'use strict'
// The lightning line from adult up, remodelled from the owner's AI sheet (2026-11-10, bitmaps in
// bolt-new-bitmaps.js), cut into parts like the adventure enemies (ADV_SPRITE in adventure.js) and put in place
// of the hand-drawn forms in bolt.js, so the lineup, the arena and the skills all use them. The egg and the
// two baby forms keep their hand-drawn art. Birds fly on their wings (FLY), the cloud floats (BLOB), the
// cat, the foxes and the awakened beast walk (QUAD). Glows are on the bitmap grid (moved onto the sprite grid
// here) and follow the part named last.
{
  const box = (x0, y0, x1, y1) => (x, y) => x >= x0 && x <= x1 && y >= y0 && y <= y1
  const NEW_BOLT = {
    tbird: [
      FLY,
      [
        ['tail', (x, y) => x <= 7 && y >= 11, 'swing', 'tail', 8, null, 0, -1.5, 8],
        ['wing', box(6, 6, 20, 21), 'swing', 'wing', 20, 16, 0.5, -3, 14],
        ['body'],
        ['head', (x, y) => x >= 23 && y <= 17, 'rigid', 'head', 0.7, 2],
      ],
      { hover: 6, fly: true, mouth: [37, 15], glows: [[29, 6, '#ffe14a', 4, 'head']] },
    ],
    staticcat: [
      QUAD,
      [
        ['tail', (x, y) => x <= 11 && y >= 15, 'swing', 'tail', 12, null, 0, -1.2, 10],
        ['legB', (x, y) => x >= 3 && x <= 17 && y >= 28, 'leg', 'bl', 28, 31],
        ['body'],
        ['legF', (x, y) => x >= 24 && y >= 28, 'leg', 'ff', 28, 31],
        ['head', (x, y) => x >= 17 && y <= 17, 'rigid', 'head', 0.6, 1.5],
      ],
      { mouth: [36, 13], emit: [{ x: 20, y: 6, type: 'zap', rate: 1.2 }] },
    ],
    stormfox: [
      QUAD,
      [
        ['tail', (x, y) => x <= 15 && y <= 27, 'swing', 'tail', 16, 22, 0, -2, 16],
        ['legBL', (x, y) => x >= 9 && x <= 16 && y >= 28, 'leg', 'bl', 28, 36],
        ['legFL', (x, y) => x >= 27 && x <= 32 && y >= 28, 'leg', 'fl', 28, 36],
        ['body'],
        ['legBF', (x, y) => x >= 17 && x <= 26 && y >= 28, 'leg', 'bf', 28, 36],
        ['legFF', (x, y) => x >= 33 && y >= 27, 'leg', 'ff', 27, 36],
        ['head', (x, y) => x >= 30 && y <= 22, 'rigid', 'head', 0.7, 2],
      ],
      { mouth: [44, 18], glows: [[6, 11, '#ffe14a', 4]] },
    ],
    hawk: [
      FLY,
      [
        ['wingBack', (x, y) => x <= 27 && y <= 31, 'swing', 'wing', 27, 28, 0.6, -3, 28],
        ['tail', (x, y) => x <= 24 && y >= 38, 'swing', 'tail', 25, 38, 0, -1.5, 18],
        ['body'],
        [
          'wingFront',
          (x, y) => x >= 31 && x <= 51 && y <= 19,
          'swing',
          'wing',
          36,
          20,
          0.4,
          -2.5,
          20,
        ],
        ['head', (x, y) => x >= 44 && y >= 18 && y <= 34, 'rigid', 'head', 0.7, 2],
      ],
      { hover: 7, fly: true, mouth: [55, 27], glows: [[46, 20, '#ffe14a', 5, 'head']] },
    ],
    gloomcloud: [
      BLOB,
      [['tail', (x, y) => x <= 10 && y >= 14, 'swing', 'tail', 11, null, 0, -1, 10], ['body']],
      {
        hover: 4,
        mouth: [38, 24],
        glows: [
          [34, 17, '#ffe14a', 3, 'body'],
          [40, 20, '#ffe14a', 3, 'body'],
        ],
        emit: [{ x: 28, y: 32, type: 'zap', rate: 1 }],
      },
    ],
    boltfox: [
      QUAD,
      [
        ['tail', (x, y) => x <= 27 && y <= 34, 'swing', 'tail', 28, 30, 0, -2, 26],
        ['legBL', (x, y) => x >= 12 && x <= 20 && y >= 37, 'leg', 'bl', 37, 46],
        ['legFL', (x, y) => x >= 36 && x <= 42 && y >= 37, 'leg', 'fl', 37, 46],
        ['body'],
        ['legBF', (x, y) => x >= 21 && x <= 30 && y >= 37, 'leg', 'bf', 37, 46],
        ['legFF', (x, y) => x >= 43 && y >= 36, 'leg', 'ff', 36, 46],
        ['head', (x, y) => x >= 38 && y <= 30, 'rigid', 'head', 0.7, 2],
      ],
      {
        mouth: [54, 24],
        glows: [
          [8, 14, '#ffe14a', 6],
          [16, 6, '#ffe14a', 5],
        ],
      },
    ],
    thunderking: [
      FLY,
      [
        ['wingBack', (x, y) => x <= 33 && y <= 46, 'swing', 'wing', 34, 42, 0.6, -3, 36],
        ['tail', (x, y) => x <= 38 && y >= 50, 'swing', 'tail', 38, 50, 0, -1.5, 26],
        ['body'],
        [
          'wingFront',
          (x, y) => x >= 34 && x <= 52 && y <= 26,
          'swing',
          'wing',
          44,
          28,
          0.4,
          -2.5,
          24,
        ],
        ['head', (x, y) => x >= 53 && y >= 12 && y <= 44, 'rigid', 'head', 0.7, 2],
      ],
      {
        hover: 8,
        fly: true,
        aura: { type: 'sparks', x: 40, y: 74, r: 30 },
        mouth: [70, 36],
        glows: [[60, 16, '#ffe14a', 6, 'head']],
      },
    ],
    foxking: [
      QUAD,
      [
        ['tail', (x, y) => x <= 40 && y <= 50, 'swing', 'tail', 42, 42, 0, -2, 38],
        ['legBL', (x, y) => x >= 12 && x <= 28 && y >= 54, 'leg', 'bl', 54, 65],
        ['legFL', (x, y) => x >= 44 && x <= 54 && y >= 54, 'leg', 'fl', 54, 65],
        ['body'],
        ['legBF', (x, y) => x >= 29 && x <= 43 && y >= 54, 'leg', 'bf', 54, 65],
        ['legFF', (x, y) => x >= 55 && y >= 52, 'leg', 'ff', 52, 65],
        ['head', (x, y) => x >= 50 && y <= 38, 'rigid', 'head', 0.7, 2],
      ],
      {
        aura: { type: 'sparks', x: 40, y: 72, r: 30 },
        mouth: [70, 32],
        glows: [
          [10, 24, '#ffe14a', 6],
          [24, 6, '#ffe14a', 6],
          [10, 44, '#ffe14a', 6],
        ],
      },
    ],
  }
  for (const [old, [rig, parts, extra]] of Object.entries(NEW_BOLT)) {
    const id = 'nb_' + old,
      { glows = [], aura, ...rest } = extra
    ADV_DESIGN_W[id] = ADV_BMP[id].rows[0].length
    const def = ADV_SPRITE(id, rig, parts, rest),
      w = ADV_BMP[id].rows[0].length,
      h = ADV_BMP[id].rows.length,
      ox = Math.round((def.size - w) / 2),
      oy = def.size - h - 2
    def.glows = glows.map(([x, y, ...g]) => [x + ox, y + oy, ...g])
    if (aura) def.aura = { ...aura, x: def.size / 2, y: def.size - 6 }
    SPRITES[old] = def
  }
}
// The awakened form plays the AI's own frames (bolt-frames.js) instead of a cut-up still.
SPRITES.bfused = FRAME_SPRITE('bfused', QUAD, {
  aura: { type: 'twinb', x: 64, y: 122, r: 30 },
  mouth: [108, 42],
  glows: [[91, 60, '#ffffff', 6]],
  emit: [{ x: 10, y: 60, type: 'zap', rate: 3 }],
})
