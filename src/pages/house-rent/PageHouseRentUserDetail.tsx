import { css } from '@emotion/react'
import { Flex, Typography } from 'antd'
import dayjs from 'dayjs'
import { chain } from 'lodash'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import { LoadingSpin } from '../../layouts/LoadingSpin'
import { useGetHouseRentUserDetail } from './house-rent-service'
export const PageHouseRentUserDetail = () => {
  const { userId } = useParams<{ userId: string }>()

  const { data: userDetailData, isLoading: isUserDetailLoading } = useGetHouseRentUserDetail(userId)

  console.log(userDetailData)

  const data = useMemo(() => {
    return chain(userDetailData?.data ?? [])
      .map((d) => {
        return {
          ...d,
          title: dayjs(d.title).format('MM/YYYY'),
        }
      })
      .orderBy('title', 'asc')
      .value()
  }, [userDetailData])

  if (isUserDetailLoading) {
    return <LoadingSpin />
  }

  return (
    <div
      css={css`
        gap: 20px;
        padding: 20px;
      `}
    >
      <div
        css={css`
          margin-bottom: 20px;
        `}
      >
        <Typography.Title level={4}>{userDetailData?.user.username}</Typography.Title>
      </div>

      <Flex vertical justify="center" align="center">
        <LineChart
          style={{ width: '100%', maxWidth: '700px', maxHeight: '70vh', aspectRatio: 1.618 }}
          responsive
          data={data}
          margin={{
            top: 5,
            right: 0,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="title" />
          <YAxis width="auto" />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            name="ค่าไฟฟ้า"
            dataKey="individualElectricityPrice"
            stroke="#A8BA00"
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            name="หน่วยไฟฟ้า"
            dataKey="electricityUnit.diff"
            stroke="#008935"
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            name="ค่าน้ำ"
            dataKey="waterPrice"
            stroke="#00B4AE"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </Flex>
    </div>
  )
}
