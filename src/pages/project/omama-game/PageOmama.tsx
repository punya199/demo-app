import { Button } from 'antd'
import { useCallback, useState } from 'react'

import { cardTitleData, ICardTitleData, INameDataType } from '../random-card/cardGame-data'
import AddPlayerOmama from './AddPlayerOmama'
import EditCardTitle from './EditCardTitle'
import Omama from './Omama'

export interface SpecialCardOwner {
  K: number | null
  Q: number | null
  J: number | null
}

const PageOmama = () => {
  const [isAddingPlayer, setIsAddingPlayer] = useState(1)
  const [nameIndex, setNameIndex] = useState(0)
  const [userNameList, setUserNameList] = useState<string[]>([])
  const [cardTitle, setCardTitle] = useState<Record<INameDataType, string>>(cardTitleData)

  const addUserName = useCallback(
    (name: string) => {
      if (!name.trim()) return
      if (userNameList.includes(name)) return
      setUserNameList([...userNameList, name])
    },
    [userNameList]
  )

  const removeUserName = (name: string) => {
    setUserNameList((prev) => {
      const newList = prev.filter((e) => e !== name)
      if (newList.length === 0) {
        setNameIndex(0)
      } else if (nameIndex >= newList.length) {
        setNameIndex(newList.length - 1)
      }
      return newList
    })
  }
  const onChange = (dataTitle: ICardTitleData) => {
    setCardTitle(dataTitle)
  }
  const upperIndexName = (index: number) => {
    const listName = [...userNameList]
    const up = listName[index]
    listName[index] = listName[index - 1]
    listName[index - 1] = up
    setUserNameList(listName)
  }

  const downIndexName = (index: number) => {
    const listName = [...userNameList]
    const up = listName[index]
    listName[index] = listName[index + 1]
    listName[index + 1] = up
    setUserNameList(listName)
  }

  return (
    <div className="flex max-w-5xl flex-col gap-2 p-4">
      <div className="rounded-2xl bg-blue-400 px-4 py-2 text-center text-2xl font-bold">
        Game Omama
      </div>
      <div className="flex items-center justify-between md:flex-row">
        <Button type="primary" className="!h-9" onClick={() => setIsAddingPlayer(1)}>
          เพิ่มชื่อหรือแก้ไขชื่อผู้เล่น
        </Button>
        {userNameList.length !== 0 && (
          <Button type="primary" className="!h-9" onClick={() => setIsAddingPlayer(2)}>
            เริ่มเกม
          </Button>
        )}
        {userNameList.length !== 0 && (
          <Button type="primary" className="!h-9" onClick={() => setIsAddingPlayer(3)}>
            แก้ไขกฎ
          </Button>
        )}
      </div>
      {isAddingPlayer === 1 && (
        <AddPlayerOmama
          userNameList={userNameList}
          addUserName={addUserName}
          removeUserName={removeUserName}
          upperIndexName={upperIndexName}
          downIndexName={downIndexName}
        />
      )}

      {isAddingPlayer === 2 && (
        <Omama
          userNameList={userNameList}
          nameIndex={nameIndex}
          setNameIndex={setNameIndex}
          cardTitle={cardTitle}
        />
      )}
      {isAddingPlayer === 3 && <EditCardTitle value={cardTitle} onChange={onChange} />}
    </div>
  )
}

export default PageOmama
