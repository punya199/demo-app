import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons'
import {
  Alert,
  Button,
  Checkbox,
  Flex,
  List,
  message,
  Radio,
  Result,
  Skeleton,
  Typography,
} from 'antd'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { EnumPollType } from './voting-interface'
import { moveItem } from './voting-helper'
import { PollResults } from './PollResults'
import { useGetPublicPoll, useSubmitVote } from './voting-service'

export const PageVotePublic = () => {
  const { slug } = useParams<{ slug: string }>()
  const { data, isLoading, isError } = useGetPublicPoll(slug)
  const { mutate: submitVote, isPending } = useSubmitVote(slug)

  const poll = data?.poll
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [rankedIds, setRankedIds] = useState<string[]>([])
  const [hasVoted, setHasVoted] = useState(false)
  // Seed local selection state from the server exactly once per poll load, not on every
  // background refetch - otherwise a refetch (window refocus, another tab) would silently
  // discard whatever the voter is mid-way through picking/reordering.
  const initializedForPollId = useRef<string | null>(null)

  useEffect(() => {
    if (!poll || initializedForPollId.current === poll.id) return
    initializedForPollId.current = poll.id

    const validOptionIds = new Set(poll.options.map((option) => option.id))
    // Sort by rank first - the server doesn't guarantee selections come back in rank order.
    // Drop any option id the poll no longer has (e.g. edited after this vote was cast).
    const myVoteOptionIds = [...(data?.myVote ?? [])]
      .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
      .map((selection) => selection.optionId)
      .filter((optionId) => validOptionIds.has(optionId))

    setHasVoted(myVoteOptionIds.length > 0)
    if (poll.pollType === EnumPollType.RANKING) {
      const fallback = poll.options.map((option) => option.id)
      setRankedIds(myVoteOptionIds.length ? myVoteOptionIds : fallback)
    } else {
      setSelectedIds(myVoteOptionIds)
    }
  }, [poll, data?.myVote])

  const optionsById = useMemo(() => {
    return new Map((poll?.options ?? []).map((option) => [option.id, option]))
  }, [poll?.options])

  const handleSubmit = () => {
    const optionIds = poll?.pollType === EnumPollType.RANKING ? rankedIds : selectedIds
    submitVote(
      { optionIds },
      {
        onSuccess: () => {
          message.success(hasVoted ? 'Vote updated' : 'Vote recorded')
          setHasVoted(true)
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-xl space-y-4 py-6">
        <Skeleton active />
      </div>
    )
  }

  if (isError || !poll) {
    return (
      <div className="mx-auto max-w-xl py-6">
        <Result status="404" title="Poll not found" subTitle="This link may be invalid." />
      </div>
    )
  }

  const canSubmit =
    poll.pollType === EnumPollType.RANKING ? rankedIds.length > 0 : selectedIds.length > 0
  // maxSelections is number | null - `> 0` guards a stray 0 (which ?? alone would not catch)
  // from disabling every checkbox and making the poll unvotable.
  const multipleChoiceLimit =
    poll.maxSelections && poll.maxSelections > 0 ? poll.maxSelections : poll.options.length

  return (
    <div className="mx-auto max-w-xl space-y-4 py-6">
      <Typography.Title level={4}>{poll.title}</Typography.Title>
      {poll.description && <Typography.Paragraph>{poll.description}</Typography.Paragraph>}

      {poll.isClosed && <Alert type="warning" showIcon message="This poll is closed" />}

      {!poll.isClosed && (
        <>
          {hasVoted && (
            <Alert
              type="success"
              showIcon
              message="You've already voted. Submitting again changes your vote."
            />
          )}

          {poll.pollType === EnumPollType.SINGLE && (
            <Radio.Group
              className="w-full"
              value={selectedIds[0]}
              onChange={(e) => setSelectedIds([e.target.value])}
            >
              <Flex vertical gap={8}>
                {poll.options.map((option) => (
                  <Radio key={option.id} value={option.id}>
                    {option.label}
                  </Radio>
                ))}
              </Flex>
            </Radio.Group>
          )}

          {poll.pollType === EnumPollType.MULTIPLE && (
            <Checkbox.Group
              className="w-full"
              value={selectedIds}
              onChange={(values) => {
                setSelectedIds((values as string[]).slice(0, multipleChoiceLimit))
              }}
            >
              <Flex vertical gap={8}>
                {poll.options.map((option) => {
                  const disabled =
                    !selectedIds.includes(option.id) && selectedIds.length >= multipleChoiceLimit
                  return (
                    <Checkbox key={option.id} value={option.id} disabled={disabled}>
                      {option.label}
                    </Checkbox>
                  )
                })}
              </Flex>
              {poll.maxSelections && (
                <Typography.Text type="secondary">Pick up to {poll.maxSelections}</Typography.Text>
              )}
            </Checkbox.Group>
          )}

          {poll.pollType === EnumPollType.RANKING && (
            <List
              bordered
              dataSource={rankedIds}
              renderItem={(optionId, index) => (
                <List.Item
                  actions={[
                    <Button
                      key="up"
                      size="small"
                      icon={<ArrowUpOutlined />}
                      disabled={index === 0}
                      onClick={() => setRankedIds((prev) => moveItem(prev, index, -1))}
                    />,
                    <Button
                      key="down"
                      size="small"
                      icon={<ArrowDownOutlined />}
                      disabled={index === rankedIds.length - 1}
                      onClick={() => setRankedIds((prev) => moveItem(prev, index, 1))}
                    />,
                  ]}
                >
                  {index + 1}. {optionsById.get(optionId)?.label}
                </List.Item>
              )}
            />
          )}

          <Button type="primary" onClick={handleSubmit} loading={isPending} disabled={!canSubmit}>
            {hasVoted ? 'Update vote' : 'Submit vote'}
          </Button>
        </>
      )}

      {hasVoted && <PollResults slug={slug} pollType={poll.pollType} isClosed={poll.isClosed} />}
    </div>
  )
}
