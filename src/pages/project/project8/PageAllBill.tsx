import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Divider, Modal, Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { IoSearchCircleSharp } from 'react-icons/io5'
import { MdDelete } from 'react-icons/md'
import { TbEdit } from 'react-icons/tb'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { appPath } from '../../../config/app-paths'
import { useGetMe } from '../../../service'
import { apiClient } from '../../../utils/api-client'
import { Friend } from './AddFriends'
import { Item } from './AddItem'

export type Bill = {
  id: number
  title: string
  items: Item[]
  friends: Friend[]
  createdAt: string
  updatedAt: string
  deletedAt: string
}

type GetBillsResponse = {
  bills: Bill[]
}

const PageAllBill = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const location = useLocation()
  const { data } = useQuery({
    queryKey: ['BillList'],
    queryFn: async () => {
      const { data } = await apiClient.get<GetBillsResponse>(`/bills`)
      return data
    },
  })

  const { mutate: deleteBill } = useMutation({
    mutationFn: async (billId: number) => {
      await apiClient.delete(`bills/${billId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['BillList'] })
    },
  })
  const { data: user } = useGetMe()
  const isLoggedIn = useMemo(() => !!user?.user.id, [user?.user.id])

  const handleViewClick = (billId: number) => {
    navigate(appPath.checkBillPageSave({ param: { billId } }))
  }
  const handleEditClick = (billId: number) => {
    if (isLoggedIn) {
      navigate(appPath.checkBillPageEdit({ param: { billId } }))
    } else {
      Modal.confirm({
        title: 'คุณยังไม่ได้เข้าสู่ระบบ',
        content: 'คุณต้องเข้าสู่ระบบก่อนจึงจะแก้ไขได้ ',
        cancelText: 'ไม่',
        okText: 'ไปหน้าเข้าสู่ระบบ',

        icon: null,
        onOk: () => {
          navigate(appPath.login(), {
            state: { redirect: location.pathname },
          })
        },
      })
    }
  }

  const handleDeleteClick = (billId: number) => {
    if (isLoggedIn) {
      Modal.confirm({
        title: 'คุณต้องการจะลบใช่หรือไม่ ?',

        okText: 'ลบ',
        cancelText: 'ไม่ลบ',
        okType: 'danger',
        icon: null,
        onOk: () => {
          deleteBill(billId)
        },
      })
    } else {
      Modal.confirm({
        title: 'ยังไม่ได้เข้าสู่ระบบ',
        content: 'คุณต้องเข้าสู่ระบบก่อนจึงจะลบได้ ',
        cancelText: 'ไม่',
        okText: 'ไปหน้าเข้าสู่ระบบ',

        icon: null,
        onOk: () => {
          navigate(appPath.login(), {
            state: { redirect: location.pathname },
          })
        },
      })
    }
  }

  const columns: ColumnsType<Bill> = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '10%',
      render: (value: string) => dayjs(value).format('DD/MM/YYYY'),
    },
    {
      title: 'Name',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => (
        <div
          style={{
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            maxWidth: 150, // จำกัดไม่ให้กว้างเกิน 200px
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: 'View',
      key: 'view',
      width: '10%',
      align: 'center',
      render: (_, record) => (
        <Button type="link" onClick={() => handleViewClick(record.id)} className="!text-2xl">
          <IoSearchCircleSharp />
        </Button>
      ),
    },
    {
      title: 'Edit',
      key: 'edit',
      width: '10%',
      align: 'center',
      render: (_, record) => (
        <Button type="link" onClick={() => handleEditClick(record.id)} className="!text-2xl">
          <TbEdit />
        </Button>
      ),
    },
    {
      title: 'Delete',
      key: 'delete',
      width: '10%',
      align: 'center',
      render: (_, record) => (
        <Button
          type="link"
          danger
          onClick={() => handleDeleteClick(record.id)}
          className="!text-2xl"
        >
          <MdDelete />
        </Button>
      ),
    },
  ]

  return (
    <div className="mx-1 mt-4 flex flex-col gap-4">
      <Typography.Title level={3} className="!text-center text-blue-700 drop-shadow-md">
        แบ่งบิลเพื่อนแบบกำหนดเอง
      </Typography.Title>

      <div>
        <Link to={appPath.checkBillPageCreate()} className="flex-1">
          <Button
            type="primary"
            className="w-full rounded-lg bg-blue-300 !py-5 !text-xl text-white hover:bg-blue-400"
          >
            สร้างบิลใหม่
          </Button>
        </Link>
      </div>

      <Divider className="text-center text-lg font-semibold">รายการที่เคยสร้าง</Divider>

      {/* ห่อ Table ด้วย div overflow-x-auto เพื่อให้ scroll แนวนอน */}
      <div className="overflow-x-auto">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data?.bills || []}
          pagination={false}
          className="rounded-xl shadow"
          scroll={{ x: 'max-content' }} // เปิด scroll แนวนอนอัตโนมัติเมื่อเกินขนาดหน้าจอ
          tableLayout="fixed"
        />
      </div>
    </div>
  )
}

export default PageAllBill
