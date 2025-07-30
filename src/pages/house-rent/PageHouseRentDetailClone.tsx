import { message, Spin } from 'antd'
import { chain } from 'lodash'
import { useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { appPath } from '../../config/app-paths'
import { calculateElectricitySummary } from './house-rent-helper'
import { IHouseRentFormValues } from './house-rent-interface'
import { useCreateHouseRent, useGetHouseRent } from './house-rent-service'
import { HouseRentForm } from './HouseRentForm'

export const PageHouseRentDetailClone = () => {
  const { houseRentId } = useParams<{ houseRentId: string }>()
  const { data: houseRentData, isLoading } = useGetHouseRent(houseRentId)

  const { mutate: saveHouseRent, isPending } = useCreateHouseRent()
  const navigate = useNavigate()

  const handleSubmit = useCallback(
    (data: IHouseRentFormValues) => {
      const attachmentIds = chain(data.attachments)
        .map((attachment) => attachment.uid)
        .compact()
        .value()
      saveHouseRent(
        {
          ...data,
          attachmentIds,
        },
        {
          onSuccess: () => {
            message.success('บันทึกข้อมูลสำเร็จ')
            navigate(appPath.houseRent(), {
              replace: true,
            })
          },
        }
      )
    },
    [saveHouseRent, navigate]
  )

  const defaultValues = useMemo((): IHouseRentFormValues | undefined => {
    if (!houseRentData) return undefined
    return {
      ...houseRentData.houseRent,
      name: '',
      electricitySummary: calculateElectricitySummary(
        houseRentData.houseRent.rents,
        houseRentData.houseRent.members
      ),
      attachments: [],
    }
  }, [houseRentData])
  return (
    <>
      {isLoading ? (
        <Spin />
      ) : (
        <HouseRentForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
        />
      )}
    </>
  )
}
