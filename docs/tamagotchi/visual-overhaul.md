# Monster visual overhaul (2.5D arena look)

Notes for the next session working on the monster game's new look. The work so far is a
standalone prototype, not yet in the game.

**Talk to the owner in Thai.** Every reply, progress note and question must be in Thai. They have
asked for this more than once.

## Where it lives

- Live prototype (claude.ai Artifact, private to the owner):
  https://claude.ai/artifact/CjvCJ453cPeJxVzQrsTTDj
  To change it from a new session, read it with the Artifact tool, edit, and republish to the same
  URL.
- Source copy: `docs/tamagotchi/prototypes/monster-arena-25d.html`. It is one self-contained page:
  open it in a browser to run it. Add a `<!doctype html>` wrapper if a browser renders it oddly.
- The page has a "ดูส่วน" dropdown at the top: all / fire monsters + skills / water monsters +
  skills / plan. The battle scene always stays on top.

## Direction the owner approved

- Style: pixel art in a 3/4 top-down 2.5D arena, like a sprite-based monster battle clip the
  owner shared. Everything is drawn by code. Never copy characters or art from existing games;
  make original designs only.
- Arena: three times the screen in width and height. The camera follows the fight, and a minimap
  sits in the corner. In demo mode the monsters walk around freely.
- Animation: crisp pixel frames, sampled from continuous pose curves and baked lazily (idle 12,
  walk 12, attack 16, cast 16, hurt 6). The attack runs wind-up, rush, hit-hold, return. The walk
  phase follows the distance walked, so feet do not slide. Movement accelerates and decelerates.
  The world is drawn at screen resolution so positions move between pixels.
- Each line keeps one animal family. A form must be a creature, never an object or a person.
  Higher stages are bigger and grander: babies are small, perfect forms are 56–64 px, ultimate
  forms are 64–80 px, fused forms are 64–88 px with a twin aura, bosses are 96 px.
- Stages must be readable. Every card and the battle HUD show a stage badge with stars. All
  evolution cards draw at the same pixel scale. Each line has a line-up strip from egg to its top
  form.
- Water monsters float and swim; they don't walk. The owner found the first water set too plain.
  The redraw added saturated colours, patterns, pulsing bioluminescent glows and see-through fins.

## Status

| Part | State |
|---|---|
| Fire line, 11 forms | Done: distinct colour per form, rigged |
| Fire skills, all 8 from `arena-data.ts` | Done: each animation matches its mechanic (range, zone delay, beam, multi-hit, status) |
| Fire fused (อวตารสุริยะ) and world boss (มังกรเพลิงกัลป์) | Done (boss redesigned once: 4-legged dragon, raised wings) |
| Water line, 11 forms | Done (v2, more detail) |
| Water ultimate | The owner chose option C, adjusted: crystal-horn whale, whale flippers instead of "hands", thick armour plates on the back. Working name ราชาวาฬผลึก (replaces วาฬราชันตรีศูล). Options A and B remain on the page for comparison |
| Water skills, all 8 | Done: shields, cleanse and regen work in the prototype |
| Water fused (สมุทรผู้ตื่น) | Done, redrawn once: original roaring sea dragon in an S-curve. The gold belly always faces the front and bottom: the belly is on the right of the tail-to-head direction, the back on the left. It has a continuous see-through dorsal sail, shoulder fin-wings, a glowing lateral line, a long-snouted roaring head and swept-back crystal horns |
| Water world boss (เต่ายักษ์วารี) | Done |
| Plan table for all 8 lines | On the page: which forms to keep and which to replace, with reasons |
| Leaf, earth, lightning, holy, dark, shadow lines | Not started |
| The other 19 fused forms and 11 bosses | Not started |
| Putting the art into the real game | Not started |

## Open items and known gaps

- The glow on the crystal whale's horn tip does not follow the head during the attack pose
  (`glows` are static sprite coordinates).
- The fire line is less detailed than water v2. Plan: raise it to the same level.
- New names (ราชาวาฬผลึก and the names in the plan table) are proposals only. The game data in
  `demo-app-backend` `species-data.ts` is unchanged.
- The skill name "ตรีศูลสมุทร" is still the game's name. Ask the owner before renaming it.
- Perfect forms have no aura yet. The idea is a small sparkle at the feet to tell them from
  adult forms.
- Guarding: the game has no manual guard. The prototype's guard pose stands for the "ปัดป้อง"
  parry dodge skill (50% damage cut, no dash).

## Next steps (suggested order)

1. Leaf line with the same process: plan table concept → sprites → rig → its 8 skills → its fused
   form and boss.
2. Then earth, lightning, holy, dark, shadow lines.
3. Integration plan for the real game: replace the emoji in `ArenaReplay.tsx` with sprite frames.
   Positions come from the server replay, so poses map to replay events (walk while moving,
   attack/cast at skill events, the parry pose on dodge events with `parry`). Combat results stay
   unchanged.

## How the prototype code is organised (inside the HTML)

- `Spr`: draws shapes on a pixel grid (`E` ellipse, `P` polygon, `L` tapered line, `spike`, `d`
  detail pixel, `line`, `eye`). It shades automatically with light from the top-left, outlines
  automatically, and supports translucent palettes (`#rrggbbaa`).
- `MATS`: palettes, 5 tones each. `GLOW`: emissive materials.
- `SPRITES[id]`: `size`, `rig` (QUAD / BIPED / BLOB / SWIM), `draw(s, P)` with pose offsets,
  `emit` particle emitters, `mouth`, optional `hover`, `aura`, and `glows`.
- `ANIM` + `getFrame`: pose curves and lazy frame baking.
- `FIRE` / `WATER`: game-skill animations (`useFire(id, att, def)` dispatches both).
- `STAGES` / `STAGE_OF`: the stage badges.
- `ROSTER`: what the battle selectors offer.
