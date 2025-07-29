import { DatePicker, Input } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import { useCallback, useState } from 'react'
import { AppInputNumber } from '../../components/AppInputNumber'

export type ICustomCellInputType = 'inputNumber' | 'monthPicker' | 'inputText'

interface ICustomCellProps {
  dataIndex: string
  recordIndex: number
  value: unknown
  inputType: ICustomCellInputType
  onValueChange: (dataIndex: string, recordIndex: number, newValue: unknown) => void
  displayValue?: string
  align?: 'left' | 'center' | 'right'
}

export const CustomCell = (props: ICustomCellProps) => {
  const { dataIndex, recordIndex, value, inputType, onValueChange, displayValue, align } = props
  const [isEdit, setIsEdit] = useState(false)
  const [tempValue, setTempValue] = useState(value)

  const handleClick = useCallback(() => {
    if (!isEdit) {
      setIsEdit(true)
    }
  }, [isEdit])

  const handleValueChange = useCallback(
    (newValue: unknown) => {
      onValueChange(dataIndex, recordIndex, newValue)
    },
    [onValueChange, dataIndex, recordIndex]
  )

  const handleBlur = useCallback(() => {
    setIsEdit(false)
    handleValueChange(tempValue)
  }, [handleValueChange, tempValue])

  const handleDateChange = useCallback(
    (date: Dayjs | null) => {
      if (date) {
        handleValueChange(date)
      }
      setIsEdit(false)
    },
    [handleValueChange]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleBlur()
      } else if (e.key === 'Escape') {
        handleBlur()
      } else if (e.key === 'Tab') {
        handleBlur()
      }
    },
    [handleBlur]
  )

  const renderInput = () => {
    switch (inputType) {
      case 'inputText':
        return (
          <Input
            value={tempValue as string}
            onChange={(e) => {
              setTempValue(e.target.value)
            }}
            onBlur={() => {
              handleBlur()
            }}
            onKeyDown={handleKeyDown}
            tabIndex={1}
            autoFocus={isEdit}
            style={{ width: '100%' }}
          />
        )
      case 'inputNumber':
        return (
          <AppInputNumber
            value={tempValue as number}
            onChange={(newValue) => {
              setTempValue(newValue)
            }}
            onBlur={() => {
              handleBlur()
            }}
            onKeyDown={handleKeyDown}
            tabIndex={1}
            autoFocus={isEdit}
            thousandSeparator=","
            allowNegative={false}
            min={0}
            style={{ width: '100%' }}
          />
        )
      case 'monthPicker':
        return (
          <DatePicker.MonthPicker
            value={dayjs(value as Dayjs)}
            onChange={handleDateChange}
            onKeyDown={handleKeyDown}
            autoFocus={isEdit}
            open={isEdit}
            style={{ width: '100%' }}
            format="MM/YYYY"
          />
        )
      default:
        return null
    }
  }

  const renderDisplay = () => {
    if (displayValue) {
      return displayValue
    }

    switch (inputType) {
      case 'inputNumber':
        return (value as number)?.toLocaleString() || '0'
      case 'monthPicker':
        return dayjs(value as Dayjs).format('MM/YYYY')
      default:
        return String(value || '')
    }
  }

  return (
    <div
      className={`custom-editable-cell ${!isEdit ? 'clickable' : ''}`}
      onClick={handleClick}
      onFocus={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={1}
      style={{
        minHeight: '32px',
        display: 'flex',
        alignItems: 'center',
        // padding: isEdit ? '0' : '4px 8px',
        textAlign: align,
        justifyContent:
          align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
      }}
    >
      {isEdit ? renderInput() : renderDisplay()}
    </div>
  )
}
