import { create } from 'zustand'

type AuthStoreState = { accessToken: string }

type AuthStoreActions = {
  setAccessToken: (nextAccessToken: AuthStoreState['accessToken']) => void
  clearAccessToken: () => void
}

export type AuthStore = AuthStoreState & AuthStoreActions

export const localStorageAuth = {
  get: () => {
    const accessToken = localStorage.getItem('accessToken') ?? ''
    return {
      accessToken,
    }
  },
  set: (accessToken: string) => {
    localStorage.setItem('accessToken', accessToken)
  },
  clear: () => {
    localStorage.removeItem('accessToken')
  },
}

/**
 * @deprecated not use this store
 */
export const useAuthStore = create<AuthStore>((set) => {
  const { accessToken } = localStorageAuth.get()
  return {
    accessToken,
    setAccessToken: (accessToken) => {
      localStorageAuth.set(accessToken)
      set({ accessToken })
    },
    clearAccessToken: () => {
      localStorageAuth.clear()
      set({ accessToken: '' })
    },
  }
})
