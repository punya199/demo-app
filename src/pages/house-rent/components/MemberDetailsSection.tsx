import { css } from '@emotion/react'
import { Table } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { chain, filter, keyBy, round, sumBy } from 'lodash'
import { useMemo } from 'react'
import { IHouseRentFormValues, IHouseRentMemberData } from '../house-rent-interface'
import { useGetUserOptions } from '../house-rent-service'

interface IMemberDetailsSectionProps {
  data: IHouseRentFormValues
}

interface IMemberSummary extends IHouseRentMemberData {
  userName: string
  houseRent: number
  airCondition: number
  internet: number
  water: number
  electricity: number
  electricityShare: number
  paymentFee: number
  total: number
  deductInternet: number
  deductElectricity: number
  totalAfterDeduct: number
  totalSeparate: number
  finalPayment: number
}

export const MemberDetailsSection = ({ data }: IMemberDetailsSectionProps) => {
  const { data: userOptions } = useGetUserOptions()

  const userOptionsHash = useMemo(() => {
    return keyBy(userOptions?.options, 'value')
  }, [userOptions?.options])

  const memberSummaries = useMemo((): IMemberSummary[] => {
    if (!data.members || !data.rents) return []

    const totalMonth = data.rents.length
    const totalMember = data.members.length

    // Shared calculations (same for all members)
    const houseRent = round((data.baseHouseRent * totalMonth) / totalMember, 0)
    const totalInternetPrice = round((data.internet?.pricePerMonth || 0) * totalMonth, 0)
    const internet = round(totalInternetPrice / totalMember, 0)
    const totalWaterPrice = sumBy(data.rents, 'waterPrice')
    const water = round(totalWaterPrice / totalMember, 0)
    const electricityShareTotalPrice = round(
      (data.electricitySummary?.shareUnit || 0) * (data.electricitySummary?.pricePerUnit || 0),
      0
    )
    const electricityShare = round(electricityShareTotalPrice / totalMember, 0)
    const paymentFee = round((data.paymentFee * totalMonth) / totalMember, 0)

    const rentsHash = keyBy(data.rents, 'id')

    return chain(data.members)
      .map((member) => {
        // Get user name
        const userName = userOptionsHash[member.userId]?.label || `User ${member.userId}`

        // Air condition cost (per member calculation)
        const airCondition = round(
          (data.airCondition?.pricePerUnit || 0) * member.airConditionUnit * totalMonth,
          0
        )

        // Individual electricity cost
        const electricity = round(
          member.electricityUnit.diff * (data.electricitySummary?.pricePerUnit || 0),
          0
        )

        // Deductions
        const deductInternet = filter(
          member.payInternetMonthIds,
          (payInternetMonthId) => !!rentsHash[payInternetMonthId]
        ).length * (data.internet?.pricePerMonth || 0)

        const deductElectricity = chain(member.payElectricityMonthIds)
          .sumBy((id) => {
            const rent = rentsHash[id]
            return rent?.electricity.totalPrice || 0
          })
          .round(0)
          .value()

        // Total before deductions
        const total = round(
          houseRent + airCondition + internet + water + electricity + paymentFee + electricityShare,
          0
        )

        // Total after deductions
        const totalAfterDeduct = round(total - deductInternet - deductElectricity, 0)

        // Monthly average
        const totalSeparate = round(totalAfterDeduct / totalMonth, 0)

        return {
          ...member,
          userName,
          houseRent,
          airCondition,
          internet,
          water,
          electricity,
          electricityShare,
          paymentFee,
          total,
          deductInternet,
          deductElectricity,
          totalAfterDeduct,
          totalSeparate,
          finalPayment: totalSeparate,
        }
      })
      .value()
  }, [data, userOptionsHash])

  const columns: ColumnsType<IMemberSummary> = [
    {
      title: 'Member',
      dataIndex: 'userName',
      key: 'userName',
      width: '12%',
      fixed: 'left',
      render: (userName: string) => (
        <div className="font-medium">{userName}</div>
      ),
    },
    {
      title: 'House Rent',
      dataIndex: 'houseRent',
      key: 'houseRent',
      width: '10%',
      align: 'right',
      render: (value: number) => `฿${value.toLocaleString()}`,
    },
    {
      title: 'Air Condition',
      dataIndex: 'airCondition',
      key: 'airCondition',
      width: '10%',
      align: 'right',
      render: (value: number) => `฿${value.toLocaleString()}`,
    },
    {
      title: 'Internet',
      dataIndex: 'internet',
      key: 'internet',
      width: '8%',
      align: 'right',
      render: (value: number) => `฿${value.toLocaleString()}`,
    },
    {
      title: 'Water',
      dataIndex: 'water',
      key: 'water',
      width: '8%',
      align: 'right',
      render: (value: number) => `฿${value.toLocaleString()}`,
    },
    {
      title: 'Electricity',
      dataIndex: 'electricity',
      key: 'electricity',
      width: '10%',
      align: 'right',
      render: (value: number) => `฿${value.toLocaleString()}`,
    },
    {
      title: 'Electricity Share',
      dataIndex: 'electricityShare',
      key: 'electricityShare',
      width: '10%',
      align: 'right',
      render: (value: number) => `฿${value.toLocaleString()}`,
    },
    {
      title: 'Payment Fee',
      dataIndex: 'paymentFee',
      key: 'paymentFee',
      width: '8%',
      align: 'right',
      render: (value: number) => `฿${value.toLocaleString()}`,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: '10%',
      align: 'right',
      render: (value: number) => (
        <div className="font-semibold">฿{value.toLocaleString()}</div>
      ),
    },
    {
      title: 'Deduct Internet',
      dataIndex: 'deductInternet',
      key: 'deductInternet',
      width: '8%',
      align: 'right',
      render: (value: number) => value > 0 ? `-฿${value.toLocaleString()}` : '-',
    },
    {
      title: 'Deduct Electricity',
      dataIndex: 'deductElectricity',
      key: 'deductElectricity',
      width: '8%',
      align: 'right',
      render: (value: number) => value > 0 ? `-฿${value.toLocaleString()}` : '-',
    },
    {
      title: 'Final Total',
      dataIndex: 'totalAfterDeduct',
      key: 'totalAfterDeduct',
      width: '10%',
      align: 'right',
      render: (value: number) => (
        <div className="font-bold text-blue-600">฿{value.toLocaleString()}</div>
      ),
    },
    {
      title: 'Per Month',
      dataIndex: 'totalSeparate',
      key: 'totalSeparate',
      width: '8%',
      align: 'right',
      render: (value: number) => (
        <div className="font-semibold text-green-600">฿{value.toLocaleString()}</div>
      ),
    },
  ]

  // Calculate totals
  const totals = useMemo(() => ({
    houseRent: sumBy(memberSummaries, 'houseRent'),
    airCondition: sumBy(memberSummaries, 'airCondition'),
    internet: sumBy(memberSummaries, 'internet'),
    water: sumBy(memberSummaries, 'water'),
    electricity: sumBy(memberSummaries, 'electricity'),
    electricityShare: sumBy(memberSummaries, 'electricityShare'),
    paymentFee: sumBy(memberSummaries, 'paymentFee'),
    total: sumBy(memberSummaries, 'total'),
    deductInternet: sumBy(memberSummaries, 'deductInternet'),
    deductElectricity: sumBy(memberSummaries, 'deductElectricity'),
    totalAfterDeduct: sumBy(memberSummaries, 'totalAfterDeduct'),
  }), [memberSummaries])

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table
          columns={columns}
          dataSource={memberSummaries}
          pagination={false}
          size="small"
          rowKey={(record) => record.userId}
          className="print:text-xs"
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row className="bg-gray-50 font-semibold">
                <Table.Summary.Cell index={0}>Total</Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">฿{totals.houseRent.toLocaleString()}</Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="right">฿{totals.airCondition.toLocaleString()}</Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="right">฿{totals.internet.toLocaleString()}</Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="right">฿{totals.water.toLocaleString()}</Table.Summary.Cell>
                <Table.Summary.Cell index={5} align="right">฿{totals.electricity.toLocaleString()}</Table.Summary.Cell>
                <Table.Summary.Cell index={6} align="right">฿{totals.electricityShare.toLocaleString()}</Table.Summary.Cell>
                <Table.Summary.Cell index={7} align="right">฿{totals.paymentFee.toLocaleString()}</Table.Summary.Cell>
                <Table.Summary.Cell index={8} align="right" className="font-bold">฿{totals.total.toLocaleString()}</Table.Summary.Cell>
                <Table.Summary.Cell index={9} align="right">-฿{totals.deductInternet.toLocaleString()}</Table.Summary.Cell>
                <Table.Summary.Cell index={10} align="right">-฿{totals.deductElectricity.toLocaleString()}</Table.Summary.Cell>
                <Table.Summary.Cell index={11} align="right" className="font-bold text-blue-600">฿{totals.totalAfterDeduct.toLocaleString()}</Table.Summary.Cell>
                <Table.Summary.Cell index={12} align="right"></Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {memberSummaries.map((member) => (
          <div key={member.userId} className="bg-gray-50 rounded-lg p-4" css={css`
              page-break-inside: avoid;
          `}>
            <div className="font-semibold text-lg mb-3 text-center text-gray-900">
              {member.userName}
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span>House Rent:</span>
                  <span className="font-medium">฿{member.houseRent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Air Condition:</span>
                  <span className="font-medium">฿{member.airCondition.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Internet:</span>
                  <span className="font-medium">฿{member.internet.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Water:</span>
                  <span className="font-medium">฿{member.water.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Electricity:</span>
                  <span className="font-medium">฿{member.electricity.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Electricity Share:</span>
                  <span className="font-medium">฿{member.electricityShare.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Fee:</span>
                  <span className="font-medium">฿{member.paymentFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>฿{member.total.toLocaleString()}</span>
                </div>
              </div>

              {(member.deductInternet > 0 || member.deductElectricity > 0) && (
                <div className="border-t pt-2 space-y-1">
                  <div className="text-sm font-medium text-red-600">Deductions:</div>
                  {member.deductInternet > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Internet:</span>
                      <span className="text-red-600">-฿{member.deductInternet.toLocaleString()}</span>
                    </div>
                  )}
                  {member.deductElectricity > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Electricity:</span>
                      <span className="text-red-600">-฿{member.deductElectricity.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-blue-50 rounded p-3 border-2 border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Final Total:</span>
                  <span className="text-lg font-bold text-blue-600">
                    ฿{member.totalAfterDeduct.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-600">Per Month:</span>
                  <span className="text-sm font-semibold text-green-600">
                    ฿{member.totalSeparate.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Mobile Summary */}
        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
          <div className="font-semibold text-lg mb-3 text-center text-blue-900">
            All Members Total
          </div>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex justify-between">
                <span>House Rent:</span>
                <span className="font-medium">฿{totals.houseRent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Air Condition:</span>
                <span className="font-medium">฿{totals.airCondition.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Internet:</span>
                <span className="font-medium">฿{totals.internet.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Water:</span>
                <span className="font-medium">฿{totals.water.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Electricity:</span>
                <span className="font-medium">฿{totals.electricity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Electricity Share:</span>
                <span className="font-medium">฿{totals.electricityShare.toLocaleString()}</span>
              </div>
            </div>
            <div className="border-t pt-2 font-bold text-lg">
              <div className="flex justify-between">
                <span>Grand Total:</span>
                <span className="text-blue-600">฿{totals.totalAfterDeduct.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}