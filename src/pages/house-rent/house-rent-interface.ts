import { Dayjs } from 'dayjs'

export interface IElectricitySummaryData {
  totalUnit: number
  totalPrice: number
  pricePerUnit: number
  shareUnit: number
}

export interface IHouseRentDetailData {
  id: string
  month: Dayjs
  houseRent: number // ค่าเช่าบ้าน
  waterPrice: number // ค่าน้ำ
  electricity: {
    totalPrice: number
    unit: number
  }
}

export interface IHouseRentPeopleData {
  id: string
  name: string
  airConditionUnit: number
  electricityUnit: {
    prev: number
    current: number
    diff: number
  }
  payInternetMonthIds?: string[]
  payElectricityMonthIds?: string[]
}

export interface IHouseRentFormValues {
  id?: string
  name: string
  rents: IHouseRentDetailData[]
  people: IHouseRentPeopleData[]
  electricitySummary: IElectricitySummaryData
  baseHouseRent: number
  paymentFee: number
  internet: {
    pricePerMonth: number
  }
  airCondition: {
    pricePerUnit: number
    unit: number
  }
}
