import { PlusOutlined } from '@ant-design/icons'
import { css } from '@emotion/react'
import { Button, Flex, Form, Grid, Table, Typography } from 'antd'
import { ColumnType } from 'antd/es/table'
import dayjs, { Dayjs } from 'dayjs'
import { set, sumBy } from 'lodash'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { v4 } from 'uuid'
import { CustomCell, ICustomCellInputType } from './CustomCell'
import { IHouseRentDetailData, IHouseRentFormValues } from './house-rent-interface'

interface IHouseRentDetailTableFieldProps {
  value?: IHouseRentDetailData[]
  onChange?: (value: IHouseRentDetailData[]) => void
}

export const HouseRentDetailTableField = (props: IHouseRentDetailTableFieldProps) => {
  const { value, onChange } = props
  const [isInit, setIsInit] = useState(false)
  const { md } = Grid.useBreakpoint()

  const form = Form.useFormInstance<IHouseRentFormValues>()
  const internet = Form.useWatch('internet', form)

  useEffect(() => {
    if (!isInit && value?.length) {
      setIsInit(true)
    }
  }, [value, isInit])

  const onAdd = useCallback(() => {
    const newData = [...(value || [])]
    newData.push({
      month: dayjs(),
      houseRentPrice: 0,
      waterPrice: 0,
      electricity: {
        totalPrice: 0,
        unit: 0,
      },
    } as IHouseRentDetailData)
    onChange?.(newData)
  }, [value, onChange])

  const onDelete = useCallback(
    (recordIndex: number) => {
      const newData = [...(value || [])]
      newData.splice(recordIndex, 1)
      onChange?.(newData)
    },
    [value, onChange]
  )

  const onValueChange = useCallback(
    (dataIndex: string, recordIndex: number, newValue: unknown) => {
      const newData = [...(value || [])]
      const oldData = newData[recordIndex]
      if (dataIndex.includes('.')) {
        set(oldData, dataIndex, newValue)
      } else {
        newData[recordIndex] = { ...oldData, [dataIndex]: newValue }
      }
      newData[recordIndex].id = oldData.id || v4()
      onChange?.(newData)
    },
    [value, onChange]
  )

  const renderCell = useCallback(
    <T extends string | number | Dayjs | Date | null | undefined>(
      dataIndex: string,
      inputType: ICustomCellInputType,
      options?: {
        displayValue?: (value: T) => string
        align?: 'left' | 'center' | 'right'
      }
    ) =>
      (value: T, _record: IHouseRentDetailData, recordIndex: number) => {
        return (
          <CustomCell
            dataIndex={dataIndex}
            recordIndex={recordIndex}
            value={value}
            inputType={inputType}
            onValueChange={onValueChange}
            displayValue={options?.displayValue?.(value)}
            align={options?.align}
          />
        )
      },
    [onValueChange]
  )

  const columns = useMemo((): ColumnType<IHouseRentDetailData>[] => {
    return [
      {
        title: 'เดือน',
        dataIndex: 'month',
        key: 'month',
        align: 'center',
        fixed: 'left',
        render: renderCell<Dayjs>('month', 'monthPicker', {
          displayValue: (month) => dayjs(month).format('MM/YYYY'),
          align: 'center',
        }),
      },
      {
        title: 'ค่าเช่าบ้าน',
        dataIndex: 'houseRentPrice',
        align: 'right',
        render: renderCell<number>('houseRentPrice', 'inputNumber', {
          align: 'right',
        }),
      },
      {
        title: 'ค่าน้ำ',
        dataIndex: 'waterPrice',
        align: 'right',
        render: renderCell<number>('waterPrice', 'inputNumber', {
          align: 'right',
        }),
      },
      {
        title: 'ค่าไฟ',
        dataIndex: ['electricity', 'totalPrice'],
        align: 'right',
        render: renderCell<number>('electricity.totalPrice', 'inputNumber', {
          align: 'right',
        }),
      },
      {
        title: 'หน่วยไฟฟ้า',
        dataIndex: ['electricity', 'unit'],
        align: 'right',
        render: renderCell<number>('electricity.unit', 'inputNumber', {
          align: 'right',
        }),
      },
      {
        title: 'จัดการ',
        dataIndex: 'action',
        align: 'center',
        render: (_, _record: IHouseRentDetailData, recordIndex: number) => (
          <Flex gap={6} justify="center">
            <Button danger size="small" onClick={() => onDelete(recordIndex)}>
              ลบ
            </Button>
          </Flex>
        ),
      },
    ]
  }, [renderCell, onDelete])

  return (
    <Table
      size={md ? 'large' : 'small'}
      title={() => (
        <Flex justify="space-between">
          <Typography.Title level={4}>ค่าเช่าบ้าน</Typography.Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
            เพิ่ม
          </Button>
        </Flex>
      )}
      rowKey="id"
      pagination={false}
      css={css`
        .ant-table-cell {
          :has(.ant-picker),
          :has(.ant-input) {
            padding: 6px;
          }
        }
        .custom-editable-cell {
          cursor: pointer;
          transition: background-color 0.2s;
          &:hover {
            background-color: #f0f0f0;
          }
        }
      `}
      dataSource={value}
      tableLayout="fixed"
      columns={columns}
      summary={(data) => {
        if (!data?.length) return null

        return (
          <Table.Summary.Row
            css={css`
              background-color: #f0f0f0;
            `}
          >
            <Table.Summary.Cell index={0} align="center" />
            <Table.Summary.Cell index={1} align="right">
              <Typography.Text strong>
                {sumBy(data, 'houseRentPrice')?.toLocaleString()}
              </Typography.Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={2} align="right">
              <Typography.Text strong>{sumBy(data, 'waterPrice').toLocaleString()}</Typography.Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={3} align="right">
              <Typography.Text strong>
                {sumBy(data, 'electricity.totalPrice').toLocaleString()}
              </Typography.Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={4} align="right">
              <Typography.Text strong>
                {sumBy(data, 'electricity.unit').toLocaleString()}
              </Typography.Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={5} align="center" />
          </Table.Summary.Row>
        )
      }}
      footer={(data) => {
        if (!data || data.length === 0) return null

        const totalHouseRent = sumBy(data, 'houseRentPrice') || 0
        const totalElectricity = sumBy(data, 'electricity.totalPrice')
        const totalInternet = (internet?.pricePerMonth || 0) * data.length
        const total = totalHouseRent + totalElectricity + totalInternet
        return (
          <Flex gap={12} justify="end">
            <Typography.Text type="danger" strong>
              {`*** สรุปยอด ค่าเช่าบ้าน ${totalHouseRent.toLocaleString()} บาท + ค่าไฟ ${totalElectricity.toLocaleString()} บาท + ค่าอินเทอร์เน็ต ${totalInternet.toLocaleString()} บาท = ${total.toLocaleString()} บาท`}
            </Typography.Text>
          </Flex>
        )
      }}
      scroll={{ x: 'max-content' }}
    />
  )
}
