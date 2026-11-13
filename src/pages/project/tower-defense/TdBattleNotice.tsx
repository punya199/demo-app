import { t, type Lang } from './strings'

export type TdNet =
  | { phase: 'starting' }
  | { phase: 'ready' }
  | { phase: 'start-error'; kind: 'energy' | 'other' }
  | { phase: 'finishing' }
  | { phase: 'paid'; coins: number }
  | { phase: 'finish-error' }

// Status line for the server round trip of a battle (start, finish, payout). Rendered under the
// canvas so the canvas overlay code stays untouched.
export const TdBattleNotice = ({
  net,
  lang,
  onRetry,
}: {
  net: TdNet
  lang: Lang
  onRetry: () => void
}) => {
  if (net.phase === 'ready') return null
  const text =
    net.phase === 'starting'
      ? t(lang, 'netStarting')
      : net.phase === 'start-error'
        ? t(lang, net.kind === 'energy' ? 'netNoEnergy' : 'netStartError')
        : net.phase === 'finishing'
          ? t(lang, 'netFinishing')
          : net.phase === 'paid'
            ? t(lang, 'netPaid', { n: net.coins })
            : t(lang, 'netFinishError')
  return (
    <div
      role="status"
      className="flex w-full items-center justify-center gap-3 rounded bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-900 dark:bg-slate-800 dark:text-slate-100"
    >
      <span>{text}</span>
      {net.phase === 'start-error' && (
        <button className="rounded bg-slate-700 px-3 py-1 text-white" onClick={onRetry}>
          {t(lang, 'netRetry')}
        </button>
      )}
    </div>
  )
}
