import { get } from 'lodash'

const _env_ = get(window, '_env_', {}) as Record<string, string>
const getEnv = (key: string): string => _env_[key] || import.meta.env[key]?.toString()

export const appConfig = () => {
  return {
    VITE_API_DOMAIN: getEnv('VITE_API_DOMAIN'),
    VITE_IS_DEVELOPMENT: getEnv('VITE_IS_DEVELOPMENT') === 'true',
  }
}
