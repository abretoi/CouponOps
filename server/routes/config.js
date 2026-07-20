import { Router } from 'express';
import { readConfig, writeConfig, callModel, PROVIDERS } from '../services/aiAdapter.js';

const router = Router();

const mask = k => (k && k.length > 8 ? k.slice(0, 4) + '••••' + k.slice(-4) : k ? '••••' : '');

// GET /api/config — keys are masked; the client never receives raw secrets back.
router.get('/', (req, res) => {
  const cfg = readConfig();
  res.json({
    aiProvider: cfg.aiProvider || 'anthropic',
    aiModel: cfg.aiModel || '',
    aiBaseUrl: cfg.aiBaseUrl || '',
    aiKeys: Object.fromEntries(Object.entries(cfg.aiKeys || {}).map(([p, k]) => [p, mask(k)])),
    providers: Object.fromEntries(Object.entries(PROVIDERS).map(([id, p]) =>
      [id, { label: p.label, needsKey: p.needsKey, models: p.models }])),
  });
});

// POST /api/config — merge patch. Masked key values (containing ••) are ignored
// so re-saving the settings form never overwrites a stored key with its mask.
router.post('/', (req, res) => {
  const patch = { ...req.body };
  if (patch.aiKeys) {
    patch.aiKeys = Object.fromEntries(
      Object.entries(patch.aiKeys).filter(([, v]) => v && !String(v).includes('••')));
  }
  writeConfig(patch);
  res.json({ ok: true });
});

// POST /api/config/test — one tiny round-trip against the active provider.
router.post('/test', async (req, res) => {
  try {
    const out = await callModel('Reply with exactly: OK', 'Connection test', 20);
    res.json({ ok: /ok/i.test(out), reply: out.slice(0, 100) });
  } catch (e) {
    res.status(502).json({ ok: false, error: e.message });
  }
});

export default router;
