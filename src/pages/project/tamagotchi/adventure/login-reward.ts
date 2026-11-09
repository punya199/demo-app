import { craftMaterialLabel } from '../core/tamagotchi-helper'
import { ILoginReward } from '../core/tamagotchi-interface'

const ITEM_LABEL: Record<string, string> = {
  premium_meat: '🥩 เนื้อชั้นดี',
  protein: '🥤 โปรตีนเชค',
  diet_tea: '🍵 ชาลดน้ำหนัก',
  training_manual: '📘 คู่มือฝึกพิเศษ',
  ...craftMaterialLabel,
}

export const BOX_LABEL = { S: 'เล็ก', M: 'กลาง', L: 'ใหญ่' } as const

// Display only: the server decides what a slot pays. `short` keeps a board cell compact.
export const loginRewardParts = (
  reward: Pick<ILoginReward, 'coin' | 'gem' | 'items' | 'box'> & { costume?: string | null }
) => [
  ...(reward.box ? [`🎁 กล่อง${BOX_LABEL[reward.box]}`] : []),
  ...(reward.coin ? [`🪙 ${reward.coin}`] : []),
  ...(reward.gem ? [`💎 ${reward.gem}`] : []),
  ...(reward.items ?? []).map(({ itemId, qty }) => `${ITEM_LABEL[itemId] ?? itemId} ×${qty}`),
  ...(reward.costume ? ['🌟 ชุดประจำเดือน'] : []),
]
