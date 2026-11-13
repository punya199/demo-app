import { useSweepTdStage } from './td-sweep-query'

// Claims a 3-star stage's rewards without replaying it. The server checks stars, lock and energy.
export const TdSweepButton = ({ stageId, energyCost }: { stageId: number; energyCost: number }) => {
  const sweep = useSweepTdStage()
  return (
    <div className="flex flex-col items-end gap-1">
      <button
        className="rounded bg-amber-600 px-4 py-2 text-sm text-white hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={sweep.isPending}
        onClick={() => sweep.mutate(stageId)}
      >
        กวาดด่าน (⚡ {energyCost})
      </button>
      {sweep.isSuccess && (
        <small role="status" className="text-emerald-600 dark:text-emerald-400">
          ได้ 🪙 {sweep.data.coins} · เศษ {sweep.data.shards}
        </small>
      )}
      {sweep.isError && (
        <small role="alert" className="text-red-500">
          กวาดไม่สำเร็จ (พลังงานไม่พอ?)
        </small>
      )}
    </div>
  )
}
