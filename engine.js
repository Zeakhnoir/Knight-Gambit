// =============================================================
// KNIGHT SLOT — game engine (pure logic, no DOM)
// =============================================================
// Rules summary:
// - 8x8 board, knight starts at bottom-right (row 7, col 7).
// - Each spin: roll N (1..10) base jumps for the primary horse.
// - Knight makes N L-shaped jumps, uniformly random among legal moves.
//   If no legal moves exist, allow revisit (in practice every square has >=2 moves).
// - Tile contents are randomized fresh and SHOWN before the spin.
// - Tiles stay active (can retrigger).
// - Tile types: EMPTY, PAYOUT (multiplier), JUMPS (+k), EXTRA_HORSE.
// - EXTRA_HORSE: spawns a second horse from top-left (0,0) that jumps N times.
//   Extra horses can themselves trigger further extra horses. Capped at depth=5.
// - Bet = 1 unit. Win = sum of all payout multipliers landed on.
// =============================================================

export const KNIGHT_MOVES = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1]
];

export const BOARD_SIZE = 8;
export const START_R = 7;
export const START_C = 7;
export const EXTRA_HORSE_START_R = 0;
export const EXTRA_HORSE_START_C = 0;
export const MAX_EXTRA_HORSE_DEPTH = 5;

// ---------- TILE WEIGHT CONFIG ----------
// Adjust these freely to tune RTP / volatility.
export const TILE_CONFIG = {
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

// Distribution of base N (jumps per spin), uniform 1..10
export function rollN(rng = Math.random) {
  return 1 + Math.floor(rng() * 10);
}

// Build a flat sampling table from TILE_CONFIG
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

export function sampleTile(rng = Math.random) {
  const r = rng();
  for (const it of DIST) if (r < it.cum) return { ...it };
  return { ...DIST[DIST.length - 1] };
}

export function buildBoard(rng = Math.random) {
  const board = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    const row = [];
    for (let c = 0; c < BOARD_SIZE; c++) row.push(sampleTile(rng));
    board.push(row);
  }
  return board;
}

export function legalMoves(r, c) {
  const out = [];
  for (const [dr, dc] of KNIGHT_MOVES) {
    const nr = r + dr, nc = c + dc;
    if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
      out.push([nr, nc]);
    }
  }
  return out;
}

// Run a single horse path. Records every step for animation.
// Returns { path: [{r,c,tile,gainedJumps,triggeredHorse}], totalPayout, hatchedHorses }
function runHorse(board, startR, startC, N, rng = Math.random) {
  let r = startR, c = startC;
  const path = [];
  let jumps = N;
  let totalPayout = 0;
  let hatchedHorses = 0;

  while (jumps > 0) {
    const moves = legalMoves(r, c);
    // Uniform random among legal moves. (All 64 squares always have >=2 legal moves.)
    const [nr, nc] = moves[Math.floor(rng() * moves.length)];
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

// Full spin orchestration: primary horse + cascading extra horses.
// Returns a structured result the UI can replay step by step.
export function spin(rng = Math.random) {
  const N = rollN(rng);
  const board = buildBoard(rng);

  const horses = [];
  // Primary horse
  const primary = runHorse(board, START_R, START_C, N, rng);
  horses.push({
    origin: 'PRIMARY',
    startR: START_R,
    startC: START_C,
    baseJumps: N,
    ...primary
  });

  // Cascade: each triggered HORSE tile spawns a new horse from top-left, jumping N times.
  let pending = primary.hatchedHorses;
  let depth = 0;
  while (pending > 0 && depth < MAX_EXTRA_HORSE_DEPTH) {
    let nextPending = 0;
    for (let i = 0; i < pending; i++) {
      const extra = runHorse(board, EXTRA_HORSE_START_R, EXTRA_HORSE_START_C, N, rng);
      horses.push({
        origin: 'EXTRA',
        depth: depth + 1,
        startR: EXTRA_HORSE_START_R,
        startC: EXTRA_HORSE_START_C,
        baseJumps: N,
        ...extra
      });
      nextPending += extra.hatchedHorses;
    }
    pending = nextPending;
    depth++;
  }

  const totalWin = horses.reduce((s, h) => s + h.totalPayout, 0);

  return {
    bet: 1,
    baseN: N,
    board,
    horses,
    totalWin
  };
}
