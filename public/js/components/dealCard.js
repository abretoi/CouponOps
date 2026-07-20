// dealCard.js — renders one deal card.
//
// Two registries drive every link on the card, so no coupon is ever named
// without a way to get it:
//   data/links.json           store ad / coupon page / matchup + rebate apps
//   data/coupon-sources.json  manufacturer coupon portals + per-brand pages
// `couponFor()` resolves each stack layer to whichever registry owns it.

import { esc } from '../api.js';

const PILLAR_BY_BADGE = {
  MONEYMAKER: 'turquoise', 'MONSTER STACK': 'turquoise', 'NEAR FREE': 'turquoise',
  'FREE ITEM': 'turquoise', 'BOGO FREE': 'turquoise', 'B1G2 FREE': 'turquoise',
  'HOT PRICE': 'sky', 'PENNY DEAL': 'sky', 'EVERY SAT': 'sky', 'SALE': 'sky',
  '3-DAY SALE': 'sky', 'MEAL DEAL': 'sky', 'COMBO LOCO': 'sky',
  'STACK IT': 'ocean', 'BOGO STACK': 'ocean', 'DOUBLE COUP': 'ocean',
  '5X EVENT': 'ocean', 'MVP STACK': 'ocean', 'BASKET DEAL': 'ocean',
  MPERKS: 'blue', 'APP COUPON': 'blue', 'REG. REWARDS': 'blue',
  EXTRABUCKS: 'blue', 'PROMO CODE': 'blue', 'SCAN GUAR.': 'blue',
};

const stepHtml = s => esc(s).replace(/&lt;(\/?strong)&gt;/g, '<$1>');

const ICON = {
  ad:      '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h12l-1.2 8.2a1.5 1.5 0 0 1-1.5 1.3H4.7a1.5 1.5 0 0 1-1.5-1.3L2 4z"/><path d="M5.5 6.5V4a2.5 2.5 0 0 1 5 0v2.5"/></svg>',
  coupons: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="4" cy="4" r="2"/><circle cx="4" cy="12" r="2"/><path d="M13 3L5.5 10.5M5.5 5.5L13 13"/></svg>',
  matchup: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2h7l3 3v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/><path d="M5.5 7.5h5M5.5 10.5h5"/></svg>',
  app:     '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="1.5" width="8" height="13" rx="1.6"/><path d="M7 12.5h2"/></svg>',
  print:   '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 6V2h7v4"/><rect x="2" y="6" width="12" height="5" rx="1"/><path d="M4.5 11h7v3h-7z"/></svg>',
  paper:   '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3.5h9v9a1.5 1.5 0 0 0 1.5 1.5H3.5A1.5 1.5 0 0 1 2 12.5z"/><path d="M11 6h3v6.5a1.5 1.5 0 0 1-3 0z"/><path d="M4 6h5M4 8.5h5M4 11h3"/></svg>',
  tag:     '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 7V2.8A.8.8 0 0 1 2.8 2H7l7 7-4.2 4.2a.8.8 0 0 1-1.2 0L2 7z"/><circle cx="5" cy="5" r="1"/></svg>',
};

function linkBtn(kind, label, url, primary = false) {
  return `<a class="deal-link${primary ? ' primary' : ''}" href="${esc(url)}" target="_blank" rel="noopener">${ICON[kind]}${esc(label)}</a>`;
}

function linkRow(d, links) {
  const store = links?.stores?.[d.store] || {};
  const apps = links?.apps || {};
  const out = [];
  const adUrl = d.durl || store.ad;
  const matchUrl = d.surl || store.matchup;
  if (adUrl) out.push(linkBtn('ad', 'Weekly ad', adUrl, true));
  if (store.coupons && store.coupons !== adUrl) out.push(linkBtn('coupons', 'Clip coupons', store.coupons, true));
  if (matchUrl && matchUrl !== adUrl) out.push(linkBtn('matchup', 'Step-by-step matchup', matchUrl));
  for (const a of d.apps || []) if (apps[a]) out.push(linkBtn('app', a, apps[a]));
  return out.length ? `<div class="link-row">${out.join('')}</div>` : '';
}

// ── Coupon resolution ──────────────────────────────────────────────────────
// Given one stack layer ("$10 off 2 Dove coupon (exp 7/11)"), work out where a
// shopper actually gets it. Order matters: the most specific owner wins.
export function couponFor(layer, deal, links, cs) {
  const t = String(layer).toLowerCase();
  const apps = links?.apps || {};
  const store = links?.stores?.[deal.store] || {};

  // A shelf price is not a coupon — nothing to clip.
  if (/^(walgreens |publix |kroger )?(bogo|buy \d|b\d ?g\d|\d\/\$|sale price|weekly ad price|everyday low|rollback|mega price|family-pack|personal price|aldi everyday|shelf|\$\d+ off \$\d+ sale)/.test(t)
      || /\b(sale price|shelf price|everyday low (base )?price|base price|unit price|tiered price|auto|automatically)\b/.test(t)) {
    if (!/coupon|digital|rewards|rebate/.test(t)) return null;
  }

  // 1. Rebate apps — exact name match against the app registry.
  for (const [name, url] of Object.entries(apps)) {
    if (t.includes(name.toLowerCase())) return { kind: 'app', label: name, url };
  }

  // 2. Store loyalty currency / digital coupons → the retailer's own coupon page.
  const programHit = (cs?.programs?.keywords || []).find(k => t.includes(k));
  if (programHit && store.coupons) {
    return { kind: 'app', label: `${deal.store} app`, url: store.coupons };
  }

  // 3. Sunday paper insert → the preview of what's in this week's inserts.
  if (/insert|sunday paper|sunday/.test(t)) {
    const p = cs?.portals?.inserts;
    if (p) return { kind: 'paper', label: p.name, url: p.url };
  }

  // 4. Brand-specific manufacturer coupon → that brand's offers page,
  //    or its corporate portal (P&G brands share one).
  const pgBrands = cs?.brandPortal?.pg || [];
  const pgHit = pgBrands.find(b => t.includes(b.toLowerCase()));
  if (pgHit && cs?.portals?.pg) {
    return { kind: 'print', label: `P&G · ${pgHit}`, url: cs.portals.pg.url };
  }
  for (const [brand, meta] of Object.entries(cs?.brands || {})) {
    if (t.includes(brand.toLowerCase())) return { kind: 'print', label: `${brand} coupons`, url: meta.url };
  }

  // 5. Any other manufacturer coupon → the national printable database.
  if (/coupon/.test(t)) {
    const p = cs?.portals?.printable;
    if (p) return { kind: 'print', label: p.name, url: p.url };
  }
  return null;
}

// The stack, rendered as clickable chips — each links to where that layer is obtained.
function stackRow(d, links, cs) {
  return (d.stk || []).map(layer => {
    const c = couponFor(layer, d, links, cs);
    if (!c) return `<span class="stack-tag">+ ${esc(layer)}</span>`;
    return `<a class="stack-tag is-link" href="${esc(c.url)}" target="_blank" rel="noopener" title="Get this: ${esc(c.label)}">+ ${esc(layer)}${ICON.tag}</a>`;
  }).join('');
}

// An explicit "get these first" checklist — deduped destinations for the whole
// stack, so a shopper can load every coupon before leaving the house.
function couponChecklist(d, links, cs) {
  const seen = new Map();
  // Dedupe on a normalized label as well as URL: the same store app can arrive
  // from the store registry ("HEB app") and the deal's app list ("H-E-B app")
  // under different URLs, and shoppers should see one button, not two.
  const key = c => `${c.label.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  const add = c => { if (c && !seen.has(key(c)) && ![...seen.values()].some(v => v.url === c.url)) seen.set(key(c), c); };
  for (const layer of d.stk || []) add(couponFor(layer, d, links, cs));
  for (const a of d.apps || []) { const url = links?.apps?.[a]; if (url) add({ kind: 'app', label: a, url }); }
  const db = cs?.portals?.database;
  if (db) add({ kind: 'print', label: db.name, url: db.url });
  if (!seen.size) return '';
  return `<div class="coupon-box">
      <div class="coupon-box-head">Get these coupons before you go</div>
      <div class="link-row">${[...seen.values()].map(c => linkBtn(c.kind, c.label, c.url)).join('')}</div>
    </div>`;
}

export function dealCard(d, marketLookup, sbg, badgeStyle, links, couponSources) {
  const pillar = PILLAR_BY_BADGE[d.badge] || 'ocean';
  const bs = badgeStyle[d.badge] || ['color-mix(in oklab, var(--ocean) 14%, var(--bg-2))', 'var(--ocean-ink)', 'color-mix(in oklab, var(--ocean) 34%, var(--line))'];
  const storeBg = sbg[d.store] || 'linear-gradient(135deg,#1f3563,#0c1530)';
  const mktLabel = d.markets.includes('all')
    ? 'All markets'
    : d.markets.map(m => marketLookup[m] || m).join(' · ');
  const priceTint = d.fn <= 0
    ? 'background:color-mix(in oklab, var(--turquoise) 22%, var(--bg-2));color:var(--turquoise-ink)'
    : d.sn >= 70
      ? 'background:color-mix(in oklab, var(--sky) 20%, var(--bg-2));color:var(--sky-ink)'
      : 'background:color-mix(in oklab, var(--ocean) 18%, var(--bg-2));color:var(--ocean-ink)';

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
      ${couponChecklist(d, links, couponSources)}
      <ol>${(d.steps || []).map(s => `<li>${stepHtml(s)}</li>`).join('')}</ol>
      <div class="stack-tags">${stackRow(d, links, couponSources)}</div>
      ${d.tip ? `<div class="tip">${esc(d.tip)}</div>` : ''}
      <div class="src-line">${esc(d.src || '')}</div>
    </div>
  </article>`;
}
