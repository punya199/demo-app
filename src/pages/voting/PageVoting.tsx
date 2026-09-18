import { CopyOutlined, PlusOutlined, StopOutlined } from '@ant-design/icons'
import { Button, Flex, message, Modal, Table, TableColumnType, Tag, Typography } from 'antd'
import dayjs from 'dayjs'
import { Link } from 'react-router-dom'
import { appPath } from '../../config/app-paths'
import { useGetFeaturePermissionAction } from '../../service'
import { EnumPermissionFeatureName } from '../../services/permission/permission.params'
import { EnumPollType, IPollData } from './voting-interface'
import { useClosePoll, useGetMyPolls } from './voting-service'

const pollTypeLabel: Record<EnumPollType, string> = {
  [EnumPollType.SINGLE]: 'Single choice',
  [EnumPollType.MULTIPLE]: 'Multiple choice',
  [EnumPollType.RANKING]: 'Ranking',
}

export const PageVoting = () => {
  const { data: myPollsData, isLoading } = useGetMyPolls()
  const { data: permissionAction } = useGetFeaturePermissionAction(EnumPermissionFeatureName.VOTING)
  const { mutate: closePoll } = useClosePoll()

  const columns: TableColumnType<IPollData>[] = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Type',
      dataIndex: 'pollType',
      key: 'pollType',
      render: (value: EnumPollType) => pollTypeLabel[value],
    },
    {
      title: 'Status',
      dataIndex: 'closedAt',
      key: 'closedAt',
      render: (value) => <Tag color={value ? 'default' : 'green'}>{value ? 'Closed' : 'Open'}</Tag>,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value) => dayjs(value).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Share link',
      dataIndex: 'slug',
      key: 'slug',
      render: (slug: string) => {
        const link = `${window.location.origin}${appPath.voteBySlug({ param: { slug } })}`
        return (
          <Button
            type="link"
            icon={<CopyOutlined />}
            onClick={() => {
              navigator.clipboard
                .writeText(link)
                .then(() => message.success('Link copied'))
                .catch(() => message.error('Could not copy the link'))
            }}
          >
            Copy link
          </Button>
        )
      },
    },
    {
      title: 'Actions',
      dataIndex: 'id',
      key: 'actions',
      render: (id: string, record) =>
        permissionAction?.canUpdate &&
        !record.closedAt && (
          <Button
            type="link"
            danger
            icon={<StopOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'Close this poll?',
                content: 'Voting will stop immediately. This cannot be undone.',
                onOk: () =>
                  closePoll(id, {
                    onError: () => message.error('Could not close the poll'),
                  }),
              })
            }}
          >
            Close
          </Button>
        ),
    },
  ]

  return (
    <div className="space-y-4 py-6 md:p-4">
      <Table
        title={() => (
          <Flex justify="space-between" align="center" gap={16}>
            <Typography.Title level={4}>My polls</Typography.Title>
            {permissionAction?.canCreate && (
              <Link to={appPath.votingCreate()}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onMouseEnter={() => {
                    import('./PageVotingCreate')
                  }}
                >
                  Create poll
                </Button>
              </Link>
            )}
          </Flex>
        )}
        rowKey="id"
        dataSource={myPollsData?.polls}
        columns={columns}
        loading={isLoading}
      />
    </div>
  )
}
