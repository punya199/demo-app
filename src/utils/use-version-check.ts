import { useEffect, useState } from 'react'
import {
  CURRENT_VERSION,
  fetchRemoteVersion,
  isNewVersion,
  POLL_MS,
  reloadOnceForChunkError,
  shouldSilentReload,
} from './version-check'

// True once a newer release is deployed. A tab hidden for a while reloads silently on refocus.
export const useVersionCheck = (): boolean => {
  const [hasUpdate, setHasUpdate] = useState(false)

  useEffect(() => {
    // A stale lazy chunk 404s after a deploy; reload once to pick up the new build.
    const onPreloadError = (e: Event) => {
      if (reloadOnceForChunkError(sessionStorage, () => window.location.reload()))
        e.preventDefault()
    }
    window.addEventListener('vite:preloadError', onPreloadError)

    if (!CURRENT_VERSION)
      return () => window.removeEventListener('vite:preloadError', onPreloadError)

    let cancelled = false
    let timer: ReturnType<typeof setInterval> | undefined
    let hiddenAt: number | null = document.hidden ? Date.now() : null

    const check = async (silentReload: boolean) => {
      const remote = await fetchRemoteVersion()
      if (cancelled || !isNewVersion(CURRENT_VERSION, remote)) return
      if (silentReload) window.location.reload()
      else setHasUpdate(true)
    }
    const stop = () => clearInterval(timer)
    const start = () => {
      stop()
      timer = setInterval(() => void check(false), POLL_MS)
    }
    const onVisibility = () => {
      if (document.hidden) {
        hiddenAt = Date.now()
        stop()
        return
      }
      const away = shouldSilentReload(hiddenAt, Date.now())
      hiddenAt = null
      void check(away)
      start()
    }

    if (!document.hidden) start()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelled = true
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('vite:preloadError', onPreloadError)
    }
  }, [])

  return hasUpdate
}
