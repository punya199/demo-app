import { Table } from 'antd'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { IHouseRentDetailData } from '../house-rent-interface'

interface IRentalDetailsSectionProps {
  rents: IHouseRentDetailData[]
}



export const RentalDetailsSection = ({ rents }: IRentalDetailsSectionProps) => {
  const columns: ColumnsType<IHouseRentDetailData> = [
    {
      title: 'Month',
      dataIndex: 'month',
      key: 'month',
      render: (month: dayjs.Dayjs) => dayjs(month).format('MMM YYYY'),
      sorter: (a, b) => dayjs(a.month).valueOf() - dayjs(b.month).valueOf(),
      width: '20%',
    },
    {
      title: 'House Rent',
      dataIndex: 'houseRentPrice',
      key: 'houseRentPrice',
      render: (price: number) => `฿${price.toLocaleString()}`,
      align: 'right',
      width: '25%',
    },
    {
      title: 'Water',
      dataIndex: 'waterPrice',
      key: 'waterPrice',
      render: (price: number) => `฿${price.toLocaleString()}`,
      align: 'right',
      width: '20%',
    },
    {
      title: 'Electricity',
      key: 'electricity',
      render: (_, record) => (
        <div className="text-right">
          <div>฿{record.electricity.totalPrice.toLocaleString()}</div>
          <div className="text-xs text-gray-500">
            {record.electricity.unit.toLocaleString()} kWh
          </div>
        </div>
      ),
      align: 'right',
      width: '25%',
    },
    {
      title: 'Total',
      key: 'total',
      render: (_, record) => {
        const total = record.houseRentPrice + record.waterPrice + record.electricity.totalPrice
        return (
          <div className="text-right font-semibold">
            ฿{total.toLocaleString()}
          </div>
        )
      },
      align: 'right',
      width: '10%',
    },
  ]

  // Calculate totals
  const totals = rents.reduce(
    (acc, rent) => ({
      houseRent: acc.houseRent + rent.houseRentPrice,
      water: acc.water + rent.waterPrice,
      electricity: acc.electricity + rent.electricity.totalPrice,
      electricityUnits: acc.electricityUnits + rent.electricity.unit,
    }),
    { houseRent: 0, water: 0, electricity: 0, electricityUnits: 0 }
  )

  const grandTotal = totals.houseRent + totals.water + totals.electricity

  // Sort rents by month
  const sortedRents = [...rents].sort((a, b) =>
    dayjs(a.month).valueOf() - dayjs(b.month).valueOf()
  )

  return (
    <div className="space-y-4 rental-details-section">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table
          columns={columns}
          dataSource={sortedRents}
          pagination={false}
          size="small"
          rowKey={(record) => record.id || dayjs(record.month).format('YYYY-MM')}
          className="print:text-xs"
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row className="bg-gray-50 font-semibold">
                <Table.Summary.Cell index={0}>Total</Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  ฿{totals.houseRent.toLocaleString()}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="right">
                  ฿{totals.water.toLocaleString()}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="right">
                  <div>
                    <div>฿{totals.electricity.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">
                      {totals.electricityUnits.toLocaleString()} kWh
                    </div>
                  </div>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="right" className="font-bold">
                  ฿{grandTotal.toLocaleString()}
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {sortedRents.map((rent, index) => {
          const total = rent.houseRentPrice + rent.waterPrice + rent.electricity.totalPrice
          return (
            <div key={rent.id || index} className="bg-gray-50 rounded-lg p-4">
              <div className="font-semibold text-lg mb-3 text-center">
                {dayjs(rent.month).format('MMM YYYY')}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>House Rent:</span>
                  <span className="font-medium">฿{rent.houseRentPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Water:</span>
                  <span className="font-medium">฿{rent.waterPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Electricity:</span>
                  <div className="text-right">
                    <div className="font-medium">฿{rent.electricity.totalPrice.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">
                      {rent.electricity.unit.toLocaleString()} kWh
                    </div>
                  </div>
                </div>
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>Total:</span>
                  <span>฿{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )
        })}

        {/* Mobile Summary */}
        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
          <div className="font-semibold text-lg mb-3 text-center text-blue-900">
            Grand Total
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>House Rent:</span>
              <span className="font-medium">฿{totals.houseRent.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Water:</span>
              <span className="font-medium">฿{totals.water.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Electricity:</span>
              <div className="text-right">
                <div className="font-medium">฿{totals.electricity.toLocaleString()}</div>
                <div className="text-xs text-gray-500">
                  {totals.electricityUnits.toLocaleString()} kWh
                </div>
              </div>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold text-lg">
              <span>Grand Total:</span>
              <span>฿{grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}