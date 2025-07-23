import { sanitizeUrl } from '@braintree/sanitize-url'
import qs from 'qs'

type IParamType = Record<string, unknown> | undefined
type IOption<T extends IParamType, V extends IParamType> = {
  param?: T
  query?: V
}

type IGenerateParam = {
  param?: IParamType
  query?: IParamType
}

export const generatePath =
  <TT extends IGenerateParam>(url: string) =>
  (option?: IOption<TT['param'], TT['query']>) => {
    const { param, query } = option ?? {}
    let newQuery = ''
    if (query) {
      newQuery = `?${qs.stringify(query)}`
    }

    let newUrl = sanitizeUrl(url)
    if (param) {
      const urls = url.split('/')
      newUrl = urls
        .map((u) => {
          if (/:.+/.test(u)) {
            return param[u.slice(1)]
          }
          return u
        })
        .join('/')
    }

    return `${newUrl}${newQuery}`
  }
