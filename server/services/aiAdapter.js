// aiAdapter.js — provider-agnostic AI calls. Every model call in CouponOps flows
// through callModel(). Mirrors the Alexecutive Career Ops adapter pattern:
// per-provider key storage, OpenAI-compatible fallback, defensive JSON parsing.
// Includes per-provider rate limiting and retry logic for free-tier APIs.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, '..', '..', 'data', 'config.json');

export const PROVIDERS = {
  anthropic:  { label: 'Anthropic (Claude)', needsKey: true,  base: 'https://api.anthropic.com',
                models: ['claude-fable-5', 'claude-opus-4-8', 'claude-sonnet-5', 'claude-haiku-4-5-20251001'] },
  openai:     { label: 'OpenAI', needsKey: true,  base: 'https://api.openai.com/v1',
                models: ['gpt-5.2', 'gpt-5.2-mini', 'gpt-5-nano'] },
  gemini:     { label: 'Google Gemini', needsKey: true,  base: 'https://generativelanguage.googleapis.com/v1beta',
                models: ['gemini-3.0-pro', 'gemini-3.0-flash', 'gemini-2.5-flash'] },
  xai:        { label: 'xAI (Grok)', needsKey: true,  base: 'https://api.x.ai/v1',
                models: ['grok-4', 'grok-4-fast'] },
  groq:       { label: 'Groq (free tier)', needsKey: true,  base: 'https://api.groq.com/openai/v1',
                models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768'] },
  openrouter: { label: 'OpenRouter', needsKey: true,  base: 'https://openrouter.ai/api/v1',
                models: ['anthropic/claude-sonnet-5', 'openai/gpt-5.2-mini', 'meta-llama/llama-3.3-70b-instruct'] },
  ollama:     { label: 'Ollama (local, free)', needsKey: false, base: 'http://localhost:11434/v1',
                models: ['llama3.2', 'qwen2.5', 'mistral'] },
  custom:     { label: 'Custom (OpenAI-compatible)', needsKey: true, base: '',
                models: [] },
};

// ── Rate-limit configuration per provider ──────────────────────────────────────
// minDelayMs  : minimum milliseconds between consecutive requests to this provider.
// maxTokensCap: hard cap on max_tokens to keep request size within provider limits.
const RATE_LIMITS = {
  groq:       { minDelayMs: 21000, maxTokensCap: 2500 },  // 3 req/min (to stay under 12K tok/min), 100K tok/day
  openrouter: { minDelayMs: 500,   maxTokensCap: 8000 },
  ollama:     { minDelayMs: 0,     maxTokensCap: 8000 },  // local, no limits
  _default:   { minDelayMs: 200,   maxTokensCap: 8000 },
};

// Track the timestamp of the last request per provider for pacing.
const lastRequestAt = {};

async function rateDelay(provider) {
  const limits = RATE_LIMITS[provider] || RATE_LIMITS._default;
  const now = Date.now();
  const last = lastRequestAt[provider] || 0;
  const wait = Math.max(0, limits.minDelayMs - (now - last));
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastRequestAt[provider] = Date.now();
}

function getMaxTokensCap(provider) {
  return (RATE_LIMITS[provider] || RATE_LIMITS._default).maxTokensCap;
}

// ── Config persistence ─────────────────────────────────────────────────────────
export function readConfig() {
  try { return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')); }
  catch { return {}; }
}

export function writeConfig(patch) {
  const cur = readConfig();
  // Deep-merge aiKeys so saving one provider's key never wipes another's.
  const next = { ...cur, ...patch, aiKeys: { ...(cur.aiKeys || {}), ...(patch.aiKeys || {}) } };
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(next, null, 2));
  return next;
}

function activeSettings(cfg) {
  const provider = cfg.aiProvider || 'anthropic';
  const meta = PROVIDERS[provider] || PROVIDERS.custom;
  return {
    provider,
    key: (cfg.aiKeys || {})[provider] || cfg.aiApiKey || '',
    base: cfg.aiBaseUrl && provider === 'custom' ? cfg.aiBaseUrl
        : provider === 'ollama' && cfg.aiBaseUrl ? cfg.aiBaseUrl
        : meta.base,
    model: cfg.aiModel || meta.models[0] || '',
  };
}

const TIMEOUT_MS = 240_000;
const MAX_RETRIES = 3;
const RETRY_BACKOFF_BASE_MS = 5000;

async function post(url, headers, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(`${res.status} ${res.statusText}: ${text.slice(0, 400)}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// Retry wrapper: handles 429 (rate limit) and 413 (payload too large) from the
// provider by backing off exponentially and, for 413, reducing max_tokens.
async function callWithRetry(fn, provider, attempt = 0) {
  try {
    await rateDelay(provider);
    return await fn();
  } catch (err) {
    const retryable = err.status === 429 || err.status === 413;
    if (!retryable || attempt >= MAX_RETRIES) throw err;

    const backoff = RETRY_BACKOFF_BASE_MS * Math.pow(2, attempt);
    console.warn(`[aiAdapter] ${err.status} from ${provider} — retrying in ${backoff}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
    await new Promise(r => setTimeout(r, backoff));
    return callWithRetry(fn, provider, attempt + 1);
  }
}

// callModel(system, user, maxTokens) → string. Provider/model/key resolved from config.
export async function callModel(system, user, maxTokens = 4000) {
  const cfg = readConfig();
  const { provider, key, base, model } = activeSettings(cfg);
  if (!model) throw new Error('No model configured. Set one in Settings.');
  if (PROVIDERS[provider]?.needsKey && !key) {
    throw new Error(`No API key saved for ${provider}. Add one in Settings.`);
  }

  // Enforce per-provider token cap to avoid 413 errors.
  const effectiveMax = Math.min(maxTokens, getMaxTokensCap(provider));

  if (provider === 'anthropic') {
    return callWithRetry(async () => {
      const data = await post(`${base}/v1/messages`,
        { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
        { model, max_tokens: effectiveMax, system, messages: [{ role: 'user', content: user }] });
      return (data.content || []).map(c => c.text || '').join('');
    }, provider);
  }

  if (provider === 'gemini') {
    return callWithRetry(async () => {
      const data = await post(`${base}/models/${model}:generateContent?key=${key}`, {},
        { systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: 'user', parts: [{ text: user }] }],
          generationConfig: { maxOutputTokens: effectiveMax } });
      return (data.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
    }, provider);
  }

  // OpenAI-compatible: openai, xai, groq, openrouter, ollama, custom
  return callWithRetry(async () => {
    const data = await post(`${base}/chat/completions`,
      key ? { authorization: `Bearer ${key}` } : {},
      { model, max_tokens: effectiveMax,
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }] });
    return data.choices?.[0]?.message?.content || '';
  }, provider);
}

// parseJson — strips markdown fences, extracts the outermost JSON array/object,
// fixes trailing commas, salvages truncation. Never trust raw model output.
export function parseJson(text) {
  if (!text) throw new Error('Empty model response');
  let t = text.replace(/```(?:json)?/gi, '').trim();
  const a = t.indexOf('['), o = t.indexOf('{');
  const start = (a !== -1 && (o === -1 || a < o)) ? a : o;
  if (start === -1) throw new Error('No JSON found in model response');
  t = t.slice(start);
  const close = t[0] === '[' ? ']' : '}';
  const end = t.lastIndexOf(close);
  if (end !== -1) t = t.slice(0, end + 1);
  t = t.replace(/,\s*([\]}])/g, '$1');
  try { return JSON.parse(t); }
  catch {
    // Truncation salvage: drop the last partial element of an array.
    if (t[0] === '[') {
      const lastObj = t.lastIndexOf('},');
      if (lastObj !== -1) return JSON.parse(t.slice(0, lastObj + 1) + ']');
    }
    throw new Error('Model returned unparseable JSON');
  }
}
