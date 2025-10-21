import { css } from '@emotion/react'
import { Flex, Grid, Table, TableColumnType, Typography } from 'antd'
import dayjs from 'dayjs'
import { chain, get } from 'lodash'
import { Fragment, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { appPath } from '../../config/app-paths'
import { IUser } from '../../service'
import {
  IGetHouseRentOverviewData,
  IGetHouseRentOverviewMemberData,
  IGetHouseRentOverviewResponse,
  useGetHouseRentOverview,
  useGetHouseRentUserList,
} from './house-rent-service'

function stringToHash(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return hash
}

function hashToHsl(hash: number) {
  const hue = hash % 360
  const saturation = 100
  const lightness = 50
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

const randomColor = (username: string) => {
  return hashToHsl(stringToHash(username))
}

type IOverviewChartProps = {
  title: string
  data: IGetHouseRentOverviewResponse['data']
} & (
  | {
      chartMemberKey: NestedPaths<IGetHouseRentOverviewMemberData>
    }
  | {
      chartKeys: {
        label: string
        key: NestedPaths<Pick<IGetHouseRentOverviewData, 'electricity'>>
        color: string
        type?: 'line' | 'area'
      }[]
    }
)
const OverviewChart = (props: IOverviewChartProps) => {
  const { title, data } = props

  const chartData = useMemo(() => {
    return chain(data ?? [])
      .map((d) => {
        if ('chartMemberKey' in props) {
          return {
            title: d.title,
            members: chain(d.members)
              .entries()
              .transform((acc: Record<string, number>, [key, value]) => {
                acc[key] = +(get(value, props.chartMemberKey, 0) || 0)
                return acc
              }, {})
              .value(),
          }
        }
        if ('chartKeys' in props) {
          return {
            title: d.title,
            electricity: d.electricity,
          }
        }
      })
      .orderBy('title', 'asc')
      .value()
  }, [props, data])

  const renderLines = useMemo(() => {
    if ('chartMemberKey' in props) {
      return chain(data ?? [])
        .transform((acc: Record<string, string>, cur) => {
          Object.entries(cur.members).forEach(([key, value]) => {
            acc[key] = value.username
          })
          return acc
        }, {})
        .entries()
        .map(([key, username]) => {
          return (
            <Line
              type="monotone"
              name={`${username}`}
              dataKey={['members', key].join('.')}
              stroke={randomColor(username)}
              activeDot={{ r: 8 }}
            />
          )
        })
        .value()
    }
    if ('chartKeys' in props) {
      return props.chartKeys.map((key) => {
        if (key.type === 'area') {
          const colorId = `color-${key.key.replace('.', '-')}`
          return (
            <Fragment>
              <defs>
                <linearGradient id={colorId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={key.color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={key.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                key={key.key}
                type="monotone"
                name={key.label}
                dataKey={key.key}
                stroke={key.color}
                fillOpacity={1}
                fill={`url(#${colorId})`}
              />
            </Fragment>
          )
        }
        return (
          <Line
            key={key.key}
            type="monotone"
            name={key.label}
            dataKey={key.key}
            stroke={key.color}
            activeDot={{ r: 8 }}
          />
        )
      })
    }
  }, [data, props])

  return (
    <Flex
      vertical
      css={css`
        height: 100%;
        width: 100%;
        min-height: 300px;
      `}
    >
      <Typography.Title level={5}>{title}</Typography.Title>
      <ResponsiveContainer width="100%" aspect={1.8}>
        <ComposedChart
          // style={{ width: '100%', maxHeight: '70vh' }}
          height={200}
          data={chartData}
          margin={{
            top: 5,
            right: 0,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="title" />
          <YAxis width="auto" tickFormatter={(value) => value.toLocaleString()} />
          <Tooltip
            formatter={(value) =>
              value.toLocaleString('th-TH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            }
          />
          <Legend />
          {renderLines}
        </ComposedChart>
      </ResponsiveContainer>
    </Flex>
  )
}

export const PageHouseRentOverview = () => {
  const { data: userListData, isLoading: isUserListLoading } = useGetHouseRentUserList()
  const { data: overviewData } = useGetHouseRentOverview()
  const { md } = Grid.useBreakpoint()
  const userColumns = useMemo(
    (): TableColumnType<IUser>[] => [
      {
        title: 'ชื่อผู้เช่า',
        dataIndex: 'username',
        key: 'username',
      },
      {
        title: 'Actions',
        key: 'id',
        dataIndex: 'id',
        align: 'center',
        render: (userId: string) => {
          return <Link to={appPath.houseRentUserDetail({ param: { userId } })}>ดูสรุป</Link>
        },
      },
    ],
    []
  )

  const data = useMemo(() => {
    return chain(overviewData?.data ?? [])
      .map((d) => {
        return {
          ...d,
          title: dayjs(d.title).format('MM/YYYY'),
        }
      })
      .orderBy('title', 'asc')
      .value()
  }, [overviewData])

  return (
    <div
      className="space-y-4 py-6 md:p-4"
      css={css`
        background-color: #f3f3f3;
        height: 100%;
      `}
    >
      <div
        css={css(
          css`
            display: grid;
            grid-template-columns: 1fr;
            gap: 20px;
            background-color: #fff;
            padding: 20px;
          `,
          md &&
            css`
              grid-template-columns: 1fr 1fr;
              gap: 36px;
            `
        )}
      >
        <OverviewChart title="ค่าไฟฟ้า" data={data} chartMemberKey="individualElectricityPrice" />
        <OverviewChart title="หน่วยไฟฟ้า" data={data} chartMemberKey="electricityUnit.diff" />
        <OverviewChart title="ค่าเช่าบ้าน" data={data} chartMemberKey="totalPrice" />
        <OverviewChart
          title="ภาพรวมค่าไฟฟ้า"
          data={data}
          chartKeys={[
            {
              label: 'ค่าไฟฟ้า',
              key: 'electricity.totalPrice',
              color: '#D3C95C',
            },
            {
              label: 'ค่าไฟฟ้าส่วนรวม',
              key: 'electricity.sharePrice',
              color: '#82ca9d',
            },
            {
              label: 'หน่วยไฟฟ้า',
              key: 'electricity.unit',
              color: '#8884d8',
              type: 'area',
            },
            {
              label: 'หน่วยไฟฟ้าส่วนรวม',
              key: 'electricity.shareUnit',
              color: '#58B1B1',
              type: 'area',
            },
          ]}
        />
      </div>
      <Table
        title={() => <Typography.Title level={4}>ผู้เช่า</Typography.Title>}
        rowKey={(e) => e.id}
        dataSource={userListData?.users}
        columns={userColumns}
        loading={isUserListLoading}
      />
    </div>
  )
}
