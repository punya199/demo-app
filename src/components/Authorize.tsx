import { some } from 'lodash'
import { PropsWithChildren, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { appPath } from '../config/app-paths'
import { EnumFeatureName, useGetFeaturePermissionAction, useGetMeSuspense } from '../service'

interface IAuthorizeProps {
  featureName: EnumFeatureName
  requiredRead?: boolean
  requiredCreate?: boolean
  requiredUpdate?: boolean
  requiredDelete?: boolean
}
export const Authorize = (props: PropsWithChildren<IAuthorizeProps>) => {
  const { featureName, requiredRead, requiredCreate, requiredUpdate, requiredDelete } = props
  const { data: getMeResponse } = useGetMeSuspense()
  const isLoggedIn = !!getMeResponse?.user?.id
  const { data: permissionAction } = useGetFeaturePermissionAction(featureName)

  const actionAllowed = useMemo(() => {
    const _requiredRead = requiredRead || requiredCreate || requiredUpdate || requiredDelete
    if (_requiredRead) {
      const d = some([
        _requiredRead && permissionAction?.canRead,
        requiredCreate && permissionAction?.canCreate,
        requiredUpdate && permissionAction?.canUpdate,
        requiredDelete && permissionAction?.canDelete,
      ])

      return d
    }

    return true
  }, [permissionAction, requiredRead, requiredCreate, requiredUpdate, requiredDelete])

  if (!isLoggedIn) {
    return (
      <Navigate to={appPath.login()} state={{ message: 'กรุณาเข้าสู่ระบบก่อนเข้าถึงหน้านี้' }} />
    )
  }

  if (!actionAllowed) {
    return <Navigate to={appPath.home()} state={{ message: 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้' }} />
  }

  return props.children
}
