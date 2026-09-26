import { describe, expect, it } from 'vitest'
import { mapAttachmentToUploadFile } from './house-rent-helper'
import { IHouseRentAttachmentData } from './house-rent-service'

const baseAttachment: IHouseRentAttachmentData = {
  id: 'attachment-1',
  createdAt: '',
  updatedAt: '',
  fileName: 'file.png',
  filePath: 'uploads/file.png',
  mimeType: 'image/png',
  size: 100,
}

describe('mapAttachmentToUploadFile', () => {
  it('requests a thumbnail for image attachments', () => {
    const result = mapAttachmentToUploadFile(baseAttachment)
    expect(result.type).toBe('image/png')
    expect(result.thumbUrl).toContain('thumbnail=true')
  })

  it('omits the thumbnail url for PDF attachments', () => {
    const result = mapAttachmentToUploadFile({
      ...baseAttachment,
      fileName: 'file.pdf',
      mimeType: 'application/pdf',
    })
    expect(result.type).toBe('application/pdf')
    expect(result.thumbUrl).toBeUndefined()
  })
})
