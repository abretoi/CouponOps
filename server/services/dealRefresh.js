// dealRefresh.js — asks the configured AI model for the current week's verified
// stackable deals in one market, in the exact deal schema the frontend renders.
// The prompt names the trusted source ecosystem (blogs, IG accounts, FB groups)
// so models with web access ground on them, and models without web access
// clearly label output as unverified projections.

import { callModel, parseJson } from './aiAdapter.js';
import { getMarkets, getSources, saveRefresh } from './dealStore.js';

const DEAL_SCHEMA = `Each deal object MUST have exactly these keys:
id (number), markets (array of market ids), store (string), cat (one of: Pantry, Produce, Snacks, Beverages, Breakfast, Dessert, Household, Personal Care, Hair Care, Beauty, Men's Care, Baby, Sun Care, Penny Items, Policy), em (one emoji), hot (0-100 heat score), title (string ending with final price), fp (final price display string), fn (final price number, negative if moneymaker), rv (regular value string), sv (savings % display), sn (savings number 0-100), badge (short uppercase label like MONEYMAKER, STACK IT, BOGO STACK, NEAR FREE, HOT PRICE, PENNY DEAL), vt (verification tag string), vc (badge rgba background), vt2 (badge text hex color), steps (array of 3-7 strings, each one stacking step, <strong> allowed), stk (array of stack components), apps (array of app names like Ibotta, Fetch Rewards, store app), exp (expiration string), src (citation: source name + date + quote), surl (source URL), durl (store deals URL), tip (1-3 sentence insider tip)`;

export async function refreshMarket(marketId) {
  const markets = getMarkets();
  const market = markets.find(m => m.id === marketId);
  if (!market) throw new Error(`Unknown market: ${marketId}`);

  const { sources } = getSources();
  const sourceList = sources
    .map(s => `- ${s.name} (${s.type}): ${s.url}`)
    .join('\n');

  const today = new Date().toISOString().slice(0, 10);
  const system = `You are an expert extreme-couponing analyst. You find VERIFIED stackable grocery coupon deals — store sale + manufacturer coupon + digital coupon + rebate app + store rewards, layered. You only report deals with realistic, current mechanics for each retailer (e.g. Walgreens Cash Rewards, CVS ExtraBucks, Kroger digital + Mega Event, Publix BOGO + stacking, H-E-B Combo Loco, Harris Teeter e-VIC/Super Doubles, Safeway/Albertsons for U, Meijer mPerks, Ibotta/Fetch stacking). Cite the deal-source ecosystem you are drawing from. If you cannot verify current-week ads, mark vt as "projected — verify in store" and lower hot by 15.`;

  const user = `Today is ${today}. Produce this week's TOP 12 stackable coupon deals for the ${market.label} market.
Retailers available in this market: ${market.stores.join(', ')}.
Market id to use in the markets array: "${marketId}".

Ground your deals in (or model them on) the current weekly ads and these trusted deal sources:
${sourceList}

${DEAL_SCHEMA}

Rules:
- Prioritize moneymakers, near-free after-rewards deals, and 3+ layer stacks.
- Real mechanics only for each chain. Include at least one deal each from a drugstore, a mass retailer, a dollar store, and the market's dominant regional grocer.
- ids: use ${Date.now() % 100000} + index.
- Return ONLY a JSON array of 12 deal objects. No prose, no markdown.`;

  const raw = await callModel(system, user, 8000);
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
