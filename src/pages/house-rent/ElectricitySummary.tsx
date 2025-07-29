import { css } from '@emotion/react'
import { Flex, Grid, Typography } from 'antd'
import Table, { ColumnType } from 'antd/es/table'
import { round, sumBy } from 'lodash'
import { useMemo } from 'react'
import {
  IElectricitySummaryData,
  IHouseRentDetailData,
  IHouseRentPeopleData,
} from './house-rent-interface'

interface IElectricitySummaryProps {
  rents: IHouseRentDetailData[]
  people: IHouseRentPeopleData[]
  summary?: IElectricitySummaryData
}
export const ElectricitySummary = (props: IElectricitySummaryProps) => {
  const { rents = [], people = [], summary } = props
  const { md } = Grid.useBreakpoint()

  const columns = useMemo((): ColumnType<IHouseRentPeopleData>[] => {
    return [
      {
        title: 'ชื่อ',
        dataIndex: 'name',
      },
      {
        title: 'รอบก่อน',
        dataIndex: ['electricityUnit', 'prev'],
        align: 'right',
        render: (value) => {
          return value.toLocaleString()
        },
      },
      {
        title: 'รอบปัจจุบัน',
        dataIndex: ['electricityUnit', 'current'],
        align: 'right',
        render: (value) => {
          return value.toLocaleString()
        },
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
    ]
  }, [summary?.pricePerUnit])

  const dataSource = useMemo(() => {
    const data: IHouseRentPeopleData[] = [...people]
    return data
  }, [people])

  return (
    !!summary && (
      <div>
        <Table
          size={md ? 'large' : 'small'}
          title={() => {
            return (
              <Typography.Text
                css={css`
                  font-size: 1.2rem;
                `}
                strong
              >
                ค่าไฟฟ้า
              </Typography.Text>
            )
          }}
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          summary={(d) => {
            const totalUnit = sumBy(d, 'electricityUnit.diff')
            const totalPrice = round(totalUnit * (summary?.pricePerUnit || 0), 0)
            return (
              <Table.Summary.Row
                css={css`
                  background-color: #f0f0f0;
                `}
              >
                <Table.Summary.Cell index={0} colSpan={3} align="right">
                  <Typography.Text strong>ส่วนรวม</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="right">
                  <Typography.Text strong>{totalUnit.toLocaleString()}</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="right">
                  <Typography.Text strong>{totalPrice.toLocaleString()}</Typography.Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )
          }}
          footer={() => {
            return (
              <Flex justify="end">
                <Typography.Text type="danger" strong>
                  {`*** ค่าไฟฟ้า ${rents.length} เดือน ${summary?.totalPrice?.toLocaleString()} บาท / ${summary?.totalUnit?.toLocaleString()} หน่วย = ${summary?.pricePerUnit?.toLocaleString()} บาท/หน่วย`}
                </Typography.Text>
              </Flex>
            )
          }}
        />
      </div>
    )
  )
}
