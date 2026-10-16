[![Deploy to Koyeb](https://www.koyeb.com/static/images/deploy/button.svg)](https://app.koyeb.com/deploy?name=yaya-developer&type=docker&image=acelectic%2Fyaya-developer%3Alatest&instance_type=free&instances_min=0&autoscaling_sleep_idle_delay=300&ports=80%3Bhttp%3B%2F&hc_protocol%5B80%5D=tcp&hc_grace_period%5B80%5D=5&hc_interval%5B80%5D=30&hc_restart_limit%5B80%5D=3&hc_timeout%5B80%5D=5&hc_path%5B80%5D=%2F&hc_method%5B80%5D=get)

## Cloudflare Pages deploy

On every release, `.github/workflows/docker-build.yml` (`deploy-pages` job) builds the app, writes `dist/config/env-config.js` with `VITE_API_DOMAIN = '/api'` (same origin), and runs `wrangler pages deploy`. `functions/api/[[path]].ts` proxies `/api/*` to the backend, stripping the `/api` prefix (same as the old ingress rewrite), so cookies stay first-party. Unknown routes fall back to `index.html` (Pages SPA default, no `404.html`).

One-time setup:

1. Cloudflare dashboard: create a Pages project with **Direct Upload** (production branch `main`).
2. Pages project > Settings > Variables: add `BACKEND_URL` = the Cloud Run service URL (no trailing `/api`), for Production (and Preview if used).
3. GitHub repo > Settings > Secrets and variables > Actions:
   - secret `CLOUDFLARE_API_TOKEN`: API token with only *Account > Cloudflare Pages > Edit*
   - variable `CLOUDFLARE_ACCOUNT_ID`
   - variable `CF_PAGES_PROJECT`: the Pages project name. The deploy job is skipped while this is unset.
4. Custom domain is attached at cutover (ticket 07); until then verify on `*.pages.dev`.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
