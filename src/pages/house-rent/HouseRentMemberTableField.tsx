import { PlusOutlined } from '@ant-design/icons'
import { css } from '@emotion/react'
import { Button, Flex, Form, Grid, Select, Table, Typography } from 'antd'
import { DefaultOptionType } from 'antd/es/select'
import { ColumnType } from 'antd/es/table'
import dayjs, { Dayjs } from 'dayjs'
import { chain, compact, round, set, sumBy, uniq } from 'lodash'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { CustomCell, ICustomCellInputType } from './CustomCell'
import {
  IElectricitySummaryData,
  IHouseRentFormValues,
  IHouseRentMemberData,
} from './house-rent-interface'
import { useGetUserOptions } from './house-rent-service'
interface IHouseRentMemberTableFieldProps {
  value?: IHouseRentMemberData[]
  onChange?: (value: IHouseRentMemberData[]) => void
  summary?: IElectricitySummaryData
  viewMode?: boolean
}

export const HouseRentMemberTableField = (props: IHouseRentMemberTableFieldProps) => {
  const { value, onChange, summary, viewMode } = props
  const [isInit, setIsInit] = useState(false)
  const { md } = Grid.useBreakpoint()

  const form = Form.useFormInstance<IHouseRentFormValues>()
  const rents = Form.useWatch('rents', form)

  const [search, setSearch] = useState('')
  const { data: userOptions } = useGetUserOptions({
    search,
  })

  useEffect(() => {
    if (!isInit && value?.length) {
      setIsInit(true)
    }
  }, [value, isInit])

  const dataSource = useMemo(() => {
    return value?.map((item) => ({
      ...item,
    }))
  }, [value])

  const onAdd = useCallback(() => {
    const newData = [...(value || [])]
    const newMember: IHouseRentMemberData = {
      airConditionUnit: 0,
      electricityUnit: {
        prev: 0,
        current: 0,
        diff: 0,
      },
      userId: '',
      payElectricityMonthIds: [],
      payInternetMonthIds: [],
    }
    newData.push(newMember)
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
      newData[recordIndex].electricityUnit.diff =
        newData[recordIndex].electricityUnit.current - newData[recordIndex].electricityUnit.prev

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
      (value: T, _record: IHouseRentMemberData, recordIndex: number) => {
        return (
          <CustomCell
            dataIndex={dataIndex}
            recordIndex={recordIndex}
            value={value}
            inputType={inputType}
            onChange={onValueChange}
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

  const columns = useMemo((): ColumnType<IHouseRentMemberData>[] => {
    return compact([
      {
        title: 'ชื่อ',
        dataIndex: 'userId',
        align: 'center',
        width: 100,
        fixed: 'left',
        render: (userId: string, _record: IHouseRentMemberData, recordIndex: number) => {
          return (
            <Select
              css={css`
                width: 100%;
                min-width: 100px;
              `}
              value={userOptions?.options.find((option) => option.value === userId)}
              options={userOptions?.options}
              onSearch={(value) => setSearch(value)}
              onSelect={(value) => {
                onValueChange('userId', recordIndex, value)
              }}
              onClear={() => {
                onValueChange('userId', recordIndex, '')
              }}
              showSearch
              allowClear
            />
          )
        },
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
          _record: IHouseRentMemberData,
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
          _record: IHouseRentMemberData,
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
      !viewMode && {
        title: 'จัดการ',
        dataIndex: 'action',
        align: 'center',
        render: (_, _record: IHouseRentMemberData, recordIndex: number) => (
          <Flex gap={6} justify="center">
            <Button danger size="small" onClick={() => onDelete(recordIndex)}>
              ลบ
            </Button>
          </Flex>
        ),
      },
    ])
  }, [
    renderCell,
    userOptions?.options,
    onValueChange,
    summary?.pricePerUnit,
    internetOptions,
    onDelete,
    viewMode,
  ])

  return (
    <Table
      size={md ? 'large' : 'small'}
      title={() => (
        <Flex justify="space-between" align="center" gap={16}>
          <Typography.Title level={4}>ข้อมูลผู้เช่า</Typography.Title>
          <div>
            {!viewMode && (
              <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
                เพิ่ม
              </Button>
            )}
          </div>
        </Flex>
      )}
      rowKey={(record, index) => `${record.userId}-${index}`}
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
      dataSource={dataSource}
      tableLayout="fixed"
      summary={(d) => {
        if (!d?.length) return null

        const totalMemberUnit = sumBy(d, 'electricityUnit.diff')
        const totalUnit = summary?.totalUnit || 0
        const shareUnit = summary?.shareUnit || 0
        const totalPrice = round(shareUnit * (summary?.pricePerUnit || 0), 0)
        return (
          <Table.Summary.Row
            css={css`
              background-color: #f0f0f0;
            `}
          >
            <Table.Summary.Cell index={0}>
              <Form.Item
                name="members"
                css={css`
                  .ant-form-item-control-input {
                    display: none;
                  }
                `}
                rules={[
                  {
                    validator: (_, value: IHouseRentMemberData[]) => {
                      const userIds = chain(value ?? [])
                        .map((item) => item.userId)
                        .value()

                      if (userIds.length && userIds.length !== uniq(userIds).length) {
                        return Promise.reject(new Error('ชื่อผู้เช่าซ้ำกัน'))
                      }
                      return Promise.resolve()
                    },
                  },
                ]}
              >
                <Form.ErrorList />
              </Form.Item>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={1} colSpan={3} align="right">
              <Typography.Text strong>
                ส่วนรวม {`(${totalUnit.toLocaleString()} - ${totalMemberUnit.toLocaleString()})`}
              </Typography.Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={3} align="right">
              <Typography.Text strong>{shareUnit.toLocaleString()}</Typography.Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={4} align="right">
              <Typography.Text strong>{totalPrice.toLocaleString()}</Typography.Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={5}>
              <Form.Item
                name="members"
                css={css`
                  .ant-form-item-control-input {
                    display: none;
                  }
                `}
                rules={[
                  {
                    validator: (_, value: IHouseRentMemberData[]) => {
                      const payInternetMonthIds = chain(value ?? [])
                        .flatMap((item) => item.payInternetMonthIds)
                        .value()

                      if (
                        payInternetMonthIds.length &&
                        payInternetMonthIds.length !== uniq(payInternetMonthIds).length
                      ) {
                        return Promise.reject(new Error('ชำระค่าอินเทอร์เน็ตซ้ำกัน'))
                      }
                      return Promise.resolve()
                    },
                  },
                ]}
              >
                <Form.ErrorList />
              </Form.Item>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={6}>
              <Form.Item
                name="members"
                css={css`
                  .ant-form-item-control-input {
                    display: none;
                  }
                `}
                rules={[
                  {
                    validator: (_, value: IHouseRentMemberData[]) => {
                      const payElectricityMonthIds = chain(value ?? [])
                        .flatMap((item) => item.payElectricityMonthIds)
                        .value()

                      if (
                        payElectricityMonthIds.length &&
                        payElectricityMonthIds.length !== uniq(payElectricityMonthIds).length
                      ) {
                        return Promise.reject(new Error('ชำระค่าไฟฟ้าซ้ำกัน'))
                      }
                      return Promise.resolve()
                    },
                  },
                ]}
              >
                <Form.ErrorList />
              </Form.Item>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={7}></Table.Summary.Cell>
          </Table.Summary.Row>
        )
      }}
      footer={() => {
        return (
          <Flex justify="end">
            <Typography.Title level={5}>
              {`*** ค่าไฟฟ้า ${rents?.length || '-'} เดือน ${summary?.totalPrice?.toLocaleString()} บาท / ${summary?.totalUnit?.toLocaleString()} หน่วย = ${summary?.pricePerUnit?.toLocaleString()} บาท/หน่วย`}
            </Typography.Title>
          </Flex>
        )
      }}
      columns={columns}
      scroll={{ x: 'max-content' }}
    />
  )
}
