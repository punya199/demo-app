import { get } from 'lodash'

const _env_ = get(window, '_env_', {})
const getEnv = (key: string) => get(_env_, key, import.meta.env[key])

export const appConfig = () => {
  return {
    VITE_API_DOMAIN: getEnv('VITE_API_DOMAIN'),
  }
}
