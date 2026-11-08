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
- The page has a "ดูส่วน" dropdown at the top: all / fire / water / leaf / earth / lightning
  (each "monsters + skills") / holy / dark / plan. The battle scene always
  stays on top. Choosing an element also shows only that element's skill buttons under the arena
  and puts one of its monsters in the arena. On a phone (≤ 760 px) the arena is pinned under the
  picker so a skill button lower down still shows its action; on a wide screen pressing a button
  scrolls the arena into view if it is off screen.
- Egg cards only stand still (eggs cannot fight). Draft lines use still cards (`buildBoard(…,
  true)`, `buildLineup(…, true)`, `addCard(…, 8, true)`): one idle frame, no particles.

## How the owner wants to work (read this first)

- Reply in Thai, short and concrete. Say what changed and where to look on the page.
- **New line = still pictures first.** Draw the 11 forms, the fused form and the boss as still
  drafts (`buildBoard(…, true)`, `buildLineup(…, true)`, `addCard(…, 8, true)`), publish, and wait.
  Only after the owner approves: drop the still flags, animate, and do the line's 8 skills.
- When the owner rejects a design twice, stop guessing: offer **three options side by side** (as
  for ราชาวาฬผลึก and อสนีผู้ตื่น) and let them pick. When they send a reference picture, follow
  it closely (they may say "เป๊ะ"); if it faces the viewer, turn it to a side view facing right.
- A detailed, high-resolution reference picture (like the shadow-line image) does not survive being
  copied into 48–96 px sprites: the owner called the close copies "ประหลาด". Treat such a picture as
  a concept only, and design simple, chunky, readable silhouettes in the style of the approved lines
  (bats, spiders, lions). When the owner likes two of three options, put both in the line (main
  branch + alt branch), as for the shadow knights and wraiths.
- Small sketches on a screenshot (a red line, a circle) are exact limits: keep to them.
- Flyers must move on their wings (the `FLY` rig), not walk.
- After every change: render the sprite sheet / run the skills in Playwright, look at the
  pictures, fix what looks wrong, then publish the Artifact, update this file, commit and push
  (`Update:` / `New:` / `Fix:` tags only).
- Renaming: the owner said to give skills new names that fit the new animals. Names on the page
  are proposals for when the art goes into the game; `species-data.ts` / `arena-data.ts` in
  `demo-app-backend` still have the old names (see "Names to apply in the game" below).

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
| Leaf line, 11 forms | Done. Deer main branch (กวางใบไม้ → กวางเขาพฤกษา → เทพพนาลัย, a jade elk carrying a small forest), wolf branch (หมาป่าไพร → หมาป่าเปลือกไม้ → ราชาหมาป่าพงไพร, a tall dark wolf with a thick silver neck ruff and vines wrapped round its body, legs and tail; the owner asked to drop the tree on its back). Poor forms stay funny: เห็ดง่วง is a sleepy critter with a red mushroom cap on its back, ตอไม้แก่ a sleepy stump with a carved face and moss beard |
| Leaf skills, all 8 | Done. New statuses in the prototype: root (`rootT`, can't walk, vines round the feet), silence (`silenceT`, crossed speech bubble, auto mode only basic-attacks), poison (`poisonT`, 2% HP a second), lifesteal (กรงเล็บไพร heals 30% of each hit), and the ent passive (`ent`: 1.2% regen a second, 8% less damage, bark flash) |
| Leaf fused (พนาผู้ตื่น) | Done: the awakened elk, mint-white body, gold armour on face/chest/back, gold branch antlers with glowing leaves, twin green/gold leaf rings |
| Leaf boss (พฤกษาโบราณ) | Done. The leaf line has no world boss (ต้นไม้โบราณ is earth), so this is the leaf raid boss `ancient_flora`: an ancient moss bear with a blossom tree and a small grove on its back. Choosing it switches the arena to the new forest theme, and the HUD says บอสเรด |
| Earth line, 11 forms | Done and animated (the owner approved the still drafts). Tortoise branch (เต่าศิลา → เต่าผาหิน with basalt pillars → เต่าภูเขา carrying a snowy mountain), rhino branch (แรดผา → แรดเกราะแร่ → ไททันแรดคริสตัล with a topaz horn). Poor forms: หนอนดินเกียจคร้าน, ก้อนหินขี้เกียจ |
| Earth skills, all 8 | Done. New statuses in the prototype: stun (`stunT`, spinning stars, can't walk, auto mode waits), stone shield (`bubbleStone` on the shared bubble shield), attack up (`atkUpT`, ×1.2 outgoing damage, orange arrow), and the boulder's stone skin (`stoneSkin`: 12% less damage, crowd control 40% shorter, 15% slower). Heavy forms walk up close before ธรณีสั่น because they are slow |
| Earth fused (ธรณีผู้ตื่น) | Done. After several rounds the owner picked the first redraw (a slim crouching rock beast in charcoal scale tufts with rust stripes, a tail curling up over its back, a three-lobed bone mask with one glowing cyan eye) and asked for it slimmer, with the amber belly kept to the lower part of the body (below y 66 in the 88 px grid) |
| Earth world boss | Done: ตัวนิ่มศิลาโบราณ, a stone pangolin with thorned scale rows (the game's ต้นไม้โบราณ is earth; the new name is only a proposal). Choosing it switches the arena to the new canyon theme |
| Lightning line, 11 forms + fused + boss | Done and animated (owner approved, with the cat branch turned into foxes). Bird branch (นกฟ้าผ่า → เหยี่ยวพายุ → วิหคราชาอสนี) flies on the `FLY` rig like the fused form; fox branch (จิ้งจอกพายุ → จิ้งจอกอสนี two tails → ราชาจิ้งจอกอสนี five tails, `boltTail`). Fused อสนีผู้ตื่น is the storm wyvern (owner's option C). World boss: storm bison (the game's จักรกลพายุ is a machine; กระทิงพายุคำราม is a proposed name), with a new storm arena theme |
| Lightning skills, all 8 | Done. New statuses in the prototype: static (`staticT`, crackling sparks, 30% a second to seize for 0.4 s, as `staticChance`/`staticStunSec` in the game), haste (`hasteT`, 30% faster walking, yellow after-images) and focus (`focusT`, basic-attack crit chance up, a crosshair over the head); `staticRetort` for แมวไฟสถิต's passive. Lightning is drawn with `boltLine`, a jagged line redrawn every frame so it flickers |
| Holy line, 11 forms + fused + boss | Done and animated (owner approved the drafts). Sheep → qilin main branch (ลูกแกะแสง → แกะปีกทิพย์ with feather wings and a halo → กิเลนรัศมี, one gold horn, gold back scales, cloud mane → กิเลนสุริยเทพ with a turning sun-wheel aura behind the head), lion branch (สิงห์น้อยรัศมี with a mane of light rays → ราชสีห์ปีกขาว with six wings → มหาราชสีห์เทวะ with a gold crown and light wings). Poor forms keep their names but became creatures: ทูตน้อยขี้เซา is a sleeping fluffball with tiny wings and a slipping halo, ระฆังแตก a sleepy hermit crab living in a cracked bronze bell. Fused ศักดิ์สิทธิ์ผู้ตื่น is the armoured sun qilin with light wings and twin rings (`twinh`). World boss: the game's เทวทูตรัศมี is an angel, so the proposal is a white celestial elephant, คชสารรัศมี (raised trunk, tiered gold headdress, crimson caparison, halo). New helpers: `haloRing`, `ray`, `lightMane`, `plumeWing` (a feathered wing at any angle), `scaleRow`, `qilinHead`, `lionFace` |
| Holy skills, all 8 | Done. New in the prototype: blind from light (`blindOn` sets `blindLight`: a white-gold glare instead of ink; any blind now makes 35% of basic attacks miss in `lungeHit`), the gold shield (`holyShield`, `bubbleHoly`), a shared `cleanse`, and the seraph lion's last stand (`ROSTER.winglion.lastStand`; `damage()` fires `lastStandFx` the first time HP drops below 35%: 28% shield, cleanse, `immuneT` 2 s). `rootOn`/`silenceOn`/`stunOn`/`staticOn`/`burnOn` now respect `immuneT`. The holy boss switches the arena to the new gold `temple` theme |
| Dark line, 11 forms + fused + boss | Done and animated (owner approved the drafts). Spider main branch (แมงมุมคำสาป with a curse rune → แมงมุมอสูรตาแดง, eight red eyes and a blood hourglass → ราชินีแมงมุมรัตติกาล, abdomen of night sky with stars and a crescent moon, horn crown), bat branch (ลูกค้างคาว → ค้างคาวเขี้ยวโลหิต → ค้างคาวอสูรราชันย์ with horns → จักรพรรดิค้างคาวคำสาป with torn wings and a skull breastplate); all bats fly on the `FLY` rig. Poor forms: หนูท่อมืด (grubby sleepy rat), หนูซากศพขี้เกียจ (stitched zombie rat, replaces ซอมบี้ขี้เกียจ). Fused รัตติกาลผู้ตื่น is the awakened spider queen (galaxy abdomen, black-gold armour, moon crown, twin rings `twind`). World boss: the game's จอมราตรี is a moon emoji, so the proposal is a giant translucent spirit hanging in front of a black eclipse, วิญญาณจันทร์ดับ (sprite id `darksoul`; the owner rejected the owl, then the version with arms and tail wisps: it must be a limbless ball of smoke with a face). Helpers: `memWing` (bat wing, `torn` cuts notches), `jLeg`, `spiderEyes`, `starDots` |
| Dark skills, all 8 | Done. New statuses in the prototype: curse (`curseT`, a turning violet sigil over the head; `cursed(e, n)` halves heals and shields, wired into the water, leaf and holy heals and `holyShield`), attack down (`atkDownT`, -20% damage dealt, red down arrow), defence down (reuses `defT`, +25% damage taken), and the zombie rat's passive (`ROSTER.zrat.undead`: `damage()` drains 15% of melee hits and sets `enraged`, +20% damage, below 50% HP). `cleanse` also clears curse and attack down. The dark boss switches the arena to the new purple `eclipse` theme |
| Shadow line, 11 forms + fused + boss | Done and animated (owner approved, 2026-11-07). Knights walk on their legs (`P.bf`/`P.bl`), wraiths float. History: a cat/snake draft, two attempts at copying the owner's reference picture (rejected as "ประหลาด"), then three concepts side by side; the owner said A (shadow knight) or B (hooded wraith) are both fine (2026-11-07), so both are in: knights are the main branch, wraiths the alt branch. Palette: black steel (`arm`, `arm2`), purple-grey cloth (`wr`, `cape`), violet glow. Tree: ไข่เงา (`segg`) → เงาจิ๋ว (`wbaby`, round hooded wisp) → หมวกผีน้อย (`kbaby`, the wisp wearing a helmet, smoke tail, floating gauntlets) → knight branch อัศวินเงา (`knight`) → อัศวินเงาเกราะทมิฬ (`knight2`, kite shield with a violet crescent, flame plume) → จอมอัศวินเงา (`knightlord`, horned helm, spiked pauldrons, violet chest core, smoke cape, greatsword); wraith branch ภูตตะเกียงเงา (`lantern`) → ภูตโคมวิญญาณ (`soulwraith`, lantern on a staff, soul flames) → เจ้าภูตเงา (`wraithlord`, bone-horned hood, torn cloak wings, scythe). Poor forms kept: ผีเงาขี้อาย, ม่านหมอกขี้เกียจ. Fused เงาผู้ตื่น (`sfused`): knight upper body on a wraith smoke tail, crowned horned helm, greatsword, flaming back hand, torn cloak wings, twin violet rings. Boss: the game's ราชาม่านเงา keeps its name (it fits the wraiths): a giant crowned phantom whose robe spreads like a curtain and fades into smoke, jagged grin, clawed hands holding violet flames (`sboss`, aura `bosss`). The rejected picture copies are in git history |
| Shadow skills, all 8 | Done (`SHADOW`, ids `shd_*`). คุไนเงา: three spinning shadow blades fan out (`shdFly`, several fly at once, unlike `projectile`). ลอยหนี: the shy ghost fades and drifts back, evasion up (`evaT`, 40% of basic hits against it miss, violet after-images) + focus. ศรเงียบ: a silent soul-flame streak from the lantern, silence. เขี้ยวเงียบ: shield bash, then a crossed shadow cut, poison. กลืนกลบ: the mist puffs up and a grey fog rolls out, blindness drawn as dark fog (`mistBlind`). เหล็กในเงา: passive `venom` (30% of basic hits poison, a soul flame clings on). อวสานเงา: screen darkens, one huge violet cleave, double damage and "ประหาร!" below 35% HP. จักรวาลเงา: passive `voidP` (20% of basic hits against it miss; after any dodge `critNext` makes its next basic hit crit +25%). The shadow boss switches the arena to the new silver-violet `crypt` theme. The four skills that named a ninja, an archer, a snake and a scorpion were renamed (2026-11-07, see "Names to apply in the game"): พัดดาบเงา, ไฟโคมเงียบ, โล่ทมิฬ, เปลวพิษวิญญาณ |
| Awakened fused forms (same line twice), all 8 | Done (one per line, see each line above) |
| Cross-line fused forms, 13 | On hold: the owner switched cross-line merging off in the game (2026-11-08, `CROSS_LINE_MERGE_ENABLED = false` in backend `monster-rules.ts`; only two monsters of one line merge, hybrids already raised stay) while the hybrid forms are rethought. Don't draw them until the owner reopens it. The 13 are listed in `FUSED_FORMS` (`species-data.ts`) |
| World bosses, all 7 | Done (fire, water, earth, lightning, holy, dark, shadow; leaf has no world boss) |
| Raid bosses | พฤกษาโบราณ done. The other 5 are still drafts waiting for the owner (2026-11-08), section "บอสเรด 5 ตัว" (`#raid`), all keep their game names: ราชันย์ลาวา `lavaking` (redrawn on the owner's word: a lava golem of stacked basalt boulders, hunched, small head with a glowing slit, fists on the ground, lava in every seam and a molten chest core; the first serpent draft is in git history), อสูรห้วงลึก `abyssfish` (redrawn: a huge abyssal shark, open jaws with big jagged teeth; the anglerfish draft is in git history), เซราฟรัศมี `raidseraph` (six-winged peacock of light, fan tail of nine eye feathers; its game skills รำแพนสายฟ้า / ขนไฟฟ้าสาด fit a peacock), จ้าวมืดมิด `vampire` (redrawn: Dracula, person-sized on a 72 px grid on purpose, the owner asked for human scale; high red-lined collar, slicked hair with a widow's peak, red eyes, fangs, medallion, two bats; the bat-drake draft is in git history. The owner accepted a person here, an exception to the creatures-only rule), ราชันย์เงานิรนาม `nameless` (headless black knight, violet fire with a blank cracked mask for a head, chain flail). Each is an animal of its line's family and differs from that element's world boss. Once approved: drop the still flag in `addCard`, add them to `ROSTER` as `kind: 'บอสเรด'`, and draw their two arena skills (`arenaSkills` in `raid-data.ts`) |
| Adventure enemies, 20, and the training dummy | Not started. `adventure-data.ts` enemies are emoji animals that are not in any line (หนอนใบไม้ 🐛, ปูน้ำจืด 🦀, ค้างคาวถ่าน 🦇, กระต่ายยักษ์ 🐇, … นกยูงอสนี 🦚); the dummy (`dummy-data.ts`) is หุ่นซ้อม 🎯. They need sprites too, or the arena mixes pixel art and emoji |
| All 8 lines | Done in the prototype |
| Putting the art into the real game | Not started |

## Names to apply in the game (when the art goes in)

The prototype uses these; the game data still has the old ones.

| Kind | Game id | Old name | New name |
|---|---|---|---|
| Skill | `ltn_claw` | เล็บพายุ | ข่วนสายฟ้า |
| Skill | `ltn_hoof` | กีบอสนี | โฉบอสนี |
| Skill | `ltn_vajra` | วัชระผ่าฟ้า | หางปาอสนี |
| Skill | `tide_trident` | ตรีศูลสมุทร | หอกเขาผลึก (also the water entry of `FUSED_SKILLS`, and `monster-merge.spec.ts` expects the old name) |
| Skill | `leaf_claw` | กรงเล็บไพร | เขาไพรสามคม |
| Skill | `leaf_trunk` | งวงพฤกษา | เถาวัลย์ฟาด |
| Skill | `earth_paw` | อุ้งตีนผา | กระทืบผา |
| Skill | `earth_quill` | ขนแร่ | หนามแร่ |
| Skill | `holy_blade` | ดาบรัศมี | อุ้งเล็บรัศมี |
| Skill | `holy_arrow` | ธนูรัศมี | ศรเขากิเลน |
| Skill | `shd_kunai` | คุไนเงา | พัดดาบเงา |
| Skill | `shd_arrow` | ศรเงียบ | ไฟโคมเงียบ |
| Skill | `shd_snake` | เขี้ยวเงียบ | โล่ทมิฬ |
| Skill | `shd_sting` | เหล็กในเงา | เปลวพิษวิญญาณ |
| Species | see the plan table on the page | อัคนีพยัคฆ์, ราชาสุริยะ, … | อัคนีแผงคอ, ราชันมังกรสุริยะ, … |
| Species (shadow) | `shadow_baby2` … `shadow_ultimateAlt` | แมวเงา, นินจาเงา, ผู้ล่าไร้เสียง, พญางูเงา, แมงป่องอาถรรพ์, เจ้าแห่งเงา, ราชันย์ไร้ตัวตน | หมวกผีน้อย, อัศวินเงา, ภูตตะเกียงเงา, อัศวินเงาเกราะทมิฬ, ภูตโคมวิญญาณ, จอมอัศวินเงา, เจ้าภูตเงา (เงาจิ๋ว, ผีเงาขี้อาย, ม่านหมอกขี้เกียจ, เงาผู้ตื่น and the boss ราชาม่านเงา keep their names) |

The owner left the remaining skill names to Claude (2026-11-07), so every skill that named an old
animal or weapon now has a name that fits its new animal (the eleven rows above). พิทักษ์พนา keeps
its name: "forest guardian" already fits the wolf king. Skill names live in two places in the game:
`arena-data.ts` (the arena skill) and the species tuple in `species-data.ts` (the old turn-based
skill, also stored in PvP history: the golden file `battle-engine.golden.json` records `moveName`,
so check it with the `battle-golden-check` skill when renaming).

## Open items and known gaps

- Weapon/equipment sets: the boss-set arena rebalance (backend PR #27) and the 12 craft sets with the Mythic grade (backend PR #29, frontend PRs #29 and #30) are merged, released (backend 1.38.0, frontend 1.46.0) and deployed (Cloud Run and Cloudflare Pages) as of 2026-11-05. Frontend PR #31 (craft patch notes) is still open.

- The fire line is less detailed than water v2. Plan: raise it to the same level.
- New names (ราชาวาฬผลึก and the names in the plan table) are proposals only. The game data in
  `demo-app-backend` `species-data.ts` is unchanged.
- `ROSTER` gives a form whose own skill is a passive that passive from the start (the wolf king's
  regen, the boulder's stone skin, the seraph lion's last stand, the zombie rat, the soul lantern,
  the wraith lord). This is not a bug: in the game a form's own skill is always active
  (`arena-fighter.ts`), so the wolf king regenerates in every fight there too.
- Perfect forms have no aura yet. The idea is a small sparkle at the feet to tell them from
  adult forms.
- Guarding: the game has no manual guard. The prototype's guard pose stands for the "ปัดป้อง"
  parry dodge skill (50% damage cut, no dash).

## Next steps (suggested order)

1. Wait for the owner's word on the 5 raid boss drafts, then animate them and their skills. After
   that the owner wants the monsters next (the 20 adventure enemies and the dummy); the cross-line
   fused forms are on hold.
2. Put the art into the game. Read the latest patch notes first
   (`src/pages/project/tamagotchi/meta/patch-notes.ts`; the frontend's tamagotchi folder and the
   backend's monster module were split into feature folders on 2026-11-07, so older paths in these
   notes may have moved). What the game looks like now (frontend 1.61.0, backend 1.48.0):
   - `arena/ArenaReplay.tsx` draws each fighter as a 44 px emoji on a fixed `ARENA_W` × `ARENA_H`
     canvas (at most 400 px tall on a computer), with no camera. The prototype's arena is three
     screens wide with a camera; the game version only needs the sprites, the poses and the skill
     effects, not the camera or the minimap.
   - Positions, projectiles (`frame.p`) and zones (`frame.z`) come from the server replay. Each
     fighter row is `[x, y, hp, act, kind, actT, inv, face, shield, statusBits]` (`act` 1 = winding
     up a skill, 2 = dodging). Events: `hit` (crit, `parried`, element bonus), `dot`, `heal`,
     `dodge`, `miss`, `skill`, `status` / `resist` / `seize`, `burst` / `zoneHit` / `beam`,
     `thorns`, `rage` and `grow`. The prototype's skill scripts (`useFire`) move the fighters
     themselves (`approach`, `lungeHit`); in the game they must not: keep only the visual part,
     started by the `skill` event and the wind-up (`act` 1), at the server's positions.
   - Pose map: walk while the position changes, attack on a basic `hit`, cast during `act` 1 and at
     `skill`, hurt on being hit, the parry pose on `dodge` / `parried`, a KO pose at `hp` 0.
   - New since the prototype: the world boss grows twice in a fight (`grow` event at 20 s and
     40 s, ATK/DEF +30%) and has an arena-wide attack with a 1 s warning, so the boss sprite needs
     a bigger, angrier look per stage and a warning effect. World boss fights are team battles
     (rented friend support units), so several sprites share the arena. The game has 19 statuses
     (`StatusId` in `arena/arena-interface.ts`); the prototype draws most of them, check `evaDown`,
     `defUp`, `regen`, `slow` and `immune`.
   - Emoji also show the pet outside the arena: `shared/PetSprite.tsx` (home screen),
     `PetAvatar.tsx` (`PetCostumeFrame`: costumes are emoji layers for backdrop, aura, back item,
     face item and hat over a 128 px box, so a sprite needs a face and head anchor for them), the
     Dex, the evolution tree and the return-home (กลับดาว) screen.
   - Suggested order: a shared sprite module in the frontend (the `Spr` / `SPRITES` / `ANIM` code
     as TypeScript, baked lazily per species id), then `ArenaReplay`, then the home screen and
     cards, then the skill effects line by line. Apply the renames above in the same release, with
     a patch-notes entry and the wiki (`WikiPanel` + backend `wiki.ts`).

## How the prototype code is organised (inside the HTML)

- `Spr`: draws shapes on a pixel grid (`E` ellipse, `P` polygon, `L` tapered line, `spike`, `d`
  detail pixel, `line`, `eye`). It shades automatically with light from the top-left, outlines
  automatically, and supports translucent palettes (`#rrggbbaa`).
- `MATS`: palettes, 5 tones each. `GLOW`: emissive materials.
- `SPRITES[id]`: `size`, `rig` (QUAD / BIPED / BLOB / SWIM), `draw(s, P)` with pose offsets,
  `emit` particle emitters, `mouth`, optional `hover`, `aura`, and `glows`. A glow is
  `[x, y, colour, radius, part?]`: with part `'head'` (or `'body'`) it follows that part's pose
  offset in the frame shown (each baked frame keeps its `pose`), as on the crystal whale's horn.
- `ANIM` + `getFrame`: pose curves and lazy frame baking.
- `FIRE` / `WATER` / `LEAF`: game-skill animations (`useFire(id, att, def)` dispatches all of
  them; `skillEl(id)` picks the tag colour, `elCols(el)` the particle colours).
- Leaf helpers: `leafShape` (pointed leaf), `grove` (small tree), `flower`, `rootsUp` (ring of
  roots bursting from the ground), `drawRazorLeaf`. `LEAF_IDS` marks which sprites are leaf.
- `THEMES` / `floors`: cave, lava (fire boss) and forest (leaf boss) arenas.
- `STAGES` / `STAGE_OF`: the stage badges.
- `ROSTER`: what the battle selectors offer.
- Shadow line: `tf(s, sc, ox, oy)` draws on a design grid at a scale (used to grow `knight` into
  `knight2` and `lantern` into `soulwraith`); `shEye`, `ribbon`, `arc`; materials `arm`/`arm2` (black
  steel), `wr`/`wr2`/`cape` (cloth), `vio` (glow), `vten` (purple claws/tendrils). `SHADOW` skills
  use `shdFly` (several things flying at once), `drawShadeBlade`, `drawSoulFlame`, `evaOn`,
  `mistBlind`; `lungeHit` handles `evaT`, `voidP`/`critNext` and `venom`. Theme `crypt`.
