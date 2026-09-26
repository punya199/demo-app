import { message } from 'antd'
import { chain } from 'lodash'
import { useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { NotFound } from '../../components/NotFound'
import { LoadingSpin } from '../../layouts/LoadingSpin'
import { useGetFeaturePermissionAction } from '../../service'
import { EnumPermissionFeatureName } from '../../services/permission/permission.params'
import { calculateElectricitySummary, mapAttachmentToUploadFile } from './house-rent-helper'
import { IHouseRentFormValues } from './house-rent-interface'
import { useGetHouseRent, useUpdateHouseRent } from './house-rent-service'
import { HouseRentForm } from './HouseRentForm'

export const PageHouseRentDetail = () => {
  const { houseRentId } = useParams<{ houseRentId: string }>()
  const { data: houseRentData, isLoading } = useGetHouseRent(houseRentId)

  const { mutate: saveHouseRent, isPending } = useUpdateHouseRent(houseRentId)
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
          onSuccess: () => {
            message.success('บันทึกข้อมูลสำเร็จ')
          },
          onError: () => {
            message.error('บันทึกข้อมูลไม่สำเร็จ')
          },
        }
      )
    },
    [saveHouseRent]
  )

  const defaultValues = useMemo((): IHouseRentFormValues | undefined => {
    if (!houseRentData) return undefined
    return {
      ...houseRentData.houseRent,
      electricitySummary: calculateElectricitySummary(
        houseRentData.houseRent.rents,
        houseRentData.houseRent.members
      ),
      attachments: houseRentData.houseRent.attachments.map(mapAttachmentToUploadFile),
    }
  }, [houseRentData])

  if (isLoading) {
    return <LoadingSpin />
  }

  if (!defaultValues) {
    return <NotFound />
  }

  return (
    <HouseRentForm
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
      viewMode={!permissionAction?.canUpdate}
    />
  )
}
