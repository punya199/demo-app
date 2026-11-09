import { Button, Card, message, Progress, Spin } from 'antd'
import { ResetCountdown } from '../shared/ResetCountdown'
import { IQuest, IQuestsData } from '../core/tamagotchi-interface'
import { loginRewardParts } from './login-reward'
import { useClaimLogin, useClaimQuest, useGetQuests } from '../core/tamagotchi-service'

interface IQuestPanelProps {
  onError: (error: unknown) => void
}

const rewardLabel = (reward: {
  coin?: number
  coinReward?: number
  gem?: number
  gemReward?: number
}) => {
  const coin = reward.coin ?? reward.coinReward ?? 0
  const gem = reward.gem ?? reward.gemReward ?? 0
  return `🪙 ${coin}${gem ? ` 💎 ${gem}` : ''}`
}

const LoginCard = (props: { login: IQuestsData['login']; onError: (error: unknown) => void }) => {
  const { login, onError } = props
  const { mutate: claim, isPending } = useClaimLogin()
  const isComplete = !login.reward
  return (
    <Card size="small" className="dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📅</span>
          <div className="flex-1">
            <div className="font-medium text-slate-900 dark:text-slate-100">
              เข้าสู่ระบบรายเดือน (รับแล้ว {login.claimed}/{login.rewards.length} วัน)
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              ขาดวันไหนไม่เป็นไร รับต่อช่องถัดไปได้เลย · รีเซ็ตทุกวันที่ 1 ของเดือน
            </div>
          </div>
          <Button
            type="primary"
            disabled={login.claimedToday || isComplete || isPending}
            onClick={() =>
              claim(undefined, {
                onError,
                onSuccess: ({ granted }) =>
                  message.success(`ได้รับ ${loginRewardParts(granted).join(' · ')}`),
              })
            }
          >
            {isComplete ? 'ครบเดือนแล้ว' : login.claimedToday ? 'รับแล้ว' : 'รับรางวัล'}
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-1 text-center text-xs sm:grid-cols-7">
          {login.rewards.map((reward, index) => {
            const day = index + 1
            const isDone = login.claimedToday ? day <= login.day : day < login.day
            const isNext = !login.claimedToday && !isComplete && day === login.day
            return (
              <div
                key={day}
                className={`rounded border px-1 py-1 ${
                  isNext
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                    : isDone
                      ? 'border-green-600 text-green-600 opacity-70'
                      : 'border-slate-300 text-slate-500 dark:border-slate-700 dark:text-slate-400'
                }`}
              >
                <div>วัน {day}</div>
                {isDone ? (
                  <div>✓</div>
                ) : (
                  loginRewardParts(reward).map((part) => <div key={part}>{part}</div>)
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

export const QuestPanel = (props: IQuestPanelProps) => {
  const { onError } = props
  const { data, isLoading } = useGetQuests()
  const { mutate: claim, isPending } = useClaimQuest()

  if (isLoading || !data) {
    return <Spin />
  }

  const renderQuest = (quest: IQuest) => {
    const isComplete = quest.progress >= quest.target
    return (
      <Card key={quest.id} size="small" className="dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{quest.emoji}</span>
          <div className="flex-1">
            <div className="font-medium text-slate-900 dark:text-slate-100">{quest.name}</div>
            <Progress
              size="small"
              percent={Math.round((quest.progress / quest.target) * 100)}
              format={() => `${quest.progress}/${quest.target}`}
            />
          </div>
          <Button
            type="primary"
            disabled={!isComplete || quest.claimed || isPending}
            onClick={() => claim(quest.id, { onError })}
          >
            {quest.claimed ? 'รับแล้ว' : `รับ ${rewardLabel(quest)}`}
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <LoginCard login={data.login} onError={onError} />
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        ภารกิจประจำวัน รีเซ็ตเที่ยงคืนเวลาไทย
        <br />
        🕒 <ResetCountdown resetsAt={data.resetsAt} />
      </p>
      {data.quests.map(renderQuest)}
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        ภารกิจประจำสัปดาห์ รีเซ็ตเที่ยงคืนวันจันทร์เวลาไทย
        <br />
        🕒 <ResetCountdown resetsAt={data.weekly.resetsAt} />
      </p>
      {data.weekly.quests.map(renderQuest)}
    </div>
  )
}
