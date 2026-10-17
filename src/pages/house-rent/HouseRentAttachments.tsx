import { Card, Col, Form, Grid, Row, Select, Typography } from 'antd'
import dayjs from 'dayjs'
import { useState } from 'react'

import { AppUploadFiles } from '../../components/AppUploadFiles'
import { IHouseRentFormValues } from './house-rent-interface'

const monthLabel = (month: unknown) => dayjs(month as string).format('MM/YYYY')

// Upload section: house-level files + files of one month at a time.
export const HouseRentAttachments = () => {
  const { md } = Grid.useBreakpoint()
  const form = Form.useFormInstance<IHouseRentFormValues>()
  const rents = Form.useWatch('rents', form)
  const [rentId, setRentId] = useState<string>()

  const rentIndex = rents?.findIndex((rent) => rent.id === rentId) ?? -1

  return (
    <Card size={md ? 'default' : 'small'}>
      <Typography.Title level={4}>อัปโหลดไฟล์รูปภาพ/เอกสาร PDF</Typography.Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Typography.Text strong>ทั่วไป</Typography.Text>
          <Form.Item name="attachments">
            <AppUploadFiles />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Typography.Text strong>รายเดือน</Typography.Text>
          <Select
            className="w-full"
            placeholder="เลือกเดือน"
            value={rentIndex >= 0 ? rentId : undefined}
            onChange={setRentId}
            options={rents?.map((rent) => ({ value: rent.id, label: monthLabel(rent.month) }))}
          />
          {rentIndex >= 0 && (
            <Form.Item name={['rents', rentIndex, 'files']} className="mt-2">
              <AppUploadFiles />
            </Form.Item>
          )}
        </Col>
      </Row>
    </Card>
  )
}
