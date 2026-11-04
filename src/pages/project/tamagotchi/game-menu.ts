// Every screen of the monster game, grouped for the menu grid. The key doubles as the URL hash
// (/monster#adventure), so a reload or a shared link opens the same screen.

export type GameMenuKey =
  | 'care'
  | 'equipment'
  | 'passive'
  | 'costume'
  | 'shop'
  | 'adventure'
  | 'expedition'
  | 'raid'
  | 'world-boss'
  | 'pvp'
  | 'quests'
  | 'friends'
  | 'dex'
  | 'wiki'
  | 'patch-notes'

export interface IGameMenuItem {
  key: GameMenuKey
  label: string
  emoji: string
}

export interface IGameMenuGroup {
  title: string
  items: IGameMenuItem[]
}

export const GAME_MENU: IGameMenuGroup[] = [
  {
    title: 'ดูแล',
    items: [
      { key: 'care', label: 'เลี้ยง', emoji: '🍖' },
      { key: 'equipment', label: 'อุปกรณ์', emoji: '🛡️' },
      { key: 'passive', label: 'ต้นไม้', emoji: '🌿' },
      { key: 'costume', label: 'ชุดแต่งตัว', emoji: '👕' },
      { key: 'shop', label: 'ร้านค้า', emoji: '🛒' },
    ],
  },
  {
    title: 'ต่อสู้',
    items: [
      { key: 'adventure', label: 'ผจญภัย', emoji: '🗺️' },
      { key: 'expedition', label: 'สำรวจ', emoji: '🧭' },
      { key: 'raid', label: 'บอส', emoji: '🐉' },
      { key: 'world-boss', label: 'บอสโลก', emoji: '🌋' },
      { key: 'pvp', label: 'สนามประลอง', emoji: '🏟️' },
    ],
  },
  {
    title: 'อื่น ๆ',
    items: [
      { key: 'quests', label: 'ภารกิจ', emoji: '📜' },
      { key: 'friends', label: 'เพื่อน', emoji: '👥' },
      { key: 'dex', label: 'Dex', emoji: '📖' },
      { key: 'wiki', label: 'คู่มือ', emoji: '📘' },
      { key: 'patch-notes', label: 'อัปเดต', emoji: '📰' },
    ],
  },
]

const MENU_KEYS = new Set<string>(GAME_MENU.flatMap((group) => group.items.map((item) => item.key)))

export const DEFAULT_MENU_KEY: GameMenuKey = 'care'

// '#adventure' -> 'adventure'; anything unknown falls back to the care screen.
export const parseMenuHash = (hash: string): GameMenuKey => {
  const key = hash.replace(/^#/, '')
  return MENU_KEYS.has(key) ? (key as GameMenuKey) : DEFAULT_MENU_KEY
}
