# Lightning line: frame-by-frame animation prompt

Cutting one still into moving parts looked odd to the owner (2026-11-10), so each creature is animated by
another AI: one sheet per creature, 5 rows x 6 frames, played frame by frame (`FRAME_SPRITE` in the
prototype's `js/sprites/bolt-frames.js`). Attach the creature's approved still from `bolt-refs/` every time.
Order one creature per request; a sheet of all nine loses consistency.

## Main prompt (replace `[CREATURE BLOCK]`)

```
Animate the creature in the attached reference image as a pixel-art sprite sheet for a game.
Keep its design EXACTLY: same shape, colours, markings, proportions and size. Do not redesign it.

SHEET LAYOUT
- ONE image: a grid of 5 rows × 6 columns, all cells equal squares, separated by solid pure-black grid lines.
- Background of every cell: flat solid #FF00FF magenta. No checkerboard, no gradient, no floor, no shadow.
- No text, labels, numbers or UI anywhere.
- Each row is one animation, read left to right, 6 frames:
  Row 1  IDLE      – a seamless loop (frame 6 flows back into frame 1).
  Row 2  MOVE      – a seamless loop of walking / flying / floating forward.
  Row 3  ATTACK    – frames 1–2 wind-up, 3–4 strike forward, 5–6 return to the idle pose.
  Row 4  SKILL     – frames 1–3 charge up (body pulls back, electricity gathers on the body),
                     frame 4 the release pose (thrusting forward), frames 5–6 return to idle.
  Row 5  HURT      – frames 1–2 recoil backwards (eyes squeezed), 3–4 stagger, 5–6 recover to idle.

FRAME CONSISTENCY (most important)
- The creature is the SAME SIZE in every frame and is never zoomed, cropped or rotated as a whole.
- It stays in the same spot in every cell: its body centre is in the middle of the cell, and its feet
  touch the same ground line, about 8% above the bottom of the cell, in every frame
  (a flying or floating creature hovers at the same height and bobs at most a few pixels).
- It always faces RIGHT, in strict side view.
- Only the parts named below move; everything else stays still, pixel for pixel.
- Motion between neighbouring frames is small and smooth; no motion blur, no smear frames, no speed lines,
  no afterimages, no squash-and-stretch of the whole body.
- Leave a margin of empty magenta around the creature in every cell so no wing, tail or ear touches
  a grid line, even at the widest pose.

EFFECTS
- Draw only the creature. Do NOT draw projectiles, beams, bolts flying away, explosions, impact flashes
  or dust: the game draws those itself.
- Allowed: small sparks or a glow ON the creature's own body during SKILL frames 2–4.

ART STYLE
- True pixel art: crisp square pixels, no anti-aliasing, no blur, no painterly shading.
- 1-pixel dark navy outline, light from the top-left, the same 16-colour palette as the reference.

[CREATURE BLOCK]
```

## Creature blocks

1. Thunder Bird (small songbird, flies). IDLE: hovering, slow wing flaps, tail feathers sway. MOVE: flying
   forward, faster flaps, head steady. ATTACK: head back, then darts forward and pecks. SKILL: wings spread
   wide and crackle, then one strong forward flap (it shoots a lightning feather).
2. Static Cat (chubby lazy cat, walks). IDLE: loafing, slow breathing, sleepy blink, tail tip twitches.
   MOVE: slow waddle, legs alternating. ATTACK: lazy front-paw swipe. SKILL: fur puffs into a spiky ball
   (spikier outline, NOT bigger overall), sparks on the fur tips.
3. Storm Fox (young fox, walks). IDLE: ears twitch, bolt tail sways. MOVE: light trot, legs alternating
   diagonally. ATTACK: crouch, quick claw swipe. SKILL: crouches low with sparking claws, then lunges.
4. Storm Hawk (hawk, flies). IDLE: hovering, big slow wing beats. MOVE: gliding forward with strong beats.
   ATTACK: rises wings up, dives with talons out. SKILL: wings raised and crackling, then swoops forward and
   down, wings swept back.
5. Gloom Cloud (lazy storm-cloud creature, floats). IDLE: puffs swell and shrink, grumpy blink, cloud tail
   sways. MOVE: drifting, puffs rolling. ATTACK: leans back, bumps forward. SKILL: darkens and swells, then
   yawns/roars with an open mouth (lightning rains in the game).
6. Thunder Fox (grown fox, walks; same tail count as the reference). IDLE: tails sway one after another.
   MOVE: steady trot. ATTACK: bite with a head thrust. SKILL: tails curl over its back and glow, the body
   crackles (a power-up in place).
7. Thunderbird King (huge regal bird, flies). IDLE: slow powerful beats, crest crackles. MOVE: flying
   forward. ATTACK: wings back, talon strike. SKILL: wings raised, glow gathers at the beak, then the head
   thrusts forward beak open (a beam in the game).
8. Thunder Fox King (five tails, walks). IDLE: tails fan and sway in a wave. MOVE: slow regal walk.
   ATTACK: heavy bite. SKILL: five tails fan out and glow, then whip forward one after another.
9. Awakened Thunder (four legs, great wings, many tails, walks). IDLE: slow wing flaps, tails sway, chest
   core pulses. MOVE: heavy walk, wings half open. ATTACK: rears back, front-claw slam. SKILL: wings and
   tails spread, chest core blazes white, head thrusts forward roaring.

## In-between frames (smoother motion)

Six frames per move play at about 4–5 a second, which reads as choppy. A second sheet with the frame halfway
between each pair doubles it to 12 per row (`FRAME_SPRITE` takes any number of frames per row; the
reduction interleaves the two sheets). Attach the creature's first sheet:

```
The attached image is a pixel-art sprite sheet: 5 rows × 6 frames of one creature
(rows: idle, move, attack, skill, hurt).
Draw a NEW sheet of IN-BETWEEN frames with the exact same layout: 5 rows × 6 columns, same cell size,
solid pure-black grid lines, flat #FF00FF magenta background, no text.
- Cell (row R, column C) is the frame exactly HALFWAY between frame C and frame C+1 of row R in the
  attached sheet.
- For column 6: in rows 1 and 2 (loops) it is halfway between frame 6 and frame 1; in rows 3, 4 and 5 it
  is halfway between frame 6 and the row's frame 1 as well (the move returns to the idle pose).
- Every part moves only half of the way it moves between the two frames: legs, wings, tails, head.
- Same creature, same size, same position in the cell, same ground line, same palette, same 1-pixel
  outline, facing right. Do not redesign, zoom, crop or move the whole creature.
- No new effects; keep only the sparks or glow on the body that the two neighbouring frames already have.
```

## Results

- 9 Awakened Thunder (bfused), first trial: consistent design; rows came at different sizes (scaled to
  match in the reduction); the hurt row barely recoils. The idle, move and hurt frames drift up to 4 px sideways, so the
  reduction slides them back to line the head and chest up (attack and skill keep their lunge).
