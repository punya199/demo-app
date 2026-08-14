import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'dark' | 'light'

type ThemeStoreState = {
  mode: ThemeMode
}

type ThemeStoreActions = {
  toggleMode: () => void
  setMode: (mode: ThemeMode) => void
}

export type ThemeStore = ThemeStoreState & ThemeStoreActions

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: 'dark',
      toggleMode: () => set((state) => ({ mode: state.mode === 'dark' ? 'light' : 'dark' })),
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'theme-storage',
    }
  )
)
