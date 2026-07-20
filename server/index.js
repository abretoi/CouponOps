// CouponOps server — Express static host + JSON API. Port 4747.
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dealsRouter from './routes/deals.js';
import configRouter from './routes/config.js';
import askRouter from './routes/ask.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4747;

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/deals', dealsRouter);
app.use('/api/config', configRouter);
app.use('/api/ask', askRouter);

app.get('/api/health', (req, res) => res.json({ ok: true, app: 'CouponOps', port: PORT }));

app.listen(PORT, () => {
  console.log(`CouponOps running → http://localhost:${PORT}`);
});
