import { round, sumBy } from 'lodash'
import {
  IElectricitySummaryData,
  IHouseRentDetailData,
  IHouseRentMemberData,
} from './house-rent-interface'

export const calculateElectricitySummary = (
  rents: IHouseRentDetailData[],
  members: IHouseRentMemberData[]
): IElectricitySummaryData => {
  const totalUnit = sumBy(rents, 'electricity.unit')
  const totalPrice = sumBy(rents, 'electricity.totalPrice')
  const pricePerUnit = round(totalPrice / totalUnit, 2)
  const totalMemberUnit = sumBy(members, 'electricityUnit.diff')
  const shareUnit = totalUnit - totalMemberUnit
  return {
    totalUnit,
    totalPrice,
    pricePerUnit,
    shareUnit,
  }
}
