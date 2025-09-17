import { Divider, Flex, Tag, Typography } from 'antd'
import { pascalCase } from 'change-case'
import { keyBy } from 'lodash'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { NotFound } from '../../components/NotFound'
import { LoadingSpin } from '../../layouts/LoadingSpin'
import { EnumUserStatus, useGetFeaturePermissionAction } from '../../service'
import { EnumPermissionFeatureName } from '../../services/permission/permission.params'
import { useGetPermissionOptions } from '../../services/permission/permission.query'
import { useGetUser, useGetUserPermissions } from '../../services/user/user.query'
import { IUserPermissionFormValues, UserPermissionForm } from './UserPermissionForm'

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
    <div>
      <Flex vertical>
        <div>
          <Typography.Title level={4}>{user.username}</Typography.Title>
        </div>
        <div>
          <Typography.Title level={4}>{user.role}</Typography.Title>
        </div>
        <div>
          <Typography.Title level={4}>
            <Tag
              color={
                user.status === EnumUserStatus.ACTIVE
                  ? 'green'
                  : user.status === EnumUserStatus.INACTIVE
                    ? 'default'
                    : 'error'
              }
            >
              {pascalCase(user.status)}
            </Tag>
          </Typography.Title>
        </div>
      </Flex>
      <Divider />
      {(userPermissionAction?.canRead || userPermissionAction?.canUpdate) && (
        <Flex vertical>
          <Typography.Title level={4}>Permissions</Typography.Title>
          <UserPermissionForm
            initialValues={initialPermissionsValues}
            userId={userId}
            disabled={!userPermissionAction?.canUpdate}
          />
        </Flex>
      )}
    </div>
  )
}

export default PageManageUserDetail
