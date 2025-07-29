import { round, sumBy } from 'lodash'
import {
  IElectricitySummaryData,
  IHouseRentDetailData,
  IHouseRentPeopleData,
} from './house-rent-interface'

export const calculateElectricitySummary = (
  rents: IHouseRentDetailData[],
  people: IHouseRentPeopleData[]
): IElectricitySummaryData => {
  const totalUnit = sumBy(rents, 'electricity.unit')
  const totalPrice = sumBy(rents, 'electricity.totalPrice')
  const pricePerUnit = round(totalPrice / totalUnit, 2)
  const totalPeopleUnit = sumBy(people, 'electricityUnit.diff')
  const shareUnit = totalUnit - totalPeopleUnit
  return {
    totalUnit,
    totalPrice,
    pricePerUnit,
    shareUnit,
  }
}
