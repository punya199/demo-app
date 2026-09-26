import { Card, Form, Grid, Input, Typography } from 'antd'

import { AppUploadFiles } from '../../components/AppUploadFiles'

interface IHouseRentAttachmentsProps {
  viewMode?: boolean
}

export const HouseRentAttachments = (props: IHouseRentAttachmentsProps) => {
  const { viewMode } = props
  const { md } = Grid.useBreakpoint()

  return (
    <Card size={md ? 'default' : 'small'}>
      <Typography.Title level={4}>แนบไฟล์รูปภาพ/เอกสาร PDF</Typography.Title>
      <Form.Item name="attachments" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="attachments">
        <AppUploadFiles disabled={viewMode} />
      </Form.Item>
    </Card>
  )
}
