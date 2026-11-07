import { message } from 'antd'
import { AxiosError } from 'axios'
import { toThaiErrorMessage } from '../core/tamagotchi-helper'

export const showError = (error: unknown) => {
  message.error(
    toThaiErrorMessage(error instanceof AxiosError ? error.response?.data?.message : undefined)
  )
}
