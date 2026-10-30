import { Button, Card, Spin, Tooltip } from 'antd'
import { getShopBlocker } from './tamagotchi-helper'
import { IMonsterData } from './tamagotchi-interface'
import { useBuyShopItem, useGetShopItems } from './tamagotchi-service'

interface IShopPanelProps {
  monster: IMonsterData | null
  coin: number
  onError: (error: unknown) => void
}

export const ShopPanel = (props: IShopPanelProps) => {
  const { monster, coin, onError } = props
  const { data, isLoading } = useGetShopItems()
  const { mutate: buy, isPending } = useBuyShopItem()

  if (isLoading) {
    return <Spin />
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        ซื้อแล้วใช้กับมอนทันที
      </p>
      {data?.items.map((item) => {
        const blocker = getShopBlocker(monster, item.price, coin)
        return (
          <Card key={item.id} size="small" className="dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{item.emoji}</span>
              <div className="flex-1">
                <div className="font-medium text-slate-900 dark:text-slate-100">{item.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{item.description}</div>
              </div>
              <Tooltip title={blocker}>
                <Button disabled={!!blocker || isPending} onClick={() => buy(item.id, { onError })}>
                  🪙 {item.price}
                </Button>
              </Tooltip>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
