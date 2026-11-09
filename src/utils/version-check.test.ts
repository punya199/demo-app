import { describe, expect, it, vi } from 'vitest'
import { isNewVersion, reloadOnceForChunkError, shouldSilentReload } from './version-check'

describe('isNewVersion', () => {
  it('is true only for a well-formed, different version', () => {
    expect(isNewVersion('1.65.0', '1.66.0')).toBe(true)
    expect(isNewVersion('1.65.0', '1.65.0')).toBe(false)
  })
  it('ignores dev builds and bad payloads', () => {
    expect(isNewVersion(undefined, '1.66.0')).toBe(false)
    expect(isNewVersion('1.65.0', null)).toBe(false)
    expect(isNewVersion('1.65.0', '<!doctype html>')).toBe(false)
    expect(isNewVersion('1.65.0', 166)).toBe(false)
  })
})

describe('shouldSilentReload', () => {
  it('needs 5 minutes hidden', () => {
    expect(shouldSilentReload(null, 1_000_000)).toBe(false)
    expect(shouldSilentReload(0, 4 * 60_000)).toBe(false)
    expect(shouldSilentReload(0, 5 * 60_000)).toBe(true)
  })
})

describe('reloadOnceForChunkError', () => {
  const makeStorage = () => {
    const m = new Map<string, string>()
    return {
      getItem: (k: string) => m.get(k) ?? null,
      setItem: (k: string, v: string) => void m.set(k, v),
    }
  }
  it('reloads once per session', () => {
    const storage = makeStorage()
    const reload = vi.fn()
    expect(reloadOnceForChunkError(storage, reload)).toBe(true)
    expect(reloadOnceForChunkError(storage, reload)).toBe(false)
    expect(reload).toHaveBeenCalledTimes(1)
  })
  it('does not reload when storage throws', () => {
    const reload = vi.fn()
    const broken = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => undefined,
    }
    expect(reloadOnceForChunkError(broken, reload)).toBe(false)
    expect(reload).not.toHaveBeenCalled()
  })
})
