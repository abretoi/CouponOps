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
// configured AI model. "all" refreshes are rejected: one market per call keeps
// token cost bounded and errors isolated.
router.post('/refresh', async (req, res) => {
  const market = req.body?.market;
  if (!market || market === 'all') {
    return res.status(400).json({ error: 'Pick a specific market to refresh (not All Markets).' });
  }
  try {
    const entry = await refreshMarket(market);
    res.json({ ok: true, market, refreshedAt: entry.refreshedAt, count: entry.deals.length });
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
