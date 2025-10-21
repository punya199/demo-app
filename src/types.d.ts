type KeyOf<T> = keyof T

type NestedPaths<T> = {
  [K in keyof T]: T[K] extends Record<string, unknown> ? `${K}.${NestedPaths<T[K]>}` : K
}[keyof T]
