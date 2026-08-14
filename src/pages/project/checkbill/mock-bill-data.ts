import { Friend } from './AddFriends'
import { Item } from './AddItem'

// ข้อมูลตัวอย่างไว้ดูหน้า Check Bill ตอนยังไม่ได้เชื่อมต่อ backend จริง
// ลบไฟล์นี้และจุดที่ import ออกได้เมื่อเชื่อมต่อ backend แล้ว
export interface MockBill {
  id: number
  title: string
  items: Item[]
  friends: Friend[]
  createdAt: string
  updatedAt: string
  deletedAt: string
}

export const mockBillFriends: Friend[] = [
  { id: 'f1', name: 'แนน' },
  { id: 'f2', name: 'บอล' },
  { id: 'f3', name: 'แก้ม' },
  { id: 'f4', name: 'โบ๊ท' },
  { id: 'f5', name: 'มิ้น' },
]

export const mockBillItems: Item[] = [
  { id: 'i1', name: 'ส้มตำ', price: 100, payerId: 'f1', friendIds: ['f1', 'f2', 'f3'] },
  {
    id: 'i2',
    name: 'ข้าวเหนียวหมูปิ้ง',
    price: 85,
    payerId: 'f2',
    friendIds: ['f2', 'f3', 'f4', 'f5'],
  },
  {
    id: 'i3',
    name: 'น้ำแข็งใส',
    price: 60,
    payerId: 'f3',
    friendIds: ['f1', 'f2', 'f3', 'f4', 'f5'],
  },
  { id: 'i4', name: 'ค่าที่จอดรถ', price: 40, payerId: 'f4', friendIds: ['f4', 'f5'] },
  {
    id: 'i5',
    name: 'ของฝาก',
    price: 220,
    payerId: 'f5',
    friendIds: ['f1', 'f2', 'f3', 'f4', 'f5'],
  },
]

export const mockBill: MockBill = {
  id: 999,
  title: 'ทริปเที่ยวทะเล (ตัวอย่าง)',
  items: mockBillItems,
  friends: mockBillFriends,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: '',
}
