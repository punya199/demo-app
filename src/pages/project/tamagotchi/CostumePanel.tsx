import { Alert, Button, Card, Popconfirm, Segmented, Spin, Switch, Tag, Tooltip } from 'antd'
import { useState } from 'react'
import { PetAvatar } from './PetAvatar'
import {
  costumeSlotLabel,
  costumeThemeLabel,
  describeCostumePrice,
  getCostumeBuyBlocker,
  gradeColor,
  gradeLabel,
  petLabel,
} from './tamagotchi-helper'
import { EnumCostumeSlot, ICostume, IMonsterData } from './tamagotchi-interface'
import {
  useBuyCostume,
  useEquipCostume,
  useGetCostumes,
  useGetWallet,
  useSetShowCostume,
  useUnequipCostume,
} from './tamagotchi-service'

interface ICostumePanelProps {
  monster: IMonsterData | null
  onError: (error: unknown) => void
}

const Swatch = (props: { costume: ICostume }) => {
  const { costume } = props
  if (costume.emoji) {
    return <span className="text-3xl">{costume.emoji}</span>
  }
  return (
    <span
      className="inline-block h-8 w-8 rounded-md border border-slate-300"
      style={{
        background: costume.gradient ?? `radial-gradient(${costume.color}, transparent 70%)`,
      }}
    />
  )
}

export const CostumePanel = (props: ICostumePanelProps) => {
  const { monster, onError } = props
  const { data, isLoading } = useGetCostumes()
  const { data: wallet } = useGetWallet()
  const { mutate: buy, isPending: isBuying } = useBuyCostume()
  const { mutate: equip, isPending: isEquipping } = useEquipCostume()
  const { mutate: unequip, isPending: isUnequipping } = useUnequipCostume()
  const { mutate: setShow, isPending: isSettingShow } = useSetShowCostume()
  const [slot, setSlot] = useState<EnumCostumeSlot>(EnumCostumeSlot.HAT)
  const [picked, setPicked] = useState<ICostume | null>(null)

  if (isLoading || !data) {
    return <Spin />
  }
  if (!monster) {
    return <Alert type="info" message="ต้องมีมอนก่อนถึงจะแต่งตัวได้" />
  }

  const worn = data.pets.find((pet) => pet.id === monster.id)?.costume ?? {}
  // Trying a piece on shows it in the preview without buying or wearing it.
  const preview = picked ? { ...worn, [picked.slot]: picked.id } : worn
  const now = new Date()
  const isBusy = isBuying || isEquipping || isUnequipping
  const items = data.catalog.filter((costume) => costume.slot === slot)
  const owns = (costume: ICostume) => data.owned.includes(costume.id)
  const buyBlocker = picked
    ? getCostumeBuyBlocker(picked, data, wallet?.coin ?? 0, wallet?.gem ?? 0, now)
    : null

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-col items-center gap-1">
        <PetAvatar
          emoji={monster.emoji}
          costume={preview}
          scale={1.4}
          label={monster.displayName}
        />
        <div className="text-sm text-slate-600 dark:text-slate-300">
          {petLabel(monster.name, monster.nickname)}
          {picked ? ' · กำลังลองใส่' : ''}
        </div>
        <div className="text-xs text-slate-500">ชุดเป็นของแต่ละตัว เปลี่ยนตัวที่หน้าเลี้ยง</div>
      </div>

      <label className="flex items-center justify-between gap-3 text-sm" htmlFor="show-costume">
        <span>ให้ผู้เล่นอื่นเห็นชุดของฉัน (เพื่อน สนามประลอง อันดับ ตัวเช่า)</span>
        <Switch
          id="show-costume"
          checked={data.showCostume}
          loading={isSettingShow}
          onChange={(show) => setShow({ show }, { onError })}
        />
      </label>

      {data.themes.length > 0 && (
        <div className="flex flex-wrap gap-1 text-xs">
          {data.themes.map((row) => (
            <Tag key={row.theme} color={row.isComplete ? 'gold' : undefined}>
              {row.isComplete ? '🏅 ' : ''}
              {costumeThemeLabel[row.theme] ?? row.theme} {row.owned}/{row.total}
            </Tag>
          ))}
        </div>
      )}

      <Segmented
        block
        value={slot}
        options={Object.values(EnumCostumeSlot).map((value) => ({
          value,
          label: costumeSlotLabel[value],
        }))}
        onChange={(value) => {
          setSlot(value as EnumCostumeSlot)
          setPicked(null)
        }}
      />

      <div className="grid grid-cols-2 gap-2">
        {items.map((costume) => {
          const isWorn = worn[costume.slot] === costume.id
          return (
            <Card
              key={costume.id}
              size="small"
              hoverable
              onClick={() => setPicked(costume)}
              className={`dark:border-slate-700 dark:bg-slate-900 ${
                picked?.id === costume.id ? '!border-amber-500' : isWorn ? '!border-blue-500' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <Swatch costume={costume} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{costume.name}</div>
                  <div className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
                    <Tag color={gradeColor[costume.rarity]} className="!mr-0">
                      {gradeLabel[costume.rarity]}
                    </Tag>
                    {costume.theme && (
                      <span>{costumeThemeLabel[costume.theme] ?? costume.theme}</span>
                    )}
                  </div>
                  <div className="text-xs">
                    {isWorn
                      ? '✔ ใส่อยู่'
                      : owns(costume)
                        ? 'มีแล้ว'
                        : describeCostumePrice(costume)}
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {picked && !owns(picked) && (
          <Tooltip title={buyBlocker}>
            <Popconfirm
              title={`ซื้อ ${picked.name}?`}
              description={`ราคา ${describeCostumePrice(picked)} ซื้อแล้วเป็นของคุณถาวร`}
              okText="ซื้อ"
              cancelText="ยกเลิก"
              disabled={!!buyBlocker}
              onConfirm={() =>
                buy({ costumeId: picked.id }, { onError, onSuccess: () => undefined })
              }
            >
              <Button type="primary" disabled={!!buyBlocker || isBusy}>
                ซื้อ {describeCostumePrice(picked)}
              </Button>
            </Popconfirm>
          </Tooltip>
        )}
        {picked && owns(picked) && worn[picked.slot] !== picked.id && (
          <Button
            type="primary"
            disabled={isBusy}
            onClick={() =>
              equip(
                { costumeId: picked.id, monsterId: monster.id },
                { onError, onSuccess: () => setPicked(null) }
              )
            }
          >
            สวมใส่
          </Button>
        )}
        <Button
          disabled={!worn[slot] || isBusy}
          onClick={() => unequip({ slot, monsterId: monster.id }, { onError })}
        >
          ถอด{costumeSlotLabel[slot]}
        </Button>
        {picked && <Button onClick={() => setPicked(null)}>เลิกลอง</Button>}
      </div>
      <p className="text-xs text-slate-500">
        แตะชิ้นไหนก็ลองใส่ดูฟรี ชุดเป็นแค่ความสวยงาม ไม่มีผลกับค่าพลัง ซื้อขายหรือแลกเปลี่ยนไม่ได้
      </p>
    </div>
  )
}
