# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev              # Start dev server (Vite)
yarn build            # Type-check (tsc -b) then production build
yarn preview          # Preview production build

yarn lint             # ESLint
yarn lint:ci          # ESLint, quiet mode (used in CI)
yarn format           # Prettier --write
yarn format:check     # Prettier --check

yarn test             # Run vitest once
yarn test:watch       # Vitest watch mode
yarn vitest run path/to/file.test.ts        # Run a single test file
yarn vitest run -t "test name"              # Run tests matching a name
```

Package manager is **Yarn 4.9.1 (Berry)** — do not use npm/pnpm, lockfile is `yarn.lock`. Node >= 20 required (see `.nvmrc`: 20.18.1).

Pre-commit runs `lint-staged` via Husky (`eslint --fix --max-warnings=0` + `prettier --write` on staged `.ts/.tsx/.js/.jsx`, `prettier --write` on `src/**/*.json`). Releases are automated via semantic-release on `main` using the `eslint` commit-message preset (conventional commits drive the version bump) — do not hand-edit `CHANGELOG.md` or `package.json`'s `version`.

## Architecture

React 18 + TypeScript SPA (Vite 6) — a multi-tool app bundling several unrelated features behind one router/auth shell, not a single-purpose product. Path alias `@/*` → `./src/*`.

**Routing & code splitting** (`src/App.tsx`): every route component is `React.lazy()`-loaded and registered in one `createBrowserRouter` tree wrapped in `RootLayout`. Route paths are never hardcoded — they come from `appPath` in `src/config/app-paths.ts` (built with `generatePath`), which is the single source of truth for URLs and their typed params.

**Auth/permission gating**: routes requiring permission are wrapped in `<Authorize featureName={EnumPermissionFeatureName...} requiredRead|requiredCreate|requiredUpdate|requiredDelete>` (`src/components/Authorize.tsx`). It checks login state and per-feature CRUD permission via `useGetMeSuspense`/`usePermissionRouteAllow` (`src/service.ts`, `src/services/permission/`) and redirects to login/home with a Thai-language toast message on failure. The `paojiao-ledger` feature instead uses its own `PaojiaoLedgerGuard`/`PaojiaoLedgerShell` wrapper, not `Authorize` — don't conflate the two auth patterns.

**API layer**: `src/utils/api-client.ts` is a single Axios instance (`apiClient`) with `withCredentials: true`. Its response interceptor watches for specific auth error codes (`AUT4001`-`AUT4004`) and transparently refreshes the token via a `Mutex`-guarded `callRefreshToken`, retrying the original request. Feature API calls live in `service.ts` (root) or per-domain `*-service.tsx`/`*-query.ts` files (e.g. `src/pages/house-rent/house-rent-service.tsx`, `src/services/user/user.query.ts`) as TanStack Query hooks — don't call `apiClient` directly from components.

**Config/env**: runtime config is read through `appConfig()` (`src/config/app-config.ts`), which prefers `window._env_` (injected at container start, see `public/config/env-config.example.js` / `nginx.conf`) over Vite's `import.meta.env`. This lets one Docker image be reconfigured per-environment without rebuilding — always read env through `appConfig()`, not `import.meta.env` directly, in app code.

**State**: Zustand stores live under `src/utils/` (app-wide, e.g. `theme-store.ts`) or co-located per feature (e.g. `src/pages/project/checkbill/check-bill-store.ts`, `src/pages/project/paojiao-ledger/ledger-store.ts`). Server state goes through TanStack Query; Zustand is for local/UI/session state only.

**Feature organization**: each top-level feature is a self-contained directory under `src/pages/` (or `src/pages/project/`) with its own components, store, service/query, and `-helper`/`-interface`/`-types` files co-located — e.g. `house-rent/`, `project/checkbill/`, `project/paojiao-ledger/`, `project/omama-game/`. Shared/reusable pieces only go in the top-level `src/components/`, `src/utils/`, `src/lib/`.

## Conventions

- Components: PascalCase; page components prefixed `Page` (e.g. `PageCreateBill.tsx`); interfaces prefixed `I` (e.g. `IAuthorizeProps`); utility files kebab-case.
- Styling: Tailwind CSS v4 utility classes by default; Emotion's `css` prop (via `@emotion/react` jsxImportSource) for cases needing dynamic/computed styles. Ant Design v5 (`antd`) is the component library — theme is centralized in `App.tsx`'s `ConfigProvider`.
- Some user-facing strings (auth/permission messages) are Thai — match existing locale/tone when adding similar messages rather than switching to English.
- Tests use Vitest + Testing Library (`jsdom` env, setup file `src/test/setup.ts`); co-locate `*.test.ts(x)` next to the file under test.
