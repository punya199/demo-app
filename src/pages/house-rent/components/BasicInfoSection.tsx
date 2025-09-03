import { IHouseRentFormValues } from '../house-rent-interface'

interface IBasicInfoSectionProps {
  data: IHouseRentFormValues
}

export const BasicInfoSection = ({ data }: IBasicInfoSectionProps) => {
  const infoItems = [
    {
      label: 'House Name',
      value: data.name,
      fullWidth: true
    },
    {
      label: 'Base House Rent',
      value: `฿${data.baseHouseRent.toLocaleString()}`
    },
    {
      label: 'Payment Fee',
      value: `฿${data.paymentFee.toLocaleString()}`
    },
    {
      label: 'Internet (per month)',
      value: `฿${data.internet.pricePerMonth.toLocaleString()}`
    },
    {
      label: 'Air Condition (per unit)',
      value: `฿${data.airCondition.pricePerUnit.toLocaleString()}`
    },
  ]

  return (
    <div className="space-y-4">
      {infoItems.map((item, index) => (
        <div
          key={index}
          className={`${item.fullWidth
            ? 'col-span-full border-b pb-3 mb-3'
            : 'flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0'
            }`}
        >
          <span className="font-medium text-gray-700 text-sm">
            {item.label}:
          </span>
          <span className={`font-semibold ${item.fullWidth ? 'text-lg text-gray-900 mt-1' : 'text-gray-900'}`}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  )
}