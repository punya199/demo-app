import { useEffect, useState } from 'react'
import { GameMenuKey, parseMenuHash } from '../core/game-menu'
import { hasUnreadPatch, PATCH_NOTES } from '../meta/patch-notes'

// Which screen is open lives in the URL hash, so a reload or a shared link keeps it.
export const useMenuFromHash = () => {
  const [menu, setMenu] = useState<GameMenuKey>(() => parseMenuHash(window.location.hash))
  useEffect(() => {
    const onHashChange = () => setMenu(parseMenuHash(window.location.hash))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])
  const select = (key: GameMenuKey) => {
    window.history.replaceState(null, '', `#${key}`)
    setMenu(key)
  }
  return [menu, select] as const
}

const PATCH_SEEN_KEY = 'tamagotchi:patch-seen'

// Newest patch version the player has opened; localStorage can throw (private mode), so it is optional.
const readSeen = () => {
  try {
    return window.localStorage.getItem(PATCH_SEEN_KEY)
  } catch {
    return null
  }
}
const writeSeen = (version: string) => {
  try {
    window.localStorage.setItem(PATCH_SEEN_KEY, version)
  } catch {
    // ignore: the badge just shows again next visit
  }
}

export const usePatchUnread = (menu: GameMenuKey) => {
  const latest = PATCH_NOTES[0].version
  const [seen, setSeen] = useState<string | null>(() => {
    const stored = readSeen()
    if (stored === null) writeSeen(latest) // first visit: baseline, no badge
    return stored ?? latest
  })
  useEffect(() => {
    if (menu === 'patch-notes' && seen !== latest) {
      writeSeen(latest)
      setSeen(latest)
    }
  }, [menu, seen, latest])
  return hasUnreadPatch(seen)
}
