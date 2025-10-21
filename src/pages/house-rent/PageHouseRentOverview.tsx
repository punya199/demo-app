import { css } from '@emotion/react'
import { Table, TableColumnType, Typography } from 'antd'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { appPath } from '../../config/app-paths'
import { IUser } from '../../service'
import { useGetHouseRentUserList } from './house-rent-service'

export const PageHouseRentOverview = () => {
  const { data: userListData, isLoading: isUserListLoading } = useGetHouseRentUserList()

  const userColumns = useMemo(
    (): TableColumnType<IUser>[] => [
      {
        title: 'ชื่อผู้เช่า',
        dataIndex: 'username',
        key: 'username',
      },
      {
        title: 'Actions',
        key: 'id',
        dataIndex: 'id',
        align: 'center',
        render: (userId: string) => {
          return <Link to={appPath.houseRentUserDetail({ param: { userId } })}>ดูสรุป</Link>
        },
      },
    ],
    []
  )

  return (
    <div
      className="space-y-4 py-6 md:p-4"
      css={css`
        background-color: #f3f3f3;
        height: 100%;
      `}
    >
      <Table
        title={() => <Typography.Title level={4}>ผู้เช่า</Typography.Title>}
        rowKey={(e) => e.id}
        dataSource={userListData?.users}
        columns={userColumns}
        loading={isUserListLoading}
      />
    </div>
  )
}
