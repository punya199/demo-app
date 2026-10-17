import { Card, Empty, Form, Grid, Select, Typography } from 'antd'
import dayjs from 'dayjs'
import { sortBy } from 'lodash'
import { useMemo, useState } from 'react'

import { AppUploadFiles } from '../../components/AppUploadFiles'
import { IHouseRentFormValues } from './house-rent-interface'

const GENERAL = 'general'

// Read-only view of every attachment: general files, then one group per month.
export const HouseRentAttachmentsView = () => {
  const { md } = Grid.useBreakpoint()
  const form = Form.useFormInstance<IHouseRentFormValues>()
  const rents = Form.useWatch('rents', form)
  const attachments = Form.useWatch('attachments', form)
  const [filter, setFilter] = useState<string>()

  const groups = useMemo(() => {
    const monthly = sortBy(rents ?? [], (rent) => dayjs(rent.month).valueOf()).map((rent) => ({
      key: rent.id ?? '',
      label: dayjs(rent.month).format('MM/YYYY'),
      files: rent.files ?? [],
    }))
    return [{ key: GENERAL, label: 'ทั่วไป', files: attachments ?? [] }, ...monthly].filter(
      (group) => group.files.length && (!filter || group.key === filter)
    )
  }, [rents, attachments, filter])

  return (
    <Card size={md ? 'default' : 'small'}>
      <Typography.Title level={4}>ไฟล์แนบทั้งหมด</Typography.Title>
      <Select
        allowClear
        className="mb-4 w-full md:w-60"
        placeholder="ทั้งหมด"
        value={filter}
        onChange={setFilter}
        options={[
          { value: GENERAL, label: 'ทั่วไป' },
          ...(rents ?? []).map((rent) => ({
            value: rent.id,
            label: dayjs(rent.month).format('MM/YYYY'),
          })),
        ]}
      />
      {groups.length ? (
        groups.map((group) => (
          <div key={group.key}>
            <Typography.Text strong>{group.label}</Typography.Text>
            <AppUploadFiles value={group.files} disabled />
          </div>
        ))
      ) : (
        <Empty description="ไม่มีไฟล์แนบ" />
      )}
    </Card>
  )
}
