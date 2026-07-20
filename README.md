# CouponOps 🛒

**Stackable grocery coupon deal command center — every stack, every market, maximum savings.**

A local-first web app that curates verified stackable coupon deals (store sale + manufacturer coupon + digital coupon + rebate apps, layered) across **21 US markets** and **38 major and regional retailers**, with an AI engine you can point at any LLM provider to refresh each market's deals for the current week and answer shopping questions.

Built in the style of the deal-hunting ecosystem: The Krazy Coupon Lady, Hip2Save, Southern Savers, @txfrugalfinds, @couponcowboy, @torok.coupon.hunter, and the Couponing for Beginners Facebook group — all of which are wired into the refresh prompt as trusted sources.

## Quick start

```bash
cd ~/Desktop/CouponOps
npm install
npm start
# → open http://localhost:4747
```

That's it. The app ships with a full seed dataset — no API key needed to browse deals. Add a key in **Settings** to unlock AI refresh and Ask-AI. See [SETUP.md](SETUP.md) for the full walkthrough and [docs/SETUP-GUIDE.md](docs/SETUP-GUIDE.md) for the beginner-level guide.

## Features

| Feature | Where |
|---|---|
| **Grocery Deals tab** — 108 deal cards with full stacking steps, stack layers, expiration, source citations | left sidebar |
| **One-click links on every card** — jump straight to the weekly ad, the coupon clip page, the step-by-step matchup, and each rebate app | deal card |
| **Everyday staples & drinks** — sports drinks, soda, chips, cereal, bread, eggs, meat, pasta, paper goods — the weekly grocery list, not just drugstore health-and-beauty | Staples / Beverages / Snacks chips |
| **Market drill-down** — 21 metros from Austin to Seattle; each shows only its retailers' deals | market pill bar |
| **Category filter** — Baby, Beauty, Household, Pantry, Produce, Penny Items… | chip row |
| **Open product search** — search any product, store, category, or stack component | search bar |
| **Sort** — hottest, biggest % saved, lowest final price, by store | sort select |
| **↻ Refresh week pill** — regenerates the selected market's deals for the current week via your AI model | controls bar |
| **Ask AI** — deal-grounded questions ("cheapest diapers in Raleigh this week?") | ask bar |
| **Sources tab** — the full deal-intelligence network: blogs, Instagram, Facebook groups, forums, rebate apps | left sidebar |
| **Settings tab** — pick provider + model, save per-provider API keys, test connection, revert to seed data | left sidebar |
| **Light/dark themes** — Apple product-marketing visual language, both modes | sidebar toggle |

## Palette

The interface uses exactly five hues, all blue — turquoise, sky, ocean, blue, navy. Value tiers read by color: turquoise means moneymaker or free, sky means a price-led deal, ocean means a multi-layer stack, blue means a loyalty-program mechanic.

## Link health

Every outbound URL lives in `data/links.json` and is verified:

```bash
npm run check-links      # 96 OK, 11 bot-walled, 0 broken
```

Retail sites behind bot walls answer scripts with 403 while serving browsers normally; those are listed and reported separately. A 404 is never excused.

## AI providers

Flip between any of these in Settings — each key is remembered separately:

Anthropic (Claude) · OpenAI · Google Gemini · xAI (Grok) · Groq (free tier) · OpenRouter · Ollama (local, free, no key) · any OpenAI-compatible custom endpoint.

## Markets

Austin · Dallas–Fort Worth · Houston · San Antonio · Raleigh-Durham · Charlotte · Atlanta · Tampa · Orlando · Miami · Cincinnati · Chicago · Minneapolis · New York · Philadelphia · Washington DC · Boston · Denver · Phoenix · Los Angeles · Seattle

Each market carries its real regional chains (H-E-B, Publix, Kroger banners, Harris Teeter, ShopRite, Market Basket, WinCo…) plus the national floor: Walmart, Target, Dollar General, Family Dollar, Dollar Tree, CVS, Walgreens, Costco, Aldi.

## A note on data freshness

The bundled dataset is a **curated seed snapshot** (week of Jul 13–19, 2026; the 48 carried-over core deals were blog-verified for Jul 5–11). Coupon deals age out weekly — that's what the Refresh pill is for. Models without live web access will produce *projections* tagged "verify in store"; treat refreshed prices as leads and confirm against the weekly ad before driving anywhere.

## Project docs

- [CLAUDE.md](CLAUDE.md) — development context for AI agents and future you
- [OMNISCIENT CLAUDE.md](OMNISCIENT%20CLAUDE.md) — operating guide (agent behavior, conventions, definition of done)
- [MEMORY.md](MEMORY.md) — durable dated decisions and gotchas
- [SETUP.md](SETUP.md) — install, configure, troubleshoot
- [docs/SETUP-GUIDE.md](docs/SETUP-GUIDE.md) — beginner walkthrough, no assumed knowledge
