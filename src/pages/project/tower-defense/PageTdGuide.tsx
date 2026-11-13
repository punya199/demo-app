import { ArrowLeftOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { appPath } from '../../../config/app-paths'
import { t, type Lang } from './strings'
import { TD_PATCH_NOTES } from './td-patch-notes'
import { useGetTdGacha } from './td-gacha-query'
import { useGetTdProfile } from './td-profile-query'
import { wikiSections } from './td-wiki'

const card =
  'flex flex-col gap-2 rounded border border-slate-300 bg-white px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
const muted = 'text-slate-500 dark:text-slate-400'

// Guide screen: the in-game wiki (Thai or English) and the Thai patch notes. Wiki numbers come from
// the td-sim config and from the profile and gacha queries the other screens already use.
const PageTdGuide = () => {
  const [lang, setLang] = useState<Lang>('th')
  const { data: gacha } = useGetTdGacha()
  const { data: profile } = useGetTdProfile()
  const sections = wikiSections(lang, { gacha: gacha?.config, energy: profile?.energy })

  return (
    <div className="mx-auto flex min-h-full w-full max-w-xl flex-col gap-3 px-4 py-4">
      <div className="flex items-center justify-between">
        <Link
          to={appPath.towerDefense()}
          className={`${muted} hover:text-blue-600 dark:hover:text-blue-400`}
          aria-label={t(lang, 'back')}
        >
          <ArrowLeftOutlined className="text-lg" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t(lang, 'wiki_open')}</h1>
        <button
          className="rounded bg-slate-200 px-3 py-1 text-sm dark:bg-slate-700 dark:text-white"
          onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
        >
          {t(lang, 'lang')}
        </button>
      </div>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        {t(lang, 'patch_title')}
      </h2>
      {TD_PATCH_NOTES.map((note) => (
        <div key={note.date} className={card}>
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-semibold">{note.title}</span>
            <small className={muted}>{note.date}</small>
          </div>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
            {note.changes.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      ))}
      {sections.map((s) => (
        <section key={s.id} className={card}>
          <h2 className="font-semibold">{s.title}</h2>
          {s.lines.map((line) => (
            <p key={line} className="text-sm">
              {line}
            </p>
          ))}
        </section>
      ))}
    </div>
  )
}

export default PageTdGuide
