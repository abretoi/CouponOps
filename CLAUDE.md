# CouponOps — Development Context

## What This Project Is

Self-hosted web app — browser-based **stackable grocery coupon deal command center**. NOT a Claude Code plugin. Users interact exclusively via browser at `http://localhost:4747`.

Express.js backend + vanilla JS SPA + provider-agnostic AI + curated multi-market deal dataset. Grown out of `coupon-dashboard-july2026.html` (single-file, 5 markets) into a full app covering 21 US markets and 38 retailers.

## Stack

| Layer | Tech |
|---|---|
| Server | Node.js 20+ / Express 4 / ESM |
| AI | Provider-agnostic via `aiAdapter.js` — Anthropic, OpenAI, Gemini, xAI, Groq, OpenRouter, Ollama, custom |
| Storage | JSON files in `data/` (`config.json` + `deals-live.json` gitignored) |
| Frontend | Vanilla JS ES modules — no build step; served from `public/` |
| Design | abretoi Apple-style dashboard system (see Design System below) |

## Project Structure

```
server/
├── index.js                Express server (port 4747)
├── routes/
│   ├── deals.js            /api/deals — list, markets, sources, refresh, refresh/clear
│   ├── config.js           /api/config — get (masked keys), save, test
│   └── ask.js              /api/ask — deal-grounded Q&A via active model
└── services/
    ├── aiAdapter.js        PROVIDERS registry, callModel(), parseJson(), config read/write
    ├── dealStore.js        Seed + live overlay merge; getDeals/getLinks/getCouponSources
    └── dealRefresh.js      Per-market AI refresh prompt + response normalization

public/
├── index.html              Shell + ALL CSS (token-driven)
└── js/
    ├── app.js              Router, state, toast, theme, model chip
    ├── api.js              Fetch helpers + esc()
    ├── views/              deals.js, sources.js, settings.js
    └── components/         dealCard.js (+ couponFor() coupon resolver)

data/
├── deals-core.json         48 deals extracted verbatim from coupon-dashboard-july2026.html
├── deals.json              GENERATED seed artifact — never hand-edit (see build rule)
├── links.json              Verified outbound-URL registry (stores x ad/coupons/matchup + apps)
├── coupon-sources.json     Where each manufacturer coupon is obtained (portals + brands)
├── sources.json            Deal-source ecosystem (blogs/IG/FB groups/forums/apps) — hand-curated
├── config.json             Gitignored — aiProvider, aiModel, aiBaseUrl, aiKeys{provider:key}
└── deals-live.json         Gitignored — AI-refreshed weeks, keyed by market

scripts/
├── build-data.js           Source of truth for markets/expansion deals → regenerates data/deals.json
├── check-links.js          Audits every URL in links.json + coupon-sources.json
└── setup.sh                Clean-install script
```

## Critical Rules

- **Generator, not hand-edits.** `data/deals.json` is a build artifact. To change markets, retailers, or seed deals: edit `scripts/build-data.js`, then `npm run build-data`. Hand edits get overwritten.
- **Token-driven CSS.** Every color/spacing/motion value in `public/index.html` resolves to a `:root` variable. Edit tokens, not rules. Light theme via `[data-theme="light"]`, persisted to `localStorage` (`couponops-theme`).
- **Keys never leave the machine.** `data/config.json` is gitignored; `GET /api/config` masks keys (`sk-a••••4f2b`); `POST /api/config` filters any value containing `••` so a masked value is never saved back over a real key. Per-provider keys deep-merge — saving one never wipes another.
- **AI output is untrusted.** `parseJson()` (fence-strip → outermost JSON → trailing-comma fix → truncation salvage) on every model response; `dealRefresh.js` normalizes every field with type coercion + clamps; `dealCard.js` escapes all HTML and re-allows only `<strong>` in steps.
- **Refresh is per-market by design.** `POST /api/deals/refresh` rejects `market: "all"` — bounded token cost, isolated failures. Refreshed weeks live in `deals-live.json` and override seed deals whose market scope is fully covered; "Revert to seed" in Settings clears them.

## Data Model

Deal object (schema shared by seed and AI refresh — see `DEAL_SCHEMA` in `dealRefresh.js`):
`id, markets[] ("all" = every market), store, cat, em, hot (0-100), title, fp/fn (final price display/number, fn<0 = moneymaker), rv, sv/sn (savings display/number), badge, vt/vc/vt2 (verification tag + colors), steps[] (may contain <strong>), stk[] (stack layers), apps[], exp, src, surl, durl, tip, origin ("seed"|"refresh")`.

Market visibility rule (used in `deals.js` view + `ask.js`): a deal shows in market M if `markets` includes `"all"` or `M`.

`CHAIN_MARKETS` in `build-data.js` maps each regional chain to the markets it actually operates in (H-E-B → TX; Publix → FL/GA/Carolinas; Kroger banners per metro; etc.). The old dashboard's `carolinas` id was split into `rdu` + `charlotte`.

## Design System

Apple product-marketing language per the `dashboard-design` skill: pure-black surface ladder (`#000/#0a0a0c/#131316/#1c1c20`), SF Pro stack, gradient hero phrase, blurred ambient glow, frosted sticky controls bar, 8pt grid, spring easing `cubic-bezier(.32,.72,0,1)`, `prefers-reduced-motion` honored, light/dark parity.

**Blue-family palette (hard constraint).** The app uses exactly five hues, all blue — no rainbow, no retailer brand colors:

| Token | Dark | Light | Carries |
|---|---|---|---|
| `--turquoise` | `#2fe0c8` | `#00857a` | moneymakers, free/near-free, best-value tier |
| `--sky` | `#5ac8fa` | `#0077b6` | price-led deals, hot prices, tips |
| `--ocean` | `#0a84ff` | `#0060c0` | multi-layer stacks, links, `--accent` |
| `--blue` | `#3d5afe` | `#2a3fb0` | loyalty-program mechanics |
| `--navy` | `#4a6fd4` | `#16305c` | forums, deepest surfaces |

`--accent`, `--accent-soft`, `--good`, `--warn` are aliases onto that ramp — never independent hues. **Never introduce a color outside these five.** Store chips (`sbg`) are generated in `build-data.js` by hashing the store name onto a ramp stop, so chains stay distinguishable without brand colors. Badge colors derive from `BADGE_TIER` (badge → ramp stop) rather than being hand-written. Deal verification-tag tints (`vc`/`vt2`) derive from the deal's heat score.

Card pillar tint maps from badge family (`PILLAR_BY_BADGE` in `dealCard.js`) onto the same five stops.

## Coupon Registry (`data/coupon-sources.json`)

Naming a coupon in a step without a way to get it is a bug. This registry maps every coupon *type* to where it is actually obtained, and `couponFor()` in `dealCard.js` resolves each stack layer against it, in priority order:

1. **Rebate app** (exact name match in `links.apps`) → Ibotta / Fetch / Checkout 51
2. **Store loyalty currency or digital coupon** (`programs.keywords` — Cash Rewards, ExtraBucks, mPerks, for U, e-VIC, MVP, Catalina, reward, …) → that store's `coupons` page
3. **Sunday paper insert** → Sunday Coupon Preview (what's in this week's inserts)
4. **P&G brand** (`brandPortal.pg` — Tide, Crest, Oral-B, Gillette, Old Spice, Febreze, Charmin, Bounty, Pampers) → P&G Good Everyday
5. **Other known brand** (`brands`) → that brand's offers page
6. **Any remaining manufacturer coupon** → Coupons.com

Resolved layers render as clickable `.stack-tag.is-link` chips, and the card shows a deduped **"Get these coupons before you go"** checklist. Shelf prices (BOGO, Mega, rollback, auto-applied) deliberately resolve to `null` — they aren't coupons and must not get a fake link.

**Coverage is verifiable**, and regressions are catchable: 291/369 stack layers resolve; every layer whose text mentions a coupon/rebate/reward/insert resolves (0 gaps). The 78 unresolved are shelf prices. Re-check by resolving `stk[]` across `/api/deals`.

## Link Registry (`data/links.json`)

**Every outbound URL lives here, and nowhere else.** Per store: `ad`, `coupons`, `matchup`. Plus an `apps` map (Ibotta, Fetch, store apps). `build-data.js` deletes any per-deal `durl`/`surl` so the registry is unambiguously the single source of truth — this permanently kills the dead-link class of bug.

`dealCard.js` assembles each card's link row from the registry: **Weekly ad** + **Clip coupons** (primary, turquoise) then **Step-by-step matchup** and one button per required app (ocean). That's how a user goes from card → live deal → the actual coupons.

Audit with `npm run check-links` (covers `links.json` **and** `coupon-sources.json` — 126 URLs). Retail sites behind Akamai/Cloudflare answer curl with 403/503/dropped connections while serving browsers normally; those domains are listed under `botWalled` and reported separately. **A 404 is never excused, even on a walled domain** — bot walls don't return 404, so a 404 there is a real dead link (this is exactly how the Meijer `weekly-ad.html` → `weeklyad.html` and `mperks.html` → `mPerks.html` typos were caught).

## Running Locally

```bash
cd ~/Desktop/CouponOps
npm install && npm start        # http://localhost:4747
npm run dev                     # --watch auto-restart
npm run build-data              # regenerate data/deals.json after editing build-data.js
```

## Known Gotchas

- `/api/deals` must ship `week/markets/sbg/badgeStyle` along with `deals` — the frontend renders chips/badges from that payload (fixed in R1; don't slim the payload).
- Provider default model lists in `aiAdapter.js` `PROVIDERS` are a convenience snapshot and drift; the Settings model field is a free-text input with datalist for exactly this reason.
- Gemini uses `:generateContent` with the key in the query string, not a Bearer header.
- Ollama needs no key; its base URL is overridable for non-default ports.

## Filters

Grocery Deals filters compose: **market → category → store → search → sort**. The store row is *market-and-category scoped* (`storesForMarket()` in `deals.js`) — it lists only stores carrying deals in the current market/category, with per-store counts, and resets to All when the market changes or the selected store leaves the filtered set. State lives in `state.store` in `app.js`.

## QA Fix Log

### R3 (Jul 20 2026) — Readability, theme toggle, coupon links, store filter

- **Contrast fixed and verified.** Split each ramp stop into a *fill* token and an `-ink` *text* token; saturated blues are unreadable at 11–13px. Small pills (badges, stack tags, deal links, refresh pill) were translucent over `transparent`, so their contrast depended on whatever composited behind them — now mixed into `--bg-2` and opaque, making contrast deterministic. Badge/verification colors were previously baked as raw hex in `deals.json` and therefore never adapted to light mode (light ink on a light card); they are now emitted as `var()`/`color-mix()` expressions. Verified in-browser with a canvas-based contrast probe: **every measured element passes WCAG AA in both themes.**
  - *Measurement gotcha:* `getComputedStyle` returns `oklab(...)` for `color-mix()` and puts gradients in `background-image`; a naive rgb parser silently mis-reads both. It also samples **mid-transition** colors right after a theme flip. Disable transitions and resolve colors via a canvas before trusting any contrast number.
- **Theme toggle restored to the top-right** in a sticky frosted `header.topbar` (matching the dashboard-design scaffold), with sun/moon SVGs and the page title on the left. `.controls` now sticks below it at `top: 56px`.
- **Manufacturer coupons are now linked** — see the Coupon Registry section above.
- **Store filter added** within each market.

### R2 (Jul 20 2026) — Blue-only palette, verified link registry, staples/drinks expansion

- **Palette collapsed to five blues.** Retired the scorecard pillar names (`--quality/--adoption/--ticket/--rose`) for `--turquoise/--sky/--ocean/--blue/--navy` across `index.html`, `dealCard.js`, `sources.js`. Store gradients and badge styles are now *generated* in `build-data.js` from the ramp instead of hand-written rgba triples — a palette change is now a five-line edit, not a 60-place find-replace. Retailer brand colors (HEB red, Aldi orange, Kroger royal) deliberately dropped. Fire/check emoji in verification tags replaced with `◆`/`✓` so no non-blue color enters via emoji.
- **`data/links.json` added** as the single source of truth for outbound URLs (42 stores × ad/coupons/matchup + 28 apps). `build-data.js` now strips per-deal `durl`/`surl`. Audited all 107: 96 × 200, 11 bot-walled.
- **Dead links fixed:** Cub `savings/coupons.html`→`/coupons`; Hy-Vee `stores/ads.aspx`→`/deals/weekly-ad`; iHeartPublix matchup→`/publix-ad/`; Lidl→`/lidl-plus`; Lowes Foods→`/rewards`; Wegmans→`/shop/deals`; Dollar Tree→`/weekly-ads`; LRWC ShopRite (redirected to a 2012 post)→`/store-deals/shoprite`; Walmart `store/finder` (redirected to a bot-block page)→`/shop/deals`; Joe V's (dead domain)→`heb.com/joe-vs-smart-shop`; Meijer `weekly-ad.html`→`weeklyad.html` and `services/mperks.html`→`shopping/mPerks.html` (both verified 404 in Chrome).
- **Link row on every card** — click straight through to the weekly ad, the coupon clip page, the step-by-step matchup, and each rebate app.
- **25 staples/drinks/snacks deals added** (`STAPLES` in `build-data.js`): sports drinks (DG 4-layer stack to ~50¢, H-E-B Combo Loco), soda/water/coffee, chips, cereal, bread, eggs/dairy, chicken, ground beef, frozen, pasta, paper goods. New categories: Staples, Meat & Seafood, Dairy & Eggs, Frozen, Bakery. Total 83 → **108 deals**.
- **`scripts/check-links.js` + `npm run check-links`** added so link health stays verifiable rather than a one-time cleanup.

### R1 (Jul 19 2026) — Initial build
- Extracted 48 deals from `coupon-dashboard-july2026.html` via one-off eval script → `deals-core.json` (verbatim carry-over, zero retyping loss).
- `getDeals()` initially returned only `{updatedAt, refreshes, deals}` — frontend requires `week/markets/sbg/badgeStyle`; added to payload.
- XSS hardening: deal steps rendered raw HTML; now escaped with `<strong>`-only re-allow (`stepHtml()` in `dealCard.js`).
- Browser-verified: market drill-down (RDU → 45 deals), category filter, refresh error path (no key → clear toast), settings provider save, light/dark parity.
