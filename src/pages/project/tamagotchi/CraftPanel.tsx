import { Alert, Button, Card, Modal, Spin, Switch, Tag } from 'antd'
import { useEffect, useState } from 'react'
import { CraftRecipeCard } from './CraftRecipeCard'
import { ItemLine } from './EquipmentParts'
import { formatCountdown, toPercent } from './tamagotchi-helper'
import { ICraftClaimResult, ICraftRecipeView } from './tamagotchi-interface'
import {
  useClaimCraft,
  useGetCraft,
  useGetWiki,
  useSkipCraft,
  useStartCraft,
} from './tamagotchi-service'

interface ICraftPanelProps {
  onError: (error: unknown) => void
}

// Ticks every second while `active`, for the queue countdown.
const useNow = (active: boolean) => {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    if (!active) {
      return
    }
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [active])
  return now
}

export const CraftPanel = (props: ICraftPanelProps) => {
  const { onError } = props
  const { data, isLoading } = useGetCraft()
  const { data: wiki } = useGetWiki()
  const { mutate: start, isPending: isStarting } = useStartCraft()
  const { mutate: skip, isPending: isSkipping } = useSkipCraft()
  const { mutate: claim, isPending: isClaiming } = useClaimCraft()
  const [useCatalyst, setUseCatalyst] = useState(false)
  const [result, setResult] = useState<ICraftClaimResult | null>(null)
  const now = useNow(data?.queue?.status === 'running')

  if (isLoading || !data) {
    return <Spin />
  }

  const isBusy = isStarting || isSkipping || isClaiming
  const { queue, catalyst } = data
  const queued = queue ? data.recipes.find((recipe) => recipe.id === queue.recipeId) : undefined
  // The server flips `status`; the clock only enables the claim button a moment earlier.
  const isReady = !!queue && (queue.status === 'ready' || new Date(queue.finishAt) <= now)

  const sets = new Map<string, ICraftRecipeView[]>()
  for (const recipe of data.recipes) {
    sets.set(recipe.setId, [...(sets.get(recipe.setId) ?? []), recipe])
  }

  const onStart = (recipe: ICraftRecipeView) => {
    const useIt = useCatalyst && catalyst.owned > 0
    Modal.confirm({
      title: `คราฟต์ ${recipe.name}?`,
      content: `ใช้เหรียญ ${recipe.coin} และวัตถุดิบตามสูตร${useIt ? ' + Catalyst 1 ก้อน' : ''} ยกเลิกไม่ได้`,
      okText: 'เริ่ม',
      cancelText: 'ยกเลิก',
      onOk: () => start({ recipeId: recipe.id, useCatalyst: useIt }, { onError }),
    })
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
        <span>🪙 {data.coin}</span>
        <Button size="small" href="#equipment">
          ไปหน้าอุปกรณ์ 🛡️
        </Button>
      </div>

      {result && (
        <Card
          size="small"
          title="ได้รับอุปกรณ์ใหม่"
          extra={
            <Button size="small" type="link" onClick={() => setResult(null)}>
              ปิด
            </Button>
          }
          className="border-emerald-400 dark:border-emerald-700 dark:bg-slate-900"
        >
          <ItemLine item={result.item} />
          <div className="mt-1 text-xs">
            {result.upgraded ? (
              <span className="text-emerald-600">✨ Catalyst สำเร็จ เกรดอัปเกรดขึ้น 1 ขั้น</span>
            ) : (
              <span className="text-slate-500 dark:text-slate-400">
                เกรดตามสูตร ไม่มีการอัปเกรด
              </span>
            )}
          </div>
        </Card>
      )}

      <Card size="small" title="คิวคราฟต์" className="dark:border-slate-700 dark:bg-slate-900">
        {queue ? (
          <div className="flex flex-col gap-2">
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {queued?.name ?? queue.recipeId}
              {queue.useCatalyst && (
                <Tag color="cyan" className="ml-2">
                  ใช้ Catalyst
                </Tag>
              )}
            </div>
            <div className="text-2xl font-semibold text-slate-900 tabular-nums dark:text-slate-100">
              {isReady ? 'เสร็จแล้ว' : formatCountdown(queue.finishAt, now)}
            </div>
            <div className="flex flex-wrap gap-2">
              {!isReady && (
                <Button
                  size="small"
                  disabled={isBusy || data.coin < queue.skipCoin}
                  onClick={() => skip(undefined, { onError })}
                >
                  ข้ามเวลา 🪙 {queue.skipCoin}
                </Button>
              )}
              <Button
                size="small"
                type="primary"
                disabled={!isReady || isBusy}
                loading={isClaiming}
                onClick={() => claim(undefined, { onError, onSuccess: setResult })}
              >
                รับของ
              </Button>
            </div>
            <Alert
              type="info"
              showIcon
              message="ต้องมีที่ว่างในกระเป๋าอุปกรณ์ตอนรับ ถ้าเต็มจะรับไม่ได้ แต่งานยังอยู่ในคิว ไม่หาย"
            />
          </div>
        ) : (
          <div className="text-sm text-slate-500 dark:text-slate-400">
            ไม่มีงานในคิว เลือกสูตรด้านล่างเพื่อเริ่มคราฟต์ (คิวเดียว)
          </div>
        )}
      </Card>

      <Card size="small" title="Catalyst" className="dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-1 text-sm">
          <div className="flex items-center gap-2">
            <Switch
              checked={useCatalyst && catalyst.owned > 0}
              disabled={catalyst.owned === 0}
              onChange={setUseCatalyst}
            />
            <span>ใช้ Catalyst ตอนเริ่มคราฟต์ (มี {catalyst.owned} ก้อน)</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            โอกาสอัปเกรดเกรด {toPercent(catalyst.chance)} · ก้อนหมดไปไม่ว่าสำเร็จหรือไม่
          </div>
          {catalyst.pity.map((row) => (
            <div key={row.step} className="text-xs text-slate-500 dark:text-slate-400">
              {row.step === 'epic_legendary' ? 'มหากาพย์ → ตำนาน' : 'ตำนาน → มิธิก'}: พลาดติดกัน{' '}
              {row.fails}/{row.guaranteeAfter} (ครบแล้วครั้งถัดไปสำเร็จแน่นอน)
            </div>
          ))}
        </div>
      </Card>

      {[...sets.entries()].map(([setId, recipes]) => (
        <Card
          key={setId}
          size="small"
          title={
            <>
              {wiki?.equipment.sets[setId]?.name ?? setId}
              {recipes[0].flagship && (
                <Tag color="magenta" className="ml-2">
                  Flagship
                </Tag>
              )}
            </>
          }
          className="dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="flex flex-col gap-2">
            {recipes.map((recipe) => (
              <CraftRecipeCard
                key={recipe.id}
                recipe={recipe}
                disabled={isBusy || !!queue}
                onStart={onStart}
              />
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}
