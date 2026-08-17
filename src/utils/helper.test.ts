import { describe, expect, it } from 'vitest'
import { UserRole } from '../service'
import { checkRole } from './helper'

describe('checkRole', () => {
  it('returns false when the user has no role', () => {
    expect(checkRole(UserRole.USER, undefined)).toBe(false)
  })

  it('returns true when the user role matches the required role', () => {
    expect(checkRole(UserRole.USER, UserRole.USER)).toBe(true)
  })

  it('returns false when the user role is below the required role', () => {
    expect(checkRole(UserRole.ADMIN, UserRole.USER)).toBe(false)
  })

  it('returns true when the user role is above the required role', () => {
    expect(checkRole(UserRole.USER, UserRole.SUPER_ADMIN)).toBe(true)
  })

  it('returns false when a super admin requirement is checked against an admin', () => {
    expect(checkRole(UserRole.SUPER_ADMIN, UserRole.ADMIN)).toBe(false)
  })
})
