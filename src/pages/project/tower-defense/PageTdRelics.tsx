import { ArrowLeftOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { appPath } from '../../../config/app-paths'
import { TdEnergy } from './TdEnergy'
import { skillLabel } from './strings'
import { elementLabel } from './td-core'
import { useGetTdGacha } from './td-gacha-query'
import { useGetTdProfile } from './td-profile-query'
import { canUnlockRelic, relicEffectText } from './td-relic'
import { useGetTdRelics, useUnlockTdRelic } from './td-relic-query'

const card =
  'flex flex-col gap-2 rounded border border-slate-300 bg-white px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
const btn =
  'rounded bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-500 disabled:opacity-50'
const muted = 'text-slate-500 dark:text-slate-400'

// Relics screen: each relic unlocks an exclusive draft skill for its core hero. Eligibility and
// price come from GET /td/relics; the server decides the unlock and the battle effect.
const PageTdRelics = () => {
  const { data } = useGetTdRelics()
  const { data: gacha } = useGetTdGacha()
  const { data: profile } = useGetTdProfile()
  const unlock = useUnlockTdRelic()
  const balances = { coins: profile?.balances.coins ?? 0, shards: profile?.balances.shards ?? 0 }
  const nameOf = (id: string) => gacha?.config.heroes.find((h) => h.id === id)?.name ?? id

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
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">เรลิก</h1>
        <TdEnergy />
      </div>
      <small className={muted}>
        ปลดล็อกเรลิกเมื่อมีฮีโร่ประจำเรลิกและคอร์ธาตุเดียวกับฮีโร่
        สกิลเฉพาะจะเข้าสู่ดราฟต์ของทุกด่านถัดไป
      </small>
      {unlock.isError && (
        <div role="alert" className="text-sm text-red-600">
          ทำรายการไม่สำเร็จ ลองใหม่อีกครั้ง
        </div>
      )}
      {data?.relics.map((r) => (
        <div key={r.id} className={card}>
          <div className="font-semibold">
            {nameOf(r.hero)} · ธาตุ{elementLabel(r.element)}
          </div>
          <small className={muted}>
            {skillLabel('th', r.skill)} · {relicEffectText()}
          </small>
          {r.unlocked ? (
            <small className={muted}>ปลดล็อกแล้ว</small>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <button
                className={btn}
                disabled={unlock.isPending || !canUnlockRelic(r, balances)}
                onClick={() => unlock.mutate(r.id)}
              >
                ปลดล็อก (เหรียญ {r.cost.coins} · ชิ้นส่วน {r.cost.shards})
              </button>
              {!r.eligible && <small className={muted}>ต้องมีฮีโร่และคอร์ธาตุที่ตรงกัน</small>}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default PageTdRelics
