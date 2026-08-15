import { EditOutlined } from '@ant-design/icons'
import { Form, Input, Typography } from 'antd'
import { set } from 'lodash'
import { cardTitleData, ICardTitleData } from '../random-card/cardGame-data'

interface EditCardTitleProps {
  value?: ICardTitleData
  onChange: (dataTitle: ICardTitleData) => void
}

const EditCardTitle = (props: EditCardTitleProps) => {
  const cardTitlef = Object.entries(cardTitleData).map(([key, value]) => ({
    key,
    value,
  }))
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center gap-2">
        <EditOutlined className="text-blue-600 dark:text-blue-400" />
        <Typography.Title level={5} className="!mb-0 !text-blue-700 dark:!text-blue-300">
          แก้ไขกฎของไพ่แต่ละใบ
        </Typography.Title>
      </div>
      <Form
        initialValues={props.value}
        onFieldsChange={(_e, allFields) => {
          const updatedValues = allFields.reduce((acc: ICardTitleData, field) => {
            set(acc, field.name[0], field.value)
            return acc
          }, {} as ICardTitleData)
          props.onChange(updatedValues)
        }}
      >
        {cardTitlef.map((e) => (
          <div
            key={e.key}
            className="grid grid-cols-[48px_1fr] items-center gap-3 border-b border-slate-100 py-1.5 last:border-0 dark:border-slate-800"
          >
            <span className="text-center font-bold text-blue-600 dark:text-blue-400">{e.key}</span>
            <Form.Item name={[e.key]} className="!mb-0">
              <Input />
            </Form.Item>
          </div>
        ))}
      </Form>
    </div>
  )
}

export default EditCardTitle
