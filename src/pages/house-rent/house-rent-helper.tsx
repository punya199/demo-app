import { UploadFile } from 'antd'
import { round, sumBy } from 'lodash'
import { appConfig } from '../../config/app-config'
import {
  IElectricitySummaryData,
  IHouseRentDetailData,
  IHouseRentMemberData,
} from './house-rent-interface'
import { IHouseRentAttachmentData } from './house-rent-service'

export const mapAttachmentToUploadFile = (attachment: IHouseRentAttachmentData): UploadFile => {
  const isImage = attachment.mimeType.startsWith('image/')
  return {
    uid: attachment.id,
    name: attachment.fileName,
    type: attachment.mimeType,
    url: `${appConfig().VITE_API_DOMAIN}/attachments/${attachment.id}/file`,
    thumbUrl: isImage
      ? `${appConfig().VITE_API_DOMAIN}/attachments/${attachment.id}/file?thumbnail=true`
      : undefined,
  }
}

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
