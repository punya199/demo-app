import { describe, expect, it } from 'vitest'
import { loginRewardParts } from './login-reward'

describe('loginRewardParts', () => {
  it('lists coin, gem, items, box and costume', () => {
    expect(loginRewardParts({ coin: 50, gem: 0 })).toEqual(['🪙 50'])
    expect(
      loginRewardParts({
        coin: 0,
        gem: 10,
        box: 'L',
        costume: 'loginCrown',
        items: [{ itemId: 'training_manual', qty: 2 }],
      })
    ).toEqual(['🎁 กล่องใหญ่', '💎 10', '📘 คู่มือฝึกพิเศษ ×2', '🌟 ชุดประจำเดือน'])
  })
})
