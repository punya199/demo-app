import { canStarUp, nextStarCost, type ITdGachaConfig } from './td-gacha'
import { useStarUpTdHero } from './td-hero-query'

// Star level of an owned hero and the button that spends shards on the next one. Stronger skill
// unlocks from the third star (the sim's STRONG_SKILL_STAR).
export const TdHeroStarUp = ({
  heroId,
  starLevel,
  shards,
  config,
}: {
  heroId: string
  starLevel: number
  shards: number
  config: ITdGachaConfig
}) => {
  const starUp = useStarUpTdHero()
  const cost = nextStarCost(starLevel, config)
  return (
    <div className="mt-1 flex flex-col gap-1">
      <small aria-label="ระดับดาว">{'★'.repeat(starLevel)}</small>
      {cost === null ? (
        <small>ดาวสูงสุดแล้ว</small>
      ) : (
        <button
          className="rounded bg-slate-700 px-2 py-1 text-xs text-white hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-800"
          disabled={starUp.isPending || !canStarUp(starLevel, shards, config)}
          onClick={() => starUp.mutate(heroId)}
        >
          เพิ่มดาว (เศษ {cost})
        </button>
      )}
      {starUp.isError && (
        <small role="alert" className="text-red-500">
          เพิ่มดาวไม่สำเร็จ
        </small>
      )}
    </div>
  )
}
