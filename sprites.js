// Pixel art assets for Knight Slot.
// Each sprite is a 16x16 pixel grid expressed as a string array; '.' = transparent.
// Rendered as inline SVG with shape-rendering: crispEdges for sharp pixels.
//
// Color codes:
//   '.' = transparent
//   'a' = dark outline
//   'b' = main body (light)
//   'c' = mid shadow
//   'd' = deep shadow
//   'e' = eye / nostril (dark)
//   'f' = highlight / mane crown
//   'g' = base pedestal mid

// Chess knight — head facing LEFT (snout pointing left), ear top-right,
// mane shadow defining the back of the neck, wide pedestal base.
// 16x16 silhouette designed to read as a chess piece even at small sizes.
export const KNIGHT_SPRITE = [
  '................',
  '.........aa.....',
  '........abba....',
  '.......abbbba...',
  '......abbbbbba..',
  '.....abbbbbcba..',
  '...aabbbbbccba..',
  '..abbbbbbbccba..',
  '.abbcebbbbcba...',
  '.abbbbbbbbcba...',
  '..aabbbbbbcba...',
  '....abbbbcba....',
  '....abbbbcba....',
  '...abbbbbbbba...',
  '..abgggggggggba.',
  '.aaaaaaaaaaaaaa.'
];

// Color palette for white/cream knight (primary horse)
export const KNIGHT_PALETTE_LIGHT = {
  a: '#1a0508',  // outline
  b: '#f4ecd8',  // light cream body
  c: '#c9b890',  // shadow
  d: '#8a7548',  // deep shadow
  e: '#1a0508',  // eye
  f: '#fff5dc',  // highlight
  g: '#7a5a30'   // pedestal
};

// Color palette for "second horse" (extra horse spawn) — golden tint
export const KNIGHT_PALETTE_GOLD = {
  a: '#2a1408',
  b: '#f7d56b',
  c: '#c89a30',
  d: '#7a5810',
  e: '#2a1408',
  f: '#fff0a8',
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
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${filter}${g}${rects.join('')}</g></svg>`;
}

// Special "extra horse" symbol icon (smaller, decorative, used inside a tile)
export const HORSE_SYMBOL_SPRITE = [
  '................',
  '.......aaaa.....',
  '......aabbaa....',
  '.....abbbbba....',
  '....abccccba....',
  '....abcddcba....',
  '...abcdddccba...',
  '...abdddddcba...',
  '...abddeedcba...',
  '....abeeebba....',
  '.....abbbba.....',
  '....abbbbbba....',
  '...abbabbabba...',
  '..aabaaaaaabaa..',
  '................',
  '................'
];

export const HORSE_SYMBOL_PALETTE = {
  a: '#1a0a00',
  b: '#ffd84d',
  c: '#ffe680',
  d: '#fff0a8',
  e: '#1a0a00'
};
