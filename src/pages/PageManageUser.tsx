import { Button, Table, Tag } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { pascalCase } from 'change-case'
import { Link } from 'react-router-dom'
import { appPath } from '../config/app-paths'
import { EnumUserStatus, IUser, UserRole } from '../service'
import { useGetUsers } from '../services/user/user.query'
const PageManageUser = () => {
  const { data } = useGetUsers()

  const columns: ColumnsType<IUser> = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      ellipsis: false,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 140,
      ellipsis: true,
      render: (role: UserRole) => {
        return pascalCase(role)
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      ellipsis: true,
      render: (status: EnumUserStatus) => {
        return (
          <Tag
            color={
              status === EnumUserStatus.ACTIVE
                ? 'green'
                : status === EnumUserStatus.INACTIVE
                  ? 'default'
                  : 'error'
            }
          >
            {pascalCase(status)}
          </Tag>
        )
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 100,
      ellipsis: true,
      render: (_, record) => (
        <Link
          to={appPath.manageUserDetail({ param: { userId: record.id } })}
          onMouseOver={() => {
            import('./manage-user/PageManageUserDetail')
          }}
        >
          <Button>Edit</Button>
        </Link>
      ),
    },
  ]
  return (
    <div>
      <Table rowKey={(e) => e.id} dataSource={data?.users} columns={columns} />
    </div>
  )
}

export default PageManageUser
