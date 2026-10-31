import { Spin, Tag } from 'antd'
import { useGetPvpLeaderboard } from './tamagotchi-service'

interface IPvpLeaderboardProps {
  season?: string
}

// Names shown are the arena names players chose themselves; the server never sends usernames.
export const PvpLeaderboard = (props: IPvpLeaderboardProps) => {
  const { data, isLoading } = useGetPvpLeaderboard(props.season)

  if (isLoading || !data) {
    return <Spin />
  }
  if (data.entries.length === 0) {
    return (
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        ซีซัน {data.season} ยังไม่มีใครสู้
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-1 text-sm">
      {data.entries.map((entry) => (
        <div
          key={`${entry.rank}-${entry.displayName}`}
          className={`flex items-center gap-2 rounded px-2 py-1 ${
            entry.isMe ? 'bg-amber-100 dark:bg-amber-900/30' : ''
          }`}
        >
          <span className="w-8 text-right font-semibold">#{entry.rank}</span>
          <span className="text-xl">{entry.emoji ?? '❔'}</span>
          <span className="flex-1 truncate">{entry.displayName}</span>
          <Tag>{entry.rating}</Tag>
          <span className="w-16 text-right text-xs text-slate-500">
            {entry.wins}ช-{entry.losses}พ
          </span>
        </div>
      ))}
    </div>
  )
}
