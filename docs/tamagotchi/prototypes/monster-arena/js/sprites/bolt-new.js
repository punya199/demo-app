'use strict'
// The 9 remodelled lightning forms (bolt-new-bitmaps.js) as sprites, uncut for now: still drafts until the
// owner approves the look, then they are cut into parts like hybrid.js.
for (const old of [
  'tbird',
  'staticcat',
  'stormfox',
  'hawk',
  'gloomcloud',
  'boltfox',
  'thunderking',
  'foxking',
  'bfused',
]) {
  const id = 'nb_' + old
  ADV_EL[id] = 'bolt'
  ADV_DESIGN_W[id] = ADV_BMP[id].rows[0].length
  SPRITES[id] = ADV_SPRITE(id, QUAD, [['body']])
}
