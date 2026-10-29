// Web Worker that builds endless levels (a few seconds each) off the main thread.

import { BuiltLevel, buildEndless } from './endless'
import type { Mode } from './modes'

export interface EndlessReply {
  n: number
  mode: Mode
  built?: BuiltLevel
  error?: string
}

self.onmessage = (e: MessageEvent<{ n: number; mode: Mode }>) => {
  const { n, mode } = e.data
  let reply: EndlessReply
  try {
    reply = { n, mode, built: buildEndless(n, mode) }
  } catch (err) {
    reply = { n, mode, error: String(err) }
  }
  ;(self as unknown as Worker).postMessage(reply)
}
