// check-links.js — audits every URL in data/links.json (and any deal-specific
// urls in data/deals.json). Run: npm run check-links
//
// Retail sites frequently sit behind Akamai/Cloudflare bot walls that answer
// curl with 403 or drop the TLS handshake entirely while serving real browsers
// normally. Those domains are listed under `botWalled` in links.json (each one
// verified by hand in Chrome) and are reported separately rather than as
// failures — otherwise the audit cries wolf on ~20 working links.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, '..', 'data');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const CONCURRENCY = 8;

const links = JSON.parse(fs.readFileSync(path.join(DATA, 'links.json'), 'utf8'));
const walled = links.botWalled.domains;

const urls = new Set(Object.values(links.apps));
for (const store of Object.values(links.stores)) {
  for (const key of ['ad', 'coupons', 'matchup']) if (store[key]) urls.add(store[key]);
}
try {
  const deals = JSON.parse(fs.readFileSync(path.join(DATA, 'deals.json'), 'utf8')).deals;
  for (const d of deals) { if (d.surl) urls.add(d.surl); if (d.durl) urls.add(d.durl); }
} catch { /* deals.json not built yet — registry-only audit */ }

// A bot wall answers 403 / 503 / dropped-connection. It never answers 404 —
// so a 404 is a real dead link even on a walled domain, and must not be excused.
const WALL_CODES = new Set([0, 401, 403, 429, 503]);
const isWalled = (u, code) => walled.some(d => u.includes(d)) && WALL_CODES.has(code);

async function check(url) {
  try {
    const res = await fetch(url, { redirect: 'follow', headers: { 'user-agent': UA }, signal: AbortSignal.timeout(15000) });
    return { url, code: res.status, ok: res.ok };
  } catch {
    return { url, code: 0, ok: false };
  }
}

const list = [...urls].sort();
const results = [];
for (let i = 0; i < list.length; i += CONCURRENCY) {
  results.push(...await Promise.all(list.slice(i, i + CONCURRENCY).map(check)));
  process.stdout.write(`\r  checked ${Math.min(i + CONCURRENCY, list.length)}/${list.length}`);
}
process.stdout.write('\r');

const good = results.filter(r => r.ok);
const wall = results.filter(r => !r.ok && isWalled(r.url, r.code));
const bad = results.filter(r => !r.ok && !isWalled(r.url, r.code));

console.log(`\n✓ ${good.length} OK`);
if (wall.length) {
  console.log(`◐ ${wall.length} bot-walled (verified working in a real browser):`);
  for (const r of wall) console.log(`    ${String(r.code).padStart(3)}  ${r.url}`);
}
if (bad.length) {
  console.log(`\n✗ ${bad.length} BROKEN — fix these in data/links.json:`);
  for (const r of bad) console.log(`    ${String(r.code).padStart(3)}  ${r.url}`);
  process.exit(1);
}
console.log('\nAll links healthy.');
