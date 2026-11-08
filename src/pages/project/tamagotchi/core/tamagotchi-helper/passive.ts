import {
  AscendancyPath,
  IPassiveDraft,
  IPassiveNode,
  PassiveEffectKey,
} from '../tamagotchi-interface'

export const PASSIVE_HUB = 'hub'

export const passiveEffectLabel: Record<PassiveEffectKey, string> = {
  atk: 'ATK',
  hp: 'HP',
  def: 'DEF',
  spd: 'SPD',
  crit: 'โอกาสคริติคอล',
  critdmg: 'ดาเมจคริติคอล',
  shield: 'โล่เริ่มต้น (% ของ HP)',
  regen: 'ฟื้น HP ต่อวินาที (%)',
  dbl: 'โอกาสโจมตีซ้ำ',
  burn: 'เทิร์นเผาไหม้ของท่าพิเศษ',
  hunger: 'ความอิ่มลดช้าลง',
  expCoin: 'เหรียญจากการสำรวจ',
  drop: 'โอกาสดรอปอุปกรณ์',
  lifesteal: 'ดูดเลือด (% ของดาเมจ)',
  thorns: 'สะท้อนดาเมจ (%)',
  firstStrike: 'ลงมือก่อนเสมอ',
  noCrit: 'ไม่ติดคริติคอล',
}

// "+3% ATK", "−20% HP", "เทิร์นเผาไหม้ของท่าพิเศษ +1".
export const describePassiveEffect = (key: PassiveEffectKey, value: number) => {
  const sign = value > 0 ? '+' : '−'
  const amount = Math.abs(value)
  if (key === 'firstStrike' || key === 'noCrit') {
    return passiveEffectLabel[key]
  }
  // These labels already carry their unit.
  if (key === 'burn' || key === 'shield' || key === 'regen') {
    return `${passiveEffectLabel[key]} ${sign}${amount}`
  }
  return `${sign}${amount}% ${passiveEffectLabel[key]}`
}

// Mirrors the server's passive rules (passive-data.ts) so a click can explain itself; the server
// still decides.
export const canAllocatePassive = (nodes: IPassiveNode[], owned: string[], nodeId: string) => {
  const node = nodes.find((entry) => entry.id === nodeId)
  return (
    !!node &&
    !owned.includes(nodeId) &&
    node.adj.some((id) => id === PASSIVE_HUB || owned.includes(id))
  )
}

export const canDeallocatePassive = (nodes: IPassiveNode[], owned: string[], nodeId: string) => {
  if (!owned.includes(nodeId)) {
    return false
  }
  const rest = new Set(owned.filter((id) => id !== nodeId))
  const seen = new Set([PASSIVE_HUB])
  const stack = [PASSIVE_HUB]
  while (stack.length) {
    const node = nodes.find((entry) => entry.id === stack.pop())
    for (const id of node?.adj ?? []) {
      if (rest.has(id) && !seen.has(id)) {
        seen.add(id)
        stack.push(id)
      }
    }
  }
  return [...rest].every((id) => seen.has(id))
}

// Total of every effect over the owned nodes (plus the picked mastery options), in the order of
// passiveEffectLabel.
export const sumPassiveEffects = (
  nodes: IPassiveNode[],
  owned: string[],
  picks: Record<string, number> = {}
) => {
  const totals: Partial<Record<PassiveEffectKey, number>> = {}
  for (const node of nodes) {
    if (owned.includes(node.id)) {
      const fx = { ...node.fx, ...(node.options?.[picks[node.id]]?.fx ?? {}) }
      for (const [key, value] of Object.entries(fx) as [PassiveEffectKey, number][]) {
        totals[key] = Math.round(((totals[key] ?? 0) + value) * 10) / 10
      }
    }
  }
  return (Object.keys(passiveEffectLabel) as PassiveEffectKey[])
    .filter((key) => totals[key])
    .map((key) => ({ key, value: totals[key]! }))
}

// Mirrors the server's ascendancy rule: the first node of a path is free to take, the rest must
// touch an owned node, and only one path can be used.
export const canAllocateAscendancyNode = (
  node: IPassiveNode,
  path: string | null,
  owned: string[]
) => {
  if (node.kind !== 'ascend' || owned.includes(node.id)) {
    return false
  }
  if (owned.length === 0) {
    return node.id.endsWith('-00')
  }
  return node.id.startsWith(`v2-asc-${path}-`) && node.adj.some((id) => owned.includes(id))
}

// `nodeId` plus every owned node that loses its link to the hub without it (a whole branch).
export const getPassiveBranch = (nodes: IPassiveNode[], owned: string[], nodeId: string) => {
  const rest = new Set(owned.filter((id) => id !== nodeId))
  const byId = new Map(nodes.map((node) => [node.id, node]))
  const seen = new Set([PASSIVE_HUB])
  const stack = [PASSIVE_HUB]
  while (stack.length) {
    for (const id of byId.get(stack.pop()!)?.adj ?? []) {
      if (rest.has(id) && !seen.has(id)) {
        seen.add(id)
        stack.push(id)
      }
    }
  }
  return owned.includes(nodeId) ? owned.filter((id) => !seen.has(id)) : []
}

// Ids of nodes whose name or effect text contains `query` (case-insensitive); empty query = none.
export const searchPassiveNodes = (nodes: IPassiveNode[], query: string) => {
  const needle = query.trim().toLowerCase()
  if (!needle) {
    return new Set<string>()
  }
  return new Set(
    nodes
      .filter(
        (node) =>
          node.id !== PASSIVE_HUB &&
          (node.name.toLowerCase().includes(needle) ||
            Object.keys(node.fx).some(
              (key) =>
                key.toLowerCase().includes(needle) ||
                passiveEffectLabel[key as PassiveEffectKey].toLowerCase().includes(needle)
            ))
      )
      .map((node) => node.id)
  )
}

export const getAscendancyPathOf = (ids: string[]): AscendancyPath | null => {
  const match = /^v2-asc-([a-z]+)-/.exec(ids[0] ?? '')
  return match ? (match[1] as AscendancyPath) : null
}

// An ascendancy node can be dropped while every other owned one stays connected to the path's
// first node (in practice: from the far end of the chain).
export const canDropAscendancyNode = (nodes: IPassiveNode[], ids: string[], nodeId: string) => {
  const path = getAscendancyPathOf(ids)
  if (!path || !ids.includes(nodeId)) {
    return false
  }
  const rest = new Set(ids.filter((id) => id !== nodeId))
  const byId = new Map(nodes.map((node) => [node.id, node]))
  const root = `v2-asc-${path}-00`
  const seen = new Set(rest.has(root) ? [root] : [])
  const stack = [...seen]
  while (stack.length) {
    for (const id of byId.get(stack.pop()!)?.adj ?? []) {
      if (rest.has(id) && !seen.has(id)) {
        seen.add(id)
        stack.push(id)
      }
    }
  }
  return [...rest].every((id) => seen.has(id))
}

// Mirrors the server's save cost (calcPassiveSaveCost): points taken back beyond the free refunds,
// a changed mastery pick, and starting the ascendancy over. The server still decides.
export const getPassiveSaveCost = (
  saved: IPassiveDraft,
  draft: IPassiveDraft,
  prices: {
    respec: { freeLeft: number; gemPrice: number }
    masteryRepick: number
    ascendancyReset: number
  }
) => {
  const kept = new Set(draft.nodeIds)
  const removed = saved.nodeIds.filter((id) => !kept.has(id)).length
  const respec = getRespecCost({ refunded: 0, ...prices.respec }, removed)
  const repicks = Object.entries(saved.masteries).filter(
    ([id, option]) =>
      kept.has(id) && draft.masteries[id] !== undefined && draft.masteries[id] !== option
  ).length
  const restarted =
    saved.ascendancyNodeIds.length > 0 &&
    saved.ascendancyNodeIds.some((id) => !draft.ascendancyNodeIds.includes(id))
  const total = respec + repicks * prices.masteryRepick + (restarted ? prices.ascendancyReset : 0)
  return { removed, respec, repicks, restarted, total }
}

// How a draft differs from what is saved, for the "unsaved changes" bar.
export const diffPassiveDraft = (saved: IPassiveDraft, draft: IPassiveDraft) => {
  const added = draft.nodeIds.filter((id) => !saved.nodeIds.includes(id)).length
  const removed = saved.nodeIds.filter((id) => !draft.nodeIds.includes(id)).length
  const ascAdded = draft.ascendancyNodeIds.filter(
    (id) => !saved.ascendancyNodeIds.includes(id)
  ).length
  const ascRemoved = saved.ascendancyNodeIds.filter(
    (id) => !draft.ascendancyNodeIds.includes(id)
  ).length
  const picks = new Set([...Object.keys(saved.masteries), ...Object.keys(draft.masteries)])
  const picked = [...picks].filter((id) => saved.masteries[id] !== draft.masteries[id]).length
  return {
    added,
    removed,
    ascAdded,
    ascRemoved,
    picked,
    isDirty: added + removed + ascAdded + ascRemoved + picked > 0,
  }
}

// Gems needed to take back `count` points when `refunded` were already taken back.
export const getRespecCost = (
  respec: { refunded: number; freeLeft: number; gemPrice: number },
  count: number
) => Math.max(0, count - respec.freeLeft) * respec.gemPrice

// A branch refund costs the same per point but never more than the cap.
export const getBranchRespecCost = (
  respec: { refunded: number; freeLeft: number; gemPrice: number; branchCap: number },
  count: number
) => Math.min(getRespecCost(respec, count), respec.branchCap)

// Mirrors the server's merge checks for one parent, so the picker explains itself.
