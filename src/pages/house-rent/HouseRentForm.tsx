/* eslint-disable react-hooks/exhaustive-deps */
import { SaveOutlined } from '@ant-design/icons'
import { css } from '@emotion/react'
import { Button, Col, Divider, Flex, Form, Grid, Input, Row } from 'antd'
import { keyBy } from 'lodash'
import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { calculateElectricitySummary } from './house-rent-helper'
import {
  IHouseRentDetailData,
  IHouseRentFormValues,
  IHouseRentMemberData,
} from './house-rent-interface'
import { HouseRentAttachments } from './HouseRentAttachments'
import { HouseRentDetailTableField } from './HouseRentDetailTableField'
import { HouseRentMasterDataField } from './HouseRentMasterDataField'
import { HouseRentMemberTableField } from './HouseRentMemberTableField'
import { HouseRentReportSummary } from './HouseRentReportSummary'

type IHouseRentStoreState = {
  data: IHouseRentFormValues
}

type IHouseRentStoreActions = {
  setData: (data: IHouseRentStoreState['data']) => void
  setRents: (rents: IHouseRentDetailData[]) => void
  setMembers: (members: IHouseRentMemberData[]) => void
  setElectricitySummary: (electricitySummary: IHouseRentFormValues['electricitySummary']) => void
}

export type IHouseRentStore = IHouseRentStoreState & IHouseRentStoreActions

// const useHouseRentStore = create<IHouseRentStore>()(
//   persist(
//     (set) => ({
//       data: {
//         name: '',
//         rents: [],
//         members: [],
//         baseHouseRent: 0,
//         paymentFee: 0,
//         electricitySummary: {
//           totalUnit: 0,
//           totalPrice: 0,
//           pricePerUnit: 0,
//           shareUnit: 0,
//         },
//         internet: {
//           pricePerMonth: 0,
//         },
//         airCondition: {
//           pricePerUnit: 0,
//           unit: 0,
//         },
//         attachments: [],
//       },
//       setData: (data) => set((state) => ({ ...state, data: { ...state.data, ...data } })),
//       setRents: (rents) =>
//         set((state) => ({
//           ...state,
//           data: { ...state.data, rents },
//         })),
//       setMembers: (members) =>
//         set((state) => ({
//           ...state,
//           data: { ...state.data, members },
//         })),
//       setElectricitySummary: (electricitySummary) =>
//         set((state) => ({
//           ...state,
//           data: { ...state.data, electricitySummary },
//         })),
//     }),
//     {
//       name: 'house-rent-storage',
//     }
//   )
// )

interface IHouseRentFormProps {
  defaultValues?: IHouseRentFormValues
  onSubmit: (data: IHouseRentFormValues) => void
  isSubmitting?: boolean
  viewMode?: boolean
}
export const HouseRentForm = (props: IHouseRentFormProps) => {
  const { defaultValues: rawDefaultValues, onSubmit, isSubmitting, viewMode } = props
  const navigate = useNavigate()

  // const { data, setData, setElectricitySummary } = useHouseRentStore()
  const { md } = Grid.useBreakpoint()
  const [form] = Form.useForm()
  const electricitySummary = Form.useWatch('electricitySummary', form)

  const defaultValues = useMemo(() => {
    const electricitySummary = calculateElectricitySummary(
      rawDefaultValues?.rents || [],
      rawDefaultValues?.members || []
    )
    return {
      ...rawDefaultValues,
      electricitySummary,
      baseHouseRent: +(rawDefaultValues?.baseHouseRent || 0),
      paymentFee: +(rawDefaultValues?.paymentFee || 0),
      internet: {
        ...rawDefaultValues?.internet,
        pricePerMonth: +(rawDefaultValues?.internet?.pricePerMonth || 0),
      },
      airCondition: {
        ...rawDefaultValues?.airCondition,
        pricePerUnit: +(rawDefaultValues?.airCondition?.pricePerUnit || 0),
        unit: +(rawDefaultValues?.airCondition?.unit || 0),
      },
    }
  }, [])

  const onValuesChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_: any, data: IHouseRentFormValues) => {
      const rentsHash = keyBy(data.rents, 'id')
      const electricitySummary = calculateElectricitySummary(data?.rents || [], data?.members || [])
      form.setFieldValue('electricitySummary', electricitySummary)
      const newMembers = (data.members || []).map((member) => ({
        ...member,
        payInternetMonthIds: (member.payInternetMonthIds || []).filter((id) => !!rentsHash[id]),
        payElectricityMonthIds: (member.payElectricityMonthIds || []).filter(
          (id) => !!rentsHash[id]
        ),
      }))
      form.setFieldValue('members', newMembers)
    },
    []
  )

  const handleSubmit = useCallback(
    async (values: IHouseRentFormValues) => {
      await form.validateFields()
      if (!viewMode) {
        onSubmit?.(values)
      }
    },
    [form, onSubmit, viewMode]
  )

  return (
    <Form
      form={form}
      onValuesChange={onValuesChange}
      onFinish={handleSubmit}
      initialValues={defaultValues}
      size={md ? 'large' : 'small'}
      layout="vertical"
      disabled={viewMode}
      scrollToFirstError
    >
      <div
        css={css`
          position: relative;
        `}
      >
        <div
          className="space-y-4 py-6 md:p-4"
          css={css`
            background-color: #585858;
            height: 100%;
          `}
        >
          <Row gutter={[16, 16]}>
            {/* keep value */}
            <Form.Item name="id" noStyle hidden>
              <Input />
            </Form.Item>
            <Form.Item name="electricitySummary" noStyle hidden>
              <Input />
            </Form.Item>
            <Form.Item name="attachments" noStyle hidden>
              <Input />
            </Form.Item>

            {/* keep value */}

            <Col xs={24} md={8}>
              <HouseRentMasterDataField />
            </Col>
            <Col xs={24} md={16}>
              <Form.Item name="rents" noStyle>
                <HouseRentDetailTableField viewMode={viewMode} />
              </Form.Item>
            </Col>
            <Col xs={24} md={24}>
              <Form.Item name="members" noStyle>
                <HouseRentMemberTableField summary={electricitySummary} viewMode={viewMode} />
              </Form.Item>
            </Col>

            <Col xs={24} md={24}>
              <HouseRentAttachments viewMode={viewMode} />
            </Col>

            <Divider />
            <Col xs={24} md={24}>
              <HouseRentReportSummary />
            </Col>
          </Row>
        </div>
        <div
          css={css`
            position: sticky;
            bottom: 0;
            left: 0;
            width: 100%;
            z-index: 1000;
            background-color: #fff;
          `}
        >
          <Flex
            justify="space-between"
            gap={8}
            css={css`
              background-color: #fff;
              padding: 16px;
              border-radius: 8px;
            `}
          >
            <Button type="default" htmlType="button" onClick={() => navigate(-1)} disabled={false}>
              {defaultValues?.id ? 'ย้อนกลับ' : 'ยกเลิก'}
            </Button>
            <div>
              {!viewMode && (
                <Button
                  variant="solid"
                  color="green"
                  htmlType="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  icon={<SaveOutlined />}
                >
                  บันทึก
                </Button>
              )}
            </div>
          </Flex>
        </div>
      </div>
    </Form>
  )
}
