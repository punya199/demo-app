import { Input } from 'antd'
import { NumericFormat, NumericFormatProps } from 'react-number-format'
interface IAppInputNumberProps
  extends Omit<NumericFormatProps, 'customInput' | 'size' | 'onChange' | 'value'> {
  value?: number
  onChange?: (value?: number) => void
}
export const AppInputNumber = (props: IAppInputNumberProps) => {
  const { onChange, ...restProps } = props
  return (
    <NumericFormat
      {...restProps}
      customInput={Input}
      onValueChange={(v) => {
        console.log({ v })
        onChange?.(v.floatValue)
      }}
    />
  )
}
