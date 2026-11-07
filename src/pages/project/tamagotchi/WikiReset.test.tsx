import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { IWikiData } from './tamagotchi-interface'
import { ResetWikiTab } from './WikiReset'

// A trimmed copy of what GET /monster/wiki sends for the parts this tab reads.
const wiki = {
  pvp: { dailyAttempts: 10, maxFightsPerOpponentPerDay: 2, seasonResetKeep: 0.5 },
  raid: { attempts: 3, resetHours: 1 },
  worldBoss: { hits: 3, resetHours: 3 },
  social: { giftsPerDay: 3, greetsPerDayPerFriend: 1, rentalOwnerDailyCap: 200 },
} as unknown as IWikiData

describe('ResetWikiTab', () => {
  // Thursday 2026-11-05 14:30 Thai time
  const now = new Date('2026-11-05T07:30:00Z')

  it('lists every reset with the server numbers and its next datetime', () => {
    render(<ResetWikiTab wiki={wiki} now={now} />)
    const rows = screen.getAllByRole('row').slice(1)
    expect(rows).toHaveLength(9)
    expect(
      screen.getByText('ท้าได้ 10 ครั้ง/วัน และคู่ต่อสู้คนเดิมไม่เกิน 2 ครั้ง/วัน')
    ).toBeTruthy()
    expect(screen.getByText('ทุกชั่วโมงตรง')).toBeTruthy()
    expect(screen.getByText(/^ทุก 3 ชม\. นับจาก 00:00 น\./)).toBeTruthy()
    // Raid (hourly) next reset is 15:00; the weekly season is Monday 00:00
    const nextOf = (event: string) =>
      within(rows.find((row) => within(row).queryByText(event))!).getAllByRole('cell')[3]
        .textContent
    expect(nextOf('👹 Boss Raid')).toMatch(/15:00 น\.$/)
    expect(nextOf('🏆 PvP: ซีซัน')).toMatch(/ 9 .+ 00:00 น\.$/)
  })
})
