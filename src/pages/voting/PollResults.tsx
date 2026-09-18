import { Progress, Typography } from 'antd'
import { EnumPollType } from './voting-interface'
import { useGetPollResults } from './voting-service'

interface IPollResultsProps {
  slug?: string
  pollType: EnumPollType
  isClosed: boolean
}

export const PollResults = ({ slug, pollType, isClosed }: IPollResultsProps) => {
  const { data } = useGetPollResults(slug, { isClosed })
  if (!data) return null

  const maxScore = Math.max(1, ...data.results.map((option) => option.score))
  const scoreLabel = pollType === EnumPollType.RANKING ? 'pts' : 'vote(s)'

  return (
    <div className="space-y-3">
      <Typography.Title level={5}>
        Results ({data.totalVotes} {data.totalVotes === 1 ? 'vote' : 'votes'} so far)
      </Typography.Title>
      {data.results.map((option) => (
        <div key={option.optionId}>
          <div className="flex justify-between">
            <span>{option.label}</span>
            <span>
              {option.score} {scoreLabel}
            </span>
          </div>
          <Progress
            percent={Math.round((option.score / maxScore) * 100)}
            showInfo={false}
            size="small"
          />
        </div>
      ))}
    </div>
  )
}
