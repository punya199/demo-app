import { Tag } from 'antd'
import { PATCH_KIND_LABEL, PATCH_NOTES, PatchNoteKind } from './patch-notes'

const KIND_COLOR: Record<PatchNoteKind, string> = { new: 'green', update: 'blue', fix: 'orange' }

export const PatchNotesPanel = () => (
  <div className="flex w-full flex-col gap-3">
    {PATCH_NOTES.map((note) => (
      <div
        key={note.version}
        className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="mb-2 flex items-baseline justify-between">
          <span className="font-semibold text-slate-900 dark:text-slate-100">v{note.version}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">{note.date}</span>
        </div>
        <ul className="flex flex-col gap-1 text-sm text-slate-700 dark:text-slate-300">
          {note.changes.map((change) => (
            <li key={change.text}>
              <Tag color={KIND_COLOR[change.kind]}>{PATCH_KIND_LABEL[change.kind]}</Tag>
              {change.text}
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
)
