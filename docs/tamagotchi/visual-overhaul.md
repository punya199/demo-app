# Monster visual overhaul (2.5D pixel-art look)

Working notes for the next session on the monster game's art. Condensed on 2026-11-09; the full history
(per-form design notes, rejected drafts, the rename table) is in git history of this file.

**Talk to the owner in Thai**, short and concrete: say what changed and where to look on the page.

## How the owner wants to work

- **New creatures = still pictures first.** Show stills, wait for approval, then animate and do skills.
- The owner has another AI draw the art (prompts below); Claude reduces it to a clean bitmap, cuts it into
  parts and animates it. Ask the owner to circle parts when a cut is not obvious; never move only part of
  a rock or limb (it tears the picture).
- After two rejections of a design, offer **three options side by side**. A reference picture faces right
  (turn it if needed). Small sketches on a screenshot are exact limits.
- Every form is a creature, never an object or a person (the vampire raid boss is the one accepted
  exception). Each line keeps one animal family. Flyers move on their wings (`FLY` rig), water forms swim.
- Higher stages are bigger and grander. Bosses must look bigger than Fused forms.
- After every change: check in Playwright, publish the Artifact, update this file, commit and push
  (`Update:` / `New:` / `Fix:` only).
- Keep token use low: read only the files a change needs; prefer few, cropped screenshots.

## The prototype page

- Live Artifact (private to the owner): https://claude.ai/artifact/CjvCJ453cPeJxVzQrsTTDj
- Source: `docs/tamagotchi/prototypes/monster-arena/`. Publish with the **absolute** `file_path` of its
  `index.html`, `root` = that folder, `files` = the changed `js/...` paths (unlisted files are kept). A
  relative `index.html` resolves against the working directory and once published the Vite app shell (blank
  page). From a new session, read the live version first (the tool refuses a publish otherwise).
- The pre-commit hook runs prettier/eslint on the prototype JS: publish after committing.
- Plain scripts sharing globals, loaded in this order: `js/engine.js` (palettes `MATS`, `Spr`, shape
  helpers, rigs QUAD/BIPED/BLOB/SWIM/FLY, `bmpRig`), `js/sprites/<line>.js` (fire opens `SPRITES`, others
  `Object.assign` into it; `raid*.js`, `adventure*.js`, `hybrid*.js` hold bitmap creatures), `js/core.js`
  (pose curves `ANIM` + lazy `getFrame`, auras `drawAura`, cards, arena, `ROSTER`, `STAGE_OF`, damage and
  statuses), `js/skills/<line>.js` (`FIRE`, `WATER`, … `RAID`, `HYBRID`), `js/flourish.js`, `js/page.js`
  (buttons, section picker, render loop), `js/flourish-hook.js`, `js/hybrid-page.js`, PixelFX trial files.
  A new script goes in `index.html` and the publish `files` list.
- "ดูส่วน" dropdown: all / each line / raid / adv / hybrid / pfx / plan; the battle stays on top. Only
  cards on screen are drawn (`onScreen` in page.js): drawing all ~150 each frame made the page stutter.
- Still drafts: `buildBoard(…, true)`, `buildLineup(…, true)`, `addCard(…, 8, true)`.

## Where the art stands

| Part | State |
|---|---|
| 8 lines × 11 forms, 8 awakened Fused forms, 7 world bosses, leaf raid boss | Done and animated |
| 8 line skills × 8 | Done (each animation matches its game mechanic) |
| 5 raid bosses (AI pictures, `bmpRig`) + their 10 skills | Done |
| 20 adventure enemies + dummy (one AI sheet, sized by species) | Done; they use their element's generic skills (owner's decision) |
| 13 cross-line Fused forms (one AI sheet, 4×4) | Done and animated in the prototype with their own skills (`HYBRID`); not in the game yet |
| Status effects from PixelFX | Trial only (`#pfx`), colours by line; waiting for the owner's verdict |

Art still open: fire line less detailed than the others; Perfect forms have no aura; ค้างคาวถ่าน is too dark.

## AI picture prompts and reduction

- Ask for: original creature, strict side view facing right, true pixel art, 1 px dark outline, light
  from the top-left, ≤ 16 colours, limbs apart from the body. For several creatures: **one sheet**, equal
  square cells with solid black grid lines, flat #FF00FF background (never a checkerboard), no text.
  The 13 hybrids' prompt and motion plan: `docs/tamagotchi/fused-hybrid-prompts.md`.
- Reduce: cut inside the grid lines, flood-fill magenta from the border, median colour per block (dark
  pixels win at 30%), 15 colours, re-outline, drop specks; smoke/steam become particles. Store as
  `pal` + `rows` bitmaps; cut parts with `ADV_SPRITE` part kinds (`rigid`, `leg` shear, `swing`).
- If an AI paints a fake checkerboard, flood-fill low-saturation greys from the border.

## In the game (frontend `src/pages/project/tamagotchi/`, backend `src/modules/monster/`)

- Sprites: `sprites/` is the TS port (`sprite-registry.ts`, `lines/`, `bitmaps/`), pixel-identical to the
  prototype (`sprite-registry.test.ts` vs `sprite-frames.golden.ts`; regenerate with
  `scripts/monster-sprites/bake-prototype-hashes.cjs` on purpose). A prototype sprite change must be
  ported by hand. Backend sends a `sprite` id with species, enemies, bosses and arena fighters; cross-line
  hybrids send `null` (emoji) until their art is ported.
- Screens: `shared/MonsterSprite.tsx` everywhere a pet shows (home, avatars, Dex, evolution tree, …).
  Costumes are switched off (`COSTUMES_ENABLED = false`); their anchors still work.
- Arena replay: `arena/replay-anim.ts` (poses), `arena/replay-sprites.ts` (sprites, statuses, element
  particles, floors), `arena/skill-fx/` (each skill's animation, converted from the prototype onto
  `runtime.ts`, timed by the server's replay; `stage.ts` schedules casts). Awakened Fused skills play their
  line Ultimate animation (`AWAKENED_FX_OF`); cross-line `fz_<a>_<b>` skills have no own animation yet.
- Boss fights: prototype bosses draw 30% bigger (`BOSS_SCALE`) and the camera zooms out (`BOSS_ZOOM`
  1.45). The game has no camera: monsters draw at 0.72×, the boss at 1.3× (`fightPxOf`, capped 230 px).
- Skill grandeur by tier (`arena/skill-fx/flourish.ts`, tier from the skill's `src`): Perfect a charge ring
  and a flare; Ultimate a magic circle under the caster (it follows), then a beam to the target (ranged), a
  shockwave (melee) or the circle flaring out (burst/self); Fused the same in two colours with a double
  beam. **No column of light through the monster** (owner). The prototype runs the same code:
  `js/flourish.js` is generated by `node scripts/monster-sprites/gen-flourish.cjs` (demo-app root, backend
  checked out beside it) and hooked in by `js/flourish-hook.js`.

## Skills and balance (backend, 2026-11-09)

- Skill strength by the stage of the form that carries it: `SKILL_TIER_PCT` in `arena/arena-rules.ts`
  (Baby 2 75, Adult 100, Perfect 120, Ultimate 140, Fused 160), applied in `tunedSkill` and in the harness
  engine; shown in the wiki skills tab.
- Every Fused form has its own innate skill (`fz_*` in `arena-data.ts`): awakened = line Ultimate + one
  effect; cross-line = an effect from each parent line.
- `scripts/arena-balance/data.js` has drifted from `arena-data.ts`: **don't run `gen-ts.js`**; edit
  `arena-data.ts` directly and copy only new `adv:` k values (see that README). Never run `tune2` with
  the tiers on.
- Arena PvP fights before the tiers were soft-deleted by a migration (they would replay differently).
- Cross-line merging may still be switched off in the game (`CROSS_LINE_MERGE_ENABLED` in backend
  `monster-rules.ts`): check before porting the hybrids.

## Prototype code notes

- `Spr` draws shapes on a pixel grid (`E`, `P`, `L`, `spike`, `d`, `line`, `eye`, `bmp`), shading and
  outlining automatically. `SPRITES[id]` = `size`, `rig`, `draw(s, P)`, `emit`, `mouth`, `hover`, `aura`,
  `glows` (a glow with a part name follows that part's pose).
- Skill scripts use `castPose`, `meleeStrike`, `projectile`, `damage`, status helpers (`burnOn`, `rootOn`,
  `poisonOn`, `stunOn`, `staticOn`, `curseOn`, `blindOn`, `mistBlind`, `silenceOn`, …) and per-line effect
  helpers (`lavaSplash`, `splash`/`ripple`, `leafBurst`/`rootsUp`, `rockBurst`/`crackRing`/`spikesUp`,
  `zapBurst`/`zapArc`, `lightBurst`/`lightPillar`, `darkBurst`/`runeRing`, `shadowBurst`/`mistRoll`).
- A form whose own skill is a passive has it from the start in `ROSTER` (the game does the same).
