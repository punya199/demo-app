# td-sim

Pure-TypeScript simulation shared by the tower-defense client and server: seeded RNG (`rng.ts`), fixed-timestep tick loop and replay (`sim.ts`), and a pinned golden replay (`golden.ts`). No DOM, no Nest. Lint (`no-restricted-imports`/`no-restricted-globals` in `eslint.config.js`) and this folder's tsconfig (no DOM lib, no ambient types) enforce that.

## Distribution decision

**td-sim lives in this repo (`demo-app/td-sim/`), the source of truth. `scripts/sync-td-sim.mjs` copies `src/` (minus tests) into `demo-app-backend/src/libs/td-sim/`.**

Why: the owner chose the cheapest option that fits two repos with one maintainer. A private npm registry or a separate GitHub repo adds hosting, tokens and a publish step for a package that changes with every game rule; a git dependency or submodule needs credentials in CI and a two-step commit for each change. A copy keeps both repos building with no new secrets, and the golden replay catches drift.

Trade-off: the backend copy can go stale. Run `yarn td-sim:sync ../demo-app-backend` after any change, commit in both repos, and `node scripts/sync-td-sim.mjs ../demo-app-backend --check` fails when they differ. Never edit the backend copy. Revisit (registry or git dependency) if a third consumer appears.

## Checks

`yarn td-sim:check` runs lint, type-check and tests. It runs in CI (`.github/workflows/td-sim.yml`). The backend has its own smoke test, `src/libs/td-sim.spec.ts`, that replays the same golden seed and expects the same hash.

## Changing sim behaviour

Any change to rules or RNG order changes `GOLDEN_HASH`. Update it on purpose, in the same commit, and note why: past replays (server verification) depend on it.
