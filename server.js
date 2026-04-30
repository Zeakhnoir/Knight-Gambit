// Knight Slot — Node.js backend
// Run: node server.js
// Endpoints:
//   GET  /api/health  -> { ok: true }
//   POST /api/spin    -> { bet, baseN, board, horses, totalWin }

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { spin } from './public/engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve the built frontend from /public (optional — convenient for single-server deployment)
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/spin', (_req, res) => {
  try {
    const result = spin();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'spin_failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Knight Slot backend listening on http://localhost:${PORT}`);
});
