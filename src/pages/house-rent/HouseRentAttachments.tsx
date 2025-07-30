import { Card, Form, Input, Typography } from 'antd'

import { AppUploadFiles } from '../../components/AppUploadFiles'
import { useGetMe } from '../../service'

export const HouseRentAttachments = () => {
  const { data: meData } = useGetMe()
  const isLoggedIn = !!meData?.user?.id

  return (
    <Card>
      <Typography.Title level={4}>แนบไฟล์รูปภาพ</Typography.Title>
      <Form.Item name="attachments" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="attachments">
        <AppUploadFiles disabled={!isLoggedIn} />
      </Form.Item>
    </Card>
  )
}
