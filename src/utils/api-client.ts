import axios from 'axios'
import { appConfig } from '../config/app-config'
import { appPath } from '../config/app-paths'
import { localStorageAuth } from './store'

const createClient = () => {
  const ax = axios.create({
    baseURL: appConfig().VITE_API_DOMAIN,
    withCredentials: true,
  })
  ax.interceptors.request.use((config) => {
    return config
  })
  ax.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      if (error?.response?.status === 401) {
        localStorageAuth.clear()
        window.location.href = appPath.login()
      }
      return Promise.reject(error)
    }
  )
  return ax
}
export const apiClient = createClient()
