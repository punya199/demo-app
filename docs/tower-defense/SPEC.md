# Tower Defense ("td") — Design Spec

Status: draft, agreed via design interview. Scope: full vision; build M1 to M3 first.

## 1. Goal and non-goals

A gear-merge roguelike tower defense for yaya, inspired by the mobile game GearPaw Defenders. Mechanics are reproduced; names, art, audio and content are original.

Non-goals:
- No decompiled code, data tables or assets from the reference app.
- No real-money IAP, no ads, no payment path.
- No live multiplayer. Multiplayer is asynchronous only.
- No link to the monster game's wallet, items or kv-store.

## 2. Reference basis and confidence

Rules below come from public store text, store changelogs and two promo guides. These sources give no numbers, so **every number in this spec is our own placeholder** and lives in config. The gear/board rule (§4) is inferred and must be tuned against hands-on play of the reference game.

## 3. Architecture

| Piece | Location | Notes |
|---|---|---|
| Frontend game | `demo-app/src/pages/project/tower-defense/` | Canvas + rAF loop, no engine, same style as `gem-diggers`. Card added in `PageGames.tsx`, path in `app-paths.ts`. |
| Shared sim | `td-sim` (private package, installed in both repos) | Pure TypeScript. No DOM, no Nest imports. Deterministic, seeded RNG, fixed timestep. |
| Backend | `demo-app-backend/src/modules/td/` | NestJS, JWT guard, DTO validation, per-user rate limiting. |
| Data | Postgres schema `td` (never `public`) | Own entities and migrations. Links to `public.user` by user-id column only, no cross-schema FK. |

`demo-app` and `demo-app-backend` are separate git repos; `td-sim` is therefore a separate package with its own golden-replay tests.

### Authority model
- `POST /td/battles` returns `{battleId, seed}`; battle ids are single-use and expire.
- Client plays live, then sends `{battleId, seed, inputLog}`.
- Server replays with `td-sim`, enforces a tick cap, and ignores any client-reported damage or rewards.
- Gacha rolls are server-side, seeded and logged.
- Energy regenerates lazily from a timestamp; no cron.

## 4. Core battle (M1)

- **Board**: 5x6 grid. A few tiles are marked -2 (reduce a gear's effectiveness). One energy source on an edge.
- **Summon**: spend run-gold to summon a random hero gear onto a free tile.
- **Charging**: a gear charges only when linked to the energy source, directly or through a chain of adjacent gears. More touching sides means faster charge and higher output.
- **Firing**: a charged gear fires its hero's skill at enemies in the lane.
- **Merge**: two identical gears merge into level n+1. (A reviewer of the reference claims levels 3 to 4 felt weaker; tune so merging is always worthwhile.)
- **Resonance**: adjacent matching gears grant crit chance.
- **Lane**: enemies walk a lane toward the HQ. Reaching it costs HQ health; zero health ends the run.
- **Rounds**: a stage is 7 rounds plus a boss. At the end of each round the player picks 1 of 3 random skills (roguelike draft).
- **Boss**: each stage has one boss with its own skill pattern and a weakness.
- **Controls**: pause and 2x speed.

## 5. Meta progression (M2 to M3)

- **Heroes**: 12 at launch, 3 roles (AoE, support, DPS), 4 per role. Rarity Common, Rare, Epic, Legendary. Duplicate pulls convert to shards; shards raise star level, which unlocks stronger skills.
- **Elements**: Fire, Ice, Nature, Physical at launch (two more later).
- **Gear mods**: per-hero, upgraded with coins.
- **Cores (M3)**: 4 slots; equipping a core activates elemental power; rarity promotion.
- **Relics (M3)**: unlock exclusive skills for core heroes.
- **Sweep (M3)**: 3 stars on a stage unlocks claiming its rewards without replaying; server-side.
- **Later**: Fusion (specific heroes at level 10, triggered in battle), Wish (clover summons a strong hero mid-run), terrain buffs.

## 6. Economy (all values are placeholders in one config file)

| Currency | Source | Sink |
|---|---|---|
| Coins | Battles | Gear mod upgrades |
| Gems | First clears, achievements, daily and 7-day goals | Gacha |
| Shards | Battles, sweeps, duplicate pulls | Hero star-ups |
| Clovers | Goals and events | Wish (later) |

- **Energy**: cap 60, +1 per 6 minutes, stage costs 6, deducted at battle start.
- **Gacha**: one standard banner. 150 gems per pull, 1,350 per 10-pull, 1 free pull per day. Rates Common 60%, Rare 30%, Epic 8%, Legendary 2%. Legendary guaranteed within 50 pulls (`gacha_pity`). Rates are shown in-game. Mythic and limited banners come in a later milestone.
- Balances are derived from an append-only ledger; never stored as a mutable total.

## 7. Content for M1 to M3

12 heroes, 4 elements, 12 skills, 3 stages (7 rounds plus boss each), 3 bosses, 6 enemy types.

## 8. Data model (`td` schema)

`player_profile`, `currency_ledger` (append-only), `hero_owned`, `gear_mod`, `core`, `relic`, `stage_progress`, `battle_session` (seed, status, expiry), `gacha_pull`, `gacha_pity`.

Later: `arena_snapshot`, `arena_rank`, `guild`, and related tables.

Rules: hand-written migrations (project has `synchronize: false`); the migration creates the `td` schema; entities registered in `database.config.ts`; no PII beyond user id; versioned save data from day one.

## 9. API (all under `/td`, JWT guarded)

| Route | Purpose |
|---|---|
| `GET /td/profile` | Profile, balances, energy |
| `GET /td/stages` | Stages and star progress |
| `POST /td/battles` | Start battle, returns seed and id |
| `POST /td/battles/:id/finish` | Submit input log, replayed server-side |
| `POST /td/stages/:id/sweep` | Claim sweep rewards (M3) |
| `POST /td/gacha/pull` | Pull (single or 10) |
| `POST /td/heroes/:id/star-up` | Spend shards |
| `POST /td/gear/:id/upgrade` | Spend coins |

Every route has a DTO with validation and per-user rate limiting.

## 10. Responsive UI

- Fixed logical canvas size scaled with `ResizeObserver`; device pixel ratio capped at 2x.
- Below 768px (portrait): lane on top, board on the bottom 60%, bottom tab bar for menus.
- 768px and up: lane and board side by side, menus in a left rail.
- Pointer events only (touch and mouse), plus keyboard shortcuts on desktop.
- Thai and English via simple string tables.

## 11. Testing

- `td-sim`: golden-replay tests (same seed gives the same result) and property tests.
- Backend: unit tests plus `*.int-spec.ts` against the test Postgres, including a forged-finish rejection test.
- Frontend: Vitest on pure logic only; no canvas tests.

## 12. Milestones

Each milestone ends playable and fun before the next starts.

| M | Content | Done when |
|---|---|---|
| M1 | Core battle, 1 stage, boss, offline sim, shapes for art | A full run is fun for 5 minutes |
| M2 | Backend `td` module, heroes, gacha, gear mods, server-verified results | Play, win, earn, pull, upgrade, all persisted |
| M3 | Cores, relics, sweep, 3 stages, wiki | Meta loop holds for a week of daily play |
| M4 | Tower, Dungeon, Invasion modes; more elements | |
| M5 | Async Arena from `arena_snapshot` | |
| M6 | Guild, guild maze, co-op, chat (needs nickname moderation) | |

## 13. Process rules

- Each PR branches from a fresh `origin/main`.
- Commit tags: `Fix:`, `Update:` or `New:` only.
- Each PR adds a short Thai player-facing entry to a `td` patch-notes file.
- In-game wiki arrives with M3.
- Guild and chat are deferred until nickname moderation and a report path exist (PDPA).

## 14. Risks and open items

- Real numbers are unknown; our values are tuned against the owner's play of the reference game.
- The gear/charging rule is inferred from marketing text.
- Sharing `td-sim` across two repos adds setup cost; decide the distribution method (private npm, git dependency or submodule) at the start of M1.
- Gacha is simulated gambling; keep soft currency only until legal and PDPA review.
- Reference art, names and audio must not be copied.
