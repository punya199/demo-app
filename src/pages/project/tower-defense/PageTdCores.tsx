import { ArrowLeftOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import {
  ADVANTAGE_PCT,
  CORE_SLOTS,
  DISADVANTAGE_PCT,
  ELEMENT_BEATS,
  ELEMENTS,
  type Element,
} from '../../../../td-sim/src'
import { appPath } from '../../../config/app-paths'
import { TdEnergy } from './TdEnergy'
import {
  canPromoteCore,
  coreBonusText,
  elementLabel,
  rarityLabel,
  slotCores,
  type ITdCore,
} from './td-core'
import { useEquipTdCore, useGetTdCores, usePromoteTdCore } from './td-core-query'
import { useGetTdProfile } from './td-profile-query'

const card =
  'flex items-center justify-between gap-3 rounded border border-slate-300 bg-white px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
const btn =
  'rounded bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-500 disabled:opacity-50'
const section = 'mt-2 text-lg font-bold text-slate-900 dark:text-white'
const muted = 'text-slate-500 dark:text-slate-400'

// Cores screen: four slots, the cores you own and their promotion. Everything shown and every
// price comes from GET /td/cores; the server decides slots, promotion and battle effects.
const PageTdCores = () => {
  const { data } = useGetTdCores()
  const { data: profile } = useGetTdProfile()
  const equip = useEquipTdCore()
  const promote = usePromoteTdCore()
  const balances = { coins: profile?.balances.coins ?? 0, shards: profile?.balances.shards ?? 0 }
  const busy = equip.isPending || promote.isPending

  const name = (c: ITdCore) => `${elementLabel(c.element)} · ${rarityLabel(c.rarity)}`
  const beats = (e: Element) => {
    const t = ELEMENT_BEATS[e]
    return t ? `${elementLabel(e)} ชนะ ${elementLabel(t)}` : null
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-xl flex-col gap-3 px-4 py-4">
      <div className="flex items-center justify-between">
        <Link
          to={appPath.towerDefense()}
          className={`${muted} hover:text-blue-600 dark:hover:text-blue-400`}
          aria-label="กลับ"
        >
          <ArrowLeftOutlined className="text-lg" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">คอร์ธาตุ</h1>
        <TdEnergy />
      </div>
      <small className={muted}>
        {ELEMENTS.map(beats).filter(Boolean).join(' · ')}
        {' · '}กายภาพเป็นกลาง · ได้เปรียบ +{ADVANTAGE_PCT - 100}% เสียเปรียบ{' '}
        {DISADVANTAGE_PCT - 100}% ดาเมจ
      </small>
      {(equip.isError || promote.isError) && (
        <div role="alert" className="text-sm text-red-600">
          ทำรายการไม่สำเร็จ ลองใหม่อีกครั้ง
        </div>
      )}
      {data && (
        <>
          <h2 className={section}>ช่องคอร์ ({CORE_SLOTS} ช่อง)</h2>
          {slotCores(data.cores).map((c, i) => (
            <div key={i} className={card}>
              <div>
                <div className="font-semibold">ช่อง {i + 1}</div>
                <small className={muted}>{c ? `${name(c)} · ${coreBonusText(c)}` : 'ว่าง'}</small>
              </div>
            </div>
          ))}

          <h2 className={section}>คอร์ที่มี</h2>
          {data.cores.length === 0 && (
            <small className={muted}>ยังไม่มีคอร์ ผ่านด่านครั้งแรกเพื่อรับคอร์</small>
          )}
          {data.cores.map((c) => (
            <div key={c.id} className={`${card} flex-col items-stretch`}>
              <div>
                <div className="font-semibold">{name(c)}</div>
                <small className={muted}>{coreBonusText(c)}</small>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {Array.from({ length: CORE_SLOTS }, (_, i) => (
                  <button
                    key={i}
                    className={btn}
                    disabled={busy || c.slot === i}
                    onClick={() => equip.mutate({ id: c.id, slot: i })}
                  >
                    {c.slot === i ? `ช่อง ${i + 1} (ใส่อยู่)` : `ใส่ช่อง ${i + 1}`}
                  </button>
                ))}
                {c.promoteCost ? (
                  <button
                    className={btn}
                    disabled={busy || !canPromoteCore(c, balances)}
                    onClick={() => promote.mutate(c.id)}
                  >
                    เลื่อนขั้น (เหรียญ {c.promoteCost.coins} · ชิ้นส่วน {c.promoteCost.shards})
                  </button>
                ) : (
                  <small className={muted}>ขั้นสูงสุดแล้ว</small>
                )}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export default PageTdCores
