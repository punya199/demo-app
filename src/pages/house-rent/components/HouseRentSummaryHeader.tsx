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

    const sortedRents = [...data.rents].sort(
      (a, b) => dayjs(a.month).valueOf() - dayjs(b.month).valueOf()
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
    <div className="no-print mb-8">
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-slate-100">{data.name}</h1>
        <p className="mb-1 text-lg text-gray-600 dark:text-slate-300">House Rent Summary</p>
        {dateRange && (
          <p className="text-sm text-gray-500 dark:text-slate-400">Period: {dateRange}</p>
        )}
      </div>

      <Flex justify="center" className="mb-6">
        <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrint} size="large">
          Print Summary
        </Button>
      </Flex>
    </div>
  )
}
