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
