import { useThemeStore } from '../utils/theme-store'

export const ThemeToggle = () => {
  const mode = useThemeStore((state) => state.mode)
  const toggleMode = useThemeStore((state) => state.toggleMode)

  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label="Toggle dark/light theme"
      className="fixed right-5 bottom-5 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-lg shadow-lg transition hover:scale-105 dark:border-slate-700 dark:bg-slate-800"
    >
      {mode === 'dark' ? '🌙' : '☀️'}
    </button>
  )
}
