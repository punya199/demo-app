import { generatePath } from '../utils/generate-path'

export const appPath = {
  home: generatePath('/home'),
  randomCard: generatePath('/random-card'),
  omamaGame: generatePath('/omama'),
  checkBillPage: generatePath('/check-bill'),
  checkBillPageCreate: generatePath('/check-bill/create'),
  checkBillPageEdit: generatePath<{ param: { billId: number } }>('/check-bill/edit/:billId'),
  checkBillPageSave: generatePath<{ param: { billId: number } }>('/check-bill/save-image/:billId'),
  login: generatePath('/login'),
  houseRent: generatePath('/house-rent'),
}
