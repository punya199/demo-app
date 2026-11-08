import { ReactNode } from 'react'

// Small building blocks shared by the in-game guide's tabs.

export const Table = (props: { head: string[]; rows: ReactNode[][] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left text-xs">
      <thead>
        <tr className="border-b border-slate-200 dark:border-slate-700">
          {props.head.map((cell) => (
            <th key={cell} className="py-1 pr-2 font-semibold">
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {props.rows.map((row, index) => (
          <tr key={index} className="border-b border-slate-100 dark:border-slate-800">
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} className="py-1 pr-2 align-top">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export const List = (props: { items: ReactNode[] }) => (
  <ul className="ml-4 list-disc space-y-1 text-sm">
    {props.items.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
)

export const Heading = (props: { children: ReactNode }) => (
  <div className="mt-3 mb-1 font-semibold text-slate-900 first:mt-0 dark:text-slate-100">
    {props.children}
  </div>
)
