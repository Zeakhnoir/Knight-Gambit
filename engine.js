// =============================================================
// KNIGHT SLOT — game engine
// =============================================================
// Edit TILE_CONFIG below to tune RTP / volatility.
// =============================================================

const KNIGHT_MOVES = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1]
];

const BOARD_SIZE = 8;
const START_R = 7;
const START_C = 7;
const EXTRA_HORSE_START_R = 0;
const EXTRA_HORSE_START_C = 0;
const MAX_EXTRA_HORSE_DEPTH = 5;

// ===== TILE WEIGHTS — TUNE THESE =====
// Higher weight = more common. They're relative, not percentages.
const TILE_CONFIG = {
  empty: { weight: 50 },
  payouts: [
    { mult: 0.1,   weight: 80 },
    { mult: 0.2,   weight: 60 },
    { mult: 0.4,   weight: 40 },
    { mult: 0.6,   weight: 25 },
    { mult: 0.8,   weight: 18 },
    { mult: 1.0,   weight: 14 },
    { mult: 2.0,   weight: 8 },
    { mult: 5.0,   weight: 3 },
    { mult: 10.0,  weight: 1.2 },
    { mult: 20.0,  weight: 0.4 },
    { mult: 50.0,  weight: 0.12 },
    { mult: 100.0, weight: 0.03 }
  ],
  extraJumps: [
    { jumps: 1,  weight: 14 },
    { jumps: 2,  weight: 10 },
    { jumps: 3,  weight: 7 },
    { jumps: 4,  weight: 5 },
    { jumps: 5,  weight: 3.5 },
    { jumps: 6,  weight: 2.5 },
    { jumps: 7,  weight: 1.5 },
    { jumps: 8,  weight: 0.9 },
    { jumps: 9,  weight: 0.5 },
    { jumps: 10, weight: 0.2 }
  ],
  extraHorse: { weight: 1.5 }
};

function rollN() {
  return 1 + Math.floor(Math.random() * 10);
}

function buildDistribution() {
  const items = [];
  items.push({ kind: 'EMPTY', weight: TILE_CONFIG.empty.weight });
  for (const p of TILE_CONFIG.payouts) {
    items.push({ kind: 'PAYOUT', mult: p.mult, weight: p.weight });
  }
  for (const j of TILE_CONFIG.extraJumps) {
    items.push({ kind: 'JUMPS', jumps: j.jumps, weight: j.weight });
  }
  items.push({ kind: 'HORSE', weight: TILE_CONFIG.extraHorse.weight });
  const total = items.reduce((s, x) => s + x.weight, 0);
  let acc = 0;
  for (const it of items) {
    acc += it.weight;
    it.cum = acc / total;
  }
  return items;
}

const DIST = buildDistribution();

function sampleTile() {
  const r = Math.random();
  for (const it of DIST) if (r < it.cum) return { ...it };
  return { ...DIST[DIST.length - 1] };
}

function buildBoard() {
  const board = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    const row = [];
    for (let c = 0; c < BOARD_SIZE; c++) row.push(sampleTile());
    board.push(row);
  }
  return board;
}

function legalMoves(r, c) {
  const out = [];
  for (const [dr, dc] of KNIGHT_MOVES) {
    const nr = r + dr, nc = c + dc;
    if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
      out.push([nr, nc]);
    }
  }
  return out;
}

function runHorse(board, startR, startC, N) {
  let r = startR, c = startC;
  const path = [];
  let jumps = N;
  let totalPayout = 0;
  let hatchedHorses = 0;

  while (jumps > 0) {
    const moves = legalMoves(r, c);
    const [nr, nc] = moves[Math.floor(Math.random() * moves.length)];
    r = nr; c = nc;
    jumps--;

    const tile = board[r][c];
    let gainedJumps = 0;
    let payout = 0;
    let triggeredHorse = false;

    if (tile.kind === 'PAYOUT') {
      payout = tile.mult;
      totalPayout += payout;
    } else if (tile.kind === 'JUMPS') {
      gainedJumps = tile.jumps;
      jumps += gainedJumps;
    } else if (tile.kind === 'HORSE') {
      triggeredHorse = true;
      hatchedHorses++;
    }

    path.push({ r, c, tile, payout, gainedJumps, triggeredHorse, jumpsRemaining: jumps });
  }

  return { path, totalPayout, hatchedHorses };
}

// Public API: run one full spin
function spin() {
  const N = rollN();
  const board = buildBoard();

  const horses = [];
  const primary = runHorse(board, START_R, START_C, N);
  horses.push({ origin: 'PRIMARY', startR: START_R, startC: START_C, baseJumps: N, ...primary });

  let pending = primary.hatchedHorses;
  let depth = 0;
  while (pending > 0 && depth < MAX_EXTRA_HORSE_DEPTH) {
    let next = 0;
    for (let i = 0; i < pending; i++) {
      const extra = runHorse(board, EXTRA_HORSE_START_R, EXTRA_HORSE_START_C, N);
      horses.push({
        origin: 'EXTRA', depth: depth + 1,
        startR: EXTRA_HORSE_START_R, startC: EXTRA_HORSE_START_C,
        baseJumps: N, ...extra
      });
      next += extra.hatchedHorses;
    }
    pending = next;
    depth++;
  }

  const totalWin = horses.reduce((s, h) => s + h.totalPayout, 0);
  return { bet: 1, baseN: N, board, horses, totalWin };
}

// Expose globally so non-module script can use it
window.KnightEngine = { spin, BOARD_SIZE, START_R, START_C };
