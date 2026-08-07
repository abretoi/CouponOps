// dealRefresh.js — asks the configured AI model for the current week's verified
// stackable deals in one market, in the exact deal schema the frontend renders.
// The prompt names the trusted source ecosystem (blogs, IG accounts, FB groups)
// so models with web access ground on them, and models without web access
// clearly label output as unverified projections.
//
// Prompt is sized to stay within Groq free-tier limits (12K tokens/min):
//   ~1200 tok input + 4000 tok max output = ~5200 tok per call,
//   with 3s inter-request delay → ≤ 2 calls/6s well under 12K/min.

import { callModel, parseJson } from './aiAdapter.js';
import { getMarkets, getSources, saveRefresh } from './dealStore.js';

const DEAL_SCHEMA = `Each deal JSON object MUST have these keys:
id (number), markets (string[]), store (string), cat (Pantry|Produce|Snacks|Beverages|Breakfast|Dessert|Household|Personal Care|Hair Care|Beauty|Men's Care|Baby|Sun Care|Penny Items|Policy), em (emoji), hot (0-100), title (string with final price), fp (string), fn (number, negative=moneymaker), rv (string), sv (string), sn (0-100), badge (MONEYMAKER|STACK IT|BOGO STACK|NEAR FREE|HOT PRICE|PENNY DEAL), vt (string), vc (rgba string), vt2 (hex string), steps (string[] 3-7 items, <strong> OK), stk (string[]), apps (string[]), exp (string), src (string), surl (url), durl (url), tip (string)`;

export async function refreshMarket(marketId) {
  const markets = getMarkets();
  const market = markets.find(m => m.id === marketId);
  if (!market) throw new Error(`Unknown market: ${marketId}`);

  const { sources } = getSources();
  // Only include essential/core sources to keep the prompt compact.
  const essentialSources = sources
    .filter(s => s.tier === 'essential')
    .slice(0, 8)
    .map(s => `- ${s.name} (${s.type})`)
    .join('\n');

  const today = new Date().toISOString().slice(0, 10);
  const system = `You are an expert extreme-couponing analyst. Find VERIFIED stackable grocery coupon deals — store sale + manufacturer coupon + digital coupon + rebate app + store rewards, layered. Cite your sources. If unverified, set vt to "projected — verify in store" and lower hot by 15.`;

  const user = `Today: ${today}. Produce this week's TOP 5 stackable coupon deals for the ${market.label} market.
Retailers: ${market.stores.join(', ')}.
Market id: "${marketId}".

Key deal sources: ${essentialSources}

${DEAL_SCHEMA}

Rules:
- Prioritize moneymakers, near-free, and 3+ layer stacks.
- Include at least one deal each from a drugstore, mass retailer, and the market's regional grocer.
- ids: use ${Date.now() % 100000} + index.
- Return ONLY a JSON array of 5 deal objects. No prose, no markdown.`;

  const raw = await callModel(system, user, 2500);
  const deals = parseJson(raw);
  if (!Array.isArray(deals) || !deals.length) throw new Error('Model returned no deals');

  // Normalize: force market scoping and required keys so the UI never breaks.
  const cleaned = deals.map((d, i) => ({
    id: Number(d.id) || Date.now() % 100000 + i,
    markets: [marketId],
    store: String(d.store || 'Unknown'),
    cat: String(d.cat || 'Pantry'),
    em: String(d.em || '🛒'),
    hot: Math.max(0, Math.min(100, Number(d.hot) || 50)),
    title: String(d.title || 'Untitled deal'),
    fp: String(d.fp || '—'), fn: Number(d.fn) || 0,
    rv: String(d.rv || '—'), sv: String(d.sv || '—'),
    sn: Math.max(0, Math.min(100, Number(d.sn) || 0)),
    badge: String(d.badge || 'STACK IT').toUpperCase().slice(0, 14),
    vt: String(d.vt || 'AI refresh — verify in store'),
    vc: String(d.vc || 'rgba(23,232,213,.18)'), vt2: String(d.vt2 || '#17E8D5'),
    steps: Array.isArray(d.steps) ? d.steps.map(String) : [],
    stk: Array.isArray(d.stk) ? d.stk.map(String) : [],
    apps: Array.isArray(d.apps) ? d.apps.map(String) : [],
    exp: String(d.exp || 'This week'), src: String(d.src || 'AI-generated projection'),
    surl: String(d.surl || ''), durl: String(d.durl || ''),
    tip: String(d.tip || ''),
    origin: 'refresh',
  }));

  return saveRefresh(marketId, cleaned);
}
