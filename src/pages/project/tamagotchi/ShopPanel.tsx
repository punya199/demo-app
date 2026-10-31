import { Button, Card, Spin, Tooltip } from 'antd'
import { getShopBlocker, getUseItemBlocker } from './tamagotchi-helper'
import { IMonsterData } from './tamagotchi-interface'
import {
  useBuyShopItem,
  useGetInventory,
  useGetShopItems,
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

  if (isLoading) {
    return <Spin />
  }

  const quantityOf = (itemId: string) =>
    inventory?.items.find((item) => item.itemId === itemId)?.quantity ?? 0
  const useBlocker = getUseItemBlocker(monster)

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
    </div>
  )
}
