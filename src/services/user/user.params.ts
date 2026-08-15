import { EnumUserStatus, UserRole } from '../../service'
import { EnumPermissionFeatureName, IPermissionAction } from '../permission/permission.params'

interface IEditPermissionData {
  featureName: EnumPermissionFeatureName
  action: IPermissionAction
}

export interface IEditUserPermissionsParams {
  permissions: IEditPermissionData[]
}

export interface IGetUserPermissionsResponse {
  permissions: IEditPermissionData[]
}

export interface IChangePasswordParams {
  currentPassword: string
  newPassword: string
}

export interface IEditUserParams {
  role: UserRole
  status: EnumUserStatus
}
