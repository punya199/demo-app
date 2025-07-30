import { UploadFile } from 'antd'
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
  houseRentPrice: number // ค่าเช่าบ้าน
  waterPrice: number // ค่าน้ำ
  electricity: {
    totalPrice: number
    unit: number
  }
}

export interface IHouseRentMemberData {
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
export interface ISaveHouseRentParams {
  id?: string
  name: string
  rents: IHouseRentDetailData[]
  members: IHouseRentMemberData[]
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
  attachmentIds: string[]
}
export interface IHouseRentFormValues extends Omit<ISaveHouseRentParams, 'attachmentIds'> {
  attachments: UploadFile[]
}
