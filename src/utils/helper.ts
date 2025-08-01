import { roleLevels, UserRole } from '../service'

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
export const checkRole = (requireRole: UserRole, userRole?: UserRole) => {
  if (!userRole) {
    return false
  }
  const userRoleIndex = roleLevels.indexOf(userRole)
  const requireRoleIndex = roleLevels.indexOf(requireRole)

  return userRoleIndex >= requireRoleIndex
}
