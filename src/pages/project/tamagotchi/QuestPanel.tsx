import { Button, Card, Progress, Spin } from 'antd'
import { useClaimQuest, useGetQuests } from './tamagotchi-service'

interface IQuestPanelProps {
  onError: (error: unknown) => void
}

export const QuestPanel = (props: IQuestPanelProps) => {
  const { onError } = props
  const { data, isLoading } = useGetQuests()
  const { mutate: claim, isPending } = useClaimQuest()

  if (isLoading || !data) {
    return <Spin />
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        ภารกิจประจำวัน รีเซ็ตเที่ยงคืนเวลาไทย
      </p>
      {data.quests.map((quest) => {
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
                {quest.claimed ? 'รับแล้ว' : `รับ 🪙 ${quest.coinReward}`}
              </Button>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
