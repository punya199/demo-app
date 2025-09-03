import { PrinterOutlined } from '@ant-design/icons'
import { Button, Flex } from 'antd'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { IHouseRentFormValues } from '../house-rent-interface'

interface IHouseRentSummaryHeaderProps {
  data: IHouseRentFormValues
  onPrint?: () => void
}

export const HouseRentSummaryHeader = ({ data, onPrint }: IHouseRentSummaryHeaderProps) => {
  const dateRange = useMemo(() => {
    if (!data.rents || data.rents.length === 0) return ''

    const sortedRents = [...data.rents].sort((a, b) =>
      dayjs(a.month).valueOf() - dayjs(b.month).valueOf()
    )

    const startDate = dayjs(sortedRents[0].month).format('MMM YYYY')
    const endDate = dayjs(sortedRents[sortedRents.length - 1].month).format('MMM YYYY')

    return startDate === endDate ? startDate : `${startDate} - ${endDate}`
  }, [data.rents])

  const handlePrint = () => {
    if (onPrint) {
      onPrint()
    } else {
      window.print()
    }
  }

  return (
    <div className="mb-8 no-print">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {data.name}
        </h1>
        <p className="text-lg text-gray-600 mb-1">House Rent Summary</p>
        {dateRange && (
          <p className="text-sm text-gray-500">Period: {dateRange}</p>
        )}
      </div>

      <Flex justify="center" className="mb-6">
        <Button
          type="primary"
          icon={<PrinterOutlined />}
          onClick={handlePrint}
          size="large"
        >
          Print Summary
        </Button>
      </Flex>
    </div>
  )
}