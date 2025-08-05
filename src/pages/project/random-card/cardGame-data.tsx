import clubs_10 from '../../../assets/images/cards/clubs_10.webp?inline'
import clubs_2 from '../../../assets/images/cards/clubs_2.webp?inline'
import clubs_3 from '../../../assets/images/cards/clubs_3.webp?inline'
import clubs_4 from '../../../assets/images/cards/clubs_4.webp?inline'
import clubs_5 from '../../../assets/images/cards/clubs_5.webp?inline'
import clubs_6 from '../../../assets/images/cards/clubs_6.webp?inline'
import clubs_7 from '../../../assets/images/cards/clubs_7.webp?inline'
import clubs_8 from '../../../assets/images/cards/clubs_8.webp?inline'
import clubs_9 from '../../../assets/images/cards/clubs_9.webp?inline'
import clubs_A from '../../../assets/images/cards/clubs_A.webp?inline'
import clubs_J from '../../../assets/images/cards/clubs_J.webp?inline'
import clubs_K from '../../../assets/images/cards/clubs_K.webp?inline'
import clubs_Q from '../../../assets/images/cards/clubs_Q.webp?inline'
import diamonds_10 from '../../../assets/images/cards/diamonds_10.webp?inline'
import diamonds_2 from '../../../assets/images/cards/diamonds_2.webp?inline'
import diamonds_3 from '../../../assets/images/cards/diamonds_3.webp?inline'
import diamonds_4 from '../../../assets/images/cards/diamonds_4.webp?inline'
import diamonds_5 from '../../../assets/images/cards/diamonds_5.webp?inline'
import diamonds_6 from '../../../assets/images/cards/diamonds_6.webp?inline'
import diamonds_7 from '../../../assets/images/cards/diamonds_7.webp?inline'
import diamonds_8 from '../../../assets/images/cards/diamonds_8.webp?inline'
import diamonds_9 from '../../../assets/images/cards/diamonds_9.webp?inline'
import diamonds_A from '../../../assets/images/cards/diamonds_A.webp?inline'
import diamonds_J from '../../../assets/images/cards/diamonds_J.webp?inline'
import diamonds_K from '../../../assets/images/cards/diamonds_K.webp?inline'
import diamonds_Q from '../../../assets/images/cards/diamonds_Q.webp?inline'
import hearts_10 from '../../../assets/images/cards/hearts_10.webp?inline'
import hearts_2 from '../../../assets/images/cards/hearts_2.webp?inline'
import hearts_3 from '../../../assets/images/cards/hearts_3.webp?inline'
import hearts_4 from '../../../assets/images/cards/hearts_4.webp?inline'
import hearts_5 from '../../../assets/images/cards/hearts_5.webp?inline'
import hearts_6 from '../../../assets/images/cards/hearts_6.webp?inline'
import hearts_7 from '../../../assets/images/cards/hearts_7.webp?inline'
import hearts_8 from '../../../assets/images/cards/hearts_8.webp?inline'
import hearts_9 from '../../../assets/images/cards/hearts_9.webp?inline'
import hearts_A from '../../../assets/images/cards/hearts_A.webp?inline'
import hearts_J from '../../../assets/images/cards/hearts_J.webp?inline'
import hearts_K from '../../../assets/images/cards/hearts_K.webp?inline'
import hearts_Q from '../../../assets/images/cards/hearts_Q.webp?inline'
import spades_10 from '../../../assets/images/cards/spades_10.webp?inline'
import spades_2 from '../../../assets/images/cards/spades_2.webp?inline'
import spades_3 from '../../../assets/images/cards/spades_3.webp?inline'
import spades_4 from '../../../assets/images/cards/spades_4.webp?inline'
import spades_5 from '../../../assets/images/cards/spades_5.webp?inline'
import spades_6 from '../../../assets/images/cards/spades_6.webp?inline'
import spades_7 from '../../../assets/images/cards/spades_7.webp?inline'
import spades_8 from '../../../assets/images/cards/spades_8.webp?inline'
import spades_9 from '../../../assets/images/cards/spades_9.webp?inline'
import spades_A from '../../../assets/images/cards/spades_A.webp?inline'
import spades_J from '../../../assets/images/cards/spades_J.webp?inline'
import spades_K from '../../../assets/images/cards/spades_K.webp?inline'
import spades_Q from '../../../assets/images/cards/spades_Q.webp?inline'

type ICardDataType = 'spades' | 'hearts' | 'diamonds' | 'clubs'
export type INameDataType =
  | 'A'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K'

export interface ICardData {
  name: INameDataType
  type: ICardDataType
  image: string
}

export const cardDeck: ICardData[] = [
  { name: 'A', type: 'hearts', image: hearts_A },
  { name: '2', type: 'hearts', image: hearts_2 },
  { name: '3', type: 'hearts', image: hearts_3 },
  { name: '4', type: 'hearts', image: hearts_4 },
  { name: '5', type: 'hearts', image: hearts_5 },
  { name: '6', type: 'hearts', image: hearts_6 },
  { name: '7', type: 'hearts', image: hearts_7 },
  { name: '8', type: 'hearts', image: hearts_8 },
  { name: '9', type: 'hearts', image: hearts_9 },
  { name: '10', type: 'hearts', image: hearts_10 },
  { name: 'J', type: 'hearts', image: hearts_J },
  { name: 'Q', type: 'hearts', image: hearts_Q },
  { name: 'K', type: 'hearts', image: hearts_K },

  { name: 'A', type: 'clubs', image: clubs_A },
  { name: '2', type: 'clubs', image: clubs_2 },
  { name: '3', type: 'clubs', image: clubs_3 },
  { name: '4', type: 'clubs', image: clubs_4 },
  { name: '5', type: 'clubs', image: clubs_5 },
  { name: '6', type: 'clubs', image: clubs_6 },
  { name: '7', type: 'clubs', image: clubs_7 },
  { name: '8', type: 'clubs', image: clubs_8 },
  { name: '9', type: 'clubs', image: clubs_9 },
  { name: '10', type: 'clubs', image: clubs_10 },
  { name: 'J', type: 'clubs', image: clubs_J },
  { name: 'Q', type: 'clubs', image: clubs_Q },
  { name: 'K', type: 'clubs', image: clubs_K },

  { name: 'A', type: 'spades', image: spades_A },
  { name: '2', type: 'spades', image: spades_2 },
  { name: '3', type: 'spades', image: spades_3 },
  { name: '4', type: 'spades', image: spades_4 },
  { name: '5', type: 'spades', image: spades_5 },
  { name: '6', type: 'spades', image: spades_6 },
  { name: '7', type: 'spades', image: spades_7 },
  { name: '8', type: 'spades', image: spades_8 },
  { name: '9', type: 'spades', image: spades_9 },
  { name: '10', type: 'spades', image: spades_10 },
  { name: 'J', type: 'spades', image: spades_J },
  { name: 'Q', type: 'spades', image: spades_Q },
  { name: 'K', type: 'spades', image: spades_K },

  { name: 'A', type: 'diamonds', image: diamonds_A },
  { name: '2', type: 'diamonds', image: diamonds_2 },
  { name: '3', type: 'diamonds', image: diamonds_3 },
  { name: '4', type: 'diamonds', image: diamonds_4 },
  { name: '5', type: 'diamonds', image: diamonds_5 },
  { name: '6', type: 'diamonds', image: diamonds_6 },
  { name: '7', type: 'diamonds', image: diamonds_7 },
  { name: '8', type: 'diamonds', image: diamonds_8 },
  { name: '9', type: 'diamonds', image: diamonds_9 },
  { name: '10', type: 'diamonds', image: diamonds_10 },
  { name: 'J', type: 'diamonds', image: diamonds_J },
  { name: 'Q', type: 'diamonds', image: diamonds_Q },
  { name: 'K', type: 'diamonds', image: diamonds_K },
]

export type ICardTitleData = Record<INameDataType, string>

export const cardTitleData: ICardTitleData = {
  A: 'กินคนเดียว',
  '2': 'หาเพื่อนกินด้วย 1 คน',
  '3': 'หาเพื่อนกินด้วย 2 คน',
  '4': 'คนขวากิน',
  '5': 'กินทุกคน',
  '6': 'คนซ้ายกิน',
  '7': 'เลือก 1 คนมาดวลเกมกัน คนแพ้กิน คนจับคิดเกม',
  '8': 'พักผ่อน',
  '9': 'เล่นเกมกันทั้งวง คนจับคิดเกม',
  '10': 'ทาแป้งให้หน้าขาว',
  J: 'จับหน้า ใครจับตามช้าสุดหรือผิดกิน ต่อ1การจั่วของใครก็ได้',
  Q: 'เพื่อนห้ามตอบคนที่จับได้ไพ่ใบนี้ ใครตอบมีเสียงกิน',
  K: 'สั่งใครกินก็ได้ ตามจำนวน ไพ่ K ที่ออกไปแล้ว',
}
