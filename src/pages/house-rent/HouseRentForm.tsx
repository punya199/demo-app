import { SaveOutlined } from '@ant-design/icons'
import { css } from '@emotion/react'
import { Button, Col, Divider, Flex, Form, Grid, Row } from 'antd'
import { keyBy } from 'lodash'
import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useGetMe } from '../../service'
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

const useHouseRentStore = create<IHouseRentStore>()(
  persist(
    (set) => ({
      data: {
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
      },
      setData: (data) => set((state) => ({ ...state, data: { ...state.data, ...data } })),
      setRents: (rents) =>
        set((state) => ({
          ...state,
          data: { ...state.data, rents },
        })),
      setMembers: (members) =>
        set((state) => ({
          ...state,
          data: { ...state.data, members },
        })),
      setElectricitySummary: (electricitySummary) =>
        set((state) => ({
          ...state,
          data: { ...state.data, electricitySummary },
        })),
    }),
    {
      name: 'house-rent-storage',
    }
  )
)

interface IHouseRentFormProps {
  defaultValues?: IHouseRentFormValues
  onSubmit: (data: IHouseRentFormValues) => void
  isSubmitting?: boolean
}
export const HouseRentForm = (props: IHouseRentFormProps) => {
  const { defaultValues, onSubmit, isSubmitting } = props
  const navigate = useNavigate()
  const { data: getMeData } = useGetMe()
  const isLoggedIn = !!getMeData?.user?.id
  const { data, setData, setElectricitySummary } = useHouseRentStore()
  const { md } = Grid.useBreakpoint()
  const [form] = Form.useForm()

  useEffect(() => {
    if (defaultValues) {
      setData(defaultValues)
    }
  }, [defaultValues, setData])

  useEffect(() => {
    if (data) {
      form.setFieldsValue(data)
    }
  }, [data, form])

  useEffect(() => {
    const electricitySummary = calculateElectricitySummary(data.rents, data.members)
    setElectricitySummary(electricitySummary)
  }, [data.rents, data.members, setElectricitySummary])

  const onValuesChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_: any, data: IHouseRentFormValues) => {
      const rentsHash = keyBy(data.rents, 'id')
      setData({
        ...data,
        members: (data.members || []).map((member) => ({
          ...member,
          payInternetMonthIds: (member.payInternetMonthIds || []).filter((id) => !!rentsHash[id]),
          payElectricityMonthIds: (member.payElectricityMonthIds || []).filter(
            (id) => !!rentsHash[id]
          ),
        })),
      })
    },
    [setData]
  )

  const handleSubmit = useCallback(async () => {
    await form.validateFields()
    if (isLoggedIn) {
      onSubmit?.(data)
    }
  }, [data, form, onSubmit, isLoggedIn])

  return (
    <div
      className="space-y-4 py-6 md:p-4"
      css={css`
        background-color: #585858;
        height: 100%;
      `}
    >
      <Form
        form={form}
        onValuesChange={onValuesChange}
        onFinish={handleSubmit}
        size={md ? 'large' : 'small'}
        layout="vertical"
        scrollToFirstError
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <HouseRentMasterDataField />
          </Col>
          <Col xs={24} md={16}>
            <Form.Item name="rents" noStyle>
              <HouseRentDetailTableField />
            </Form.Item>
          </Col>
          <Col xs={24} md={24}>
            <Form.Item name="members" noStyle>
              <HouseRentMemberTableField summary={data.electricitySummary} />
            </Form.Item>
          </Col>

          <Col xs={24} md={24}>
            <HouseRentAttachments />
          </Col>

          <Divider />
          <Col xs={24} md={24}>
            <HouseRentReportSummary data={data} />
          </Col>
          <Col span={24}>
            <Flex
              justify="space-between"
              gap={8}
              css={css`
                background-color: #fff;
                padding: 16px;
                border-radius: 8px;
              `}
            >
              <Button type="default" htmlType="button" onClick={() => navigate(-1)}>
                {defaultValues?.id ? 'ย้อนกลับ' : 'ยกเลิก'}
              </Button>
              <div>
                {isLoggedIn && (
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
          </Col>
        </Row>
      </Form>
    </div>
  )
}
