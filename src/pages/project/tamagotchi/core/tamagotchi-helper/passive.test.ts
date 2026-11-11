import { describe, expect, it } from 'vitest'
import {
  hpAfter,
  describePassiveEffect,
  searchPassiveNodes,
  getPassiveBranch,
  canDropAscendancyNode,
  getPassiveSaveCost,
  sumPassiveEffects,
  getAscendancyPathOf,
  canDeallocatePassive,
  canAllocatePassive,
  diffPassiveDraft,
  canAllocateAscendancyNode,
  getBranchRespecCost,
  getRespecCost,
  getDraftChangeCost,
} from '.'
import { IBattleEvent, IPassiveDraft, IPassiveNode } from '../tamagotchi-interface'

describe('passive tree helpers', () => {
  const node = (id: string, adj: string[], fx: IPassiveNode['fx'] = {}) =>
    ({ id, adj, fx }) as IPassiveNode
  const nodes = [
    node('hub', ['a']),
    node('a', ['hub', 'b'], { atk: 3 }),
    node('b', ['a'], { atk: 3, hp: -20 }),
  ]

  it('allocates only next to the hub or an owned node', () => {
    expect(canAllocatePassive(nodes, [], 'a')).toBe(true)
    expect(canAllocatePassive(nodes, [], 'b')).toBe(false)
    expect(canAllocatePassive(nodes, ['a'], 'b')).toBe(true)
    expect(canAllocatePassive(nodes, ['a'], 'a')).toBe(false)
  })

  it('drops only a node that keeps the rest connected', () => {
    expect(canDeallocatePassive(nodes, ['a', 'b'], 'b')).toBe(true)
    expect(canDeallocatePassive(nodes, ['a', 'b'], 'a')).toBe(false)
  })

  it('sums and describes effects', () => {
    expect(sumPassiveEffects(nodes, ['a', 'b'])).toEqual([
      { key: 'atk', value: 6 },
      { key: 'hp', value: -20 },
    ])
    expect(describePassiveEffect('hp', -20)).toBe('−20% HP')
    expect(describePassiveEffect('burn', 1)).toBe('เทิร์นเผาไหม้ของท่าพิเศษ +1')
  })

  it('charges gems only past the free refunds', () => {
    const respec = { refunded: 8, freeLeft: 2, gemPrice: 1 }
    expect(getRespecCost(respec, 2)).toBe(0)
    expect(getRespecCost(respec, 5)).toBe(3)
  })
})

describe('passive branch and search', () => {
  const node = (id: string, adj: string[], name = id, fx: IPassiveNode['fx'] = {}) =>
    ({ id, adj, name, fx }) as IPassiveNode
  const nodes = [
    node('hub', ['a']),
    node('a', ['hub', 'b'], 'Ember Might', { atk: 2 }),
    node('b', ['a', 'c'], 'Deep Pool', { hp: 2 }),
    node('c', ['b'], 'Deep Pool', { hp: 2 }),
  ]

  it('takes the node and everything cut off from the hub', () => {
    expect(getPassiveBranch(nodes, ['a', 'b', 'c'], 'b')).toEqual(['b', 'c'])
    expect(getPassiveBranch(nodes, ['a', 'b', 'c'], 'c')).toEqual(['c'])
    expect(getPassiveBranch(nodes, ['a'], 'b')).toEqual([])
  })

  it('searches names and effect labels, and never the hub', () => {
    expect([...searchPassiveNodes(nodes, 'deep')]).toEqual(['b', 'c'])
    expect([...searchPassiveNodes(nodes, 'atk')]).toEqual(['a'])
    expect(searchPassiveNodes(nodes, '  ').size).toBe(0)
  })

  it('caps a branch refund at the branch cap', () => {
    const respec = { refunded: 10, freeLeft: 0, gemPrice: 1, branchCap: 20 }
    expect(getBranchRespecCost(respec, 12)).toBe(12)
    expect(getBranchRespecCost(respec, 60)).toBe(20)
  })
})

describe('masteries, ascendancy and keystone replay', () => {
  const node = (id: string, adj: string[], extra: Partial<IPassiveNode> = {}) =>
    ({ id, adj, name: id, fx: {}, kind: 'small', ...extra }) as IPassiveNode

  it('adds the picked mastery option to the totals', () => {
    const nodes = [
      node('m', [], {
        kind: 'mastery',
        options: [
          { name: 'a', fx: { atk: 8 } },
          { name: 'b', fx: { hp: 8 } },
        ],
      }),
    ]
    expect(sumPassiveEffects(nodes, ['m'])).toEqual([])
    expect(sumPassiveEffects(nodes, ['m'], { m: 1 })).toEqual([{ key: 'hp', value: 8 }])
  })

  it('starts an ascendancy path at its first node, then follows the chain on that path only', () => {
    const root = node('v2-asc-striker-00', ['v2-asc-striker-01'], { kind: 'ascend' })
    const next = node('v2-asc-striker-01', ['v2-asc-striker-00'], { kind: 'ascend' })
    const other = node('v2-asc-warden-00', [], { kind: 'ascend' })
    expect(canAllocateAscendancyNode(root, null, [])).toBe(true)
    expect(canAllocateAscendancyNode(next, null, [])).toBe(false)
    expect(canAllocateAscendancyNode(next, 'striker', [root.id])).toBe(true)
    expect(canAllocateAscendancyNode(other, 'striker', [root.id])).toBe(false)
    expect(canAllocateAscendancyNode(node('x', []), null, [])).toBe(false)
  })

  it('describes flag effects without a number', () => {
    expect(describePassiveEffect('firstStrike', 1)).toBe('ลงมือก่อนเสมอ')
    expect(describePassiveEffect('lifesteal', 15)).toBe('+15% ดูดเลือด (% ของดาเมจ)')
  })

  it('follows the attacker HP through lifesteal and thorns', () => {
    const events = [
      { actor: 'player', targetHp: 20, actorHp: 45, healed: 5 },
      { actor: 'enemy', targetHp: 30, actorHp: 25, reflected: 5 },
    ] as IBattleEvent[]
    expect(hpAfter(events, 1, 'player', 50)).toBe(45)
    expect(hpAfter(events, 1, 'enemy', 40)).toBe(20)
    expect(hpAfter(events, 2, 'enemy', 40)).toBe(25)
    expect(hpAfter(events, 2, 'player', 50)).toBe(30)
  })
})

describe('passive draft and save', () => {
  const draft = (overrides: Partial<IPassiveDraft> = {}): IPassiveDraft => ({
    nodeIds: [],
    masteries: {},
    ascendancyNodeIds: [],
    ...overrides,
  })
  const prices = { respec: { freeLeft: 2, gemPrice: 1 }, masteryRepick: 1, ascendancyReset: 20 }

  it('is free to add, free within the free refunds, then 1 gem per point taken back', () => {
    const saved = draft({ nodeIds: ['a', 'b', 'c', 'd'] })
    expect(
      getPassiveSaveCost(saved, draft({ nodeIds: ['a', 'b', 'c', 'd', 'e'] }), prices).total
    ).toBe(0)
    expect(getPassiveSaveCost(saved, draft({ nodeIds: ['a', 'b'] }), prices).total).toBe(0)
    expect(getPassiveSaveCost(saved, draft(), prices)).toMatchObject({ removed: 4, total: 2 })
  })

  it('charges for a changed mastery pick on a kept node, but not for a first pick', () => {
    const saved = draft({ nodeIds: ['m'], masteries: { m: 0 } })
    expect(
      getPassiveSaveCost(saved, draft({ nodeIds: ['m'], masteries: { m: 2 } }), prices).repicks
    ).toBe(1)
    expect(
      getPassiveSaveCost(
        draft({ nodeIds: ['m'] }),
        draft({ nodeIds: ['m'], masteries: { m: 2 } }),
        prices
      ).total
    ).toBe(0)
  })

  it('charges the ascendancy price only when something in it is removed', () => {
    const saved = draft({ ascendancyNodeIds: ['v2-asc-striker-00'] })
    expect(getPassiveSaveCost(saved, draft(), prices).total).toBe(20)
    expect(
      getPassiveSaveCost(
        saved,
        draft({ ascendancyNodeIds: ['v2-asc-striker-00', 'v2-asc-striker-01'] }),
        prices
      ).total
    ).toBe(0)
  })

  it('reports what changed, and nothing for an identical draft', () => {
    const saved = draft({ nodeIds: ['a', 'b'], masteries: { m: 0 } })
    expect(diffPassiveDraft(saved, saved).isDirty).toBe(false)
    expect(
      diffPassiveDraft(saved, draft({ nodeIds: ['a', 'c', 'd'], masteries: { m: 1 } }))
    ).toMatchObject({
      added: 2,
      removed: 1,
      picked: 1,
      isDirty: true,
    })
  })

  it('knows the ascendancy path and only drops a node that leaves the rest connected', () => {
    const node = (id: string, adj: string[]) =>
      ({ id, adj, fx: {}, kind: 'ascend' }) as unknown as IPassiveNode
    const nodes = [
      node('v2-asc-warden-00', ['v2-asc-warden-01']),
      node('v2-asc-warden-01', ['v2-asc-warden-00', 'v2-asc-warden-02']),
      node('v2-asc-warden-02', ['v2-asc-warden-01']),
    ]
    const ids = nodes.map((n) => n.id)
    expect(getAscendancyPathOf(ids)).toBe('warden')
    expect(getAscendancyPathOf([])).toBeNull()
    expect(canDropAscendancyNode(nodes, ids, 'v2-asc-warden-02')).toBe(true)
    expect(canDropAscendancyNode(nodes, ids, 'v2-asc-warden-01')).toBe(false)
  })
})

// The tree is a mesh, so these use several branches off the hub, listed so the search must visit
// nodes that come before the one it removes (a 2-node chain cannot show that).
describe('canDeallocatePassive on a branching tree', () => {
  const node = (id: string, adj: string[]) => ({ id, adj, fx: {} }) as IPassiveNode
  const nodes = [
    node('hub', ['r6', 'r7']),
    node('r6', ['hub', 'x']),
    node('r7', ['hub', 's1']),
    node('s1', ['r7', 's2', 'l']),
    node('s2', ['s1', 's3']),
    node('s3', ['s2']),
    node('l', ['s1']),
    node('x', ['r6']),
  ]

  it('lets a root go when the rest hangs off another root', () => {
    expect(canDeallocatePassive(nodes, ['r6', 'r7', 's1'], 'r6')).toBe(true)
  })

  it('refuses a node that other nodes hang off, and says how many go with it', () => {
    const owned = ['r7', 's1', 's2', 's3', 'l']
    expect(canDeallocatePassive(nodes, owned, 's1')).toBe(false)
    expect(getPassiveBranch(nodes, owned, 's1').sort()).toEqual(['l', 's1', 's2', 's3'])
  })

  it('lets any leaf go and nothing that is not owned', () => {
    const owned = ['r7', 's1', 's2', 's3', 'l']
    expect(canDeallocatePassive(nodes, owned, 's3')).toBe(true)
    expect(canDeallocatePassive(nodes, owned, 'l')).toBe(true)
    expect(canDeallocatePassive(nodes, owned, 'x')).toBe(false)
  })

  it('agrees with the branch for every owned node of a larger tree', () => {
    const owned = ['r6', 'x', 'r7', 's1', 's2', 's3', 'l']
    for (const id of owned) {
      expect(canDeallocatePassive(nodes, owned, id)).toBe(
        getPassiveBranch(nodes, owned, id).length === 1
      )
    }
    expect(owned.filter((id) => canDeallocatePassive(nodes, owned, id)).sort()).toEqual([
      'l',
      's3',
      'x',
    ])
  })
})

describe('getDraftChangeCost', () => {
  const prices = {
    respec: { freeLeft: 1, gemPrice: 1 },
    masteryRepick: 1,
    ascendancyReset: 20,
  }
  const saved: IPassiveDraft = {
    nodeIds: ['a', 'b', 'c'],
    masteries: {},
    ascendancyNodeIds: ['v2-asc-striker-00', 'v2-asc-striker-01'],
  }

  it('is free inside the free refunds and 1 gem per point after', () => {
    const one = { ...saved, nodeIds: ['a', 'b'] }
    const two = { ...saved, nodeIds: ['a'] }
    expect(getDraftChangeCost(saved, saved, one, prices)).toBe(0)
    expect(getDraftChangeCost(saved, one, two, prices)).toBe(1)
  })

  it('charges the whole reset for dropping one ascendancy node', () => {
    const next = { ...saved, ascendancyNodeIds: ['v2-asc-striker-00'] }
    expect(getDraftChangeCost(saved, saved, next, prices)).toBe(20)
    // Dropping a second one in the same draft adds nothing: the reset is already paid.
    const none = { ...saved, ascendancyNodeIds: [] }
    expect(getDraftChangeCost(saved, next, none, prices)).toBe(0)
  })

  it('is negative when an edit puts a node back', () => {
    const removed = { ...saved, nodeIds: ['a'] }
    expect(getDraftChangeCost(saved, removed, saved, prices)).toBe(-1)
  })
})
