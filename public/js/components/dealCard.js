// dealCard.js — renders one deal card. Pillar tint derives from the badge
// family and resolves to the blue ramp (turquoise → sky → ocean → blue → navy).
// The link row is assembled from the verified registry in data/links.json so
// every outbound URL is maintained in exactly one place.

import { esc } from '../api.js';

const PILLAR_BY_BADGE = {
  // Best-in-class: moneymakers and near-free → brightest stop
  MONEYMAKER: 'turquoise', 'MONSTER STACK': 'turquoise', 'NEAR FREE': 'turquoise',
  'FREE ITEM': 'turquoise', 'BOGO FREE': 'turquoise', 'B1G2 FREE': 'turquoise',
  // Price-led deals → sky
  'HOT PRICE': 'sky', 'PENNY DEAL': 'sky', 'EVERY SAT': 'sky', 'SALE': 'sky',
  '3-DAY SALE': 'sky', 'MEAL DEAL': 'sky', 'COMBO LOCO': 'sky',
  // Multi-layer stacks → ocean
  'STACK IT': 'ocean', 'BOGO STACK': 'ocean', 'DOUBLE COUP': 'ocean',
  '5X EVENT': 'ocean', 'MVP STACK': 'ocean', 'BASKET DEAL': 'ocean',
  // Loyalty-program mechanics → blue
  MPERKS: 'blue', 'APP COUPON': 'blue', 'REG. REWARDS': 'blue',
  EXTRABUCKS: 'blue', 'PROMO CODE': 'blue', 'SCAN GUAR.': 'blue',
};

// Steps may carry <strong> emphasis from the seed/AI data — escape everything,
// then re-allow only that one tag so refreshed content can never inject markup.
const stepHtml = s => esc(s).replace(/&lt;(\/?strong)&gt;/g, '<$1>');

const ICON = {
  ad:      '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h12l-1.2 8.2a1.5 1.5 0 0 1-1.5 1.3H4.7a1.5 1.5 0 0 1-1.5-1.3L2 4z"/><path d="M5.5 6.5V4a2.5 2.5 0 0 1 5 0v2.5"/></svg>',
  coupons: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="4" cy="4" r="2"/><circle cx="4" cy="12" r="2"/><path d="M13 3L5.5 10.5M5.5 5.5L13 13"/></svg>',
  matchup: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2h7l3 3v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/><path d="M5.5 7.5h5M5.5 10.5h5"/></svg>',
  app:     '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="1.5" width="8" height="13" rx="1.6"/><path d="M7 12.5h2"/></svg>',
};

function linkBtn(kind, label, url, primary = false) {
  return `<a class="deal-link${primary ? ' primary' : ''}" href="${esc(url)}" target="_blank" rel="noopener">${ICON[kind]}${esc(label)}</a>`;
}

// Build the link row: store ad + coupon clip page + step-by-step matchup,
// then one button per rebate/store app the deal requires.
function linkRow(d, links) {
  const store = links?.stores?.[d.store] || {};
  const apps = links?.apps || {};
  const out = [];

  // Deal-specific URL wins over the store default when the data carries one.
  const adUrl = d.durl || store.ad;
  const matchUrl = d.surl || store.matchup;

  if (adUrl) out.push(linkBtn('ad', 'Weekly ad', adUrl, true));
  if (store.coupons && store.coupons !== adUrl) out.push(linkBtn('coupons', 'Clip coupons', store.coupons, true));
  if (matchUrl && matchUrl !== adUrl) out.push(linkBtn('matchup', 'Step-by-step matchup', matchUrl));

  for (const a of d.apps || []) {
    const url = apps[a];
    if (url) out.push(linkBtn('app', a, url));
  }
  return out.length ? `<div class="link-row">${out.join('')}</div>` : '';
}

export function dealCard(d, marketLookup, sbg, badgeStyle, links) {
  const pillar = PILLAR_BY_BADGE[d.badge] || 'ocean';
  const bs = badgeStyle[d.badge] || ['color-mix(in oklab, var(--ocean) 14%, transparent)', 'var(--ocean)', 'color-mix(in oklab, var(--ocean) 32%, var(--line))'];
  const storeBg = sbg[d.store] || 'linear-gradient(135deg,#1a3a6b,#0a1a33)';
  const mktLabel = d.markets.includes('all')
    ? 'All markets'
    : d.markets.map(m => marketLookup[m] || m).join(' · ');
  // Final-price tint: moneymaker → turquoise, deep discount → sky, else ocean.
  const priceTint = d.fn <= 0
    ? 'background:color-mix(in oklab, var(--turquoise) 22%, transparent);color:var(--turquoise)'
    : d.sn >= 70
      ? 'background:color-mix(in oklab, var(--sky) 20%, transparent);color:var(--sky)'
      : 'background:color-mix(in oklab, var(--ocean) 18%, transparent);color:var(--accent-soft)';

  return `
  <article class="card" data-pillar="${pillar}" data-id="${d.id}" data-reveal>
    <div class="card-top">
      <span class="store-tag" style="background:${storeBg}">${esc(d.store)}</span>
      <span class="badge" style="background:${bs[0]};color:${bs[1]};border-color:${bs[2]}">${esc(d.badge)}</span>
      <span class="hot-tag">${d.em || ''} heat ${d.hot}</span>
    </div>
    <h3>${esc(d.title)}</h3>
    <div class="price-row">
      <span class="fp" style="${priceTint}">${esc(d.fp)}</span>
      <span class="rv">${esc(d.rv)}</span>
      <span class="sv">save ${esc(d.sv)}</span>
    </div>
    ${d.vt ? `<span class="vt" style="background:${d.vc || 'var(--bg-3)'};color:${d.vt2 || 'var(--text-2)'}">${esc(d.vt)}</span>` : ''}
    <div class="mkt-line">${esc(d.cat)} · ${esc(mktLabel)}</div>
    ${linkRow(d, links)}
    <div class="card-detail">
      ${d.exp ? `<div class="exp-line">⏱ ${esc(d.exp)}</div>` : ''}
      <ol>${(d.steps || []).map(s => `<li>${stepHtml(s)}</li>`).join('')}</ol>
      <div class="stack-tags">${(d.stk || []).map(s => `<span class="stack-tag">+ ${esc(s)}</span>`).join('')}</div>
      ${d.tip ? `<div class="tip">${esc(d.tip)}</div>` : ''}
      <div class="src-line">${esc(d.src || '')}</div>
    </div>
  </article>`;
}
