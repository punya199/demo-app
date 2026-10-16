import { IHouseRentFormValues } from '../house-rent-interface'

interface IBasicInfoSectionProps {
  data: IHouseRentFormValues
}

export const BasicInfoSection = ({ data }: IBasicInfoSectionProps) => {
  const infoItems = [
    {
      label: 'House Name',
      value: data.name,
      fullWidth: true,
    },
    {
      label: 'Base House Rent',
      value: `฿${data.baseHouseRent.toLocaleString()}`,
    },
    {
      label: 'Payment Fee',
      value: `฿${data.paymentFee.toLocaleString()}`,
    },
    {
      label: 'Internet (per month)',
      value: `฿${data.internet.pricePerMonth.toLocaleString()}`,
    },
    {
      label: 'Air Condition (per unit)',
      value: `฿${data.airCondition.pricePerUnit.toLocaleString()}`,
    },
  ]

  return (
    <div className="space-y-4">
      {infoItems.map((item, index) => (
        <div
          key={index}
          className={`${
            item.fullWidth
              ? 'col-span-full mb-3 border-b pb-3'
              : 'flex items-center justify-between border-b border-gray-100 py-2 last:border-b-0 dark:border-slate-800'
          }`}
        >
          <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
            {item.label}:
          </span>
          <span
            className={`font-semibold ${item.fullWidth ? 'mt-1 text-lg text-gray-900 dark:text-slate-100' : 'text-gray-900 dark:text-slate-100'}`}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  )
}
