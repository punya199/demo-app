import { Mutex } from 'async-mutex'
import { to } from 'await-to-js'
import axios, { AxiosError } from 'axios'
import { get } from 'lodash'
import { appConfig } from '../config/app-config'
import { appPath } from '../config/app-paths'
import { localStorageHelper } from './local-storage-helper'

const REFRESH_TOKEN = `auth/refresh-token`
let isRefreshing = false
const mutex = new Mutex()

const createClient = () => {
  const ax = axios.create({
    baseURL: appConfig().VITE_API_DOMAIN,
    withCredentials: true,
  })
  ax.interceptors.request.use((config) => {
    const uid = localStorage.getItem('uid')
    const viteAppVersion = import.meta.env.VITE_APP_VERSION
    if (uid) {
      config.headers['x-user-id'] = uid
    }
    if (viteAppVersion) {
      config.headers['x-app-version'] = viteAppVersion
    }

    return config
  })
  ax.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      const code = get(error, 'response.data.code') || ''
      if (['AUT4001', 'AUT4002', 'AUT4003', 'AUT4004'].includes(code)) {
        return callRefreshToken(error)
      }

      return Promise.reject(error)
    }
  )
  return ax
}
export const apiClient = createClient()

export const callRefreshToken = async (error: AxiosError) => {
  const storage = localStorageHelper.get()
  const { uid, refreshToken } = storage
  const ax = axios.create({
    baseURL: appConfig().VITE_API_DOMAIN,
    headers: {
      authorization: `Bearer ${refreshToken}`,
    },
    withCredentials: true,
  })
  if (uid) {
    ax.interceptors.request.use((config) => {
      config.headers['x-user-id'] = uid
      return config
    })
  }

  if (!isRefreshing) {
    try {
      await mutex.runExclusive(async () => {
        isRefreshing = true
        const [refreshTokenError, refreshTokenResponse] = await to(
          ax.post<{ refreshToken: string }>(REFRESH_TOKEN)
        )

        if (refreshTokenResponse?.data?.refreshToken) {
          localStorageHelper.set({
            refreshToken: refreshTokenResponse.data.refreshToken,
          })
        }

        // const debugLog: Record<string, unknown> = {
        //   message: refreshTokenError?.message,
        //   uid,
        // }
        // if (refreshTokenError instanceof AxiosError) {
        //   set(debugLog, 'response.data', refreshTokenError.response?.data)
        //   set(debugLog, 'response.status', refreshTokenError.response?.status)
        //   set(debugLog, 'response.statusText', refreshTokenError.response?.statusText)
        //   set(debugLog, 'response.headers', refreshTokenError.response?.headers)
        //   set(debugLog, 'response.config', refreshTokenError.response?.config)
        // } else if (refreshTokenResponse) {
        //   set(debugLog, 'response.data', refreshTokenResponse?.data)
        //   set(debugLog, 'response.status', refreshTokenResponse?.status)
        //   set(debugLog, 'response.statusText', refreshTokenResponse?.statusText)
        //   set(debugLog, 'response.headers', refreshTokenResponse?.headers)
        //   set(debugLog, 'response.config', refreshTokenResponse?.config)
        // }

        const redirect = window.location.pathname !== appPath.login()

        if (refreshTokenError) {
          if (redirect) {
            window.location.href = appPath.login()
          }
          return Promise.reject(error)
        }
      })
    } catch (errors) {
      return await Promise.reject(errors)
    } finally {
      isRefreshing = false
    }
  }
  try {
    await mutex.waitForUnlock()
    // if (!error.response) return await Promise.reject(error)
    const refreshedResponse = await ax.request(error.config || {})
    return refreshedResponse
  } catch (errors) {
    return Promise.reject(errors)
  }
}
