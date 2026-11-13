import { ArrowLeftOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { appPath } from '../../../config/app-paths'
import { TdEnergy } from './TdEnergy'
import { goalLabel, goalProgressText, goalState, type ITdGoal } from './td-goals'
import { useClaimTdGoal, useGetTdGoals } from './td-goals-query'

const card =
  'flex items-center justify-between gap-3 rounded border border-slate-300 bg-white px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
const claimBtn =
  'rounded bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-500 disabled:opacity-50'

// Goals screen: daily goals, the 7-day track and achievements. Everything shown comes from
// GET /td/goals; claiming is a bodiless POST and the server decides whether anything is owed.
const PageTdGoals = () => {
  const { data } = useGetTdGoals()
  const claim = useClaimTdGoal()

  const row = (g: ITdGoal, path: string) => {
    const state = goalState(g)
    return (
      <div key={g.id} className={card}>
        <div>
          <div className="font-semibold">{goalLabel(g.id)}</div>
          <small className="text-slate-500 dark:text-slate-400">
            {goalProgressText(g)} · 💎 {g.gems}
          </small>
        </div>
        {state === 'claimed' ? (
          <span className="text-sm text-slate-500 dark:text-slate-400">รับแล้ว</span>
        ) : (
          <button
            className={claimBtn}
            disabled={state === 'pending' || claim.isPending}
            onClick={() => claim.mutate(path)}
          >
            รับรางวัล
          </button>
        )}
      </div>
    )
  }

  const section = 'mt-2 text-lg font-bold text-slate-900 dark:text-white'

  return (
    <div className="mx-auto flex min-h-full w-full max-w-xl flex-col gap-3 px-4 py-4">
      <div className="flex items-center justify-between">
        <Link
          to={appPath.towerDefense()}
          className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
          aria-label="กลับ"
        >
          <ArrowLeftOutlined className="text-lg" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">ภารกิจ</h1>
        <TdEnergy />
      </div>
      {claim.isError && (
        <div role="alert" className="text-sm text-red-600">
          รับรางวัลไม่สำเร็จ ลองใหม่อีกครั้ง
        </div>
      )}
      {data && (
        <>
          <h2 className={section}>ภารกิจรายวัน</h2>
          <small className="text-slate-500 dark:text-slate-400">รีเซ็ตทุกวันเวลา 07:00 น.</small>
          {data.daily.map((g) => row(g, `daily/${g.id}/claim`))}

          <h2 className={section}>เช็กอิน 7 วัน</h2>
          <div className={card}>
            <div>
              <div className="font-semibold">วันที่ {data.track.day}/7</div>
              <small className="text-slate-500 dark:text-slate-400">
                💎 {data.track.gems} · ทำภารกิจรายวันอย่างน้อย 1 อย่างก่อนรับ
              </small>
            </div>
            {data.track.claimedToday ? (
              <span className="text-sm text-slate-500 dark:text-slate-400">รับแล้ววันนี้</span>
            ) : (
              <button
                className={claimBtn}
                disabled={!data.track.claimable || claim.isPending}
                onClick={() => claim.mutate('track/claim')}
              >
                รับรางวัล
              </button>
            )}
          </div>

          <h2 className={section}>ความสำเร็จ</h2>
          {data.achievements.map((g) => row(g, `achievements/${g.id}/claim`))}
        </>
      )}
    </div>
  )
}

export default PageTdGoals
