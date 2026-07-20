# CouponOps — Working Memory

Durable, dated facts an agent (or future you) needs that aren't obvious from the code.

## Project state (2026-07-20)

- **v1.2 built and browser-verified** on Jul 20 2026 — AA contrast in both themes, top-right theme toggle, coupon-source links, in-market store filter.
- v1.1 (Jul 20): blue palette, link registry, staples expansion.
- v1.1 detail: **108 seed deals** · 21 markets · 38 retailers · 25 sources · 42-store link registry. Server on port **4747**. Pushed to GitHub.
- v1.0 (Jul 19): initial build, 83 deals.
- Seed snapshot covers **week of Jul 13–19, 2026**. The 48 core deals (extracted from `~/Desktop/coupon-dashboard-july2026.html`) are hip2save/KCL-verified for the week of Jul 5–11; expansion deals are chain-mechanic templates. The **Refresh pill exists precisely because seed data ages** — each market refresh replaces its deals via the active AI model.
- Original dashboard's `carolinas` market was split into `rdu` + `charlotte`; national-chain deals scoped to the old 4 markets were remapped to `"all"`.

## Decisions

- **Blue-only palette** (Jul 20 2026, user directive): five hues — turquoise / sky / ocean / blue / navy — and nothing else. No rainbow, and deliberately no retailer brand colors. Store chip gradients and badge styles are *generated* from the ramp in `build-data.js` rather than hand-written, so the palette stays enforceable. Color encodes deal value: turquoise = moneymaker/free, sky = price-led, ocean = multi-layer stack, blue = loyalty mechanic.
- **`data/links.json` is the only home for outbound URLs** (Jul 20 2026): `build-data.js` strips per-deal `durl`/`surl` on every build. One place to audit, one place to fix — the dead-link bug class is structurally gone.
- **Bot walls never return 404** (Jul 20 2026): the link checker excuses 403/503/0 on known-walled domains but *never* a 404. This is precisely what surfaced the real Meijer typos (`weekly-ad.html`→`weeklyad.html`, `mperks.html`→`mPerks.html`) hiding behind the exemption.

- **Express app over single-file HTML** (Jul 19 2026): the LLM settings/refresh loop needs a server for key storage and CORS-free provider calls; mirrors the proven Alexecutive Career Ops shape.
- **Per-market refresh only** (Jul 19 2026): `market: "all"` rejected server-side — bounded cost, isolated failures.
- **Refresh trusts but verifies**: models without live web access produce projections; the prompt instructs them to tag `vt` as "projected — verify in store" and cut `hot` by 15. Treat refreshed prices as leads, not gospel.

## User preferences

- Design must match the abretoi Apple-style dashboard system (dashboard-design skill) — dark-first, pillar tints, gradient hero, frosted controls.
- Primary markets of interest: **Austin, TX** and **Raleigh-Durham, NC**.
- Doc suite modeled on Alexecutive Career Ops (CLAUDE.md + OMNISCIENT CLAUDE.md + README + SETUP + printable Setup Guide).

## Gotchas already hit (don't rediscover)

- **Contrast measurement in-browser is a trap.** `getComputedStyle` reports `color-mix()` as `oklab(...)` and puts gradients in `background-image`, so a naive `rgb()` parser mis-reads both and reports nonsense. It also returns **mid-transition** values for ~300ms after a theme flip. Always: disable transitions, resolve colors through a canvas pixel, and composite ancestor backgrounds. Three separate "failures" during R3 were all measurement artifacts, not CSS bugs.
- **Translucent pills have no fixed contrast.** Anything on `transparent` inherits whatever is behind it (card gradient, hero glow). Small text pills must mix into an opaque surface (`--bg-2`).
- **Colors baked into `deals.json` can't follow the theme.** Emit `var()`/`color-mix()` strings from `build-data.js` instead of hex, or light mode silently breaks.

- Meijer's bot wall is *inconsistent* — it returns 404 for some scripted requests and 403 for others, including for its own homepage. Verify Meijer URLs in a real browser, never by curl alone.
- `livingrichwithcoupons.com/shoprite-coupon-deals` returns 200 but redirects to a **2012** post — a 200 is not proof a link is good. Same trap with `walmart.com/store/finder`, which 200s into a bot-block page.
- Joe V's Smart Shop has no live standalone domain; it lives under `heb.com/joe-vs-smart-shop`.

- `/api/deals` payload must include `week/markets/sbg/badgeStyle` — the frontend builds chips and badges from it.
- Deal `steps` carry `<strong>` markup → rendered via `stepHtml()` (escape-all, re-allow `<strong>` only). Keep it that way for AI-refreshed content.
- Provider model lists in `aiAdapter.js` are a snapshot; Settings model field is deliberately free-text.

## Next steps (candidate)

- Wire a real web-search-capable refresh (provider tool-use) so `vt` tags become verifiable citations.
- Per-deal shopping-list export (Excel via SheetJS, per the design suite's per-tab export convention).
- Deal favorites + week-over-week price history in `data/`.
