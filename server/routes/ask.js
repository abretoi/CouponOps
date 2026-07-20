import { Router } from 'express';
import { callModel } from '../services/aiAdapter.js';
import { getDeals, getMarkets } from '../services/dealStore.js';

const router = Router();

// POST /api/ask { question, market } — answer grounded in the currently loaded
// deals for the selected market. Deals are serialized compactly to keep the
// prompt small; the model is told not to invent deals that are not in context.
router.post('/', async (req, res) => {
  const { question, market = 'all' } = req.body || {};
  if (!question?.trim()) return res.status(400).json({ error: 'Question required' });

  try {
    const { deals } = getDeals();
    const markets = getMarkets();
    const label = markets.find(m => m.id === market)?.label || 'All Markets';
    const scoped = deals
      .filter(d => market === 'all' || d.markets.includes('all') || d.markets.includes(market))
      .slice(0, 60)
      .map(d => `[${d.store} · ${d.cat}] ${d.title} — final ${d.fp} (reg ${d.rv}, save ${d.sv}). Stack: ${d.stk.join(' + ')}. Exp: ${d.exp}`)
      .join('\n');

    const system = `You are CouponOps' deal concierge for the ${label} market. Answer using ONLY the deal list provided. If nothing matches, say so and suggest the closest alternative in the list. Be concise and practical: name the store, the stack, and the final price.`;
    const answer = await callModel(system, `DEALS THIS WEEK:\n${scoped}\n\nQUESTION: ${question}`, 1500);
    res.json({ answer });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

export default router;
