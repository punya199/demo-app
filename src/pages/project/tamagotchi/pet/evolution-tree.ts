import { EnumMonsterLine, EnumMonsterStage, IWikiSpecies } from '../core/tamagotchi-interface'

// Lays out one line's evolution tree (pure, so it can be tested) for EvolutionTree.tsx: one
// column per stage, branches stacked so the alternate form sits on top, the good/normal form in
// the middle row and the neglected form at the bottom. Fused forms belong to two lines and are
// not part of any one line's tree.

export const TREE_STAGES = [
  EnumMonsterStage.EGG,
  EnumMonsterStage.BABY_1,
  EnumMonsterStage.BABY_2,
  EnumMonsterStage.ADULT,
  EnumMonsterStage.PERFECT,
  EnumMonsterStage.ULTIMATE,
] as const

export interface ITreeNode {
  species: IWikiSpecies
  column: number
  row: number
  // Not a final form and nowhere to go: the branch ends without reaching an ultimate.
  isDeadEnd: boolean
}

export interface ITreeEdge {
  from: string
  to: string
}

export interface ITreeLayout {
  nodes: ITreeNode[]
  edges: ITreeEdge[]
  rows: number
}

// Alt forms first, then the plain/good branch, then the poor branch.
const branchRank = (speciesId: string) => {
  if (speciesId.endsWith('Alt')) {
    return 0
  }
  if (speciesId.endsWith('Poor')) {
    return 2
  }
  return 1
}

const isFinalStage = (stage: EnumMonsterStage) =>
  stage === EnumMonsterStage.ULTIMATE || stage === EnumMonsterStage.FUSED

export const buildEvolutionTree = (
  allSpecies: IWikiSpecies[],
  line: EnumMonsterLine
): ITreeLayout => {
  const columns = TREE_STAGES.map((stage) =>
    allSpecies
      .filter((species) => species.line === line && species.stage === stage)
      .sort((a, b) => branchRank(a.id) - branchRank(b.id))
  )
  const rows = Math.max(1, ...columns.map((column) => column.length))

  const nodes = columns.flatMap((column, columnIndex) => {
    // A lone form sits in the middle row; a pair keeps the alt form level with the alt branch.
    const offset = column.length === 1 ? Math.floor((rows - 1) / 2) : 0
    return column.map((species, index) => ({
      species,
      column: columnIndex,
      row: offset + index,
      isDeadEnd: !isFinalStage(species.stage) && species.evolutions.length === 0,
    }))
  })
  const ids = new Set(nodes.map((node) => node.species.id))
  const edges = nodes.flatMap((node) =>
    node.species.evolutions
      .filter((rule) => ids.has(rule.to))
      .map((rule) => ({ from: node.species.id, to: rule.to }))
  )
  return { nodes, edges, rows }
}

export type TreeNodeState = 'done' | 'current' | 'next' | 'next-dead' | 'skipped' | 'future'
export type TreeEdgeState = 'done' | 'next' | 'next-dead' | 'idle'

export interface ITreeProgress {
  // The forms this monster has been, egg first; the last one is its current form.
  path: string[]
}

// How one monster's history colors its line's tree. Without progress every node is plain.
export const getTreeStates = (layout: ITreeLayout, progress: ITreeProgress | null) => {
  const nodeStates = new Map<string, TreeNodeState>()
  const edgeStates = new Map<string, TreeEdgeState>()
  const edgeKey = (edge: ITreeEdge) => `${edge.from}>${edge.to}`
  if (!progress || progress.path.length === 0) {
    return { nodeStates, edgeStates, edgeKey }
  }

  const currentId = progress.path[progress.path.length - 1]
  const current = layout.nodes.find((node) => node.species.id === currentId)
  const onPath = new Set(progress.path)
  const nextIds = new Set(
    layout.edges.filter((edge) => edge.from === currentId).map((edge) => edge.to)
  )
  const isDead = (id: string) =>
    layout.nodes.find((node) => node.species.id === id)?.isDeadEnd ?? false

  for (const node of layout.nodes) {
    const id = node.species.id
    if (id === currentId) {
      nodeStates.set(id, 'current')
    } else if (onPath.has(id)) {
      nodeStates.set(id, 'done')
    } else if (nextIds.has(id)) {
      nodeStates.set(id, isDead(id) ? 'next-dead' : 'next')
    } else if (current && node.column <= current.column) {
      nodeStates.set(id, 'skipped')
    } else {
      nodeStates.set(id, 'future')
    }
  }

  const pathEdges = new Set(
    progress.path.slice(1).map((to, index) => `${progress.path[index]}>${to}`)
  )
  for (const edge of layout.edges) {
    const key = edgeKey(edge)
    if (pathEdges.has(key)) {
      edgeStates.set(key, 'done')
    } else if (edge.from === currentId) {
      edgeStates.set(key, isDead(edge.to) ? 'next-dead' : 'next')
    } else {
      edgeStates.set(key, 'idle')
    }
  }
  return { nodeStates, edgeStates, edgeKey }
}
