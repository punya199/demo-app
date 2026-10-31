import { Button, Card, Modal, Progress, Spin, Tooltip } from 'antd'
import { formatAge, getExpeditionBlocker } from './tamagotchi-helper'
import { IMonsterData } from './tamagotchi-interface'
import {
  useClaimExpedition,
  useGetExpedition,
  useGetShopItems,
  useGetWiki,
  useStartExpedition,
} from './tamagotchi-service'

interface IExpeditionPanelProps {
  monster: IMonsterData | null
  onError: (error: unknown) => void
}

export const ExpeditionPanel = (props: IExpeditionPanelProps) => {
  const { monster, onError } = props
  const { data, isLoading } = useGetExpedition()
  const { data: shop } = useGetShopItems()
  const { data: wiki } = useGetWiki()
  const { mutate: start, isPending: isStarting } = useStartExpedition()
  const { mutate: claim, isPending: isClaiming } = useClaimExpedition()

  if (isLoading || !data) {
    return <Spin />
  }

  const area = data.areas.find((candidate) => candidate.id === monster?.expeditionAreaId)
  const itemLabel = (itemId: string) => {
    const item = shop?.items.find((candidate) => candidate.id === itemId)
    const material = wiki?.equipment.materials.find((candidate) => candidate.id === itemId)
    const found = item ?? material
    return found ? `${found.emoji} ${found.name}` : itemId
  }

  const showSummary = (summary: { minutes: number; coins: number; items: string[] }) =>
    Modal.success({
      title: 'ระหว่างที่คุณไม่อยู่',
      content: (
        <div>
          <div>สำรวจไป {formatAge(summary.minutes)}</div>
          <div>🪙 เหรียญ +{summary.coins}</div>
          {Object.entries(
            summary.items.reduce<Record<string, number>>(
              (counts, itemId) => ({ ...counts, [itemId]: (counts[itemId] ?? 0) + 1 }),
              {}
            )
          ).map(([itemId, count]) => (
            <div key={itemId}>
              {itemLabel(itemId)} +{count}
            </div>
          ))}
        </div>
      ),
    })

  if (monster?.expeditionAreaId) {
    const isBack = monster.expeditionReturned
    return (
      <Card
        size="small"
        className="dark:border-slate-700 dark:bg-slate-900"
        title={`${area?.emoji ?? ''} ${area?.name ?? 'กำลังสำรวจ'}`}
      >
        <div className="flex flex-col gap-3">
          <Progress
            percent={Math.round((monster.expeditionMinutes / data.maxMinutes) * 100)}
            format={() => `${formatAge(monster.expeditionMinutes)}/${formatAge(data.maxMinutes)}`}
          />
          <div className="text-sm">
            เก็บได้แล้ว 🪙 {monster.expeditionPendingCoins}
            {monster.expeditionPendingDrops > 0 &&
              ` + ของสะสม ${monster.expeditionPendingDrops} ชิ้น`}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {isBack
              ? 'มอนกลับบ้านแล้ว (ครบเวลา ป่วย หรือหิว) มารับรางวัลได้เลย'
              : 'ปิดแอปได้ มอนเก็บของให้ตามเวลาจริง ความอิ่มและความแข็งแรงยังลดลง ต้องกลับมาดูแล'}
          </div>
          <Button
            type="primary"
            disabled={isClaiming}
            onClick={() =>
              claim(undefined, { onSuccess: ({ summary }) => showSummary(summary), onError })
            }
          >
            {isBack ? 'รับรางวัล' : 'เรียกกลับและรับรางวัล'}
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        ส่งมอนไปสำรวจได้นานสุด {formatAge(data.maxMinutes)} ปิดแอปได้ ต้องกลับมากดรับรางวัล
      </p>
      {data.areas.map((candidate) => {
        const blocker = getExpeditionBlocker(monster, candidate.unlocked)
        return (
          <Card key={candidate.id} size="small" className="dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{candidate.unlocked ? candidate.emoji : '🔒'}</span>
              <div className="flex-1">
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  {candidate.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  🪙 {Math.floor(candidate.ratePerHour ?? candidate.baseRatePerHour)} ต่อชั่วโมง
                </div>
              </div>
              <Tooltip title={blocker}>
                <Button
                  type="primary"
                  disabled={!!blocker || isStarting}
                  onClick={() => start(candidate.id, { onError })}
                >
                  ส่งสำรวจ
                </Button>
              </Tooltip>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
