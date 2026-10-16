import dayjs from 'dayjs'
import { ReactNode } from 'react'

interface IHouseRentSummaryContentProps {
  children: ReactNode
}

export const HouseRentSummaryContent = ({ children }: IHouseRentSummaryContentProps) => {
  return (
    <div className="space-y-8 print:space-y-6">
      {/* Print-specific header for printed pages */}
      <div className="mb-6 hidden text-center print:block">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">House Rent Summary</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">
          Generated on {dayjs().tz().format('DD/MM/YYYY HH:mm')}
        </p>
      </div>

      {/* Responsive grid container */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 print:gap-6">{children}</div>
    </div>
  )
}

interface ISummarySection {
  title: string
  children: ReactNode
  className?: string
  printBreak?: boolean
  colSpan?: {
    default?: number
    lg?: number
    print?: number
  }
}

export const SummarySection = ({
  title,
  children,
  className = '',
  printBreak = false,
  colSpan = { default: 1, lg: 12 },
}: ISummarySection) => {
  // Map colSpan values to actual Tailwind classes
  const getGridColClass = (defaultSpan: number = 1, lgSpan: number = 12) => {
    const defaultClasses = {
      1: 'col-span-1',
      2: 'col-span-2',
      3: 'col-span-3',
      4: 'col-span-4',
      5: 'col-span-5',
      6: 'col-span-6',
      7: 'col-span-7',
      8: 'col-span-8',
      9: 'col-span-9',
      10: 'col-span-10',
      11: 'col-span-11',
      12: 'col-span-12',
    }

    const lgClasses = {
      1: 'lg:col-span-1',
      2: 'lg:col-span-2',
      3: 'lg:col-span-3',
      4: 'lg:col-span-4',
      5: 'lg:col-span-5',
      6: 'lg:col-span-6',
      7: 'lg:col-span-7',
      8: 'lg:col-span-8',
      9: 'lg:col-span-9',
      10: 'lg:col-span-10',
      11: 'lg:col-span-11',
      12: 'lg:col-span-12',
    }

    return `${defaultClasses[defaultSpan as keyof typeof defaultClasses] || 'col-span-1'} ${lgClasses[lgSpan as keyof typeof lgClasses] || 'lg:col-span-12'}`
  }

  const gridColClass = getGridColClass(colSpan.default, colSpan.lg)
  const printBreakClass = printBreak ? 'print:page-break-before-always' : ''

  return (
    <div className={`${gridColClass} ${printBreakClass} ${className}`}>
      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-slate-900 print:rounded-none print:border print:shadow-none">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-slate-100 print:text-lg">
          {title}
        </h2>
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  )
}
