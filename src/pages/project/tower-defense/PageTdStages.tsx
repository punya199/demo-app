import { ArrowLeftOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { appPath } from '../../../config/app-paths'
import { TdEnergy } from './TdEnergy'
import { stageStatus, starRow } from './td-stage'
import { useGetTdStages } from './td-stage-query'

const card =
  'flex items-center justify-between gap-3 rounded border border-slate-300 bg-white px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'

// Stage list: stars per stage, and later stages locked until the previous one is cleared. All of
// it comes from GET /td/stages; the server also refuses to start a locked stage.
const PageTdStages = () => {
  const { data } = useGetTdStages()

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
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">เลือกด่าน</h1>
        <TdEnergy />
      </div>
      {data?.stages.map((s) => {
        const status = stageStatus(s)
        return (
          <div key={s.stageId} className={`${card} ${status === 'locked' ? 'opacity-50' : ''}`}>
            <div>
              <div className="font-semibold">ด่าน {s.stageId}</div>
              <div aria-label={`${s.stars} ดาว`} className="text-amber-500">
                {starRow(s.stars)}
              </div>
              {status !== 'cleared' && (
                <small className="text-slate-500 dark:text-slate-400">
                  {status === 'locked'
                    ? 'ผ่านด่านก่อนหน้าเพื่อปลดล็อก'
                    : `ผ่านครั้งแรกรับ 💎 ${s.firstClearGems}`}
                </small>
              )}
            </div>
            {status === 'locked' ? (
              <span aria-label="ล็อก">🔒</span>
            ) : (
              <Link
                to={`${appPath.towerDefense()}?stage=${s.stageId}`}
                className="rounded bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600 dark:bg-slate-800"
              >
                {status === 'cleared' ? 'เล่นอีกครั้ง' : 'เล่น'} (⚡ {data.energyCost})
              </Link>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default PageTdStages
