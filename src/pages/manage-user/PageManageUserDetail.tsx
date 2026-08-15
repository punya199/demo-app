import { SafetyCertificateOutlined } from '@ant-design/icons'
import { Avatar, Card, Tag, Typography } from 'antd'
import { pascalCase } from 'change-case'
import { keyBy } from 'lodash'
import { motion } from 'motion/react'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { NotFound } from '../../components/NotFound'
import { LoadingSpin } from '../../layouts/LoadingSpin'
import { EnumUserStatus, useGetFeaturePermissionAction, UserRole } from '../../service'
import { EnumPermissionFeatureName } from '../../services/permission/permission.params'
import { useGetPermissionOptions } from '../../services/permission/permission.query'
import { useGetUser, useGetUserPermissions } from '../../services/user/user.query'
import { IUserPermissionFormValues, UserPermissionForm } from './UserPermissionForm'

const roleColor: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: '#a855f7',
  [UserRole.ADMIN]: '#2563eb',
  [UserRole.USER]: '#64748b',
}

const PageManageUserDetail = () => {
  // const queryClient = useQueryClient()
  const query = useParams()

  const userId = query.userId || ''

  const { data: userResponse, isLoading: userLoading } = useGetUser(userId)

  const { data: permissionOptionsResponse, isLoading: permissionOptionsLoading } =
    useGetPermissionOptions({
      enabled: !!userId,
    })

  const { data: userPermissionsResponse, isLoading: userPermissionsLoading } =
    useGetUserPermissions(userId)

  // const { mutate: editUserPermission } = useMutation({
  //   mutationFn: async (param: { userId: string; role: UserRole }) => {
  //     await apiClient.put<IUser>(`/users/${param.userId}/permissions`, { role: param.role })
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['UserList'] })
  //   },
  // })

  const initialPermissionsValues = useMemo(() => {
    const userPermissions = keyBy(userPermissionsResponse?.permissions || [], 'featureName')
    const data: IUserPermissionFormValues = {
      permissions: (permissionOptionsResponse?.options || []).map((option) => ({
        featureName: option.featureName,
        action: { ...option.action, ...(userPermissions[option.featureName]?.action || {}) },
      })),
    }
    return data
  }, [userPermissionsResponse, permissionOptionsResponse])

  const { data: userPermissionAction } = useGetFeaturePermissionAction(
    EnumPermissionFeatureName.USER_PERMISSIONS
  )

  if (userLoading || permissionOptionsLoading || userPermissionsLoading) {
    return <LoadingSpin />
  }

  if (!userResponse || !userPermissionsResponse || !permissionOptionsResponse) {
    return <NotFound />
  }

  const { user } = userResponse

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar size={64} style={{ backgroundColor: roleColor[user.role] }} className="text-xl">
              {user.username.slice(0, 2).toUpperCase()}
            </Avatar>
            <div className="min-w-0 flex-1">
              <Typography.Title level={4} className="!mb-2 break-words">
                {user.username}
              </Typography.Title>
              <div className="flex flex-wrap gap-2">
                <Tag color={roleColor[user.role]} className="!rounded-full">
                  {pascalCase(user.role)}
                </Tag>
                <Tag
                  color={
                    user.status === EnumUserStatus.ACTIVE
                      ? 'green'
                      : user.status === EnumUserStatus.INACTIVE
                        ? 'default'
                        : 'error'
                  }
                  className="!rounded-full"
                >
                  {pascalCase(user.status)}
                </Tag>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {(userPermissionAction?.canRead || userPermissionAction?.canUpdate) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-3 flex items-center gap-2">
            <SafetyCertificateOutlined className="text-xl text-blue-600 dark:text-blue-400" />
            <Typography.Title level={4} className="!mb-0 !text-blue-600 dark:!text-blue-400">
              Permissions
            </Typography.Title>
          </div>
          <UserPermissionForm
            initialValues={initialPermissionsValues}
            userId={userId}
            disabled={!userPermissionAction?.canUpdate}
          />
        </motion.div>
      )}
    </div>
  )
}

export default PageManageUserDetail
