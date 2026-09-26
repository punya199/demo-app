import { PlusOutlined } from '@ant-design/icons'
import type { GetProp, UploadFile, UploadProps } from 'antd'
import { Image, message, Upload } from 'antd'
import { UploadChangeParam } from 'antd/es/upload/interface'
import { get } from 'lodash'
import { useCallback, useMemo, useState } from 'react'
import { appConfig } from '../config/app-config'
import { IHouseRentFormValues } from '../pages/house-rent/house-rent-interface'

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0]

const ACCEPTED_MIME_TYPES = ['image/png', 'image/jpeg', 'application/pdf']

const isPdfFile = (file: UploadFile) => file.type === 'application/pdf'

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

  const fileList = useMemo((): UploadFile[] => {
    return [...(value || [])]
  }, [value])

  const handlePreview = useCallback(async (file: UploadFile) => {
    if (isPdfFile(file)) {
      window.open(file.url, '_blank', 'noopener,noreferrer')
      return
    }

    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType)
    }

    setPreviewImage(file.url || (file.preview as string))
    setPreviewOpen(true)
  }, [])

  const beforeUpload = useCallback((file: FileType) => {
    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
      message.error('รองรับเฉพาะไฟล์รูปภาพ (PNG, JPEG) หรือ PDF เท่านั้น')
      return Upload.LIST_IGNORE
    }
    return true
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

  return (
    <>
      <Upload
        action={`${appConfig().VITE_API_DOMAIN}/attachments/upload`}
        accept={ACCEPTED_MIME_TYPES.join(',')}
        beforeUpload={beforeUpload}
        withCredentials={true}
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
