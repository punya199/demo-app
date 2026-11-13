import { ArrowLeftOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { appPath } from '../../../config/app-paths'
import {
  formatRate,
  pullAvailability,
  RARITIES,
  type ITdGachaConfig,
  type TdGachaMode,
  type TdRarity,
} from './td-gacha'
import { useGetTdGacha, usePullTdGacha } from './td-gacha-query'
import { useGetTdProfile } from './td-profile-query'

const RARITY_LABEL: Record<TdRarity, string> = {
  common: 'ธรรมดา',
  rare: 'หายาก',
  epic: 'มหากาพย์',
  legendary: 'ตำนาน',
}
const RARITY_COLOR: Record<TdRarity, string> = {
  common: 'text-slate-500',
  rare: 'text-blue-500',
  epic: 'text-purple-500',
  legendary: 'text-amber-500',
}
const ROLE_LABEL = { aoe: 'โจมตีกลุ่ม', support: 'สนับสนุน', dps: 'ดาเมจ' }

const btn =
  'rounded bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-800'

const buttons = (config: ITdGachaConfig): { mode: TdGachaMode; label: string }[] => [
  { mode: 'free', label: 'สุ่มฟรีวันนี้' },
  { mode: 'single', label: `สุ่ม 1 ครั้ง (💎 ${config.singleCost})` },
  { mode: 'ten', label: `สุ่ม 10 ครั้ง (💎 ${config.tenCost})` },
]

const PageTdGacha = () => {
  const { data } = useGetTdGacha()
  const { data: profile } = useGetTdProfile()
  const pull = usePullTdGacha()

  if (!data) return null
  const { config, state } = data
  const gems = profile?.balances.gems ?? 0
  const nameOf = (id: string) => config.heroes.find((h) => h.id === id)?.name ?? id
  const owned = new Set(state.ownedHeroIds)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 overflow-x-hidden px-4 py-4 text-slate-900 dark:text-slate-100">
      <div className="flex items-center justify-between">
        <Link
          to={appPath.towerDefense()}
          aria-label="กลับไปเกม"
          className="text-slate-500 hover:text-blue-600 dark:text-slate-400"
        >
          <ArrowLeftOutlined className="text-lg" />
        </Link>
        <h1 className="text-xl font-bold">สุ่มฮีโร่</h1>
        <span role="status" aria-label="เพชร">
          💎 {gems}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {buttons(config).map(({ mode, label }) => (
          <button
            key={mode}
            className={btn}
            disabled={
              pull.isPending || !pullAvailability(mode, gems, config, state.freePullAvailable)
            }
            onClick={() => pull.mutate(mode)}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        การันตีตำนานใน {state.pullsUntilLegendary} ครั้ง (สูงสุด {config.pityLimit} ครั้ง)
      </p>

      {pull.isError && (
        <p role="alert" className="text-sm text-red-500">
          สุ่มไม่สำเร็จ ลองใหม่อีกครั้ง
        </p>
      )}
      {pull.data && (
        <section aria-label="ผลการสุ่ม">
          <h2 className="mb-2 font-semibold">ผลการสุ่ม</h2>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {pull.data.pulls.map((p, i) => (
              <li
                key={i}
                className="rounded border border-slate-300 p-2 text-sm dark:border-slate-700"
              >
                <div className={RARITY_COLOR[p.rarity]}>{RARITY_LABEL[p.rarity]}</div>
                <div>{nameOf(p.heroId)}</div>
                {p.duplicate && <small>ซ้ำ → เศษ +{p.shards}</small>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-label="อัตราการออก">
        <h2 className="mb-2 font-semibold">อัตราการออก</h2>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {RARITIES.map((r) => (
            <li key={r} className={RARITY_COLOR[r]}>
              {RARITY_LABEL[r]} {formatRate(config.rates[r])}
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="ฮีโร่ทั้งหมด">
        <h2 className="mb-2 font-semibold">
          ฮีโร่ ({owned.size}/{config.heroes.length})
        </h2>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {config.heroes.map((h) => (
            <li
              key={h.id}
              className={`rounded border border-slate-300 p-2 text-sm dark:border-slate-700 ${owned.has(h.id) ? '' : 'opacity-40'}`}
            >
              <div className={RARITY_COLOR[h.rarity]}>{RARITY_LABEL[h.rarity]}</div>
              <div>{h.name}</div>
              <small>{ROLE_LABEL[h.role]}</small>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default PageTdGacha
