import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Modal, Select, Table, Tag } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { pascalCase } from 'change-case'
import { EnumUserStatus, IGetUsersResponse, IUser, UserRole } from '../service'
import { apiClient } from '../utils/api-client'
const PageManageUser = () => {
  const queryClient = useQueryClient()
  const { data } = useQuery({
    queryKey: ['UserList'],
    queryFn: async () => {
      const { data } = await apiClient.get<IGetUsersResponse>(`/users`)
      return data
    },
  })
  const { mutate: editUser } = useMutation({
    mutationFn: async (param: { userId: number; role: UserRole }) => {
      await apiClient.put<IUser>(`/users/${param.userId}`, { role: param.role })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['UserList'] })
    },
  })
  const handleEditRole = (userId: number, role: UserRole) => {
    let newRole = role
    Modal.confirm({
      title: 'Edit Role',
      icon: null,
      content: (
        <Select
          placeholder="Role"
          defaultValue={newRole}
          options={[
            { label: 'Admin', value: UserRole.ADMIN },
            { label: 'User', value: UserRole.USER },
            { label: 'Super admin', value: UserRole.SUPER_ADMIN, disabled: true },
          ]}
          onChange={(value) => (newRole = value)}
        />
      ),
      okText: 'Save',
      cancelText: 'Cancel',
      onOk: async () => {
        editUser({ userId, role: newRole })
      },
    })
  }

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
        <Button onClick={() => handleEditRole(record.id, record.role)}>Edit</Button>
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
