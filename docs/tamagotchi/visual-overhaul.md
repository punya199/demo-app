# Monster visual overhaul (2.5D arena look)

Notes for the next session working on the monster game's new look. The work so far is a
standalone prototype, not yet in the game.

**Talk to the owner in Thai.** Every reply, progress note and question must be in Thai. They have
asked for this more than once.

## Where it lives

- Live prototype (claude.ai Artifact, private to the owner):
  https://claude.ai/artifact/CjvCJ453cPeJxVzQrsTTDj
  It is published from the local folder with its JS files (`file_path` = `index.html`, `root` =
  the folder, `files` = every `js/...` path). The repo copy is the source: edit it, check in
  Playwright, republish. From a new session, compare the live files with the repo first (the
  Artifact tool shows a diff on the first publish); don't read the whole page.
- Source: `docs/tamagotchi/prototypes/monster-arena/` (split from the old single
  `monster-arena-25d.html` on 2026-11-08, behaviour unchanged). `index.html` is the page (styles and
  HTML), and plain scripts load in this order, sharing globals: `js/engine.js` (palettes, `Spr`,
  shape helpers, rigs), `js/sprites/<line>.js` (`fire.js` opens `SPRITES`, the rest
  `Object.assign` into it; `raid.js` holds the raid bosses, `earth.js` also the earth world boss),
  `js/core.js` (animation, frame baking, auras, cards, arena, rules, basic moves),
  `js/skills/<line>.js` (each line's game skills) and `js/page.js` (buttons, skill cards, picker,
  plan tables). To change one creature, open only its line's sprite file; to change a skill, its
  skill file. Line files: fire, water, leaf, earth, bolt, holy, dark, shadow. A new script file
  must be added to `index.html` and to the publish `files` list. Open `index.html` in a browser to
  run it.
- The repo's pre-commit hook runs prettier and eslint --fix on the prototype's JS files, so after
  committing, republish the formatted files (behaviour is unchanged).
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
| Raid bosses | พฤกษาโบราณ done. The other 5 are still drafts waiting for the owner (2026-11-08), section "บอสเรด 5 ตัว" (`#raid`), all keep their game names: ราชันย์ลาวา `lavaking` (third version, 2026-11-08: the owner's AI-made lava golem, reduced from about 860×960 to 90×87 by taking the commonest colour per 9.5 px block and mapping to a hand-picked rock + lava palette, smoke and embers dropped (they are particles); animated with `bmpRig`, see below. Second version,  a lava golem of stacked basalt boulders, hunched, small head with a glowing slit, fists on the ground, lava in every seam and a molten chest core; the first serpent draft is in git history), อสูรห้วงลึก `abyssfish` (third version, 2026-11-08: the owner's own AI-made picture, 160×64, reduced to 16 colours and stored as a bitmap in `js/sprites/raid-bitmaps.js`, drawn with the new `Spr.bmp` (bitmap pixels count for the ground line, unlike `d` detail pixels). Body 150×59 on a 160 grid, about 1.6× as long as the other bosses; the tail sways with the pose, the jaw does not move. For skill animations it may need a few extra pose bitmaps (jaw open, lunge); the owner can make them with the prompt template given in chat: same creature, palette and size, one pose per picture. Earlier code-drawn versions are in git history), เซราฟรัศมี `raidseraph` (second version, 2026-11-08: the owner's AI-made peacock, 1024 px JPG with a fake grey checkerboard painted in as "transparency": removed by flood-filling low-saturation greys (165/189) from the border, then from seeds in the enclosed pockets between wing and neck and between the legs; reduced by 10.5× to 88 × 91 (median colour per block mapped to a hand-picked cream/gold/sky palette, outline when ≥ 20% of a block is dark, lone cream tones despeckled, silhouette re-outlined); the halo and crest were cut out and are drawn in code (`haloRing`, sky stems with gold orbs) so they follow the head. Animated with `bmpRig` (`seraphPart`/`seraphOffsets`): head, raised wings (row shear from their base), middle and low wings (column shear, tips flap), two legs (shear from the hip); cream is painted under each wing so a moved wing never opens a hole. In `ROSTER` and the foe list; holy arena theme `temple`. First version, code-drawn: a six-winged peacock of light, fan tail of nine eye feathers; its game skills รำแพนสายฟ้า / ขนไฟฟ้าสาด fit a peacock), จ้าวมืดมิด `vampire` (third version, 2026-11-08: the owner's AI-made Dracula, white/grey painted checkerboard flood-filled away, bats cut out, reduced by 13.1× to 43 × 69 on the 72 grid by the commonest colour per block with priority for the red eyes, gold and white shirt; animated with `vampPart`/`vampOffsets`: head, reaching hand, the two hanging cape edges (row shear, hem most), legs; dark cloth or red lining painted under each moving part; two flapping bats drawn in code; in `ROSTER` and the foe list. Second version, code-drawn: Dracula, person-sized on a 72 px grid on purpose, the owner asked for human scale; high red-lined collar, slicked hair with a widow's peak, red eyes, fangs, medallion, two bats; the bat-drake draft is in git history. The owner accepted a person here, an exception to the creatures-only rule), ราชันย์เงานิรนาม `nameless` (second version, 2026-11-08: the owner's AI-made headless knight on a dark grey painted checkerboard, removed by flood-filling neutral greys (sat < 11; the armour is violet-tinted so it survives), reduced by 10.8× to 85 × 91; the thin chain is cut out and drawn in code from the fist to the spiked ball; animated with `namelessPart`/`namelessOffsets`: flaming head, fist, swinging ball, outer cape edge, legs; in `ROSTER` and the foe list. First version, code-drawn: headless black knight, violet fire with a blank cracked mask for a head, chain flail). Each is an animal of its line's family and differs from that element's world boss. ราชันย์ลาวา and อสูรห้วงลึก are animated (2026-11-08) with `bmpRig` (`raid-bitmaps.js`): the bitmap is cut into named parts by a `part(x, y)` function and each part follows the pose (golem, redone on the owner's sketch 2026-11-08: every rock the owner circled is one part, `GOLEM_ROCKS` ellipses in `raid-bitmaps.js`, each pixel goes to its nearest rock and only the uncircled chest stays as the body; along a limb the shoulder rock follows 25% of the pose, the next 50%, 80%, and the fist or foot 100%, offsets ×0.6 and capped at 4 px; dark molten lava `#6a1206` is painted behind every rock at least 3 px inside the outline (`inner`), so a gap opened by a moving rock glows and the outline never shows a red rim. Never move only part of a rock: the owner rejected that because it tore the picture; shark, cut further 2026-11-08 (`sharkPart`, `sharkOffsets`): the crest is split along the line of the back (`sharkBackY`) into eight spikes that bend from their base in a wave from tail to head, the pectoral fin and three belly fins bend row by row (a shear) only below the belly line, so no base row ever moves and nothing tears; plus tail sway and a lower jaw that drops onto a red mouth). Both are in `ROSTER` as raid bosses; their own two skills are not drawn yet. For the others, once approved: drop the still flag in `addCard`, add them to `ROSTER` as `kind: 'บอสเรด'`, and draw their two arena skills (`arenaSkills` in `raid-data.ts`) |
| Adventure enemies, 20, and the training dummy | Done and animated (2026-11-08), section "ศัตรูผจญภัย 20 ตัว + หุ่นซ้อม" (`#adv`). From the owner's one AI-made sheet (5 × 5 cells on flat #FF00FF, game order then the dummy): each cell cut by a magenta threshold, reduced by the median colour per block (dark pixels win when they fill 30% of the block), 15 colours each, silhouette re-outlined, stored in `js/sprites/adventure-bitmaps.js` (`ADV_BMP`). **Size follows the animal, not the stage** (owner, 2026-11-08: a worm or a bird smaller than a boar, but not too small): longest side worm 32, crab 38, charcoal bat 40, gull / scorpion / squirrel 44, beetle 46, turtle 50, ant / hawk 52, eagle / cave bat 54, rabbit 56, snake 58, mist shark 60, boar / goat / peacock 64, golem 78, dragon 80, dummy 46; the grid is the longer side + 6 rounded up to 8, and every card draws at one pixel scale. The stage badge still follows the game stage. Sprite ids `advworm` … `advpeacock` and `dummy` in `js/sprites/adventure.js`, built by `ADV_SPRITE(id, rig, parts)`; part cuts are measured on the first (stage-size) reduction and scaled by `ADV_DESIGN_W`: each part is `[name, test(x, y), kind, …]` with kinds `rigid` (head, claw, fist), `leg` (shear from its top row, foot lifts) and `swing` (tail/wing bends round a pivot). Under each moving part its own pixels stay at rest, so nothing tears (`bmpRig` now paints a part's own colours when `under` has no `col`). `ADV_EL` / `ADV_STAGE` give line and stage badge; area bosses are `boss: true, kind: 'บอสพื้นที่'` (they don't grow) and take their element's arena theme. They use their line's generic skills, and the owner decided (2026-11-08) that this stays: no own skill animations for adventure enemies. The dummy (`ROSTER.dummy.dummy`) never hits back. ค้างคาวถ่าน came out dark on the dark page; brighten its palette if the owner finds it hard to see |
| All 8 lines | Done in the prototype |
| Putting the art into the real game | Steps 1 and 2 done (2026-11-08): sprite module + ids, and the arena replay draws the sprites (generic element effects; per-skill animations still to port). Home, Dex and other screens still show emoji (step 3) |

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
| Skill (raid boss) | `e_dragontail` (จ้าวมืดมิด) | หางมังกรฟาด | ฝูงค้างคาวโลหิต (the fire world boss also uses e_dragontail: give the vampire its own id) |
| Skill (raid boss) | `e_orebite` (จ้าวมืดมิด) | กัดบดแร่ | เขี้ยวดูดเลือด (the dark world boss also uses e_orebite: give the vampire its own id) |
| Skill (raid boss) | `e_sparktail` (ราชันย์เงานิรนาม) | หางสปาร์ก | เหวี่ยงตุ้มโซ่ (the lightning world boss also uses e_sparktail: give the knight its own id) |
| Skill (raid boss) | `e_mistbite` (ราชันย์เงานิรนาม) | ขย้ำในหมอก | ฟันจากหมอก (the shark keeps ขย้ำในหมอก: give the knight its own id) |
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

### To do (as of 2026-11-08)

How the owner wants art made now: the owner has another AI draw one still picture per creature
(prompts in the "AI picture prompts" section below); Claude reduces it to a clean bitmap, cuts it into
parts and animates it (`bmpRig`), and draws the skill effects in code. Ask the owner to circle the
parts on a preview when the cut is not obvious; never move only part of a rock or limb.

1. **Raid bosses:** all five now use the owner's AI pictures and are animated (2026-11-08):
   ราชันย์ลาวา, อสูรห้วงลึก, เซราฟรัศมี, จ้าวมืดมิด, ราชันย์เงานิรนาม. The other AI paints a checkerboard
   into the picture instead of real transparency; it is removed by flood-filling low-saturation greys
   from the border (seeded again in enclosed pockets when needed). Ask for a real transparent PNG.
2. **อสูรห้วงลึก (shark):** done (2026-11-08) without the owner circling: `sharkPart` cuts tail,
   eight crest spikes, pectoral fin, three belly fins and the jaw. If the owner wants a different
   cut, they circle it on the parts preview and the ranges in `SHARK_CREST` / `sharkPart` change.
3. **Raid boss skills:** done in the prototype (2026-11-08), `js/skills/raid.js` (`RAID`, ids `raid_*`,
   `game` = the arena-data id, `boss` = the sprite; `RAID_OF[boss]` lists a boss's skills). Buttons under the
   arena (group `raid`) put that boss in the foe slot and make it use the skill on our monster; in auto mode a
   raid boss uses its own two. Burst skills call `closeIn` (a heavy hop) first because bosses walk slowly.
   รัดหลอมละลาย: three molten rings wrap and squeeze the target (burn + slow). ลมหายใจภูเขาไฟ: the chest core
   swells, then a straight molten beam with flying rock and a scorched line on the floor (burn). วังน้ำวน:
   warning ring, then a spinning whirlpool that turns the target round (slow). ขย้ำในหมอก: fog rolls out, the
   shark lunges out of it and two rows of teeth snap shut (blind). รำแพนสายฟ้า: nine charged rays fan out,
   then a ring of lightning bolts (stun). ขนไฟฟ้าสาด: five electric feathers in a fan (static 40%).
   ฝูงค้างคาวโลหิต (game e_dragontail): the cape flares and a swarm of bats spirals out (defence down).
   เขี้ยวดูดเลือด (game e_orebite): dissolves into bats, bites, blood flows back to him (defence down).
   เหวี่ยงตุ้มโซ่ (game e_sparktail): four swings of the flail (static 30%). ฟันจากหมอก (game e_mistbite,
   shared with the shark): sinks into violet fog, appears beside the target and cuts (blind). The new names
   are in "Names to apply in the game"; the knight needs its own skill id in the game, since e_mistbite is
   also the shark's.
   **World boss grow:** the owner chose (2026-11-08) to keep the same sprite and make it bigger at each grow
   stage, not to draw an angrier form: `growBoss` in `core.js` scales the sprite +10% per stage (1.1 at
   20 s, 1.2 at 40 s, `GROW_SECS`/`GROW_STEP`) with three pulses, a red ring and a banner; `e.grow` scales the
   drawing, shadow, glows, `centerOf` and `mouthOf`. The button บอสโลกขยายร่าง skips ahead to the next stage.
   In the game, `ArenaReplay` should do the same on the `grow` event.
4. **Adventure enemies:** done (2026-11-08) from the owner's one-sheet picture, sized by species, see the
   status table. They keep the generic element skills (owner's decision). Only per-creature fixes remain.
5. **Cross-line merging is switched off** on branch `claude/tamagotchi-game-expansion-ercfjr` in
   both repos (backend `CROSS_LINE_MERGE_ENABLED = false`, frontend merge screen, wiki and patch
   note), tests pass, **no PR yet**: it reaches players only after the owner asks for PRs and they
   merge. The 13 hybrid fused forms stay on hold until the owner reopens them.
6. **Next: put the art into the game**, see "Plan: putting the art into the game" below (waiting for
   the owner to say go).

### AI picture prompts

Give the other AI: original creature, strict side view facing right, true pixel art on an exact grid
(no anti-aliasing), 1 px dark outline, light from the top-left, at most 16 colours, transparent
background, exact canvas (48 egg/baby, 56 adult, 64 perfect, 80 ultimate, 88 fused, 96 boss; a long
shark 160×64; Dracula 72), native size plus an 8× upscale, and a pose with limbs clearly apart from
the body so it can be cut into parts. Its pictures are not on a clean grid and have ~150+ colours,
so always reduce them; the shark came out 160×64 as asked, the golem about 860×960 and had to be
reduced by ~9.5×.

Adventure enemies (2026-11-08): the owner asked for one sheet with all 20 plus the training dummy, so the
prompt given in chat asks for a 5 × 5 grid (21 cells used, reading order = `adventure-data.ts` order, then
the dummy), every creature alone in its cell with empty space round it, on a flat solid #FF00FF magenta
background (not a checkerboard, which costs a cleanup every time), no text or numbers. Each creature is
cut from its cell and reduced to its animal's size (see the status table; first done by stage size, then
redone by species on the owner's request).
Look-alikes kept apart on purpose: ฉลามหมอก is a small round grey mist shark (not the raid shark),
มังกรหลับใหล a chubby sleepy dragon (not the fire world boss), โกเลมผลึก crystals with no lava (not
ราชันย์ลาวา), นกยูงอสนี a navy storm peacock (not the white holy เซราฟรัศมี).

## Plan: putting the art into the game (agreed with the owner 2026-11-08, steps 1–2 done)

Today every screen in the game still shows emoji; all the art lives only in the prototype. Read the latest
patch notes first (`src/pages/project/tamagotchi/meta/patch-notes.ts`; the frontend's tamagotchi folder
and the backend's monster module were split into feature folders on 2026-11-07, so older paths here may
have moved). Game versions when this was written: frontend 1.61.0, backend 1.48.0. Steps, in order:

1. **Shared sprite module + sprite ids. Done (2026-11-08), branch `claude/tamagotchi-game-expansion-ercfjr`
   in both repos, no PR yet.**
   - Frontend: `src/pages/project/tamagotchi/sprites/`. `engine/` holds `Spr` (`spr.ts`, with a pure
     `bakePixels()` beside the canvas `bake()`), the rigs (`rigs.ts`), `ANIM` (`anim.ts`), `bmpRig`
     (`bmp-rig.ts`) and the shape helpers (`shapes.ts`); `lines/<line>.ts` the sprites (fire, water, leaf,
     earth, bolt, holy, dark, shadow, raid, adventure, plus `raid-parts.ts`); `bitmaps/` the AI-picture
     bitmaps. `sprite-registry.ts` is the entry: `SPRITES` (all 133 ids), `hasSprite`, `spriteLine`,
     `getSpriteFrame(id, anim, i)` (baked on first use, cached per id, keeps its `pose` for glows).
     Unused prototype helpers (old drawWraith/Demon/Skel/Skull, dragonHead, featherWing) were dropped.
   - `sprite-registry.test.ts` bakes every frame of every sprite and compares FNV hashes with
     `sprite-frames.golden.ts`, made from the prototype: the port is pixel-identical. **The TS port is
     now the game's copy of the art.** When a sprite changes in the prototype, make the same change in
     `lines/…`, then regenerate the hashes on purpose with
     `scripts/monster-sprites/bake-prototype-hashes.cjs` (usage in its header) and check that only that
     sprite's hashes moved.
   - Backend: `sprite` next to `emoji` on `ISpecies` (`LINE_SPRITES` in `species-data.ts`, form-key order;
     the 8 awakened fused forms; cross-line hybrids `null`), `IArenaStage` (20 enemies), `IRaidBoss`,
     `IWorldBoss` and the plain dummy (`'dummy'`). Sent in: the monster view, evolution summaries, Dex,
     merge forms in the wiki, friends, the equipment pet list, PvP opponents (from the defense's
     `species_id`), adventure enemy views, raid / world boss lists, dummy presets, and every arena
     fighter (`IArenaFighterSpec.sprite` → the replay's fighter summaries `sprite`). Snapshots stored
     before this have no sprite: PvP defenses get it from `species_id`; old support units and NPCs send
     none, so the client shows the emoji. `core/sprite-ids.spec.ts` checks the 130 ids are unique.
   - Game id → sprite id: world bosses `storm_golem` stormbison, `flame_dragon` boss, `tide_tortoise`
     turtle, `ancient_tree` pangolin, `radiant_angel` holyele, `night_lord` darksoul, `shadow_king` sboss;
     raid bosses `lava_king` lavaking, `deep_dweller` abyssfish, `ancient_flora` flora, `radiant_seraph`
     raidseraph, `void_sovereign` vampire, `nameless_phantom` nameless; adventure stages in game order
     `advworm` … `advpeacock`. The prototype-only options `whaleA`, `whaleB` and `whaleking` have no game id.
   - Not player-visible yet, so no patch note or wiki text; add both with step 2/3.
2. **`ArenaReplay` (the biggest step). Done (2026-11-08) except the per-skill animations, see "Step 2 as
   built" below.** `arena/ArenaReplay.tsx` draws each fighter as a 44 px emoji on a
   fixed `ARENA_W` × `ARENA_H` canvas (at most 400 px tall on a computer), no camera. The game needs only
   the sprites, poses and skill effects, not the prototype's camera or minimap.
   - Positions, projectiles (`frame.p`) and zones (`frame.z`) come from the server replay. Each fighter
     row is `[x, y, hp, act, kind, actT, inv, face, shield, statusBits]` (`act` 1 = winding up a skill,
     2 = dodging). Events: `hit` (crit, `parried`, element bonus), `dot`, `heal`, `dodge`, `miss`,
     `skill`, `status` / `resist` / `seize`, `burst` / `zoneHit` / `beam`, `thorns`, `rage`, `grow`.
   - The prototype's skill scripts (`useFire`) move the fighters themselves (`approach`, `lungeHit`); in
     the game they must not: keep only the visual part, started by the `skill` event and the wind-up
     (`act` 1), at the server's positions.
   - Pose map: walk while the position changes, attack on a basic `hit`, cast during `act` 1 and at
     `skill`, hurt on being hit, the parry pose on `dodge` / `parried`, a KO pose at `hp` 0.
   - World boss: on `grow` make the same sprite 10% bigger per stage (the owner's choice, as `growBoss`
     in the prototype), plus a warning effect for its arena-wide attack (1 s). World boss fights are team
     battles (rented support units), so several sprites share the arena.
   - Statuses: the game has 19 (`StatusId` in `arena/arena-interface.ts`); the prototype draws most;
     still to draw: `evaDown`, `defUp`, `regen`, `slow`, `immune`.
   - Adventure enemies use the generic skills of their element (owner's decision): no own animations.
   **Step 2 as built.** `arena/replay-anim.ts` (pure, tested) turns the replay into a pose per fighter:
   KO (`hp` 0, falls back and fades), wind-up (`act` 1: basic = attack 0–0.42, skill = cast 0–0.45 of the
   animation, the wind-up's length found by scanning back), follow-through for 0.4 s after the fighter's
   basic `hit` (skill name `โจมตี`) or `skill` event, hurt for 0.3 s after being hit (and on `act` 3,
   hitstun) with a 0.12 s white flash, stunned = idle frame 0, walk when moving (> 0.35 px a tick, also
   `act` 2 dash and 4 charge) with the cycle following the distance walked, else idle. `grow` events add
   `GROW_STEP` (10%) each, with a pulse. `arena/replay-sprites.ts` is loaded with `import()` (its own
   chunk, ~94 kB gzip) and draws: shadow, aura, sprite (flipped when `face` < 0), glows, flash,
   after-images while dashing, status effects on the body (stun stars, roots, silence bubble, blind ink,
   curse ring, focus crosshair, attack/defence arrows, new: a drooping feather for `evaDown`, regen fireflies,
   burn/poison particles, static sparks, immune ring, slow drops), and element particles
   (`ELEMENT_PARTICLES`) for hits, bursts, zones, beams, projectile trails, skill casts, heals, shields, KO,
   grow and rage, plus each sprite's own emitters. Particles, auras and glows are the prototype's
   (`sprites/fx/`). Scale: 1.5 world px per sprite px, 1.2 for 96 px grids and up (the 160 px shark would
   cover the arena); a sprite is kept inside the arena. The position is the body centre, the feet are 18 px
   below. A boss winding up a skill with radius ≥ 200 turns the arena edge red with "ระวัง! โจมตีทั้งสนาม".
   Fighters without art (cross-line hybrids, NPCs, old snapshots) keep the emoji path unchanged. Checked in
   Playwright on adventure, PvP, raid and world-boss replays from the real engine.
   **Skill animations (done 2026-11-08):** every line skill (8 × 8) and the 10 raid boss skills play the
   prototype's own animation, in `arena/skill-fx/`. The prototype scripts were converted file by file
   (`fire.ts` … `raid.ts`, same names and helpers) onto `runtime.ts`, which keeps the prototype's API but
   makes the game-mechanic calls puppets: `damage`, `approach`, `walkTo`, `lungeHit`, `closeIn` do nothing,
   `tween`/`wait` run on the replay clock, `castPose(...).charged` resolves at the server's release,
   `meleeStrike` calls `onHit` at each of the cast's server hits, `inRange` asks whether the server hit that
   fighter, `projectileOf(att, …)` lands on the first hit (and hides the server's orb for that side), and
   `zoneDelay(att, ms)` waits for the server's `zoneHit`, `zoneAt(att, def)` puts a zone at the server's aim
   point (the `zone` event) and `beamAngle(att, …)` aims a beam along the server's `beam` event. `casts.ts` reads each cast from the replay
   (wind-up stretch, `skill` release, its `hit`s, the zone landing, the target); `stage.ts` starts each
   script at its wind-up, applies the scripts' `ox/oy`, squash, alpha, flashes and after-images to the
   sprite, the screen shake/darken/fire tint/white flash, and binds passives to replay events: `rebirth`
   (ปีกอัคนี), `laststand` (ปีกขาวเจิดจ้า), the ent's bark on hits taken, static and jelly retorts on
   basic hits taken, the void step on `dodge`, the soul lantern's venom flame, the zombie rat's `rage`.
   Basic hits use the prototype's impact burst. Scenes are in sprite pixels (world / 1.5). Skills the
   prototype never drew (dodges, adventure enemy `e_*`, NPC `n_*`, world boss `wb_quake_*`) keep the
   generic element particles. A replay holds its first frame up to 1.5 s for the sprite chunk to load.
   `stage.test.ts` runs every animation through a fake canvas and fails on any script error; all 74 were
   also checked in Chromium on replays from the real engine (one fight per skill, caster = the species
   that owns it). When an animation changes in the prototype, port the change into the matching
   `skill-fx/<line>.ts` by hand (the converter was one-off). The floor (done 2026-11-08) is `sprites/fx/floors.ts`: the
   prototype's eight themes redrawn on the game's flat box (back wall with rocks and crystals, stone tiles,
   glowing rim, cracks, pools, rubble); a fight with a boss (raid, world or adventure area boss) takes its
   element's theme, a water boss and every other fight the blue cave.
3. **Other screens. Done (2026-11-08).** (The costume system was then switched off, 2026-11-08, at the
   owner's request: `COSTUMES_ENABLED = false` in backend `monster-rules.ts` and frontend `game-menu.ts`;
   no costume reaches any screen, buy/equip are refused, the menu entry and wiki tab are hidden, owned
   costumes and stored loadouts are kept. The anchors below still work when it comes back.) `shared/MonsterSprite.tsx` draws a sprite (still, or the idle
   loop with `animate`) with its aura and glows, from the lazily loaded chunk (`shared/sprite-loader.ts`,
   one load for every caller), and shows the emoji until it loads or when there is no art. Costumes:
   `spriteAnchors(id)` (sprite-registry) finds the hat spot (highest painted pixel above the head, around
   the mouth: designs face right) and the face spot; `PetCostumeFrame` takes them as `anchor`
   (`shared/costume-anchor.ts`, the sprite fills `SPRITE_FRAC` 80% of the frame). Used on: home
   (`PetSprite`, idle loop instead of the emoji hop; egg wobble and sick shake kept), `PetAvatar`
   (friends, PvP opponents, costume screen), the pet picker bar, Dex (48 px, undiscovered stay ❓), the
   evolution tree (SVG `foreignObject`), return-home, adventure stage enemies, the Hall of Fame. Still
   emoji: rankings and support-unit lists (their stored snapshots carry no sprite) and text lines in the
   wiki. Before this the plan read:
   **Other screens:** `shared/PetSprite.tsx` (home), `PetAvatar.tsx` (`PetCostumeFrame`: costumes are
   emoji layers for backdrop, aura, back item, face item and hat over a 128 px box, so every sprite needs
   a head and face anchor), the Dex, the evolution tree and the return-home (กลับดาว) screen.
4. **Renames in the game data**, in the same release: "Names to apply in the game" above (skills and
   species in `arena-data.ts` / `species-data.ts`; check PvP history with the `battle-golden-check`
   skill, since the golden file stores `moveName`). The vampire and the headless knight need their own
   raid skill ids (today they share ids with other bosses).
5. **Release:** a Thai patch-notes entry, the wiki (`WikiPanel.tsx` + backend `wiki.ts`), tests for the
   new helpers, then PRs in both repos when the owner asks.
6. **Art still open:** fire line less detailed than the others; perfect forms have no aura; ค้างคาวถ่าน
   is too dark on the dark page (brighten its palette); the 13 cross-line fused forms stay on hold.

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
