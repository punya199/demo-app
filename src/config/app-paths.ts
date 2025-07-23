import { generatePath } from '../utils/generate-path'

export const appPath = {
  home: generatePath('/home'),
  randomCard: generatePath('/random-card'),
  omamaGame: generatePath('/omama'),
  checkBillPage: generatePath('/check-bill'),
  checkBillPageCreate: generatePath('/check-bill/create'),
  checkBillPageEdit: generatePath<{ param: { billId: number } }>('/check-bill/:billId'),

  login: generatePath('/login'),
}
