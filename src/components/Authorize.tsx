import { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import { appPath } from '../config/app-paths'
import { EnumFeatureName, useGetMeSuspense, usePermissionRouteAllow } from '../service'

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
  const actionAllowed = usePermissionRouteAllow(featureName, {
    requiredRead,
    requiredCreate,
    requiredUpdate,
    requiredDelete,
  })

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
