import { Router } from 'express';
import { getDeals, getMarkets, getSources, clearRefresh } from '../services/dealStore.js';
import { refreshMarket } from '../services/dealRefresh.js';

const router = Router();

router.get('/', (req, res) => {
  try { res.json(getDeals()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/markets', (req, res) => {
  try { res.json({ markets: getMarkets() }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/sources', (req, res) => {
  try { res.json(getSources()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/deals/refresh { market } — regenerate one market's deals via the
// configured AI model, or all markets sequentially if market is "all".
// Includes inter-market pacing to stay within free-tier rate limits.
router.post('/refresh', async (req, res) => {
  const market = req.body?.market;
  if (!market) {
    return res.status(400).json({ error: 'Pick a market to refresh, or use "all".' });
  }
  try {
    if (market === 'all') {
      const markets = getMarkets().filter(m => m.id !== 'all');
      let totalCount = 0;
      let lastRefreshedAt = null;
      const errors = [];
      for (let i = 0; i < markets.length; i++) {
        const m = markets[i];
        try {
          console.log(`[refresh] ${i + 1}/${markets.length} — ${m.label} (${m.id})...`);
          const entry = await refreshMarket(m.id);
          totalCount += entry.deals.length;
          lastRefreshedAt = entry.refreshedAt;
          console.log(`[refresh] ✓ ${m.label}: ${entry.deals.length} deals`);
        } catch (mktErr) {
          console.warn(`[refresh] ✗ ${m.label}: ${mktErr.message}`);
          errors.push({ market: m.id, error: mktErr.message });
        }
        // Extra breathing room between markets (rate delay is also enforced
        // inside aiAdapter, but this adds a buffer for the token-per-minute
        // window to drain, especially important on Groq free tier).
        if (i < markets.length - 1) {
          await new Promise(r => setTimeout(r, 2000));
        }
      }
      res.json({
        ok: true,
        market: 'all',
        refreshedAt: lastRefreshedAt,
        count: totalCount,
        errors: errors.length ? errors : undefined,
      });
    } else {
      const entry = await refreshMarket(market);
      res.json({ ok: true, market, refreshedAt: entry.refreshedAt, count: entry.deals.length });
    }
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

// POST /api/deals/refresh/clear { market } — revert to seed data.
router.post('/refresh/clear', (req, res) => {
  try { clearRefresh(req.body?.market || 'all'); res.json({ ok: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
