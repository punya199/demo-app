import { Button, Card, Spin } from 'antd'
import { groupInventory, InventoryGroupKey, itemSourcesOf } from './inventory-helper'
import { useGetInventory, useGetWiki } from './tamagotchi-service'

interface IMaterialsBagProps {
  // Switches the bag back to the gear tab (where enhance and refine live).
  onOpenGear: () => void
}

// Read-only: using and gifting items stay in the shop and friends screens.
const GROUP_LINK: Partial<Record<InventoryGroupKey, { label: string; href?: string }>> = {
  craft: { label: 'ไปคราฟต์', href: '#craft' },
  upgrade: { label: 'ตีบวก / รีไฟน์ที่แท็บอุปกรณ์' },
  token: { label: 'ไปบอสโลก', href: '#world-boss' },
  consumable: { label: 'ไปร้านค้า', href: '#shop' },
}

export const MaterialsBag = (props: IMaterialsBagProps) => {
  const { onOpenGear } = props
  const { data: inventory, isLoading } = useGetInventory()
  const { data: wiki } = useGetWiki()

  if (isLoading || !inventory) {
    return <Spin />
  }

  const groups = groupInventory(inventory.items, itemSourcesOf(wiki))
  if (groups.length === 0) {
    return (
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        ยังไม่มีวัตถุดิบ ลองผจญภัย สำรวจ หรือสู้บอสเพื่อลุ้นดรอป
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {groups.map((group) => {
        const link = GROUP_LINK[group.key]
        return (
          <Card
            key={group.key}
            size="small"
            className="dark:border-slate-700 dark:bg-slate-900"
            title={group.title}
            extra={
              link && (
                <Button
                  size="small"
                  type="link"
                  href={link.href}
                  onClick={link.href ? undefined : onOpenGear}
                >
                  {link.label}
                </Button>
              )
            }
          >
            <ul className="m-0 grid list-none grid-cols-1 gap-1 p-0 sm:grid-cols-2">
              {group.entries.map((entry) => (
                <li key={entry.itemId} className="flex items-center justify-between gap-2 text-sm">
                  <span>{entry.label}</span>
                  <span className="font-semibold tabular-nums">×{entry.quantity}</span>
                </li>
              ))}
            </ul>
          </Card>
        )
      })}
    </div>
  )
}
