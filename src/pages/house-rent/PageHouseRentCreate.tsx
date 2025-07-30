import { message } from 'antd'
import { chain } from 'lodash'
import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { appPath } from '../../config/app-paths'
import { IHouseRentFormValues } from './house-rent-interface'
import { useCreateHouseRent } from './house-rent-service'
import { HouseRentForm } from './HouseRentForm'

export const PageHouseRentCreate = () => {
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
    return {
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
    }
  }, [])
  return (
    <HouseRentForm defaultValues={defaultValues} onSubmit={handleSubmit} isSubmitting={isPending} />
  )
}
