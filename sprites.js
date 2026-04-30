// Pixel art assets for Knight Slot.
// Each sprite is a pixel grid expressed as a string array; '.' = transparent.
// Rendered as inline SVG with shape-rendering: crispEdges for sharp pixels.
//
// Color codes:
//   '.' = transparent
//   'a' = dark outline
//   'b' = main body (light)
//   'c' = mid shadow (mane / neck)
//   'd' = deep shadow
//   'e' = eye
//   'g' = pedestal base

// Chess knight — 28x20 horizontal silhouette.
// Head facing LEFT (snout pointing left), pointed ear up-back,
// mane shadow on the back of the neck, classic Staunton pedestal.
export const KNIGHT_SPRITE = [
  '............................',
  '............................',
  '...............aaa..........',
  '..............abbba.........',
  '...........aaabbbbba........',
  '..........abbbbbbbbba.......',
  '.........abbbbbbbbbbba......',
  '........abbbbbbbbbbbcba.....',
  '.......abbbbebbbbbbbccba....',
  '......abbbbbbbbbbbbbccba....',
  '.....abbbbbbbbbbbbbbccba....',
  '....abbbbaabbbbbbbbbccba....',
  '....abaaa..abbbbbbbbccba....',
  '....aa......abbbbbbbccba....',
  '............abbbbbbbccba....',
  '............abbbbbbbbcba....',
  '............abbbbbbbbbba....',
  '...........abbbbbbbbbbbba...',
  '..........aggggggggggggga...',
  '..........aaaaaaaaaaaaaaa...'
];

// Color palette for white/cream knight (primary horse)
export const KNIGHT_PALETTE_LIGHT = {
  a: '#1a0508',  // outline
  b: '#f4ecd8',  // light cream body
  c: '#beac82',  // mane shadow
  d: '#8a7548',  // deep shadow
  e: '#1a0508',  // eye
  g: '#7a5a30'   // pedestal
};

// Color palette for "second horse" (extra horse spawn) — golden tint
export const KNIGHT_PALETTE_GOLD = {
  a: '#2a1408',
  b: '#f7d56b',
  c: '#b8881e',
  d: '#7a5810',
  e: '#2a1408',
  g: '#5a3a08'
};

export function spriteToSVG(sprite, palette, size = 64, glow = false) {
  const w = sprite[0].length;
  const h = sprite.length;
  const rects = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = sprite[y][x];
      if (ch === '.') continue;
      const fill = palette[ch];
      if (!fill) continue;
      rects.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${fill}"/>`);
    }
  }
  const filter = glow
    ? '<defs><filter id="glow"><feGaussianBlur stdDeviation="0.4"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>'
    : '';
  const g = glow ? '<g filter="url(#glow)">' : '<g>';
  // viewBox preserves the sprite's aspect ratio inside a square `size` box.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" shape-rendering="crispEdges">${filter}${g}${rects.join('')}</g></svg>`;
}