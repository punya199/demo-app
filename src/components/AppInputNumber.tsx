import { Input } from 'antd'
import { useCallback, useState } from 'react'
import { NumberFormatValues, NumericFormat, NumericFormatProps } from 'react-number-format'
interface IAppInputNumberProps
  extends Omit<NumericFormatProps, 'customInput' | 'size' | 'onChange' | 'onBlur' | 'value'> {
  value?: number
  onChange?: (value?: number) => void
  onBlur?: (value?: number) => void
}
export const AppInputNumber = (props: IAppInputNumberProps) => {
  const { onChange, onBlur, ...restProps } = props
  const [tempValue, setTempValue] = useState<number | undefined>(props.value)

  const onValueChange = useCallback(
    (v: NumberFormatValues) => {
      setTempValue(v.floatValue)
      onChange?.(v.floatValue)
    },
    [onChange]
  )

  const handleBlur = useCallback(() => {
    onBlur?.(tempValue)
  }, [onBlur, tempValue])

  return (
    <NumericFormat
      {...restProps}
      customInput={Input}
      onValueChange={onValueChange}
      onBlur={handleBlur}
    />
  )
}
