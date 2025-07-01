import { Button } from 'antd'
import { FormValues } from './MeowFrom'

interface ContractProps {
  prices: FormValues[]
  onRemove: (index: number) => void
}

const MeowItems = ({ prices, onRemove }: ContractProps) => {
  return (
    <div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {prices.map((f, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-500">
            <div>
              <h3 className="text-lg font-semibold text-blue-700 mb-2">สินค้า #{index + 1}</h3>
              <p className="text-gray-700">
                <span className="font-medium">ชื่อสินค้า:</span> {f.product}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">ราคา:</span> {f.price.toLocaleString()} บาท
              </p>
              <p className="text-gray-700">
                <span className="font-medium">หมวดหมู่:</span> {f.Category}
              </p>
            </div>
            <Button
              onClick={() => {
                onRemove(index)
              }}
            >
              ลบ
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MeowItems
