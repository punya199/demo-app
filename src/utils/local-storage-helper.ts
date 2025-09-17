import deepmerge from 'deepmerge'
import { set } from 'lodash'

const baseValues = {
  uid: '',
  refreshToken: '',
} as const

type ILocalStorage = Record<keyof typeof baseValues, string>

export const localStorageHelper = {
  get: (): ILocalStorage => {
    return Object.keys(baseValues).reduce((acc: ILocalStorage, key) => {
      set(acc, key, localStorage.getItem(key) ?? '')
      return acc
    }, {} as ILocalStorage)
  },
  set: (nextLocalStorage: Partial<ILocalStorage>) => {
    const oldLocalStorage = localStorageHelper.get()

    Object.entries(deepmerge(oldLocalStorage, nextLocalStorage)).forEach(([key, value]) => {
      localStorage.setItem(key, value as string)
    })
  },
  clear: () => {
    Object.keys(baseValues).forEach((key) => {
      localStorage.removeItem(key)
    })
  },
}
