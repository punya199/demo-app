// Builds docs/tamagotchi/prototypes/monster-arena/js/flourish.js from the game's flourish.ts and the
// backend skill table. Run from the demo-app root, with demo-app-backend checked out beside it:
//   node scripts/monster-sprites/gen-flourish.cjs
const fs = require('fs')
const ts = require('typescript')
const OUT = 'docs/tamagotchi/prototypes/monster-arena/js/flourish.js'
const src = fs.readFileSync('src/pages/project/tamagotchi/arena/skill-fx/flourish.ts', 'utf8')
let js = ts.transpileModule(src, {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
}).outputText
js = js
  .replace(/^import .*\n/gm, '')
  .replace(/^export /gm, '')
  .replace(/scene\.shake/g, 'shake')
  .replace(/scene\.flashScreen/g, 'flashScreen')
  .replace(/scene\.darken/g, 'darken')
const be = fs.readFileSync('../demo-app-backend/src/modules/monster/arena/arena-data.ts', 'utf8')
const tjs = ts.transpileModule(be.replace(/^import .*$/m, ''), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText
const m = { exports: {} }
new Function('module', 'exports', tjs)(m, m.exports)
const EL = { flame: 'fire', tide: 'water', leaf: 'leaf', earth: 'earth', lightning: 'bolt', holy: 'holy', dark: 'dark', shadow: 'shadow' }
const tab = {}
for (const s of m.exports.ARENA_SKILLS) if (s.slot === 'active') tab[s.id] = [s.src, s.kind, EL[s.el] || 'gold']
const out = `'use strict'
// Grandeur by skill tier: the same code as the game's arena/skill-fx/flourish.ts (transpiled by
// gen-flourish; the game's scene.shake / flashScreen / darken are this page's globals). SKILL_INFO is each
// player skill's [src, kind, element] from the backend arena-data.ts, so the tier matches the game's.
const FLOURISH = (() => {
${js.trim()}
  const EL = ${JSON.stringify(EL)}
  const SKILL_INFO = ${JSON.stringify(tab)}
  // The flourish of a game skill id, or null below Perfect.
  const of = (id) => {
    const info = SKILL_INFO[id]
    if (!info) return null
    const [src, kind, el] = info
    const tier = flourishTierOf(src, 'active')
    if (!tier) return null
    const els = [el]
    if (tier === 3) {
      const other = src.slice('fused_'.length).split('_').map((l) => EL[l]).find((e) => e !== el)
      els.push(other || 'gold')
    }
    return { tier, kind, els }
  }
  return { of, charge, release, colsOf }
})()
`
fs.writeFileSync(OUT, out)
console.log('skills', Object.keys(tab).length)
