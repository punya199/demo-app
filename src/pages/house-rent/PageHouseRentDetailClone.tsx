import { Empty, message } from 'antd'
import { chain } from 'lodash'
import { useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { appPath } from '../../config/app-paths'
import { LoadingSpin } from '../../layouts/LoadingSpin'
import { useGetFeaturePermissionAction } from '../../service'
import { EnumPermissionFeatureName } from '../../services/permission/permission.params'
import { calculateElectricitySummary } from './house-rent-helper'
import { IHouseRentFormValues } from './house-rent-interface'
import { useCreateHouseRent, useGetHouseRent } from './house-rent-service'
import { HouseRentForm } from './HouseRentForm'

export const PageHouseRentDetailClone = () => {
  const { houseRentId } = useParams<{ houseRentId: string }>()
  const { data: houseRentData, isLoading } = useGetHouseRent(houseRentId)
  const navigate = useNavigate()

  const { mutate: saveHouseRent, isPending } = useCreateHouseRent()
  const { data: permissionAction } = useGetFeaturePermissionAction(
    EnumPermissionFeatureName.HOUSE_RENT
  )

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
          onSuccess: (response) => {
            message.success('บันทึกข้อมูลสำเร็จ')
            navigate(appPath.houseRentDetail({ param: { houseRentId: response.houseRent.id } }), {
              replace: true,
            })
          },
          onError: () => {
            message.error('บันทึกข้อมูลไม่สำเร็จ')
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

  if (isLoading) {
    return <LoadingSpin />
  }
  if (!defaultValues) {
    return <Empty description="ไม่พบข้อมูล" />
  }

  return (
    <HouseRentForm
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
      viewMode={!permissionAction?.canCreate}
    />
  )
}
