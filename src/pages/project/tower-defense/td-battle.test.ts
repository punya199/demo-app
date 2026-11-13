import { describe, expect, it } from 'vitest'
import { battleErrorKind, buildFinishBody } from './td-battle'

describe('buildFinishBody', () => {
  it('sends the seed, the final tick and a copy of the log, nothing else', () => {
    const log = [{ tick: 3, type: 'summon' as const, tile: 4 }]
    const body = buildFinishBody(77, 900, log)
    expect(body).toEqual({ seed: 77, ticks: 900, inputs: [{ tick: 3, type: 'summon', tile: 4 }] })
    expect(body.inputs).not.toBe(log)
  })

  it('has no result, damage or reward field for the server to trust', () => {
    expect(Object.keys(buildFinishBody(1, 1, [])).sort()).toEqual(['inputs', 'seed', 'ticks'])
  })
})

describe('battleErrorKind', () => {
  it('maps a 409 on start to the energy message', () => {
    expect(battleErrorKind({ response: { status: 409 } })).toBe('energy')
  })
  it('maps everything else to a generic error', () => {
    expect(battleErrorKind({ response: { status: 500 } })).toBe('other')
    expect(battleErrorKind(new Error('offline'))).toBe('other')
    expect(battleErrorKind(null)).toBe('other')
  })
})
