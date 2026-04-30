// Pixel art assets for Knight Slot.
// Side-profile chess knight — clean silhouette, no fancy stuff.
// Each sprite is a pixel grid; '.' = transparent, letters = color codes.
// Rendered as inline SVG with shape-rendering: crispEdges for sharp pixels.

// Chess knight (24x26) — side profile, snout facing LEFT.
// Classic chess piece silhouette: pointed ear, bulged head,
// narrow neck, wide pedestal base.
export const KNIGHT_SPRITE = [
  '........................',
  '..............aa........',
  '.............abba.......',
  '............abbba.......',
  '...........abbbba.......',
  '..........abbbbbaa......',
  '.........abbbbbbbba.....',
  '........abbbbbbbbbba....',
  '.......abbbbbbbbbbba....',
  '......abbbbbbbbbbbba....',
  '.....abbebbbbbbbbbba....',
  '....abbbbbbbbbbbbbba....',
  '...abbbbbbbbbbbbbbba....',
  '..abbbbbbbbbbbbbbbba....',
  '..abbbbaabbbbbbbbbba....',
  '..abbaa..abbbbbbbbba....',
  '..aaa....abbbbbbbbba....',
  '..........abbbbbbba.....',
  '..........abbbbbba......',
  '..........abbbbbba......',
  '..........abbbbbba......',
  '.........abbbbbbbba.....',
  '........abbbbbbbbbba....',
  '.......abbbbbbbbbbbba...',
  '......aaaaaaaaaaaaaaaa..',
  '........................'
];

// Color palette for white/cream knight (primary horse)
export const KNIGHT_PALETTE_LIGHT = {
  a: '#140608',   // outline (dark)
  b: '#f0e4c8',   // body (cream)
  e: '#140608'    // eye
};

// Color palette for "second horse" (extra horse spawn) — golden tint
export const KNIGHT_PALETTE_GOLD = {
  a: '#241008',
  b: '#f5c842',
  e: '#241008'
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
  // preserveAspectRatio centers sprite inside the square tile box
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" shape-rendering="crispEdges">${filter}${g}${rects.join('')}</g></svg>`;
}
