---
name: add-env-var
description: Add, rename or remove an environment / runtime config value in this React (Vite) app. Use whenever code needs a new VITE_* value, an API domain, a feature flag, or a change to src/config/app-config.ts, public/config/env-config.example.js, or the deploy workflow's env-config step.
---

# Add an env var (frontend)

The browser reads config in two layers, through `appConfig()` in `src/config/app-config.ts`:

1. `window._env_`, from `/config/env-config.js` (loaded by `index.html` before the app). This is
   **runtime** config that can change per environment without a rebuild. It wins.
2. `import.meta.env`, baked in by Vite at **build** time from `.env*` / the build environment.
   This is the fallback.

Everything in the browser is public. Never put a secret here. Secrets belong in the backend
(`demo-app-backend`, `add-env-var` skill there).

## Checklist

1. **`appConfig()`**: add `VITE_X: getEnv('VITE_X')`, converting the type here
   (`=== 'true'` for booleans, `Number(...)` for numbers). The `VITE_` prefix is required, or
   Vite won't expose it at build time.
2. **Read it only through `appConfig().VITE_X`**, never `import.meta.env` in app code. (The one
   existing exception is the build-stamped `VITE_APP_VERSION` in `api-client.ts`.)
3. **Local dev**: add it to `public/config/env-config.example.js` with a dev-safe value. Each of
   the 3 developers copies that into their own `public/config/env-config.js` (or `.env`), so
   mention the new key in the PR description.
4. **Production (Cloudflare Pages)**: the `deploy-pages` job in
   `.github/workflows/docker-build.yml` writes `dist/config/env-config.js` from a heredoc
   ("Write runtime env-config"). Add the production value there. If it differs per environment
   or is sensitive-ish, use `${{ vars.X }}` (a repo variable) instead of a literal, and say in
   the PR which repo variable must be created before merge.
5. **Missing value**: `getEnv` returns `undefined` when neither layer has the key. Give the
   code a sensible default instead of crashing (`appConfig().VITE_X ?? 'fallback'`).
6. **README.md**: if it's a deploy setting, note it next to the existing `VITE_API_DOMAIN`
   explanation.

## Removing / renaming

Keep reading the old name as a fallback for one release (`getEnv('VITE_NEW') || getEnv('VITE_OLD')`),
update the workflow and the example file, then drop the old one in a later PR.

## Verify

```bash
yarn build      # tsc + vite build
yarn dev        # check the value in the running app
```
