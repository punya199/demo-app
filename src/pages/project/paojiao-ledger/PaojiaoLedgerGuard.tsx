import { PropsWithChildren } from 'react'
import Pnotfound from '../../../layouts/Pnotfound'
import { useGetMeSuspense } from '../../../service'
import { LEDGER_ALLOWED_USERNAMES } from './ledger-access'

// This ledger is one specific family member's private data, not a role-level feature -
// it's locked to specific usernames regardless of role. Anyone else gets a plain 404,
// not a "no permission" message, so the route doesn't even reveal that it exists.
export const PaojiaoLedgerGuard = ({ children }: PropsWithChildren) => {
  const { data } = useGetMeSuspense()
  const user = data?.user
  const isAllowed = !!user?.username && LEDGER_ALLOWED_USERNAMES.includes(user.username)

  if (!isAllowed) {
    return <Pnotfound />
  }

  return <>{children}</>
}
