import { canUpgradeGear, nextGearCost, type ITdGachaConfig } from './td-gacha'
import { useUpgradeTdGear } from './td-gear-query'

// Gear mod level of an owned hero and the button that spends coins on the next one. The mod adds
// damage in battle (the sim's GEAR_MOD_DAMAGE_PCT); the server replay applies the same level.
export const TdGearMod = ({
  heroId,
  modLevel,
  coins,
  config,
}: {
  heroId: string
  modLevel: number
  coins: number
  config: ITdGachaConfig
}) => {
  const upgrade = useUpgradeTdGear()
  const cost = nextGearCost(modLevel, config)
  return (
    <div className="mt-1 flex flex-col gap-1">
      <small aria-label="ระดับม็อดเกียร์">เกียร์ม็อด Lv.{modLevel}</small>
      {cost === null ? (
        <small>ม็อดสูงสุดแล้ว</small>
      ) : (
        <button
          className="rounded bg-slate-700 px-2 py-1 text-xs text-white hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-800"
          disabled={upgrade.isPending || !canUpgradeGear(modLevel, coins, config)}
          onClick={() => upgrade.mutate(heroId)}
        >
          อัปเกรดม็อด (เหรียญ {cost})
        </button>
      )}
      {upgrade.isError && (
        <small role="alert" className="text-red-500">
          อัปเกรดม็อดไม่สำเร็จ
        </small>
      )}
    </div>
  )
}
