// Release step: turn the unreleased 'next' patch-notes entry into the real version and release time.
// Usage: node scripts/stamp-patch-notes.mjs <version>   (run by semantic-release's prepare step, and by the Docker and Pages builds)
import { readFileSync, writeFileSync } from 'node:fs'

const FILE = 'src/pages/project/tamagotchi/meta/patch-notes.ts'
const version = process.argv[2]
if (!/^\d+\.\d+\.\d+$/.test(version ?? '')) throw new Error(`bad version: ${version}`)

const src = readFileSync(FILE, 'utf8')
const next = /version: 'next',\n(\s*)releasedAt: '[^']*'/
if (!next.test(src)) {
  console.log("no 'next' patch note, nothing to stamp")
} else {
  const releasedAt = new Date().toISOString().replace(/\.\d+Z$/, 'Z')
  writeFileSync(FILE, src.replace(next, `version: '${version}',\n$1releasedAt: '${releasedAt}'`))
  console.log(`stamped patch note ${version} @ ${releasedAt}`)
}
