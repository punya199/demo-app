import { Button, Card, Spin, Tooltip } from 'antd'
import { gradeLabel, getShopBlocker, getUseItemBlocker } from './tamagotchi-helper'
import { IMonsterData } from './tamagotchi-interface'
import {
  useBuyEquipmentBox,
  useBuyMaterial,
  useBuyShopItem,
  useGetInventory,
  useGetShopItems,
  useGetWiki,
  useUseInventoryItem,
} from './tamagotchi-service'

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
  const { mutate: buyBox, isPending: isBuyingBox } = useBuyEquipmentBox()
  const { mutate: buyMaterial, isPending: isBuyingMaterial } = useBuyMaterial()

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
                    onClick={() => buy(item.id, { onError })}
                  >
                    ซื้อ 🪙 {item.price}
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
              <Tooltip title={getShopBlocker(equipment.boxPrice, coin)}>
                <Button
                  disabled={!!getShopBlocker(equipment.boxPrice, coin) || isBuyingBox}
                  onClick={() => buyBox(undefined, { onError })}
                >
                  ซื้อ 🪙 {equipment.boxPrice}
                </Button>
              </Tooltip>
            </div>
          </Card>
          {equipment.materials.map((material) => {
            const isGem = material.currency === 'gem'
            const blocker = isGem ? null : getShopBlocker(material.price, coin)
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
                  <Tooltip title={blocker}>
                    <Button
                      disabled={!!blocker || isBuyingMaterial}
                      onClick={() => buyMaterial(material.id, { onError })}
                    >
                      ซื้อ {isGem ? '💎' : '🪙'} {material.price}
                    </Button>
                  </Tooltip>
                </div>
              </Card>
            )
          })}
        </>
      )}
    </div>
  )
}
