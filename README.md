# Yaya demo-app

React 18 + TypeScript SPA (Vite 6) that bundles several unrelated tools behind one router and auth shell: house rent, user management, voting, checkbill, gem diggers, omama game, paojiao ledger, random card and tamagotchi.

## Getting started

Requires Node >= 20 (`.nvmrc`: 20.18.1) and **Yarn 4.9.1** (Berry). Don't use npm or pnpm.

```bash
yarn install
yarn dev
```

## Commands

| Command                             | What it does                                 |
| ----------------------------------- | -------------------------------------------- |
| `yarn dev`                          | Vite dev server                              |
| `yarn build`                        | Type-check (`tsc -b`), then production build |
| `yarn preview`                      | Preview the production build                 |
| `yarn lint` / `yarn lint:ci`        | ESLint (`lint:ci` is quiet mode)             |
| `yarn format` / `yarn format:check` | Prettier write / check                       |
| `yarn test` / `yarn test:watch`     | Vitest once / watch                          |

## Runtime config

Read env through `appConfig()` (`src/config/app-config.ts`). It prefers `window._env_` (injected at container start, see `public/config/env-config.example.js` and `nginx.conf`) over `import.meta.env`, so one Docker image can be reconfigured per environment without a rebuild.

## Project layout

- `src/router.tsx`: all routes, with every page lazy-loaded. Paths come from `src/config/app-paths.ts`.
- `src/pages/`: one self-contained directory per feature (`house-rent/`, `project/checkbill/`, ...).
- `src/components/`, `src/utils/`, `src/lib/`: shared code.
- `src/service.ts` and per-feature `*-service.tsx` / `*-query.ts`: TanStack Query API hooks.
- `functions/`: Cloudflare Pages Functions (`/api/*` proxy).

See `CLAUDE.md` for architecture and conventions.

## Releases

semantic-release runs on `main`. Commit summaries use `Fix:`, `Update:` or `New:`. Don't hand-edit `CHANGELOG.md` or the `package.json` version.

## Cloudflare Pages deploy

On every release, `.github/workflows/docker-build.yml` (`deploy-pages` job) builds the app, writes `dist/config/env-config.js` with `VITE_API_DOMAIN = '/api/v1'` (same origin), and runs `wrangler pages deploy`. `functions/api/[[path]].ts` proxies `/api/*` to the backend with the path unchanged (the backend serves under `/api/v1`), so cookies stay first-party. Unknown routes fall back to `index.html` (Pages SPA default, no `404.html`).

One-time setup:

1. Cloudflare dashboard: create a Pages project with **Direct Upload** (production branch `main`).
2. Pages project > Settings > Variables: add `BACKEND_URL` = the Cloud Run service URL (no trailing `/api`), for Production (and Preview if used).
3. GitHub repo > Settings > Secrets and variables > Actions:
   - secret `CLOUDFLARE_API_TOKEN`: API token with only *Account > Cloudflare Pages > Edit*
   - variable `CLOUDFLARE_ACCOUNT_ID`
   - variable `CF_PAGES_PROJECT`: the Pages project name. The deploy job is skipped while this is unset.
4. Custom domain is attached at cutover (ticket 07); until then verify on `*.pages.dev`.
