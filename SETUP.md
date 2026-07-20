# CouponOps — Setup

## Requirements

- **Node.js 20+** (`node -v` to check; install from https://nodejs.org or `brew install node`)
- macOS, Linux, or Windows. No database, no Docker, no build step.

## Install & run

```bash
cd ~/Desktop/CouponOps
npm install          # installs Express (the only dependency)
npm start            # → CouponOps running → http://localhost:4747
```

Development mode with auto-restart on file changes:

```bash
npm run dev
```

Different port:

```bash
PORT=5050 npm start
```

Or use the clean-install script (safe to re-run):

```bash
bash scripts/setup.sh
```

## Configure the AI engine (optional but recommended)

Browsing deals needs **no key**. The **↻ Refresh week** pill and **Ask AI** bar need one model configured:

1. Open **Settings** (left sidebar).
2. Under **API Keys**, paste a key for any provider and click **Save key**. Keys are stored only in `data/config.json` on your machine (gitignored, masked in the UI, never sent anywhere except that provider's API).
3. Under **Active model**, pick the provider + model and click **Save active model**.
4. Click **Test connection** — you want `✓ Connected`.

### Where to get keys

| Provider | Where | Cost |
|---|---|---|
| Anthropic (Claude) | console.anthropic.com → API Keys | paid (best quality) |
| OpenAI | platform.openai.com | paid |
| Google Gemini | aistudio.google.com | free tier available |
| xAI (Grok) | console.x.ai | paid |
| Groq | console.groq.com | **free tier** |
| OpenRouter | openrouter.ai | pay-as-you-go, some free models |
| Ollama | ollama.com — runs models locally | **free, no key at all** |

> Note: a Claude.ai Pro/Max subscription is **not** API access — you need an API key from console.anthropic.com. Free routes: Groq, Gemini free tier, or local Ollama.

The model field is free-text on purpose — if a provider ships a newer model than the suggestions list, just type its id.

## Using the app

1. **Pick your market** in the pill bar (e.g. 🤠 Austin, TX or 🌲 Raleigh-Durham, NC).
2. **Filter** by category chips, **search** any product, **sort** by heat / % saved / final price.
3. **Click a card** to expand the full stack: numbered steps, stack layers, required apps, expiration, source links.
4. **↻ Refresh week** — with a market selected, regenerates that market's deals for the current week via your model. Refreshed weeks are stored in `data/deals-live.json`; **Settings → Revert** restores the seed snapshot.
5. **Ask AI** — questions answered only from the deals currently on screen for your market.

## Updating the seed dataset

`data/deals.json` is generated. To add markets, retailers, or seed deals:

```bash
# 1. edit scripts/build-data.js (MARKETS, CHAIN_MARKETS, EXPANSION)
# 2. regenerate:
npm run build-data
# 3. restart the server
```

To add deal sources (blogs/IG/FB groups/apps) used by the refresh prompt and the Sources tab: edit `data/sources.json` directly (it's hand-curated, not generated).

## Checking link health

Every outbound URL (store weekly ads, coupon pages, matchup blogs, rebate apps) lives in `data/links.json`:

```bash
npm run check-links
```

Expect `112 OK, 12 bot-walled, 0 broken` (covers `links.json` and `coupon-sources.json`). Bot-walled means the retailer blocks scripted requests but the page works fine in a browser — those are verified by hand and listed separately. If anything shows under **BROKEN**, fix that entry in `data/links.json`; no URL lives anywhere else.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `EADDRINUSE: port 4747` | Something already on the port: `kill $(lsof -ti:4747)` or run with `PORT=5050 npm start` |
| Refresh fails: "No API key saved for …" | Settings → paste + Save key for the **active** provider |
| Refresh fails: 401/403 | Key invalid or out of credit — re-check at the provider console |
| Refresh fails: "unparseable JSON" | Model too small/chatty — switch to a stronger model and retry |
| Ollama errors | Is it running? `ollama serve`, and `ollama pull llama3.2` first |
| Deals look stale | They're the seed snapshot — select a market and hit ↻ Refresh week |
| A store link 404s | Run `npm run check-links`, then fix the entry in `data/links.json` |
| Blank page | Hard-refresh (⌘⇧R); check the terminal running `npm start` for errors |
