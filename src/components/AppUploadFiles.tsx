import { PlusOutlined } from '@ant-design/icons'
import type { GetProp, UploadFile, UploadProps } from 'antd'
import { Image, Upload } from 'antd'
import { HttpRequestHeader, UploadChangeParam } from 'antd/es/upload/interface'
import { get } from 'lodash'
import { useCallback, useMemo, useState } from 'react'
import { appConfig } from '../config/app-config'
import { IHouseRentFormValues } from '../pages/house-rent/house-rent-interface'

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0]

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })

interface IAppUploadFilesProps {
  value?: IHouseRentFormValues['attachments']
  onChange?: (value: IHouseRentFormValues['attachments']) => void
  disabled?: boolean
}

export const AppUploadFiles = (props: IAppUploadFilesProps) => {
  const { value, onChange, disabled } = props
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')

  const fileList = useMemo(() => {
    return [...(value || [])]
  }, [value])

  const handlePreview = useCallback(async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType)
    }

    setPreviewImage(file.url || (file.preview as string))
    setPreviewOpen(true)
  }, [])

  const handleChange = useCallback(
    (info: UploadChangeParam<UploadFile<unknown>>) => {
      onChange?.(
        info.fileList.map((file) => {
          const attachmentId = get(file, 'response.id')
          if (attachmentId) {
            file.uid = attachmentId
            file.url = `${appConfig().VITE_API_DOMAIN}/attachments/${attachmentId}/file`
          }
          return file
        })
      )
    },
    [onChange]
  )

  const uploadButton = useMemo(
    () => (
      <button style={{ border: 0, background: 'none' }} type="button">
        <PlusOutlined />
        <div style={{ marginTop: 8 }}>Upload</div>
      </button>
    ),
    []
  )

  const headers = useMemo((): HttpRequestHeader => {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      return {
        authorization: 'Bearer ' + accessToken,
      }
    }
    return {}
  }, [])

  return (
    <>
      <Upload
        action={`${appConfig().VITE_API_DOMAIN}/attachments/upload`}
        accept="image/png,image/jpeg,image/jpeg"
        headers={headers}
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        disabled={disabled}
      >
        {(value?.length && value?.length >= 8) || disabled ? null : uploadButton}
      </Upload>
      {previewImage && (
        <Image
          wrapperStyle={{ display: 'none' }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(''),
          }}
          src={previewImage}
        />
      )}
    </>
  )
}
