# Knight's Gambit — Slot Game

An 8×8 chess-board slot game. The knight starts at the bottom-right corner and makes 1–10 L-shaped jumps each spin. Tiles can pay multipliers, give extra jumps, or spawn a second golden knight from the top-left corner.

## Quick start

```bash
npm install
npm start
# open http://localhost:3000
```

That's it. Single Node.js process serves both the API and the frontend.

## File structure

```
knight-slot/
├── package.json           # express + cors deps
├── server.js              # Node backend, exposes /api/spin
└── public/                # frontend, served as static files
    ├── index.html         # React app (loaded via CDN, no build step)
    ├── engine.js          # game logic — used by BOTH backend and browser
    └── sprites.js         # pixel art knight + palettes
```

## How the game works

| Element            | Behavior                                                         |
| ------------------ | ---------------------------------------------------------------- |
| Board              | 8×8, dark red ("black") + cream ("white") tiles                  |
| Knight start       | Bottom-right corner (row 7, col 7)                               |
| Base jumps `N`     | Rolled uniformly 1–10 at the start of each spin                  |
| Movement           | Standard chess L-move, **uniformly random** among legal moves    |
| Tile contents      | Re-randomized & **shown** before the spin starts                 |
| Tile retrigger     | Tiles stay active — knight can land on the same tile twice       |
| Stuck state        | Doesn't happen on 8×8 (every square has ≥2 legal moves)          |
| Extra-horse symbol | Spawns a 2nd knight from top-left (0,0); jumps the same `N` times|
| Recursion cap      | Extra-horse cascade stops after depth 5                          |
| Bet                | 1 unit per spin                                                  |

## Tile types & current weights

Edit `public/engine.js`, the `TILE_CONFIG` object. Higher weight = more common.

| Type           | Values                                                 |
| -------------- | ------------------------------------------------------ |
| `EMPTY`        | Pays nothing                                           |
| `PAYOUT`       | 0.1× / 0.2× / 0.4× / 0.6× / 0.8× / 1× / 2× / 5× / 10× / 20× / 50× / 100× |
| `JUMPS`        | +1 to +10 extra jumps                                  |
| `EXTRA_HORSE`  | Spawns the second knight                               |

## Tuning RTP

Run a Monte Carlo simulation. Quick recipe:

```js
// sim.js — drop in project root
import { spin } from './public/engine.js';

const SPINS = 500_000;
let total = 0;
for (let i = 0; i < SPINS; i++) total += spin().totalWin;
console.log('RTP:', (total / SPINS * 100).toFixed(2) + '%');
```

Run with `node sim.js`. Tweak weights in `engine.js`, re-run, repeat until you hit your target.

**Drivers of RTP:**
- Higher weight on big payouts (10×+) → higher RTP and higher volatility
- Higher weight on `JUMPS` tiles → MASSIVE RTP increase (extra landings = compounding)
- Higher weight on `EXTRA_HORSE` → big variance, harder to control
- Higher weight on `EMPTY` → lower RTP, lower volatility

## API

### `POST /api/spin`

No request body. Returns:

```json
{
  "bet": 1,
  "baseN": 7,
  "board": [[{"kind":"PAYOUT","mult":0.4}, ...], ...],
  "horses": [
    {
      "origin": "PRIMARY",
      "startR": 7, "startC": 7,
      "baseJumps": 7,
      "path": [
        {"r":5,"c":6,"tile":{"kind":"PAYOUT","mult":0.4},"payout":0.4,"gainedJumps":0,"triggeredHorse":false,"jumpsRemaining":6},
        ...
      ],
      "totalPayout": 1.2,
      "hatchedHorses": 0
    }
  ],
  "totalWin": 1.2
}
```

The frontend replays the `path` array tile-by-tile with ~310ms animation per jump.

### `GET /api/health` — liveness check

## Production notes

- The frontend currently has a fallback to client-side spin if `/api/spin` is unreachable. **Remove that fallback for real money play** — spin results MUST come from the server.
- Add session/auth, balance persistence, and audit logging before going live.
- The current animation (~310ms/hop) means a 10-jump spin takes ~3s. Adjustable in `index.html` (`sleep(310)` line).
- Knight sprite is a 16×16 pixel art SVG generated at runtime (`sprites.js`). To swap in real pixel art PNG/sprite-sheets, replace `KNIGHT_SPRITE` data with image URLs and adjust `Knight` component.

## Customizing visuals

- **Tile colors:** CSS variables `--board-dark`, `--board-light` in `index.html` `<style>`.
- **Gold/red theme:** `--gold`, `--accent`.
- **Knight palette:** `KNIGHT_PALETTE_LIGHT` (primary, cream/white) and `KNIGHT_PALETTE_GOLD` (extra horse) in `sprites.js`.
- **Animation speed:** `await sleep(310)` line in `handleSpin()` in `index.html`.
# Knight-Gambit
