export enum EnumPermissionFeatureName {
  HOUSE_RENT = 'house_rent',
  BILL = 'bill',
  USER = 'user',
  USER_PERMISSIONS = 'user_permissions',
}

export interface IPermissionAction {
  canRead: boolean
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
}

export interface IPermissionOption {
  featureName: EnumPermissionFeatureName
  action: IPermissionAction
}

export interface IPermissionOptionResponse {
  options: IPermissionOption[]
}
