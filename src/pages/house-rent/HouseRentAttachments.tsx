import { Card, Form, Input, Typography } from 'antd'

import { AppUploadFiles } from '../../components/AppUploadFiles'

interface IHouseRentAttachmentsProps {
  viewMode?: boolean
}

export const HouseRentAttachments = (props: IHouseRentAttachmentsProps) => {
  const { viewMode } = props

  return (
    <Card>
      <Typography.Title level={4}>แนบไฟล์รูปภาพ</Typography.Title>
      <Form.Item name="attachments" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="attachments">
        <AppUploadFiles disabled={viewMode} />
      </Form.Item>
    </Card>
  )
}
