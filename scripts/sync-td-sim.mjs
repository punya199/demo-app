// Copies td-sim (source of truth, this repo) into the backend repo.
// Usage: node scripts/sync-td-sim.mjs <path-to-demo-app-backend> [--check]
// --check copies nothing and exits 1 when the backend copy has drifted.
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { join, relative, resolve } from 'node:path'

const [backend, flag] = process.argv.slice(2)
if (!backend || (flag && flag !== '--check')) {
  console.error('usage: node scripts/sync-td-sim.mjs <backend-repo-path> [--check]')
  process.exit(2)
}

const src = resolve('td-sim/src')
const dest = resolve(backend, 'src/libs/td-sim')
const NOTE =
  'Synced from demo-app/td-sim by scripts/sync-td-sim.mjs. Do not edit here; edit the frontend repo and re-sync.\n'

const list = (dir) =>
  readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile())
    .map((e) => relative(dir, join(e.parentPath, e.name)))
    .filter((f) => !f.endsWith('.test.ts'))
    .sort()

const files = list(src)

if (flag === '--check') {
  const have = existsSync(dest) ? list(dest).filter((f) => f !== 'SYNCED.md') : []
  const same =
    JSON.stringify(files) === JSON.stringify(have) &&
    files.every((f) => readFileSync(join(src, f), 'utf8') === readFileSync(join(dest, f), 'utf8'))
  console.log(same ? 'td-sim in sync' : 'td-sim DRIFT: run the sync script')
  process.exit(same ? 0 : 1)
}

rmSync(dest, { recursive: true, force: true })
mkdirSync(dest, { recursive: true })
for (const f of files) cpSync(join(src, f), join(dest, f))
writeFileSync(join(dest, 'SYNCED.md'), NOTE)
console.log(`copied ${files.length} files to ${dest}`)
