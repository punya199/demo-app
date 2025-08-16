import { Spin } from 'antd'

export const LoadingSpin = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Spin spinning />
    </div>
  )
}
