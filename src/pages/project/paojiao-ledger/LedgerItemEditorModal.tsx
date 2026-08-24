import { message, Modal, Popconfirm } from 'antd'
import { CSSProperties, useState } from 'react'
import {
  LedgerItemRecord,
  useAddLedgerItem,
  useDeleteLedgerItem,
  useLedgerItems,
  useRenameLedgerItem,
} from './ledger-query'
import { ledgerColor, ledgerFont } from './ledger-tokens'
import { ledgerInputStyle, ledgerPrimaryButtonStyle } from './ledger-ui-styles'

interface LedgerItemEditorModalProps {
  open: boolean
  onClose: () => void
}

// Server-backed (shared across both users) editor for the add-entry dropdown's category list -
// see LedgerItemSelect, which opens this from its "จัดการหมวดหมู่" row.
export const LedgerItemEditorModal = ({ open, onClose }: LedgerItemEditorModalProps) => {
  const { data: items, isLoading } = useLedgerItems()
  const addItem = useAddLedgerItem()
  const renameItem = useRenameLedgerItem()
  const deleteItem = useDeleteLedgerItem()

  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const sorted = [...(items ?? [])].sort((a, b) => a.name.localeCompare(b.name, 'th'))

  const handleAdd = () => {
    const name = newName.trim()
    if (!name) return
    addItem.mutate(name, {
      onSuccess: () => setNewName(''),
      onError: (err) => message.error(getErrorMessage(err) ?? 'เพิ่มไม่สำเร็จ ลองใหม่อีกครั้ง'),
    })
  }

  const startEdit = (item: LedgerItemRecord) => {
    setEditingId(item.id)
    setEditingName(item.name)
  }

  const commitEdit = () => {
    if (!editingId) return
    const name = editingName.trim()
    if (!name) {
      setEditingId(null)
      return
    }
    renameItem.mutate(
      { id: editingId, name },
      {
        onSuccess: () => setEditingId(null),
        onError: (err) => message.error(getErrorMessage(err) ?? 'แก้ไขไม่สำเร็จ ลองใหม่อีกครั้ง'),
      }
    )
  }

  const handleDelete = (item: LedgerItemRecord) => {
    deleteItem.mutate(item.id, {
      onError: () => message.error('ลบไม่สำเร็จ ลองใหม่อีกครั้ง'),
    })
  }

  return (
    <Modal title="จัดการหมวดหมู่" open={open} onCancel={onClose} footer={null} destroyOnHidden>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {isLoading && (
          <div style={{ fontSize: 13, color: ledgerColor.textFaint }}>กำลังโหลด...</div>
        )}

        <div
          style={{
            maxHeight: 340,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {sorted.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 2px',
                borderBottom: `1px solid ${ledgerColor.rowDivider}`,
              }}
            >
              {editingId === item.id ? (
                <>
                  <input
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitEdit()
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    style={{ ...ledgerInputStyle, flex: 1, padding: '6px 8px' }}
                  />
                  <button
                    type="button"
                    onClick={commitEdit}
                    style={smallActionStyle(ledgerColor.moneyIn)}
                  >
                    บันทึก
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    style={smallActionStyle(ledgerColor.textFaint)}
                  >
                    ยกเลิก
                  </button>
                </>
              ) : (
                <>
                  <span style={{ flex: 1, fontSize: 14, minWidth: 0 }}>{item.name}</span>
                  {item.protected ? (
                    <span
                      style={{
                        fontSize: 11.5,
                        color: ledgerColor.textFaint,
                        whiteSpace: 'nowrap',
                      }}
                      title="ระบบใช้ชื่อนี้อ้างอิงการคำนวณโดยตรง แก้ไข/ลบไม่ได้"
                    >
                      ใช้ในระบบ
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        style={smallActionStyle(ledgerColor.accent)}
                      >
                        แก้ไข
                      </button>
                      <Popconfirm
                        title="ลบหมวดหมู่นี้?"
                        description="ลบแล้วกู้คืนไม่ได้"
                        okText="ลบ"
                        cancelText="ยกเลิก"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => handleDelete(item)}
                        styles={{ root: { width: 280 } }}
                      >
                        <button type="button" style={smallActionStyle(ledgerColor.moneyOut)}>
                          ลบ
                        </button>
                      </Popconfirm>
                    </>
                  )}
                </>
              )}
            </div>
          ))}
          {!isLoading && sorted.length === 0 && (
            <div style={{ fontSize: 13, color: ledgerColor.textFaint, padding: '8px 2px' }}>
              ยังไม่มีรายการ
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            gap: 8,
            paddingTop: 10,
            borderTop: `1px solid ${ledgerColor.rowDivider}`,
          }}
        >
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="เพิ่มรายการใหม่"
            style={{ ...ledgerInputStyle, flex: 1 }}
          />
          <button type="button" onClick={handleAdd} style={ledgerPrimaryButtonStyle}>
            เพิ่ม
          </button>
        </div>
      </div>
    </Modal>
  )
}

const smallActionStyle = (color: string): CSSProperties => ({
  border: 'none',
  background: 'none',
  padding: '4px 6px',
  fontSize: 12.5,
  fontWeight: 500,
  fontFamily: ledgerFont.sans,
  color,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
})

function getErrorMessage(err: unknown): string | undefined {
  if (err && typeof err === 'object' && 'response' in err) {
    const resp = (err as { response?: { data?: { message?: string } } }).response
    return resp?.data?.message
  }
  return undefined
}
