import { domToCanvas } from 'modern-screenshot'
import { ledgerColor } from './ledger-tokens'

// Breathing room (CSS px, pre-scale) added around whatever element is captured - domToCanvas
// crops exactly to the node's own box, which sits flush against its container on the live page.
const IMAGE_PADDING = 24

// Shared by PageLedgerSummary's period card/chart and RoundDetailModal's round breakdown - both
// just need "this one card, as a PNG, with some margin" so it doesn't read as accidentally cropped.
export const saveElementAsImage = async (el: HTMLElement, filename: string): Promise<void> => {
  const scale = 2
  const canvas = await domToCanvas(el, { backgroundColor: ledgerColor.pageBg, scale })

  const pad = IMAGE_PADDING * scale
  const padded = document.createElement('canvas')
  padded.width = canvas.width + pad * 2
  padded.height = canvas.height + pad * 2
  const ctx = padded.getContext('2d')
  if (!ctx) throw new Error('canvas 2d context unavailable')
  ctx.fillStyle = ledgerColor.pageBg
  ctx.fillRect(0, 0, padded.width, padded.height)
  ctx.drawImage(canvas, pad, pad)

  const link = document.createElement('a')
  link.download = filename
  link.href = padded.toDataURL('image/png')
  link.click()
}
