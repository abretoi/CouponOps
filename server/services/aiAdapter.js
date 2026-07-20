// aiAdapter.js — provider-agnostic AI calls. Every model call in CouponOps flows
// through callModel(). Mirrors the Alexecutive Career Ops adapter pattern:
// per-provider key storage, OpenAI-compatible fallback, defensive JSON parsing.

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

async function post(url, headers, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}: ${text.slice(0, 400)}`);
  }
  return res.json();
}

// callModel(system, user, maxTokens) → string. Provider/model/key resolved from config.
export async function callModel(system, user, maxTokens = 4000) {
  const cfg = readConfig();
  const { provider, key, base, model } = activeSettings(cfg);
  if (!model) throw new Error('No model configured. Set one in Settings.');
  if (PROVIDERS[provider]?.needsKey && !key) {
    throw new Error(`No API key saved for ${provider}. Add one in Settings.`);
  }

  if (provider === 'anthropic') {
    const data = await post(`${base}/v1/messages`,
      { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      { model, max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] });
    return (data.content || []).map(c => c.text || '').join('');
  }

  if (provider === 'gemini') {
    const data = await post(`${base}/models/${model}:generateContent?key=${key}`, {},
      { systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { maxOutputTokens: maxTokens } });
    return (data.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
  }

  // OpenAI-compatible: openai, xai, groq, openrouter, ollama, custom
  const data = await post(`${base}/chat/completions`,
    key ? { authorization: `Bearer ${key}` } : {},
    { model, max_tokens: maxTokens,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }] });
  return data.choices?.[0]?.message?.content || '';
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
