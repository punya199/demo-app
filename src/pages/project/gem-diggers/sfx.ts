// Tiny synthesized sound effects (no audio files needed).

let ctx: AudioContext | null = null
export let muted = false

export function setMuted(m: boolean) {
  muted = m
}

function audio(): AudioContext | null {
  if (muted) return null
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function tone(
  freq: number,
  dur: number,
  type: OscillatorType,
  vol: number,
  delay = 0,
  slideTo?: number
) {
  const a = audio()
  if (!a) return
  const t = a.currentTime + delay
  const osc = a.createOscillator()
  const gain = a.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur)
  gain.gain.setValueAtTime(vol, t)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(gain).connect(a.destination)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

let lastDig = 0
export const sfx = {
  tap: () => tone(220, 0.08, 'square', 0.05, 0, 140),
  dig: () => {
    const now = performance.now()
    if (now - lastDig < 35) return // many miners at once: don't stack clicks
    lastDig = now
    tone(700 + Math.random() * 500, 0.05, 'triangle', 0.05, 0, 300)
  },
  cartDone: () => {
    tone(660, 0.1, 'sine', 0.08)
    tone(990, 0.16, 'sine', 0.08, 0.08)
  },
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.3, 'triangle', 0.09, i * 0.11)),
  lose: () => tone(300, 0.5, 'sawtooth', 0.05, 0, 110),
  denied: () => tone(140, 0.12, 'square', 0.04),
  crack: () => tone(180, 0.07, 'square', 0.05, 0, 90),
  unlock: () => [392, 523, 784].forEach((f, i) => tone(f, 0.18, 'square', 0.05, i * 0.07)),
}
