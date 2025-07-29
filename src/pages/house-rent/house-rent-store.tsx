import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  IHouseRentDetailData,
  IHouseRentFormValues,
  IHouseRentMemberData,
} from './house-rent-interface'

type IHouseRentStoreState = {
  data: IHouseRentFormValues
}

type IHouseRentStoreActions = {
  setData: (data: IHouseRentStoreState['data']) => void
  setRents: (rents: IHouseRentDetailData[]) => void
  setMembers: (members: IHouseRentMemberData[]) => void
  setElectricitySummary: (electricitySummary: IHouseRentFormValues['electricitySummary']) => void
}

export type IHouseRentStore = IHouseRentStoreState & IHouseRentStoreActions

export const useHouseRentStore = create<IHouseRentStore>()(
  persist(
    (set) => ({
      data: {
        name: '',
        rents: [],
        members: [],
        baseHouseRent: 0,
        paymentFee: 0,
        electricitySummary: {
          totalUnit: 0,
          totalPrice: 0,
          pricePerUnit: 0,
          shareUnit: 0,
        },
        internet: {
          pricePerMonth: 0,
        },
        airCondition: {
          pricePerUnit: 0,
          unit: 0,
        },
        attachments: [],
      },
      setData: (data) => set((state) => ({ ...state, data: { ...state.data, ...data } })),
      setRents: (rents) =>
        set((state) => ({
          ...state,
          data: { ...state.data, rents },
        })),
      setMembers: (members) =>
        set((state) => ({
          ...state,
          data: { ...state.data, members },
        })),
      setElectricitySummary: (electricitySummary) =>
        set((state) => ({
          ...state,
          data: { ...state.data, electricitySummary },
        })),
    }),
    {
      name: 'house-rent-storage',
    }
  )
)
