import { css } from '@emotion/react'
import { Empty } from 'antd'

export const NotFound = () => {
  return (
    <div
      css={css`
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      `}
    >
      <Empty />
    </div>
  )
}
