import { Button, Card, Modal, Spin, Tooltip } from 'antd'
import { useState } from 'react'
import { CompareLine, ItemLine } from '../equipment/EquipmentParts'
import { gradeLabel, getShopBlocker, getUseItemBlocker, isWornBy } from '../core/tamagotchi-helper'
import { IEquipmentItem, IMonsterData } from '../core/tamagotchi-interface'
import {
  useBuyEquipmentBox,
  useBuyMaterial,
  useBuyShopItem,
  useGetEquipment,
  useGetInventory,
  useGetShopItems,
  useGetWallet,
  useGetWiki,
  useUseInventoryItem,
} from '../core/tamagotchi-service'

// Mirrors the server's SHOP_BUY_MAX_QUANTITY: x10 costs ten times the single price.
const BULK = 10

interface IShopPanelProps {
  monster: IMonsterData | null
  coin: number
  onError: (error: unknown) => void
}

export const ShopPanel = (props: IShopPanelProps) => {
  const { monster, coin, onError } = props
  const { data, isLoading } = useGetShopItems()
  const { data: inventory } = useGetInventory()
  const { mutate: buy, isPending: isBuying } = useBuyShopItem()
  const { mutate: consume, isPending: isUsing } = useUseInventoryItem()
  const { data: wiki } = useGetWiki()
  const { data: wallet } = useGetWallet()
  const { mutate: buyBox, isPending: isBuyingBox } = useBuyEquipmentBox()
  const { mutate: buyMaterial, isPending: isBuyingMaterial } = useBuyMaterial()
  const { data: equipmentData } = useGetEquipment()
  const [opened, setOpened] = useState<IEquipmentItem[]>([])

  if (isLoading) {
    return <Spin />
  }

  const quantityOf = (itemId: string) =>
    inventory?.items.find((item) => item.itemId === itemId)?.quantity ?? 0
  const useBlocker = getUseItemBlocker(monster)
  const equipment = wiki?.equipment

  return (
    <div className="flex w-full flex-col gap-2">
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        ซื้อเก็บไว้ในกระเป๋า แล้วกดใช้กับมอนเมื่อต้องการ
      </p>
      {data?.items.map((item) => {
        const quantity = quantityOf(item.id)
        const buyBlocker = getShopBlocker(item.price, coin)
        return (
          <Card key={item.id} size="small" className="dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{item.emoji}</span>
              <div className="flex-1">
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  {item.name} <span className="text-xs text-slate-500">x{quantity}</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{item.description}</div>
              </div>
              <div className="flex flex-col gap-1">
                <Tooltip title={buyBlocker}>
                  <Button
                    size="small"
                    disabled={!!buyBlocker || isBuying}
                    onClick={() => buy({ itemId: item.id }, { onError })}
                  >
                    ซื้อ 🪙 {item.price}
                  </Button>
                </Tooltip>
                <Tooltip title={getShopBlocker(item.price * BULK, coin)}>
                  <Button
                    size="small"
                    disabled={!!getShopBlocker(item.price * BULK, coin) || isBuying}
                    onClick={() => buy({ itemId: item.id, quantity: BULK }, { onError })}
                  >
                    ซื้อ x{BULK} 🪙 {item.price * BULK}
                  </Button>
                </Tooltip>
                <Tooltip title={quantity === 0 ? 'ไม่มีในกระเป๋า' : useBlocker}>
                  <Button
                    size="small"
                    type="primary"
                    disabled={quantity === 0 || !!useBlocker || isUsing}
                    onClick={() => consume(item.id, { onError })}
                  >
                    ใช้
                  </Button>
                </Tooltip>
              </div>
            </div>
          </Card>
        )
      })}
      {equipment && (
        <>
          <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            อุปกรณ์และวัตถุดิบตีบวก
          </p>
          <Card size="small" className="dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎁</span>
              <div className="flex-1">
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  กล่องสุ่มอุปกรณ์
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  อัตรา:{' '}
                  {Object.entries(equipment.boxGradeRates)
                    .map(
                      ([grade, rate]) => `${gradeLabel[grade as keyof typeof gradeLabel]} ${rate}%`
                    )
                    .join(' · ')}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Tooltip title={getShopBlocker(equipment.boxPrice, coin)}>
                  <Button
                    disabled={!!getShopBlocker(equipment.boxPrice, coin) || isBuyingBox}
                    onClick={() =>
                      buyBox(undefined, { onError, onSuccess: ({ items }) => setOpened(items) })
                    }
                  >
                    ซื้อ 🪙 {equipment.boxPrice}
                  </Button>
                </Tooltip>
                <Tooltip title={getShopBlocker(equipment.boxPrice * BULK, coin)}>
                  <Button
                    disabled={!!getShopBlocker(equipment.boxPrice * BULK, coin) || isBuyingBox}
                    onClick={() =>
                      buyBox(BULK, { onError, onSuccess: ({ items }) => setOpened(items) })
                    }
                  >
                    ซื้อ x{BULK} 🪙 {equipment.boxPrice * BULK}
                  </Button>
                </Tooltip>
              </div>
            </div>
          </Card>
          {equipment.materials.map((material) => {
            const isGem = material.currency === 'gem'
            const isToken = material.currency === 'raid_token'
            // Gems are checked by the server; coins and raid tokens we can explain up front.
            const blocker = isGem
              ? null
              : isToken
                ? getShopBlocker(material.price, wallet?.raidToken ?? 0, 'Raid Token')
                : getShopBlocker(material.price, coin)
            return (
              <Card
                key={material.id}
                size="small"
                className="dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{material.emoji}</span>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {material.name}{' '}
                      <span className="text-xs text-slate-500">x{quantityOf(material.id)}</span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {material.description}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Tooltip title={blocker}>
                      <Button
                        disabled={!!blocker || isBuyingMaterial}
                        onClick={() => buyMaterial({ itemId: material.id }, { onError })}
                      >
                        ซื้อ {isGem ? '💎' : isToken ? '🎖️' : '🪙'} {material.price}
                      </Button>
                    </Tooltip>
                    {!isGem && !isToken && (
                      <Tooltip title={getShopBlocker(material.price * BULK, coin)}>
                        <Button
                          disabled={
                            !!getShopBlocker(material.price * BULK, coin) || isBuyingMaterial
                          }
                          onClick={() =>
                            buyMaterial({ itemId: material.id, quantity: BULK }, { onError })
                          }
                        >
                          ซื้อ x{BULK} 🪙 {material.price * BULK}
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </>
      )}
      <Modal
        open={opened.length > 0}
        title="🎁 เปิดกล่องสุ่มได้"
        footer={<Button onClick={() => setOpened([])}>ตกลง</Button>}
        onCancel={() => setOpened([])}
      >
        <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto">
          {opened.map((item) => (
            <div key={item.id} className="flex flex-col gap-2">
              <ItemLine
                item={item}
                set={equipmentData?.sets.find((set) => set.setId === item.setId)}
              />
              <CompareLine
                item={item}
                worn={equipmentData?.items.find(
                  (it) => isWornBy(it, equipmentData.monsterId) && it.slot === item.slot
                )}
              />
            </div>
          ))}
          <p className="text-xs text-slate-500">เก็บไว้ในกระเป๋าอุปกรณ์แล้ว</p>
        </div>
      </Modal>
    </div>
  )
}
