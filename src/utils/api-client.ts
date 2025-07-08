import axios from 'axios'
import { set } from 'lodash'
import { appConfig } from '../config/app-config'

const createClient = () => {
  const ax = axios.create({
    baseURL: appConfig().VITE_API_DOMAIN,
  })
  ax.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      set(config, ['headers', 'authorization'], 'Bearer ' + accessToken)
    }
    return config
  })
  return ax
}
export const apiClient = createClient()
