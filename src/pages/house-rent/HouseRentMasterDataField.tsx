import { css } from '@emotion/react'
import { Card, Flex, Form, Grid, Input, Typography } from 'antd'
import { AppInputNumber } from '../../components/AppInputNumber'

export const HouseRentMasterDataField = () => {
  const { md } = Grid.useBreakpoint()
  return (
    <Card size={md ? 'default' : 'small'}>
      <Flex gap={16} vertical>
        <Typography.Text
          css={css`
            font-size: 1.2rem;
          `}
          strong
        >
          Master
        </Typography.Text>
        <div
          css={css`
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          `}
        >
          <Form.Item
            name="name"
            label="ชื่อรายการ"
            rules={[{ required: true, message: 'กรุณากรอกชื่อรายการ' }]}
            required
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="baseHouseRent"
            label="ค่าเช่าบ้านต่อเดือน"
            rules={[{ required: true, message: 'กรุณากรอกค่าเช่าบ้านต่อเดือน' }]}
            required
          >
            <AppInputNumber tabIndex={1} thousandSeparator="," allowNegative={false} min={0} />
          </Form.Item>
          <Form.Item
            name="paymentFee"
            label="ค่าธรรมเนียมการชำระต่อเดือน"
            rules={[{ required: true, message: 'กรุณากรอกค่าธรรมเนียมการชำระต่อเดือน' }]}
            required
          >
            <AppInputNumber tabIndex={1} thousandSeparator="," allowNegative={false} min={0} />
          </Form.Item>
          <Form.Item
            name={['internet', 'pricePerMonth']}
            label="ค่าอินเทอร์เน็ตต่อเดือน"
            rules={[{ required: true, message: 'กรุณากรอกค่าอินเทอร์เน็ตต่อเดือน' }]}
            required
          >
            <AppInputNumber tabIndex={1} thousandSeparator="," allowNegative={false} min={0} />
          </Form.Item>
          <Form.Item
            name={['airCondition', 'pricePerUnit']}
            label="ค่าแอร์ต่อตัว"
            rules={[{ required: true, message: 'กรุณากรอกค่าแอร์ต่อตัว' }]}
            required
          >
            <AppInputNumber tabIndex={1} thousandSeparator="," allowNegative={false} min={0} />
          </Form.Item>
          <Form.Item
            name={['airCondition', 'unit']}
            label="จำนวนแอร์"
            rules={[{ required: true, message: 'กรุณากรอกจำนวนแอร์' }]}
            required
          >
            <AppInputNumber tabIndex={1} thousandSeparator="," allowNegative={false} min={0} />
          </Form.Item>
        </div>
      </Flex>
    </Card>
  )
}
