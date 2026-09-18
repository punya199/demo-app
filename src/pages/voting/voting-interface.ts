export enum EnumPollType {
  SINGLE = 'single',
  MULTIPLE = 'multiple',
  RANKING = 'ranking',
}

export interface IPollOptionData {
  id: string
  label: string
  order: number
}

export interface IPollData {
  id: string
  title: string
  description: string | null
  slug: string
  pollType: EnumPollType
  maxSelections: number | null
  closesAt: string | null
  closedAt: string | null
  createdAt: string
  options: IPollOptionData[]
}

export interface ICreatePollParams {
  title: string
  description?: string
  pollType: EnumPollType
  options: string[]
  maxSelections?: number
  closesAt?: string
}
