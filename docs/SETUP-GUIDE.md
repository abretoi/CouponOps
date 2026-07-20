# CouponOps Setup Guide

*A complete walkthrough with no assumed knowledge — in the style of the Alexecutive Career Ops Setup Guide. To make a PDF: open this file in any Markdown viewer (or the GitHub/VS Code preview) and print to PDF.*

---

## 1. What is CouponOps?

CouponOps is a private web app that runs entirely on your computer. It shows you the best **stackable** grocery coupon deals — deals where a store sale, a manufacturer coupon, a digital app coupon, store rewards, and rebate apps all pile onto the same item, taking something from $16 down to free (or even a "moneymaker," where you come out ahead).

It covers 21 US metro areas — including Austin, TX and Raleigh-Durham, NC — and 38 grocery chains, drugstores, and dollar stores. It also has a built-in AI assistant you can power with any AI provider you like.

Nothing about your shopping or your API keys ever leaves your machine except the calls made directly to the AI provider you choose.

## 2. One-time installation

**Step 1 — Install Node.js** (the engine the app runs on):
Go to https://nodejs.org, download the LTS version (20 or newer), and run the installer. To confirm it worked, open the **Terminal** app and type `node -v` — you should see something like `v22.1.0`.

**Step 2 — Install the app.** In Terminal, type:

```
cd ~/Desktop/CouponOps
bash scripts/setup.sh
```

You'll see checkmarks as it installs. This takes under a minute.

## 3. Starting and stopping

**Start** (every time you want to use it):

```
cd ~/Desktop/CouponOps
npm start
```

Then open your web browser and go to: **http://localhost:4747**

**Stop:** go back to the Terminal window and press `Ctrl + C`. (Closing the Terminal window also stops it.)

## 4. A tour of the app

### The left sidebar
- **Grocery Deals** — the main event. All deals, all filters.
- **Sources** — the trusted blogs, Instagram accounts, Facebook groups, forums, and rebate apps the deals draw from.
- **Settings** — where you set up your AI provider and API key.
- **◐ theme** — switch between dark and light mode.

### The Grocery Deals tab, top to bottom
1. **Market pills** — click your city (🤠 Austin, 🌲 Raleigh-Durham, …). Every pill shows how many deals are live there. "All Markets" shows everything.
2. **Search bar** — type any product ("detergent", "diapers"), store ("HEB"), or deal type ("BOGO").
3. **Sort menu** — Hottest / Biggest % saved / Lowest final price / By store.
4. **↻ Refresh week** — see section 6.
5. **Category chips** — Baby, Beauty, Household, Pantry, Produce, Penny Items, and more.
6. **Ask AI bar** — see section 7.
7. **Deal cards** — every card carries a row of link buttons you can click straight through:
   - **Weekly ad** — that store's current ad
   - **Clip coupons** — the digital coupon page where you load the offers
   - **Step-by-step matchup** — the blog post laying the whole stack out
   - **One button per app** (Ibotta, Fetch, the store app) — tap to install or open

   Click the card itself to expand it. You'll then see:
   - **Numbered steps** — the exact stacking order at the register, with the running math
   - **Stack tags** — every layer in the stack, listed out
   - **The tip** — the insider trick that makes the deal work
   - **The source** — where the deal was verified

### Reading a deal card
The big colored price is your **final price after everything**. The struck-through price is the regular price. "MONEYMAKER" means you get back more than you paid. "Heat" (0–100) is how good the deal is this week.

## 5. Setting up the AI (one time, ~3 minutes)

The AI powers two things: refreshing deals to the current week, and answering questions. Browsing the built-in deals needs no setup at all.

1. Get an API key from any one provider. Easiest free options:
   - **Groq** (free): console.groq.com → create account → API Keys → Create
   - **Google Gemini** (free tier): aistudio.google.com → Get API key
   - **Ollama** (free, fully local, no account): install from ollama.com, then run `ollama pull llama3.2`
   - Best quality (paid): **Anthropic Claude** at console.anthropic.com
2. In CouponOps: **Settings → API Keys** → paste the key into that provider's box → **Save key**.
3. **Settings → Active model** → choose the provider and a model → **Save active model**.
4. Click **Test connection**. You want: `✓ Connected`.

You can save keys for several providers and flip between them any time — the active model is shown at the bottom of the sidebar.

## 6. Refreshing to the current week

Coupon deals expire weekly. The bundled deals are a snapshot; here's how to get fresh ones:

1. On Grocery Deals, **click a specific market** (not All Markets).
2. Click **↻ Refresh week**. The spinner runs ~15–60 seconds.
3. The market's deals are replaced with the AI's current-week picks, tagged with the refresh date.

**Honesty note:** if your model can't browse the live web, its deals are educated projections built from each chain's real coupon mechanics — treat them as leads and verify against the store's weekly ad (every card links to it) before shopping. Made a mess? **Settings → Revert all markets to seed data** puts everything back.

## 7. Asking questions

Type into the Ask AI bar on the deals page — for example:

- *"Cheapest diapers in Raleigh this week?"*
- *"Best moneymakers at Walgreens right now?"*
- *"Build me a $30 stock-up trip in Austin."*

Answers come only from the deals currently loaded for your selected market, so it can't hallucinate deals that aren't on the board.

## 8. FAQ & troubleshooting

**Is my API key safe?** It's stored in `data/config.json` on your machine only, never displayed once saved (you'll see `sk-a••••4f2b`), and only ever sent to that provider.

**The page won't load.** Is `npm start` still running in Terminal? Restart it, then reload the browser.

**"Port 4747 in use."** Run `kill $(lsof -ti:4747)` in Terminal, then `npm start` again.

**Refresh says "No API key saved."** The *active* provider needs a key — Settings → API Keys.

**Refresh says "unparseable JSON."** Small models sometimes fumble. Switch to a stronger model (Settings) and retry.

**Where do the deals come from?** The Sources tab lists the entire ecosystem — KCL, Hip2Save, Southern Savers, @txfrugalfinds, @couponcowboy, @torok.coupon.hunter, the Couponing for Beginners Facebook group, r/couponing, and more. The AI is instructed to ground its refreshes in those sources.

**How do I add my own source or store?** Sources: edit `data/sources.json`. Stores/markets/seed deals: edit `scripts/build-data.js`, run `npm run build-data`, restart.

**A store link didn't work.** Run `npm run check-links` in Terminal — it tests every link in the app and tells you exactly which entry in `data/links.json` to fix. Some retailers (Kroger, Food Lion, CVS, Costco) block automated checks but work fine when you click them; the checker labels those separately so they don't look broken.

**Why is everything blue?** Deliberate. Color carries meaning here: turquoise = moneymaker or free, sky = a strong price, ocean = a multi-layer stack, deeper blue = a loyalty-program mechanic. You can read the value of a deal before reading the words.

---

*CouponOps v1.1 · updated Jul 20, 2026 · 108 deals · runs locally · your keys, your machine, your savings.*
