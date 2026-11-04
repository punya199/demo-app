---
name: new-frontend-page
description: Add a new page/route or a new screen (panel) in the monster game to this React app. Use when creating a Page*.tsx, adding a route to src/router.tsx or a path to appPath, adding a menu item/panel to the Tamagotchi game (src/pages/project/tamagotchi/), or wiring a new backend endpoint into TanStack Query hooks.
---

# New frontend page or game screen

Read `CLAUDE.md` (Architecture + Conventions) first. This skill is the checklist on top of it.
There are two cases: **A** a new route/page anywhere in the app, and **B** a new screen inside
the monster game, which is a menu panel, *not* a route. Pick the one that fits. Most game
features are B.

## 0. Before you start (3 developers work in parallel)

Three people, each with their own Claude, edit the same few files. To keep merges clean:

- Start from a fresh `origin/main` and rebase again before pushing.
- In shared files, **append** new entries and never reorder or reformat existing ones:
  `src/router.tsx` (lazy imports + route list), `src/config/app-paths.ts`,
  `tamagotchi/game-menu.ts`, the `panels` map in `PageTamagotchi.tsx`,
  `tamagotchi-service.tsx`, and `tamagotchi-interface.ts`.
- Don't reformat files you didn't change. Let `lint-staged` format only what you staged.
- If the backend must change too, it's a separate repo (`demo-app-backend`), possibly in another
  dev's hands. Agree on the response shape first, and link both PRs to each other.

## A. New route / page

1. **Path**: add it to `appPath` in `src/config/app-paths.ts` with `generatePath`. Typed params
   look like `generatePath<{ param: { pollId: string } }>('/voting/:pollId/edit')`. Never hardcode
   a URL string anywhere else. Navigate with `appPath.x({ param: {...} })`.
2. **Component**: `src/pages/<feature>/Page<Name>.tsx` (or `src/pages/project/<feature>/`), named
   `Page...`, with props interfaces prefixed `I`. Keep feature helpers, store and types next to it
   (`<feature>-helper.ts`, `-interface.ts`, `-service.tsx`).
3. **Router**: in `src/router.tsx`, add a `lazy(() => import(...))` at the top. Use
   `.then(m => ({ default: m.PageX }))` for a named export. Never import a page directly.
   Then add `{ path: appPath.x(), element: ... }` to the route list.
4. **Auth**: wrap the element in
   `<Authorize featureName={EnumPermissionFeatureName.X} requiredRead|requiredCreate|...>`.
   A new feature name must also exist in the backend's permission feature list. Leave a route
   without `Authorize` only when it is meant to be public, and say so in a comment the way
   `voteBySlug` does. `paojiao-ledger` uses its own guard/shell. Don't copy it for other features.
5. If it should appear in a menu (e.g. `PageGames`), link it via `appPath`.

## B. New screen in the monster game (`src/pages/project/tamagotchi/`)

The game is one route (`appPath.tamagotchi()` → `/monster`). Screens are panels chosen by the
URL hash (`/monster#raid`).

1. `game-menu.ts`: add the key to the `GameMenuKey` union and an item `{ key, label, emoji }`
   (Thai label) to the right group in `GAME_MENU`.
2. Update `game-menu.test.ts`. It asserts the total number of screens (`toHaveLength(...)`).
3. Create `<Name>Panel.tsx`. It takes `onError: (error: unknown) => void`, plus `monster` if it
   needs the selected pet. Wire it into the `panels` map in `PageTamagotchi.tsx` with
   `onError={showError}`.
4. Pass `{ onError }` to every `mutate(...)` call so server refusals show as a toast. Don't
   swallow errors.
5. Use Ant Design (`Card size="small"`, `Button`, `Spin`, `Progress`) + Tailwind, with
   `dark:` variants like the existing panels (`dark:border-slate-700 dark:bg-slate-900`).
6. Write user-facing text in Thai, matching the tone of the other panels.

## API hooks (both cases)

- Never call `apiClient` from a component. Add `useXxx` hooks to the feature's service file
  (for the game: `tamagotchi-service.tsx`) using `useQuery` / `useMutation`.
- Put response types in the feature's interface file (`tamagotchi-interface.ts`), mirroring what
  the backend returns. Don't use `any`.
- After a mutation, update the cache the way the other hooks do:
  - If the reply includes `monster`, call `setSelectedMonster(queryClient, data.monster)` so the
    other pets' slots stay in the cached list. Invalidating `MY_MONSTER_KEY` also works.
  - If coins/gems changed, invalidate `WALLET_KEY` (or set it from `data.wallet`).
  - Invalidate the feature's own key and anything else it changes (`INVENTORY_KEY`,
    `EQUIPMENT_KEY`, `['adventure']`, ...).
- The game is server-authoritative. Show what the server returns (battle events to replay,
  rewards). Never compute a result on the client and send it up.
- Read config only through `appConfig()`, never `import.meta.env`.
- Zustand is for UI/local state only. Server data stays in TanStack Query.

## Tests

Put pure logic (formatting, derived numbers, tree building) in a `*-helper.ts` / `.ts` file and
test it with a co-located Vitest `*.test.ts`, e.g. `tamagotchi-helper.test.ts` or
`evolution-tree.test.ts`. Components only need a test when they hold real logic.

## Before committing

```bash
yarn lint:ci
yarn test
yarn build          # tsc -b catches broken types across the app
```

To check it visually, run `yarn dev` and open the page (or `/monster#<key>`). The `run` skill can
take a screenshot. Commit as `New:` / `Update:` / `Fix:` (see `CLAUDE.md`). If a backend endpoint
or wiki field is involved, link the `demo-app-backend` PR in the description.
