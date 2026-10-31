import { Alert, Button, Card, Input, Modal, Popconfirm, Select, Spin, Tag, Tooltip } from 'antd'
import { useState } from 'react'
import {
  formatFriendCode,
  getGiftBlocker,
  getSupportBlocker,
  stageLabel,
  statLabel,
} from './tamagotchi-helper'
import { IFriend, IFriendVisit, IMonsterData, StatKey } from './tamagotchi-interface'
import {
  useFriendRequest,
  useFriendRespond,
  useGetFriends,
  useGetInventory,
  useGetProfile,
  useGetShopItems,
  useGetSupport,
  useGiftFriend,
  useGreetFriend,
  useRemoveFriend,
  useSetProfileName,
  useSetSupport,
  useVisitFriend,
} from './tamagotchi-service'

interface IFriendsPanelProps {
  monster: IMonsterData | null
  onError: (error: unknown) => void
}

const ProfileCard = (props: { onError: (error: unknown) => void }) => {
  const { onError } = props
  const { data: profile } = useGetProfile()
  const { mutate: rename, isPending } = useSetProfileName()
  const [name, setName] = useState('')
  const [copied, setCopied] = useState(false)

  if (!profile) {
    return <Spin />
  }

  const copy = () => {
    navigator.clipboard
      ?.writeText(profile.friendCode)
      .then(() => setCopied(true))
      .catch(() => setCopied(false))
  }

  return (
    <Card size="small" className="dark:border-slate-700 dark:bg-slate-900" title="โปรไฟล์ของฉัน">
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">รหัสเพื่อน</span>
          <b className="text-lg tracking-widest">{formatFriendCode(profile.friendCode)}</b>
          <Button size="small" onClick={copy}>
            {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
          </Button>
        </div>
        <div className="flex gap-2">
          <Input
            value={name}
            maxLength={16}
            placeholder={`ชื่อที่คนอื่นเห็น: ${profile.displayName}`}
            onChange={(event) => setName(event.target.value)}
          />
          <Button
            disabled={name.trim().length < 2 || isPending}
            onClick={() => rename(name.trim(), { onSuccess: () => setName(''), onError })}
          >
            เปลี่ยนชื่อ
          </Button>
        </div>
        <p className="text-xs text-slate-500">
          ส่งรหัสนี้ให้เพื่อนเพื่อเพิ่มเป็นเพื่อน คนอื่นเห็นเฉพาะชื่อนี้
          ไม่เห็นชื่อผู้ใช้หรืออีเมลของคุณ
        </p>
      </div>
    </Card>
  )
}

const SupportCard = (props: {
  monster: IMonsterData | null
  onError: (error: unknown) => void
}) => {
  const { monster, onError } = props
  const { data } = useGetSupport()
  const { mutate: setSupport, isPending } = useSetSupport()
  const blocker = getSupportBlocker(monster, data?.support, new Date())
  const unit = data?.support

  return (
    <Card size="small" className="dark:border-slate-700 dark:bg-slate-900" title="ตัวซัพพอร์ต">
      <div className="flex items-center gap-3 text-sm">
        {unit ? (
          <>
            <span className="text-3xl">{unit.emoji}</span>
            <div className="flex-1">
              <div className="font-medium">
                {unit.name} <Tag>{stageLabel[unit.stage]}</Tag>
              </div>
              <div className="text-xs text-slate-500">
                {(Object.keys(statLabel) as StatKey[])
                  .map((key) => `${statLabel[key]} ${unit.stats[key]}`)
                  .join(' · ')}
              </div>
            </div>
          </>
        ) : (
          <p className="flex-1 text-slate-500">
            ยังไม่ได้ตั้งตัวซัพพอร์ต เพื่อนเช่าไปตีบอสโลกได้และคุณได้เหรียญ
          </p>
        )}
        <Tooltip title={blocker}>
          <Button
            type="primary"
            disabled={!!blocker || isPending}
            onClick={() => setSupport(undefined, { onError })}
          >
            {unit ? 'อัปเดต' : 'ตั้งตัวซัพพอร์ต'}
          </Button>
        </Tooltip>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        ระบบจำค่าพลังของมอนตัวนี้ไว้ (รวมอุปกรณ์ stamina เต็ม) ใช้ได้เฉพาะบอสโลก ใช้ใน PvP ไม่ได้
      </p>
    </Card>
  )
}

const VisitModal = (props: { visit: IFriendVisit | null; onClose: () => void }) => {
  const { visit, onClose } = props
  const monster = visit?.monster
  return (
    <Modal
      open={!!visit}
      title={visit ? `เยี่ยม ${visit.displayName}` : ''}
      onCancel={onClose}
      footer={null}
    >
      {visit && !monster && <p>เพื่อนยังไม่มีมอนที่มีชีวิต</p>}
      {visit && monster && (
        <div className="flex items-center gap-4">
          <span className="text-6xl">{monster.emoji}</span>
          <div className="text-sm">
            <div className="font-semibold">
              {monster.name} <Tag>{stageLabel[monster.stage]}</Tag>
              {monster.isSick && <Tag color="red">ป่วย</Tag>}
              {monster.isExploring && <Tag color="blue">ออกสำรวจ</Tag>}
            </div>
            <div className="text-xs text-slate-500">
              {(Object.keys(statLabel) as StatKey[])
                .map((key) => `${statLabel[key]} ${monster.stats[key]}`)
                .join(' · ')}
            </div>
            <div className="text-xs text-slate-500">
              ชนะ {monster.wins} · แพ้ {monster.losses} · แต้มมิตรภาพ {visit.points}
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}

const FriendRow = (props: {
  friend: IFriend
  giftsLeft: number
  onError: (error: unknown) => void
  onVisit: (visit: IFriendVisit) => void
}) => {
  const { friend, giftsLeft, onError, onVisit } = props
  const { data: inventory } = useGetInventory()
  const { data: shop } = useGetShopItems()
  const { mutate: visit, isPending: isVisiting } = useVisitFriend()
  const { mutate: greet, isPending: isGreeting } = useGreetFriend()
  const { mutate: gift, isPending: isGifting } = useGiftFriend()
  const { mutate: remove } = useRemoveFriend()
  const [itemId, setItemId] = useState<string | undefined>()

  // Only consumables from the shop can be given, and only ones the player owns.
  const giftable = (shop?.items ?? [])
    .map((item) => ({
      item,
      quantity: inventory?.items.find((entry) => entry.itemId === item.id)?.quantity ?? 0,
    }))
    .filter((entry) => entry.quantity > 0)
  const giftBlocker = getGiftBlocker(giftsLeft, giftable.length)

  return (
    <Card size="small" className="dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-3xl">{friend.monster?.emoji ?? '❔'}</span>
        <div className="min-w-0 flex-1 text-sm">
          <div className="truncate font-medium text-slate-900 dark:text-slate-100">
            {friend.displayName}{' '}
            {friend.hasSupport && (
              <Tag color="green" className="ml-1">
                ให้เช่า
              </Tag>
            )}
          </div>
          <div className="text-xs text-slate-500">
            {friend.monster ? stageLabel[friend.monster.stage] : 'ไม่มีมอน'} · แต้มมิตรภาพ{' '}
            {friend.points}
          </div>
        </div>
        <Button
          size="small"
          disabled={isVisiting}
          onClick={() => visit(friend.relationId, { onSuccess: onVisit, onError })}
        >
          เยี่ยม
        </Button>
        <Tooltip title={friend.canGreet ? undefined : 'ทักทายวันนี้แล้ว'}>
          <Button
            size="small"
            disabled={!friend.canGreet || isGreeting}
            onClick={() => greet(friend.relationId, { onError })}
          >
            ทักทาย
          </Button>
        </Tooltip>
        <Popconfirm
          title="ลบเพื่อนคนนี้?"
          okText="ลบ"
          cancelText="ยกเลิก"
          onConfirm={() => remove(friend.relationId, { onError })}
        >
          <Button size="small" danger>
            ลบ
          </Button>
        </Popconfirm>
      </div>
      <div className="mt-2 flex items-center gap-2 text-sm">
        <Select
          size="small"
          className="min-w-40"
          placeholder="เลือกของขวัญ"
          value={itemId}
          onChange={setItemId}
          options={giftable.map((entry) => ({
            value: entry.item.id,
            label: `${entry.item.emoji} ${entry.item.name} x${entry.quantity}`,
          }))}
        />
        <Tooltip title={giftBlocker}>
          <Button
            size="small"
            disabled={!!giftBlocker || !itemId || isGifting}
            onClick={() =>
              itemId &&
              gift(
                { relationId: friend.relationId, itemId },
                { onSuccess: () => setItemId(undefined), onError }
              )
            }
          >
            ส่งของขวัญ
          </Button>
        </Tooltip>
      </div>
    </Card>
  )
}

export const FriendsPanel = (props: IFriendsPanelProps) => {
  const { monster, onError } = props
  const { data, isLoading } = useGetFriends()
  const { mutate: request, isPending: isRequesting } = useFriendRequest()
  const { mutate: respond } = useFriendRespond()
  const { mutate: remove } = useRemoveFriend()
  const [code, setCode] = useState('')
  const [visit, setVisit] = useState<IFriendVisit | null>(null)

  if (isLoading || !data) {
    return <Spin />
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <ProfileCard onError={onError} />

      <Card size="small" className="dark:border-slate-700 dark:bg-slate-900" title="เพิ่มเพื่อน">
        <div className="flex gap-2">
          <Input
            value={code}
            maxLength={12}
            placeholder="รหัสเพื่อน เช่น ABCD-2345"
            onChange={(event) => setCode(event.target.value)}
          />
          <Button
            type="primary"
            disabled={code.trim().length < 8 || isRequesting}
            onClick={() => request(code, { onSuccess: () => setCode(''), onError })}
          >
            ส่งคำขอ
          </Button>
        </div>
      </Card>

      {data.incoming.map((entry) => (
        <Alert
          key={entry.relationId}
          type="info"
          message={`${entry.displayName} ขอเป็นเพื่อน`}
          action={
            <div className="flex gap-1">
              <Button
                size="small"
                type="primary"
                onClick={() => respond({ relationId: entry.relationId, accept: true }, { onError })}
              >
                ตอบรับ
              </Button>
              <Button
                size="small"
                onClick={() =>
                  respond({ relationId: entry.relationId, accept: false }, { onError })
                }
              >
                ปฏิเสธ
              </Button>
            </div>
          }
        />
      ))}
      {data.outgoing.map((entry) => (
        <Alert
          key={entry.relationId}
          type="warning"
          message={`ส่งคำขอถึง ${entry.displayName} แล้ว รอตอบรับ`}
          action={
            <Button size="small" onClick={() => remove(entry.relationId, { onError })}>
              ยกเลิก
            </Button>
          }
        />
      ))}

      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-900 dark:text-slate-100">เพื่อน</span>
        <span className="text-xs text-slate-500">
          {data.friends.length}/{data.friendLimit} · ส่งของขวัญได้อีก {data.giftsLeft} ชิ้นวันนี้
        </span>
      </div>
      {data.friends.length === 0 && (
        <p className="text-center text-sm text-slate-500">
          ยังไม่มีเพื่อน ลองแลกรหัสเพื่อนกับคนที่รู้จัก
        </p>
      )}
      {data.friends.map((friend) => (
        <FriendRow
          key={friend.relationId}
          friend={friend}
          giftsLeft={data.giftsLeft}
          onError={onError}
          onVisit={setVisit}
        />
      ))}

      <SupportCard monster={monster} onError={onError} />
      <VisitModal visit={visit} onClose={() => setVisit(null)} />
    </div>
  )
}
