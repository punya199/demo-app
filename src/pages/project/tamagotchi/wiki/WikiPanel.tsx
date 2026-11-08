import { Collapse, Spin } from 'antd'
import { IWikiData } from '../core/tamagotchi-interface'
import { useGetWiki } from '../core/tamagotchi-service'
import { CraftWikiTab } from './WikiCraft'
import { ResetWikiTab } from './WikiReset'
import { SkillsWikiTab } from './WikiSkills'
import { StartWikiTab, CareWikiTab, OnlineWikiTab, StaminaWikiTab } from './WikiBasics'
import { EvolutionWikiTab, PotentialWikiTab } from './WikiEvolution'
import { BattleWikiTab, AdventureWikiTab, IdleWikiTab } from './WikiBattle'
import { PassiveWikiTab, ReturnHomeWikiTab, CostumeWikiTab, EconomyWikiTab } from './WikiProgress'
import { EquipmentWikiTab, RaidWikiTab } from './WikiEquipment'
import { WorldBossWikiTab, BossDetailWikiTab } from './WikiBosses'
import { SocialWikiTab, PvpWikiTab } from './WikiSocialPvp'

// The in-game guide. Every number comes from GET /monster/wiki (the server's rule constants), so
// this page explains the rules exactly as the server applies them.

const buildSections = (wiki: IWikiData) => [
  { key: 'start', label: '🎮 วิธีเล่น', children: <StartWikiTab wiki={wiki} /> },
  { key: 'care', label: '🍖 การเลี้ยง', children: <CareWikiTab wiki={wiki} /> },
  { key: 'online', label: '⚡ ออนไลน์', children: <OnlineWikiTab wiki={wiki} /> },
  { key: 'stamina', label: '🔋 Stamina (ผจญภัย)', children: <StaminaWikiTab wiki={wiki} /> },
  { key: 'evolution', label: '🧬 วิวัฒนาการ', children: <EvolutionWikiTab wiki={wiki} /> },
  { key: 'potential', label: '🎲 ค่าสุ่มมอน', children: <PotentialWikiTab wiki={wiki} /> },
  { key: 'battle', label: '⚔️ การต่อสู้', children: <BattleWikiTab wiki={wiki} /> },
  { key: 'skills', label: '🌀 สกิล', children: <SkillsWikiTab wiki={wiki} /> },
  { key: 'adventure', label: '🗺️ ผจญภัย', children: <AdventureWikiTab wiki={wiki} /> },
  { key: 'idle', label: '💤 โหมด Idle', children: <IdleWikiTab wiki={wiki} /> },
  { key: 'passive', label: '🌳 ต้นไม้ความสามารถ', children: <PassiveWikiTab wiki={wiki} /> },
  {
    key: 'return-home',
    label: '🌠 กลับดาว (แกนสัตว์เลี้ยง)',
    children: <ReturnHomeWikiTab wiki={wiki} />,
  },
  { key: 'costume', label: '👗 ชุดแต่งตัว', children: <CostumeWikiTab /> },
  { key: 'equipment', label: '🛡️ อุปกรณ์และตีบวก', children: <EquipmentWikiTab wiki={wiki} /> },
  { key: 'craft', label: '🔨 คราฟต์', children: <CraftWikiTab wiki={wiki} /> },
  { key: 'raid', label: '👹 บอสและชุดเซ็ต', children: <RaidWikiTab wiki={wiki} /> },
  { key: 'world-boss', label: '🌩️ บอสโลก', children: <WorldBossWikiTab wiki={wiki} /> },
  {
    key: 'boss-detail',
    label: '🎯 ค่าบอสและหุ่นซ้อม',
    children: <BossDetailWikiTab wiki={wiki} />,
  },
  { key: 'social', label: '🤝 เพื่อนและเช่าตัว', children: <SocialWikiTab wiki={wiki} /> },
  { key: 'pvp', label: '🏟️ สนามประลอง (PvP)', children: <PvpWikiTab wiki={wiki} /> },
  { key: 'reset', label: '🕒 ตารางรีเซ็ต', children: <ResetWikiTab wiki={wiki} /> },
  { key: 'economy', label: '💰 เหรียญ เพชร และร้านค้า', children: <EconomyWikiTab wiki={wiki} /> },
]

export const WikiPanel = () => {
  const { data, isLoading } = useGetWiki()
  if (isLoading || !data) {
    return <Spin />
  }
  // accordion: opening a section closes the one that was open.
  return (
    <Collapse
      accordion
      className="w-full"
      defaultActiveKey={['start']}
      items={buildSections(data)}
    />
  )
}
