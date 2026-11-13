export type KeyAction = 'pause' | 'speed' | 'restart' | 'lang'

const KEYS: Record<string, KeyAction> = { p: 'pause', ' ': 'pause', f: 'speed', r: 'restart', l: 'lang' }

export const keyAction = (key: string): KeyAction | null => KEYS[key.toLowerCase()] ?? null

/** Client pointer position to logical-canvas coordinates. */
export function pointerToLogical(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
  view: { width: number; height: number }
) {
  return {
    x: ((clientX - rect.left) / rect.width) * view.width,
    y: ((clientY - rect.top) / rect.height) * view.height,
  }
}
