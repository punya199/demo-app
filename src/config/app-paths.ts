import { generatePath } from '../utils/generate-path'

export const appPath = {
  home: generatePath('/home'),
  randomCard: generatePath('/random-card'),
  omamaGame: generatePath('/omama'),
  checkBillPage: generatePath('/check-bill'),
  checkBillPageCreate: generatePath('/check-bill/create'),
  checkBillPageEdit: generatePath<{ param: { billId: number } }>('/check-bill/:billId/edit'),
  checkBillPageSave: generatePath<{ param: { billId: number } }>('/check-bill/:billId/view'),
  login: generatePath('/login'),
  houseRent: generatePath('/house-rent'),
  houseRentCreate: generatePath('/house-rent/create'),
  houseRentDetail: generatePath<{ param: { houseRentId: string } }>('/house-rent/:houseRentId'),
  houseRentDetailClone: generatePath<{ param: { houseRentId: string } }>(
    '/house-rent/:houseRentId/clone'
  ),
}
