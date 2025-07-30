import { css } from '@emotion/react'
import { Flex, Grid, Typography } from 'antd'
import Table, { ColumnType } from 'antd/es/table'
import { chain, filter, keyBy, round, sumBy } from 'lodash'
import { useMemo } from 'react'
import { AppInputNumber } from '../../components/AppInputNumber'
import { IHouseRentFormValues } from './house-rent-interface'

const renderNumber = (value: number | undefined) => {
  if (!value) return '-'
  return <AppInputNumber value={value} displayType="text" thousandSeparator />
}

interface IHouseRentReportSummaryData {
  id: string
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

interface IHouseRentReportSummaryProps {
  data: IHouseRentFormValues
}
export const HouseRentReportSummary = (props: IHouseRentReportSummaryProps) => {
  const { data } = props
  const { md } = Grid.useBreakpoint()
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
    const totalMonth = data.rents?.length || 0
    const totalMember = data.members?.length || 0

    // house rent
    const houseRent = round((data.baseHouseRent * totalMonth) / totalMember, 0)

    // internet
    const totalInternetPrice = round(data.internet.pricePerMonth * totalMonth, 0)
    const internet = round(totalInternetPrice / totalMember, 0)

    // water
    const totalWaterPrice = sumBy(data.rents, 'waterPrice')
    const water = round(totalWaterPrice / totalMember, 0)

    // electricity share
    const electricityShare = round(
      (data.electricitySummary.shareUnit * data.electricitySummary.pricePerUnit) / totalMember,
      0
    )

    // payment fee
    const paymentFee = round((data.paymentFee * totalMonth) / totalMember, 0)

    const rentsHash = keyBy(data.rents, 'id')

    return chain(data.members || [])
      .reduce((acc: IHouseRentReportSummaryData[], member) => {
        // air condition
        const airCondition = round(
          data.airCondition.pricePerUnit * member.airConditionUnit * totalMonth,
          0
        )

        // electricity
        const electricity = round(
          member.electricityUnit.diff * data.electricitySummary.pricePerUnit,
          0
        )

        // debuct
        const deductInternet =
          filter(
            member.payInternetMonthIds,
            (payInternetMonthId) => !!rentsHash[payInternetMonthId]
          ).length * data.internet.pricePerMonth

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
          name: member.name,
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
    data.rents,
    data.baseHouseRent,
    data.internet.pricePerMonth,
    data.electricitySummary.shareUnit,
    data.electricitySummary.pricePerUnit,
    data.paymentFee,
    data.members,
    data.airCondition.pricePerUnit,
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
