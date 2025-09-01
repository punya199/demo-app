import { css } from '@emotion/react'
import { Flex, Form, Grid, Typography } from 'antd'
import Table, { ColumnType } from 'antd/es/table'
import { chain, filter, keyBy, round, sumBy } from 'lodash'
import { useMemo } from 'react'
import { AppInputNumber } from '../../components/AppInputNumber'
import { IHouseRentFormValues } from './house-rent-interface'
import { useGetUserOptions } from './house-rent-service'

const renderNumber = (value: number | undefined) => {
  if (!value) return '-'
  return <AppInputNumber value={value} displayType="text" thousandSeparator />
}

interface IHouseRentReportSummaryData {
  id?: string
  name: string
  houseRent: number
  airCondition: number
  internet: number
  water: number
  electricity: number
  electricityShare: number
  paymentFee: number
  total: number
  totalAfterDeduct: number
  totalSeparate: number
  deductInternet?: number
  deductElectricity?: number
  finalPayment: number
}

export const HouseRentReportSummary = () => {
  const form = Form.useFormInstance<IHouseRentFormValues>()
  const members = Form.useWatch('members', form)
  const rents = Form.useWatch('rents', form)
  const electricitySummary = Form.useWatch('electricitySummary', form)
  const baseHouseRent = Form.useWatch('baseHouseRent', form)
  const internetData = Form.useWatch('internet', form)
  const airConditionData = Form.useWatch('airCondition', form)
  const paymentFeeData = Form.useWatch('paymentFee', form)

  const { md } = Grid.useBreakpoint()

  const { data: userOptions } = useGetUserOptions()

  const userOptionsHash = useMemo(() => {
    return keyBy(userOptions?.options, 'value')
  }, [userOptions?.options])

  const columns = useMemo((): ColumnType<IHouseRentReportSummaryData>[] => {
    return [
      {
        title: 'ชื่อ',
        dataIndex: 'name',
        align: 'center',
        width: 100,
        fixed: 'left',
        render: (value) => {
          return (
            <Flex>
              <Typography.Text>{value}</Typography.Text>
            </Flex>
          )
        },
      },
      {
        title: 'ค่าเช่า',
        dataIndex: 'houseRent',
        align: 'right',
        width: 100,
        render: renderNumber,
      },
      {
        title: 'ค่าติดแอร์',
        dataIndex: 'airCondition',
        align: 'right',
        width: 100,
        render: renderNumber,
      },
      {
        title: 'ค่าอินเทอร์เน็ต',
        dataIndex: 'internet',
        align: 'right',
        width: 100,
        render: renderNumber,
      },
      {
        title: 'ค่าน้ำ',
        dataIndex: 'water',
        align: 'right',
        width: 100,
        render: renderNumber,
      },
      {
        title: 'ค่าไฟแยก',
        dataIndex: 'electricity',
        align: 'right',
        width: 100,
        render: renderNumber,
      },
      {
        title: 'ค่าไฟส่วนรวม',
        dataIndex: 'electricityShare',
        align: 'right',
        width: 100,
        render: renderNumber,
      },
      {
        title: 'ค่าธรรมเนียม',
        dataIndex: 'paymentFee',
        align: 'right',
        width: 100,
        render: renderNumber,
      },
      {
        title: 'รวม',
        dataIndex: 'total',
        align: 'right',
        width: 100,
        render: renderNumber,
      },
      {
        title: 'หักค่าอินเทอร์เน็ต',
        dataIndex: 'deductInternet',
        align: 'right',
        width: 100,
        render: renderNumber,
      },
      {
        title: 'หักจ่ายค่าไฟ',
        dataIndex: 'deductElectricity',
        align: 'right',
        width: 100,
        render: renderNumber,
      },
      {
        title: 'รวมหลังหักค่าใช้จ่าย',
        dataIndex: 'totalAfterDeduct',
        align: 'right',
        width: 100,
        render: renderNumber,
      },
      {
        title: 'รวม แบ่งจ่ายต่อเดือน',
        dataIndex: 'totalSeparate',
        align: 'right',
        width: 100,
        render: renderNumber,
      },
    ]
  }, [])

  const dataSource = useMemo(() => {
    const totalMonth = rents?.length || 0
    const totalMember = members?.length || 0

    // house rent
    const houseRent = round((baseHouseRent * totalMonth) / totalMember, 0)

    // internet
    const totalInternetPrice = round((internetData?.pricePerMonth || 0) * totalMonth, 0)
    const internet = round(totalInternetPrice / totalMember, 0)

    // water
    const totalWaterPrice = sumBy(rents, 'waterPrice')
    const water = round(totalWaterPrice / totalMember, 0)

    // electricity share
    const electricityShareTotalPrice = round(
      (electricitySummary?.shareUnit || 0) * (electricitySummary?.pricePerUnit || 0),
      0
    )
    const electricityShare = round(electricityShareTotalPrice / totalMember, 0)

    // payment fee
    const paymentFee = round((paymentFeeData * totalMonth) / totalMember, 0)

    const rentsHash = keyBy(rents, 'id')

    return chain(members || [])
      .reduce((acc: IHouseRentReportSummaryData[], member) => {
        // air condition
        const airCondition = round(
          (airConditionData?.pricePerUnit || 0) * member.airConditionUnit * totalMonth,
          0
        )

        // electricity
        const electricity = round(
          member.electricityUnit.diff * electricitySummary?.pricePerUnit || 0,
          0
        )

        // debuct
        const deductInternet =
          filter(
            member.payInternetMonthIds,
            (payInternetMonthId) => !!rentsHash[payInternetMonthId]
          ).length * internetData?.pricePerMonth

        const deductElectricity = chain(member.payElectricityMonthIds)
          .sumBy((id) => {
            const rent = rentsHash[id]
            return rent?.electricity.totalPrice || 0
          })
          .round(0)
          .value()

        // total
        const total = round(
          houseRent + airCondition + internet + water + electricity + paymentFee + electricityShare,
          0
        )

        // total after deduct
        const totalAfterDeduct = round(total - deductInternet - deductElectricity, 0)

        // total separate
        const totalSeparate = round(totalAfterDeduct / totalMonth, 0)

        acc.push({
          id: member.id,
          name: userOptionsHash[member.userId]?.label || '',
          houseRent,
          airCondition,
          internet,
          water,
          electricity,
          electricityShare,
          paymentFee,
          total,
          totalAfterDeduct,
          totalSeparate,
          deductInternet,
          deductElectricity,
          finalPayment: totalSeparate,
        })
        return acc
      }, [])
      .value()
  }, [
    rents,
    members,
    baseHouseRent,
    internetData?.pricePerMonth,
    electricitySummary?.shareUnit,
    electricitySummary?.pricePerUnit,
    paymentFeeData,
    airConditionData?.pricePerUnit,
    userOptionsHash,
  ])

  return (
    <div>
      <Table
        title={() => <Typography.Title level={4}>สรุปรายการ</Typography.Title>}
        pagination={false}
        columns={columns}
        dataSource={dataSource}
        tableLayout="fixed"
        size={md ? 'large' : 'small'}
        rowKey="id"
        scroll={{ x: 'max-content' }}
        summary={(data) => {
          if (!data?.length) return null

          return (
            <Table.Summary.Row
              css={css`
                background-color: #f0f0f0;
              `}
            >
              <Table.Summary.Cell index={0} align="center">
                <Typography.Text strong>รวม</Typography.Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">
                <Typography.Text strong>
                  {sumBy(data, 'houseRent').toLocaleString()}
                </Typography.Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} align="right">
                <Typography.Text strong>
                  {sumBy(data, 'airCondition').toLocaleString()}
                </Typography.Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={3} align="right">
                <Typography.Text strong>{sumBy(data, 'internet').toLocaleString()}</Typography.Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={4} align="right">
                <Typography.Text strong>{sumBy(data, 'water').toLocaleString()}</Typography.Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={5} align="right">
                <Typography.Text strong>
                  {sumBy(data, 'electricity').toLocaleString()}
                </Typography.Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={6} align="right">
                <Typography.Text strong>
                  {sumBy(data, 'electricityShare').toLocaleString()}
                </Typography.Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={7} align="right">
                <Typography.Text strong>
                  {sumBy(data, 'paymentFee').toLocaleString()}
                </Typography.Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={8} align="right">
                <Typography.Text strong>{sumBy(data, 'total').toLocaleString()}</Typography.Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={9} align="right">
                <Typography.Text strong>
                  {sumBy(data, 'deductInternet').toLocaleString()}
                </Typography.Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={10} align="right">
                <Typography.Text strong>
                  {sumBy(data, 'deductElectricity').toLocaleString()}
                </Typography.Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={11} align="right">
                <Typography.Text strong>
                  {sumBy(data, 'totalAfterDeduct').toLocaleString()}
                </Typography.Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={12} align="right"></Table.Summary.Cell>
            </Table.Summary.Row>
          )
        }}
      />
    </div>
  )
}
