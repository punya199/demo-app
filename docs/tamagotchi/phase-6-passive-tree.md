# Phase 6: Passive Tree v2

Status: **phases 1 to 3 implemented.** Phase 1 (merged): 6-arm tree, 12 keystones, 100-point cap, branch refund, migration, new panel. Phase 2: `lifesteal`, `thorns`, `firstStrike` and `noCrit` in the 1v1 battle engine (the golden battle test is unchanged; the team/World Boss engine ignores the first three), keystones Undertow, Soul Pact, Thorn Mantle, First Strike, Overgrowth and Immovable now use them. Phase 3: 12 masteries (3 options each, first pick free, re-pick 1 gem), 3 ascendancy paths of 12 nodes with their own pool (Nightmare raid clears + world boss kills, 6 each, 12 max; start over costs 20 gems), endpoints `POST /passive/mastery`, `/passive/ascendancy/allocate` and `/passive/ascendancy/reset`. **Icons:** every node shows a line glyph for its strongest effect (notables add a second glyph, keystones a red drawback badge, masteries show their pick), drawn as inline SVG in `passive-icons.tsx`; the logic is in `passive-glyphs.ts`. Glyphs appear once they would be about 11px on screen, frames show at every zoom; available nodes pulse softly unless the user prefers reduced motion. **Still deferred:** `vsElement` and `critReduce` effects, "def becomes 0" overrides, jewel sockets, the JSON data file (the tree is generated in code).

## 1. Goals

- A tree large enough to need zoom/pan and to offer many different builds (~400 nodes).
- PoE look and depth: dark glowing map, node shapes by kind, keystones with trade-offs, masteries, an ascendancy layer.
- Keep the battle engine simple: new effects must fit the existing burn/shield/regen/double-strike machinery.
- Existing players lose nothing: everyone gets a free full refund once.

Out of scope for v1: jewel sockets (the `socket` kind is reserved in the data model, not shipped), a trainer level system.

## 2. Current system (facts from the code, 2026-11-03)

| Item | Value | Source |
|---|---|---|
| Nodes | 43, 3 arms (flame, tide, leaf) + hub | `passive-data.spec.ts` |
| Kinds | small, notable, key | `passive-data.ts` |
| Point cap | 60 | `PASSIVE_MAX_POINTS` |
| Points | Dex 1 each (max 33), raid first clears 1 each, world boss kills 1 each, PvP season rank 3/2/1 | `calcPassivePoints` |
| Respec | first 10 refunded points free, then 1 gem each | `calcRespecCost` |
| Effect keys | 13 (atk, hp, def, spd, crit, critdmg, shield, regen, dbl, burn, hunger, expCoin, drop) | `PassiveEffectKey` |
| Frontend | SVG panel, 232 lines | `PassivePanel.tsx` |

Facts to verify before implementation: `raid_progress` rows are written only on a clear (6 bosses x 3 difficulties = 18), and the adventure has 5 areas x 4 stages = 20 first clears.

## 3. Tree layout

Six arms around one hub, one per monster line: **flame, tide, leaf, earth, lightning, spirit** (holy/dark/shadow combined). Each arm leans toward its line's stat bias. Bridge clusters between neighbouring arms carry hybrid effects (the fused forms).

| Part | Count | Notes |
|---|---|---|
| Hub ring | ~12 | small nodes, start of every path |
| Arms (6) | ~50 each, ~300 | 3 parallel lanes of ~16 nodes, cross-links, 2 keystones, 2 masteries per arm |
| Bridges (6) | ~12 each, ~72 | hybrid effects between neighbours |
| **Main tree** | **~384** | |
| Ascendancy (3 paths) | ~12 each, 36 | separate map, separate point pool |
| **Total** | **~420** | |

Node kinds and shapes:

| Kind | Shape | Role |
|---|---|---|
| small | circle | one plain stat (+2% atk) |
| notable | diamond | 2-3 stats, a milestone on a lane |
| keystone | hexagon | big bonus with a trade-off, 12 total |
| mastery | rounded square | pick 1 of 3 effects, 12 total |
| ascendancy | star | path specialisation |
| socket | (reserved) | not shipped in v1 |

Each arm has one colour; the arm colour is shared by its nodes and glow.

## 4. Points

Main pool, **cap 100**:

| Source | Points | Limit |
|---|---|---|
| Dex species | 1 each | 33 |
| Raid first clears | 1 each | 18 |
| Adventure stage first clears | 1 each | 20 |
| Total-win milestones | 1 per 100 wins | 10 |
| World boss kills | 1 each | none (~1 per week) |
| PvP season rank | 3 / 2 / 1 | 1-3 per month |

Fixed sources give 81 points; the last 19 come from boss kills and PvP, about 3-4 months of play. Wins are counted from existing data, so no new progression system is needed.

Ascendancy pool, **about 12 points**, separate from the main pool: Nightmare raid first clears (6) plus world boss kills (up to 6).

### Gem income (changed after the first draft)

Gem prices in this spec depend on income, which now includes daily gems, weekly quests and a login streak (already implemented in `quest-data.ts`, no passive-tree code involved).

| Source | Gems | Cadence |
|---|---|---|
| Dex discovery | 1 per new species | one time, 33+ |
| Adventure boss first clears | 90 total | one time |
| PvP season reward | 3 to 30 | monthly |
| Daily quests (battle win, expedition) | 1 each, 2 per day | daily |
| Weekly quests (4) | 5 / 4 / 3 / 3 = 15 | weekly |
| Daily login streak | day 3: 1, day 5: 1, day 7: 5 = 7 | weekly cycle |

Recurring income is about 36 gems a week (14 daily, 15 weekly, 7 login), about 150 a month. Costumes cost 30 to 100 gems. Consequences for this spec:

- Mastery re-pick (1 gem) and respec (1 gem per point) stay cheap and fine.
- Ascendancy switch stays at 20 gems, about 4 days of income, so it is a small commitment, not a big one. Raise it to 60 if switching should hurt.
- "Refund whole branch" at 1 gem per point can cost 20 or more gems for a big branch; cap it at 20 gems per action.
- Open question for the balance pass: whether respec prices should scale with the income above.

## 5. Keystones (12, two per arm)

Keystones use negative values on existing stats where possible. Negative `fx` is allowed on keystones only; the spec test enforces it.

| Arm | Keystone | Effect | Trade-off |
|---|---|---|---|
| Flame | Inferno Pact | +50% atk | def becomes 0 |
| Flame | Cinder Heart | burn lasts +2 turns | -20% hp |
| Tide | Tidal Ward | start with shield = 30% max hp | -25% atk |
| Tide | Undertow | lifesteal 15% | -15% spd |
| Leaf | Overgrowth | regen doubled | crit becomes 0 |
| Leaf | Thorn Mantle | reflect 20% of damage taken | -20% atk |
| Earth | Bedrock | +40% def | -30% spd |
| Earth | Immovable | +30% hp and def | cannot crit |
| Lightning | First Strike | always acts first | -20% hp |
| Lightning | Overcharge | +60% crit damage | -15% def |
| Spirit | Soul Pact | lifesteal 25% | -30% hp |
| Spirit | Twilight Gambit | 20% double strike | -30% def |

Final numbers are set in the balance pass (section 9).

## 6. Masteries (12, two per arm)

A mastery is a node where the player picks one of three effects. Changing the pick costs 1 gem. No option may duplicate what a plain node already gives. Examples (all to be finalised in the balance pass):

| Arm | Mastery | Options |
|---|---|---|
| Flame | Ember Craft | burn +1 turn / +10% atk vs tide / +5% crit |
| Tide | Deep Current | shield +8% / lifesteal 5% / +10% atk vs flame |
| Leaf | Wild Growth | regen +1% / thorns 8% / +10% atk vs earth |
| Earth | Stone Lore | +8% def / +10% atk vs lightning / start shield 10% |
| Lightning | Static Field | +6% spd / first strike chance 10% / +10% atk vs leaf |
| Spirit | Veil Rite | lifesteal 6% / double strike 6% / +10% drop |

(Each arm has two masteries; the second one per arm is listed in the data file, not in this table.)

## 7. Ascendancy (3 paths, ~12 nodes each)

One path per account, chosen from a separate map. Switching costs a fixed 20 gems. The unlock needs at least 1 ascendancy point.

- **Vanguard**: tank. def, hp, shield.
- **Striker**: burst. crit, double strike, spd.
- **Warden**: sustain and economy. regen, burn, drop.

## 8. Engine, data and API

**New effect types (at most 6):** `lifesteal`, `thorns`, `firstStrike`, `vsElement`, `startShield`, `critReduce`. Each maps onto the existing effect machinery. Fighters without effects must still produce bit-identical fights: `battle-engine.golden.spec.ts` must pass unchanged, and RNG order must not change. Add every new effect to `wiki.ts`.

**Data:** nodes live in a checked-in JSON file (`passive-tree.json`) with a script that lays out and validates it: connected graph, no orphans, no duplicate ids, only keystones may carry negative values, all `adj` links two-way. `passive-data.ts` loads it. Node ids are never renamed (they are stored per player).

**API:** `GET /passive` still publishes the whole graph. Add: mastery pick, ascendancy choose/switch, refund a branch. Allocation stays server-authoritative inside one row-locked transaction (existing `lockRow` pattern). Never trust client point counts.

**Existing players:** a migration soft-deletes old allocations and resets `refunded_points` to 0, using a new id set. No wallet entries are needed (points are not currency). The panel shows a one-time notice.

**Respec:** keep 10 free refunds, then 1 gem per point. New "refund whole branch" action, same per-point price, capped at 20 gems per action. Mastery re-pick 1 gem. Ascendancy switch 20 gems (60 if you want it to hurt, see gem income).

## 9. Frontend

- Pinch-zoom and drag-pan, with a minimap.
- Search by node name or effect, matches highlighted.
- Tap a node for a detail card; an explicit **Allocate** button (no accidental taps).
- Dark theme, glowing lines, node shapes by kind, colour by arm. Emoji and simple SVG icons only in v1.
- Render SVG with viewport culling; switch to canvas only if measured too slow at ~400 nodes.
- Thai UI text, as in the rest of the game.

## 10. Balance target

A full 100-point build adds about 2x what today's full 60-point build adds in total stats. A point is worth about 70% of today's, because many nodes are notables and masteries. Per-node numbers are tuned with the existing battle simulation tests before release.

## 11. Test plan

- Data spec: node count per kind, graph connected, ids unique, `adj` symmetric, negative values only on keystones, every arm reachable from the hub.
- Points spec: `calcPassivePoints` per source and the 100 cap.
- Rules spec: allocate/deallocate keep the graph connected; mastery pick and ascendancy rules.
- Engine: golden-file test unchanged; one spec per new effect.
- Integration: migration refunds everyone; concurrent allocate requests cannot overspend points.

## 12. Rollout and open items

1. Implement behind the data file and migration, deploy backend first, frontend second.
2. Open items to confirm: gem price scaling (section 4), raid clear-row behaviour, adventure stage count (20), exact keystone and mastery numbers, spirit arm art direction.
3. Commit tags for this repo: `Fix:` / `Update:` / `New:` only.
