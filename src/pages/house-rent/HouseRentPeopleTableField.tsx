import { css } from '@emotion/react'
import { Button, Flex, Form, Grid, Select, Table, Typography } from 'antd'
import { DefaultOptionType } from 'antd/es/select'
import { ColumnType } from 'antd/es/table'
import dayjs, { Dayjs } from 'dayjs'
import { chain, round, set, sumBy } from 'lodash'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { v4 } from 'uuid'
import { CustomCell, ICustomCellInputType } from './CustomCell'
import {
  IElectricitySummaryData,
  IHouseRentFormValues,
  IHouseRentPeopleData,
} from './house-rent-interface'

interface IHouseRentPeopleTableFieldProps {
  value?: IHouseRentPeopleData[]
  onChange?: (value: IHouseRentPeopleData[]) => void
  summary?: IElectricitySummaryData
}

export const HouseRentPeopleTableField = (props: IHouseRentPeopleTableFieldProps) => {
  const { value, onChange, summary } = props
  const [isInit, setIsInit] = useState(false)
  // const [tempData, setTempData] = useState<IHouseRentPeopleData[]>(value || [])
  const { md } = Grid.useBreakpoint()

  const form = Form.useFormInstance<IHouseRentFormValues>()
  const rents = Form.useWatch('rents', form)

  useEffect(() => {
    if (!isInit && value?.length) {
      // setTempData(value || [])
      setIsInit(true)
    }
  }, [value, isInit])

  const onAdd = useCallback(() => {
    const newData = [...(value || [])]
    newData.push({
      name: '',
      airConditionUnit: 0,
      electricityUnit: {
        prev: 0,
        current: 0,
        diff: 0,
      },
    } as IHouseRentPeopleData)
    // setTempData(newData)
    onChange?.(newData)
  }, [value, onChange])

  const onDelete = useCallback(
    (recordIndex: number) => {
      const newData = [...(value || [])]
      newData.splice(recordIndex, 1)
      // setTempData(newData)
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
      newData[recordIndex].electricityUnit.diff =
        newData[recordIndex].electricityUnit.current - newData[recordIndex].electricityUnit.prev
      newData[recordIndex].id = oldData.id || v4()
      // setTempData(newData)
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
      (value: T, _record: IHouseRentPeopleData, recordIndex: number) => {
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

  const internetOptions = useMemo(() => {
    return chain(rents || [])
      .map(
        (rent): DefaultOptionType => ({
          label: dayjs(rent.month).format('MM/YYYY'),
          value: rent.id,
        })
      )
      .unshift({
        label: 'เลือกทั้งหมด',
        value: 'all',
      })
      .value()
  }, [rents])

  const columns = useMemo((): ColumnType<IHouseRentPeopleData>[] => {
    return [
      {
        title: 'ชื่อ',
        dataIndex: 'name',
        key: 'name',
        align: 'center',
        width: 150,
        render: renderCell<string>('name', 'inputText', {
          align: 'left',
        }),
      },
      {
        title: 'จำนวนแอร์',
        dataIndex: 'airConditionUnit',
        align: 'right',
        render: renderCell<number>('airConditionUnit', 'inputNumber', {
          align: 'right',
        }),
      },
      {
        title: 'หน่วยไฟฟ้า เก่า',
        dataIndex: ['electricityUnit', 'prev'],
        align: 'right',
        render: renderCell<number>('electricityUnit.prev', 'inputNumber', {
          align: 'right',
        }),
      },
      {
        title: 'หน่วยไฟฟ้า ใหม่',
        dataIndex: ['electricityUnit', 'current'],
        align: 'right',
        render: renderCell<number>('electricityUnit.current', 'inputNumber', {
          align: 'right',
        }),
      },
      {
        title: 'จำนวนหน่วยที่ใช้งาน',
        dataIndex: ['electricityUnit', 'diff'],
        align: 'right',
        render: (value) => {
          return value.toLocaleString()
        },
      },
      {
        title: 'ยอดชำระ (บาท)',
        align: 'right',
        render: (_value, record) => {
          return (
            <Typography>
              {round(
                record.electricityUnit.diff * (summary?.pricePerUnit || 0),
                0
              ).toLocaleString()}
            </Typography>
          )
        },
      },
      {
        title: 'ชำระค่าอินเทอร์เน็ต',
        dataIndex: 'payInternetMonthIds',
        align: 'right',
        render: (
          payInternetMonthIds: string[],
          _record: IHouseRentPeopleData,
          recordIndex: number
        ) => {
          return (
            <Select
              size="small"
              value={payInternetMonthIds}
              onChange={(value) => {
                const newValues = value.includes('all')
                  ? internetOptions.map((option) => option.value)
                  : value
                onValueChange('payInternetMonthIds', recordIndex, newValues)
              }}
              mode="multiple"
              className="w-full"
              options={internetOptions}
              showSearch
              allowClear
            />
          )
        },
      },
      {
        title: 'ชำระค่าไฟฟ้า',
        dataIndex: 'payElectricityMonthIds',
        align: 'right',
        render: (
          payElectricityMonthIds: string[],
          _record: IHouseRentPeopleData,
          recordIndex: number
        ) => {
          return (
            <Select
              size="small"
              value={payElectricityMonthIds}
              onChange={(value) => {
                const newValues = value.includes('all')
                  ? internetOptions.map((option) => option.value)
                  : value
                onValueChange('payElectricityMonthIds', recordIndex, newValues)
              }}
              mode="multiple"
              className="w-full"
              options={internetOptions}
              showSearch
              allowClear
            />
          )
        },
      },
      {
        title: 'จัดการ',
        dataIndex: 'action',
        align: 'center',
        render: (_, _record: IHouseRentPeopleData, recordIndex: number) => (
          <Flex gap={6} justify="center">
            <Button danger size="small" onClick={() => onDelete(recordIndex)}>
              ลบ
            </Button>
          </Flex>
        ),
      },
    ]
  }, [renderCell, summary?.pricePerUnit, internetOptions, onValueChange, onDelete])

  return (
    <Table
      size={md ? 'large' : 'small'}
      title={() => (
        <Flex justify="space-between">
          <Typography.Text
            css={css`
              font-size: 1.2rem;
            `}
            strong
          >
            ข้อมูลผู้เช่า
          </Typography.Text>
          <Button type="primary" onClick={onAdd}>
            เพิ่ม
          </Button>
        </Flex>
      )}
      rowKey={(record) => record.id}
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
      summary={(d) => {
        const totalUnit = sumBy(d, 'electricityUnit.diff')
        const totalPrice = round(totalUnit * (summary?.pricePerUnit || 0), 0)
        return (
          <Table.Summary.Row
            css={css`
              background-color: #f0f0f0;
            `}
          >
            <Table.Summary.Cell index={0} colSpan={4} align="right">
              <Typography.Text strong>ส่วนรวม</Typography.Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={3} align="right">
              <Typography.Text strong>{totalUnit.toLocaleString()}</Typography.Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={4} align="right">
              <Typography.Text strong>{totalPrice.toLocaleString()}</Typography.Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={5} colSpan={3}></Table.Summary.Cell>
          </Table.Summary.Row>
        )
      }}
      footer={() => {
        return (
          <Flex justify="end">
            <Typography.Text type="danger" strong>
              {`*** ค่าไฟฟ้า ${rents?.length || '-'} เดือน ${summary?.totalPrice?.toLocaleString()} บาท / ${summary?.totalUnit?.toLocaleString()} หน่วย = ${summary?.pricePerUnit?.toLocaleString()} บาท/หน่วย`}
            </Typography.Text>
          </Flex>
        )
      }}
      columns={columns}
    />
  )
}
