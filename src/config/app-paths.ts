import { generatePath } from '../utils/generate-path'

// Exported so route-matching code (e.g. RootLayout deciding when to hide authenticated chrome)
// can check against the same pattern appPath.voteBySlug builds its URLs from, instead of
// duplicating the '/vote/' literal.
export const VOTE_ROUTE_TEMPLATE = '/vote/:slug'

export const appPath = {
  home: generatePath('/'),
  randomCard: generatePath('/random-card'),
  omamaGame: generatePath('/omama'),
  checkBillPage: generatePath('/check-bill'),
  checkBillPageCreate: generatePath('/check-bill/create'),
  checkBillPageEdit: generatePath<{ param: { billId: number } }>('/check-bill/:billId/edit'),
  checkBillPageSave: generatePath<{ param: { billId: number } }>('/check-bill/:billId/view'),
  login: generatePath('/login'),
  register: generatePath('/register'),
  houseRent: generatePath('/house-rent'),
  houseRentCreate: generatePath('/house-rent/create'),
  houseRentOverview: generatePath('/house-rent/overview'),
  houseRentUserDetail: generatePath<{ param: { userId: string } }>('/house-rent/users/:userId'),
  houseRentDetail: generatePath<{ param: { houseRentId: string } }>('/house-rent/:houseRentId'),
  houseRentDetailClone: generatePath<{ param: { houseRentId: string } }>(
    '/house-rent/:houseRentId/clone'
  ),
  houseRentSummary: generatePath<{ param: { houseRentId: string } }>(
    '/house-rent/:houseRentId/summary'
  ),
  manageUser: generatePath('/manage-user'),
  manageUserDetail: generatePath<{ param: { userId: string } }>('/manage-user/:userId'),
  paojiaoLedgerEntries: generatePath('/paojiao-ledger/entries'),
  paojiaoLedgerSummary: generatePath('/paojiao-ledger/summary'),
  paojiaoLedgerShare: generatePath('/paojiao-ledger/share'),
  paojiaoLedgerWages: generatePath('/paojiao-ledger/wages'),
  voting: generatePath('/voting'),
  votingCreate: generatePath('/voting/create'),
  votingEdit: generatePath<{ param: { pollId: string } }>('/voting/:pollId/edit'),
  voteBySlug: generatePath<{ param: { slug: string } }>(VOTE_ROUTE_TEMPLATE),
}
