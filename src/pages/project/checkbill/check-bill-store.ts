import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Friend } from './AddFriends'
import { Item } from './AddItem'

type PositionStoreState = { items: Item[]; friends: Friend[]; title: string }

type PositionStoreActions = {
  setItems: (nextPosition: PositionStoreState['items']) => void
  setFriends: (nextPosition: PositionStoreState['friends']) => void
  setTitle: (nextTitle: PositionStoreState['title']) => void
}

export type PositionStore = PositionStoreState & PositionStoreActions

export const useCheckBillStore = create<PositionStore>()(
  persist(
    (set) => ({
      items: [],
      friends: [],
      title: '',
      setItems: (items) => set({ items }),
      setFriends: (friends) => set({ friends }),
      setTitle: (title) => set({ title }),
    }),
    { name: 'position-storage' }
  )
)
