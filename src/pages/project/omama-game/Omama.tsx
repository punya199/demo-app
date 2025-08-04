import { Button } from 'antd'
import {
  default as black_dark,
  default as black_light,
} from '../../../assets/images/cards/back_dark.webp'
import { ICardData } from '../random-card/cardGame-data'
import { SpecialCardOwner } from './PageOmama'

interface OmamaProps {
  cardlist: ICardData[][]
  userNameList: string[]
  nameIndex: number
  specialCardOwner: SpecialCardOwner
  currentCard: ICardData | null
  onRandom: () => void
  onClickCard: (index: number) => void
}
const Omama = (props: OmamaProps) => {
  return (
    <div>
      <div className="flex items-center justify-center gap-4">
        <Button type="primary" onClick={props.onRandom}>
          สุ่มไพ่ใหม่
        </Button>
        <div className="flex w-80 items-center justify-center text-lg font-semibold text-gray-700">
          ผู้เล่นที่ต้องจั่ว :{' '}
          <span className="text-blue-700">{props.userNameList[props.nameIndex]}</span>
        </div>
      </div>

      {/* Card Stack */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {props.cardlist.map((e, index) => (
          <div
            key={index}
            className={`flex flex-col items-center rounded-xl bg-white p-4 shadow-md transition hover:shadow-xl ${
              props.userNameList.length > 0 ? 'cursor-pointer hover:scale-105' : ''
            }`}
            onClick={() => {
              if (props.userNameList.length === 0) return
              props.onClickCard(index)
            }}
          >
            <img
              src={e.length === 0 ? black_light : black_dark}
              alt="back"
              className="w-28 rounded-lg object-cover drop-shadow-lg"
            />
            <div className="mt-3 text-sm text-gray-600">เหลือ {e.length} ใบ</div>
          </div>
        ))}
        <div className="rounded-xl bg-white p-4 shadow-md transition hover:shadow-xl">
          <div className="mb-2 text-lg font-semibold">คนที่ได้ไพ่พิเศษ </div>
          <ul className="list-inside space-y-1 text-gray-700">
            {Object.entries(props.specialCardOwner).map(([cardType, ownerIndex]) => (
              <li key={cardType}>
                {cardType} : {props.userNameList[ownerIndex] || 'ยังไม่มีคนได้'}
              </li>
            ))}
          </ul>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl bg-white p-6 text-center shadow">
            <div className="mb-4 text-xl font-semibold text-gray-800">ไพ่ที่ได้</div>
            <img
              src={props.currentCard ? props.currentCard.image : black_light}
              alt={props.currentCard?.name || 'back'}
              className="mx-auto w-40 drop-shadow-lg"
            />
            <div className="mt-4 text-sm text-gray-600">
              เหลือ {props.cardlist.flat().length} ใบ
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Omama
