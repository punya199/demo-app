import { Form, Input } from 'antd'
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
    <div className="rounded-lg bg-gray-50 p-4 shadow-md">
      <Form
        initialValues={props.value}
        layout="inline"
        onFieldsChange={(_e, allFields) => {
          const updatedValues = allFields.reduce((acc: ICardTitleData, field) => {
            set(acc, field.name[0], field.value)
            return acc
          }, {} as ICardTitleData)
          props.onChange(updatedValues)
        }}
      >
        {cardTitlef.map((e) => (
          <Form.Item
            label={e.key}
            name={[e.key]}
            labelCol={{ className: 'w-5' }}
            className="w-full"
          >
            <Input />
          </Form.Item>
        ))}
      </Form>
    </div>
  )
}

export default EditCardTitle
