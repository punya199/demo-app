import { EditOutlined, PlayCircleOutlined, UserAddOutlined } from '@ant-design/icons'
import { Segmented, Typography } from 'antd'
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

  const segmentedOptions = [
    { label: 'ผู้เล่น', value: 1, icon: <UserAddOutlined /> },
    ...(userNameList.length > 1
      ? [
          { label: 'เริ่มเกม', value: 2, icon: <PlayCircleOutlined /> },
          { label: 'แก้ไขกฎ', value: 3, icon: <EditOutlined /> },
        ]
      : []),
  ]

  return (
    <div className="flex w-full justify-center px-4 py-6">
      <div className="flex w-full max-w-5xl flex-col gap-4">
        <Typography.Title
          level={3}
          className="!mb-0 text-center !text-blue-700 dark:!text-blue-300"
        >
          Omama
        </Typography.Title>

        <div className="flex justify-center">
          <Segmented
            value={isAddingPlayer}
            onChange={(value) => setIsAddingPlayer(value as number)}
            options={segmentedOptions}
            size="large"
          />
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
    </div>
  )
}

export default PageOmama
