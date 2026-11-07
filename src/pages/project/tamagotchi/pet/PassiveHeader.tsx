import { IPassiveState } from '../core/tamagotchi-interface'

interface IPassiveHeaderProps {
  points: IPassiveState['points']
}

export const PassiveHeader = (props: IPassiveHeaderProps) => {
  const { points } = props
  return (
    <>
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-slate-500 dark:text-slate-400">แต้มที่เหลือ</span>
        <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {points.left}
          <span className="text-sm font-normal text-slate-500"> / {points.earned}</span>
        </span>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Dex {points.sources.dexSpecies} · เรด {points.sources.raidFirstClears} · ผจญภัย{' '}
        {points.sources.adventureClears} · ชนะสะสม {points.sources.totalWins} · บอสโลก{' '}
        {points.sources.worldBossDefeats} · ซีซัน PvP {points.sources.pvpSeasons}
      </p>
    </>
  )
}
