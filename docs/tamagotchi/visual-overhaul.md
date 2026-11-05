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
  skills / leaf monsters + skills / plan. The battle scene always stays on top.

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
| Leaf line, 11 forms | Done. Deer main branch (กวางใบไม้ → กวางเขาพฤกษา → เทพพนาลัย, a jade elk carrying a small forest), wolf branch (หมาป่าไพร → หมาป่าเปลือกไม้ → ราชาหมาป่าพงไพร, a tree growing from its shoulders). Poor forms stay funny: เห็ดง่วง is a sleepy critter with a red mushroom cap on its back, ตอไม้แก่ a sleepy stump with a carved face and moss beard |
| Leaf skills, all 8 | Done. New statuses in the prototype: root (`rootT`, can't walk, vines round the feet), silence (`silenceT`, crossed speech bubble, auto mode only basic-attacks), poison (`poisonT`, 2% HP a second), lifesteal (กรงเล็บไพร heals 30% of each hit), and the ent passive (`ent`: 1.2% regen a second, 8% less damage, bark flash) |
| Leaf fused (พนาผู้ตื่น) | Done: the awakened elk, mint-white body, gold armour on face/chest/back, gold branch antlers with glowing leaves, twin green/gold leaf rings |
| Leaf boss (พฤกษาโบราณ) | Done. The leaf line has no world boss (ต้นไม้โบราณ is earth), so this is the leaf raid boss `ancient_flora`: an ancient moss bear with a blossom tree and a small grove on its back. Choosing it switches the arena to the new forest theme, and the HUD says บอสเรด |
| Earth, lightning, holy, dark, shadow lines | Not started |
| The other 18 fused forms and 10 bosses | Not started |
| Putting the art into the real game | Not started |

## Open items and known gaps

- The glow on the crystal whale's horn tip does not follow the head during the attack pose
  (`glows` are static sprite coordinates).
- The fire line is less detailed than water v2. Plan: raise it to the same level.
- New names (ราชาวาฬผลึก and the names in the plan table) are proposals only. The game data in
  `demo-app-backend` `species-data.ts` is unchanged.
- The skill name "ตรีศูลสมุทร" is still the game's name. Ask the owner before renaming it.
- Leaf skill names still name the old animals: กรงเล็บไพร (tiger claw, now the stag's three antler
  slashes), งวงพฤกษา (elephant trunk, now a thick vine that rears up from the bark wolf's back),
  พิทักษ์พนา (ent, now the wolf king's passive). Ask the owner before renaming them.
- `ROSTER` in the prototype gives the wolf king the ent passive from the start, so it regenerates in
  every fight there.
- Perfect forms have no aura yet. The idea is a small sparkle at the feet to tell them from
  adult forms.
- Guarding: the game has no manual guard. The prototype's guard pose stands for the "ปัดป้อง"
  parry dodge skill (50% damage cut, no dash).

## Next steps (suggested order)

1. Earth line with the same process as fire, water and leaf: plan table concept → sprites → rig →
   its 8 skills → its fused form and boss. Then lightning, holy, dark, shadow.
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
- `FIRE` / `WATER` / `LEAF`: game-skill animations (`useFire(id, att, def)` dispatches all of
  them; `skillEl(id)` picks the tag colour, `elCols(el)` the particle colours).
- Leaf helpers: `leafShape` (pointed leaf), `grove` (small tree), `flower`, `rootsUp` (ring of
  roots bursting from the ground), `drawRazorLeaf`. `LEAF_IDS` marks which sprites are leaf.
- `THEMES` / `floors`: cave, lava (fire boss) and forest (leaf boss) arenas.
- `STAGES` / `STAGE_OF`: the stage badges.
- `ROSTER`: what the battle selectors offer.
