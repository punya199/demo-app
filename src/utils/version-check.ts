// Detects that a newer release is deployed: the build writes /version.json (scripts/stamp-patch-notes.mjs)
// and the running bundle compares it with its baked-in VITE_APP_VERSION.
export const CURRENT_VERSION: string | undefined = import.meta.env.VITE_APP_VERSION || undefined
export const POLL_MS = 60_000
export const SILENT_RELOAD_AFTER_HIDDEN_MS = 5 * 60_000
export const CHUNK_RELOAD_KEY = 'chunk-reload-done'

const SEMVER = /^\d+\.\d+\.\d+$/

// Only a well-formed, different version counts, so a bad/missing file never prompts a reload.
export const isNewVersion = (current: string | undefined, remote: unknown): boolean =>
  !!current && typeof remote === 'string' && SEMVER.test(remote) && remote !== current

export const shouldSilentReload = (hiddenAt: number | null, now: number): boolean =>
  hiddenAt !== null && now - hiddenAt >= SILENT_RELOAD_AFTER_HIDDEN_MS

// Reloads at most once per session, so a real outage can't cause a reload loop.
export const reloadOnceForChunkError = (
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  reload: () => void
): boolean => {
  try {
    if (storage.getItem(CHUNK_RELOAD_KEY)) return false
    storage.setItem(CHUNK_RELOAD_KEY, '1')
  } catch {
    return false
  }
  reload()
  return true
}

// null on any failure (offline, 404 falling through to index.html, bad JSON): the caller stays quiet.
export const fetchRemoteVersion = async (): Promise<string | null> => {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' })
    if (!res.ok) return null
    const data: unknown = await res.json()
    const version = (data as { version?: unknown } | null)?.version
    return typeof version === 'string' ? version : null
  } catch {
    return null
  }
}
