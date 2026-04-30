# Knight's Gambit — Slot Game

8×8 chess board slot game. The knight jumps L-shape moves. Tiles can pay multipliers, give extra jumps, or spawn a second golden knight.

## How to run

**Just double-click `index.html`** — opens in your browser. No install, no commands, no server.

That's it.

## File structure

```
knight-slot/
├── index.html          ← double-click to play
├── README.md
├── assets/
│   ├── knight-cream.png   ← primary horse pixel art
│   └── knight-gold.png    ← extra-horse pixel art (gold)
└── src/
    ├── engine.js          ← game logic (edit weights here)
    ├── app.js             ← UI / animation
    └── styles.css         ← visuals
```

## Tuning the game

All weights are in **`src/engine.js`** — look for `TILE_CONFIG` near the top.

```js
const TILE_CONFIG = {
  empty: { weight: 50 },
  payouts: [
    { mult: 0.1, weight: 80 },
    ...
  ],
  ...
};
```

After editing, just **refresh the browser** (Ctrl+R / Cmd+R). No restart needed since there's no server.

## Tweaking visuals

- **Tile colors** (red/white): edit CSS variables `--board-dark` and `--board-light` in `src/styles.css`.
- **Animation speed**: edit `ANIMATION_MS` at the top of `src/app.js` (lower = faster).
- **Knight art**: replace `assets/knight-cream.png` and `assets/knight-gold.png` with your own pixel art (any size; image will be scaled to the tile via CSS `image-rendering: pixelated`).

## Game rules

- 8×8 board, knight starts bottom-right
- Each spin: roll N (1–10) base jumps
- Knight moves L-shape, uniformly random among legal moves
- Tile contents re-randomized and shown each spin
- Tiles stay active (can retrigger)
- Extra-horse tile: spawns 2nd horse (gold) from top-left, jumps N times
- Bet 1 per spin
