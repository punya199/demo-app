import { Button, message, Modal } from 'antd'
import { stageLabel } from '../core/tamagotchi-helper'
import { IMonsterData, IWikiData } from '../core/tamagotchi-interface'
import { useReturnHome } from '../core/tamagotchi-service'
import { MonsterSprite } from '../shared/MonsterSprite'

interface IReturnHomeModalProps {
  open: boolean
  onClose: () => void
  monster: IMonsterData
  petCore: IWikiData['petCore']
  onError: (error: unknown) => void
}

// One step: the warning and the reward are on screen together, then confirm or cancel.
export const ReturnHomeModal = (props: IReturnHomeModalProps) => {
  const { open, onClose, monster, petCore, onError } = props
  const { mutate, isPending } = useReturnHome()

  const submit = () =>
    mutate(monster.id, {
      onError,
      onSuccess: () => {
        message.success(
          `${monster.displayName} กลับดาวแล้ว ได้แกนสัตว์เลี้ยง ×${petCore.perReturn}`
        )
        onClose()
      },
    })

  return (
    <Modal
      open={open}
      onCancel={isPending ? undefined : onClose}
      title="🌠 กลับดาว"
      footer={null}
      destroyOnHidden
    >
      <div className="flex flex-col gap-3 text-sm">
        <p className="text-slate-600 dark:text-slate-300">
          ส่งมอนกลับดาวบ้านเกิด มอนจะจากไปถาวรและคืนช่องเลี้ยงให้ คุณจะได้ 🔮
          แกนสัตว์เลี้ยงของสายพันธุ์นี้ ไว้ใช้คราฟต์ในภายหลัง
        </p>
        <div className="rounded border border-slate-200 p-3 text-center dark:border-slate-700">
          <div className="flex justify-center">
            <MonsterSprite sprite={monster.sprite} emoji={monster.emoji} size={72} />
          </div>
          <div className="font-semibold">{monster.displayName}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {monster.name} · {stageLabel[monster.stage]}
          </div>
          <div className="mt-2">
            ได้รับ 🔮 แกน {monster.name} ×{petCore.perReturn}
          </div>
        </div>
        <p className="rounded border border-amber-400 p-2 text-amber-700 dark:text-amber-300">
          ย้อนกลับไม่ได้ อุปกรณ์ที่สวมอยู่จะกลับเข้ากระเป๋า ส่วนคอสตูม สกิล และ passive
          ยังอยู่กับคุณ
        </p>
        <div className="flex justify-end gap-2">
          <Button onClick={onClose} disabled={isPending}>
            ยกเลิก
          </Button>
          <Button type="primary" danger loading={isPending} onClick={submit}>
            ยืนยันกลับดาว
          </Button>
        </div>
      </div>
    </Modal>
  )
}
