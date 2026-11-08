import { EditOutlined } from '@ant-design/icons'
import { Button, Input, Modal, Tooltip } from 'antd'
import { useState } from 'react'
import { useRenameMonster } from '../core/tamagotchi-service'
import { IMonsterData } from '../core/tamagotchi-interface'

const MAX_LENGTH = 16

// A pencil next to the pet's name. The server owns the rules (characters, cooldown); this only
// caps the length and explains them.
export const RenamePet = (props: { monster: IMonsterData; onError: (error: unknown) => void }) => {
  const { monster, onError } = props
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const { mutate: rename, isPending } = useRenameMonster()

  const start = () => {
    setName(monster.nickname ?? '')
    setOpen(true)
  }

  return (
    <>
      <Tooltip title="ตั้งชื่อมอน">
        <Button
          size="small"
          type="text"
          aria-label="ตั้งชื่อมอน"
          icon={<EditOutlined />}
          onClick={start}
        />
      </Tooltip>
      <Modal
        open={open}
        title={`ตั้งชื่อ ${monster.emoji} ${monster.name}`}
        okText="บันทึก"
        cancelText="ยกเลิก"
        confirmLoading={isPending}
        onCancel={() => setOpen(false)}
        onOk={() =>
          rename({ monsterId: monster.id, name }, { onSuccess: () => setOpen(false), onError })
        }
      >
        <Input
          id="pet-nickname"
          value={name}
          maxLength={MAX_LENGTH}
          placeholder={monster.name}
          onChange={(event) => setName(event.target.value)}
          onPressEnter={() =>
            !isPending &&
            rename({ monsterId: monster.id, name }, { onSuccess: () => setOpen(false), onError })
          }
        />
        <p className="mt-2 text-xs text-slate-500">
          ไม่เกิน {MAX_LENGTH} ตัวอักษร ใช้ได้เฉพาะภาษาไทย อังกฤษ ตัวเลข ช่องว่าง และ - _ .
          เพื่อนและคู่ต่อสู้จะเห็นชื่อนี้ ปล่อยว่างเพื่อลบชื่อ เปลี่ยนได้ทุก 10 นาที
        </p>
      </Modal>
    </>
  )
}
