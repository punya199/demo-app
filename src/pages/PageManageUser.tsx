import { DeleteOutlined, EditOutlined, TeamOutlined, UserSwitchOutlined } from '@ant-design/icons'
import { Avatar, Button, Input, message, Modal, Table, Tag, Tooltip, Typography } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { pascalCase } from 'change-case'
import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { appPath } from '../config/app-paths'
import { EditUserModal } from './manage-user/EditUserModal'
import { EnumUserStatus, IUser, useGetMe, UserRole } from '../service'
import { useDeleteUser, useGetUsers } from '../services/user/user.query'
import { checkRole } from '../utils/helper'

const roleColor: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: '#a855f7',
  [UserRole.ADMIN]: '#2563eb',
  [UserRole.USER]: '#64748b',
}

const statusColor: Record<EnumUserStatus, string> = {
  [EnumUserStatus.ACTIVE]: 'green',
  [EnumUserStatus.INACTIVE]: 'default',
  [EnumUserStatus.BLOCKED]: 'error',
}

const PageManageUser = () => {
  const { data } = useGetUsers()
  const { data: me } = useGetMe()
  const { mutate: deleteUser } = useDeleteUser()
  const isSuperAdmin = checkRole(UserRole.SUPER_ADMIN, me?.user?.role)
  const [searchText, setSearchText] = useState('')
  const [editUserTarget, setEditUserTarget] = useState<IUser | null>(null)

  const filteredUsers = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()
    if (!keyword) return data?.users
    return data?.users.filter((u) => u.username.toLowerCase().includes(keyword))
  }, [data?.users, searchText])

  const handleDeleteClick = (record: IUser) => {
    Modal.confirm({
      title: `ต้องการลบผู้ใช้ "${record.username}" ใช่หรือไม่?`,
      content: 'การลบนี้ไม่สามารถยกเลิกได้',
      okText: 'ลบ',
      cancelText: 'ยกเลิก',
      okType: 'danger',
      icon: null,
      onOk: () => {
        deleteUser(record.id, {
          onSuccess: () => {
            message.success('ลบผู้ใช้สำเร็จ')
          },
          onError: () => {
            message.error('ลบผู้ใช้ไม่สำเร็จ')
          },
        })
      },
    })
  }

  const columns: ColumnsType<IUser> = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      ellipsis: false,
      render: (username: string, record) => (
        <div className="flex items-center gap-3">
          <Avatar style={{ backgroundColor: roleColor[record.role] }}>
            {username.slice(0, 2).toUpperCase()}
          </Avatar>
          <span className="font-medium text-slate-900 dark:text-slate-100">{username}</span>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 140,
      ellipsis: true,
      render: (role: UserRole) => (
        <Tag color={roleColor[role]} className="!rounded-full">
          {pascalCase(role)}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      ellipsis: true,
      render: (status: EnumUserStatus) => (
        <Tag color={statusColor[status]} className="!rounded-full">
          {pascalCase(status)}
        </Tag>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 100,
      ellipsis: true,
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <Link
            to={appPath.manageUserDetail({ param: { userId: record.id } })}
            onMouseOver={() => {
              import('./manage-user/PageManageUserDetail')
            }}
          >
            <Tooltip title="Edit permissions">
              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className="inline-block"
              >
                <Button type="text" shape="circle" icon={<EditOutlined />} />
              </motion.div>
            </Tooltip>
          </Link>

          {isSuperAdmin && record.role !== UserRole.SUPER_ADMIN && (
            <Tooltip title="Edit role & status">
              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className="inline-block"
              >
                <Button
                  type="text"
                  shape="circle"
                  icon={<UserSwitchOutlined />}
                  onClick={() => setEditUserTarget(record)}
                />
              </motion.div>
            </Tooltip>
          )}

          {isSuperAdmin && record.id !== me?.user?.id && (
            <Tooltip title="Delete user">
              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className="inline-block"
              >
                <Button
                  type="text"
                  danger
                  shape="circle"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteClick(record)}
                />
              </motion.div>
            </Tooltip>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TeamOutlined className="text-xl text-blue-600 dark:text-blue-400" />
          <Typography.Title level={4} className="!mb-0 !text-blue-600 dark:!text-blue-400">
            Manage User
          </Typography.Title>
        </div>
        <Input.Search
          placeholder="Search username"
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full sm:w-64"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Table rowKey={(e) => e.id} dataSource={filteredUsers} columns={columns} />
      </div>

      <EditUserModal
        open={!!editUserTarget}
        user={editUserTarget}
        onClose={() => setEditUserTarget(null)}
      />
    </div>
  )
}

export default PageManageUser
