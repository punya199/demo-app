import { CopyOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons'
import { css } from '@emotion/react'
import { Button, Flex, Table, TableColumnType, Typography } from 'antd'
import dayjs from 'dayjs'
import { sumBy } from 'lodash'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { appPath } from '../../config/app-paths'
import { formatCurrency } from '../../utils/format-currency'
import { IHouseRentDetailData, IHouseRentMemberData } from './house-rent-interface'
import { IHouseRentDataResponse, useGetHouseRentList } from './house-rent-service'

export const PageHouseRent = () => {
  const { data: houseRentListData, isLoading } = useGetHouseRentList()
  const navigate = useNavigate()

  const columns = useMemo(
    (): TableColumnType<IHouseRentDataResponse>[] => [
      {
        title: 'ลำดับ',
        dataIndex: 'id',
        key: 'id',
        render: (_, __, index) => index + 1,
      },
      {
        title: 'ชื่อรายการ',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'เดือน',
        dataIndex: 'rents',
        key: 'rents',
        align: 'center',
        render: (value: IHouseRentDetailData[]) =>
          value.map((item) => dayjs(item.month).format('MM/YYYY')).join(', '),
      },
      {
        title: 'ผู้เช่า',
        dataIndex: 'members',
        key: 'members',
        align: 'center',
        render: (value: IHouseRentMemberData[]) => value.map((item) => item.name).join(', '),
      },
      {
        title: 'ยอดรวม',
        dataIndex: 'total',
        key: 'total',
        align: 'right',
        render: (_value, record: IHouseRentDataResponse) => {
          const data = record.rents
          const totalHouseRent = sumBy(data, 'houseRentPrice') || 0
          const totalElectricity = sumBy(data, 'electricity.totalPrice')
          const totalInternet = (record.internet?.pricePerMonth || 0) * data.length
          const total = totalHouseRent + totalElectricity + totalInternet
          return formatCurrency(total, {
            decimal: 0,
          })
        },
      },
      {
        title: 'วันที่สร้าง',
        dataIndex: 'createdAt',
        key: 'createdAt',
        align: 'center',
        render: (value) => dayjs(value).format('DD/MM/YYYY HH:mm'),
      },
      {
        title: 'วันที่แก้ไขล่าสุด',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        align: 'center',
        render: (value) => dayjs(value).format('DD/MM/YYYY HH:mm'),
      },
      {
        title: 'จัดการ',
        dataIndex: 'id',
        key: 'id',
        align: 'center',
        render: (value) => (
          <Flex gap={4} justify="center">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => navigate(appPath.houseRentDetail({ param: { houseRentId: value } }))}
              title="ดูรายละเอียด"
            />
            <Button
              type="link"
              icon={<CopyOutlined />}
              onClick={() =>
                navigate(appPath.houseRentDetailClone({ param: { houseRentId: value } }))
              }
              title="คัดลอก"
            />
          </Flex>
        ),
      },
    ],
    [navigate]
  )

  return (
    <div
      className="space-y-4 py-6 md:p-4"
      css={css`
        background-color: #f3f3f3;
        height: 100%;
      `}
    >
      <Table
        title={() => (
          <Flex justify="space-between" align="center" gap={16}>
            <Typography.Title level={4}>รายการค่าเช่าบ้าน</Typography.Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate(appPath.houseRentCreate())}
            >
              เพิ่มรายการ
            </Button>
          </Flex>
        )}
        rowKey="id"
        tableLayout="fixed"
        dataSource={houseRentListData?.houseRents}
        columns={columns}
        loading={isLoading}
      />
    </div>
  )
}
