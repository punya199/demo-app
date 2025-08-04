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

export interface ICardData {
  name: string
  image: string
  title?: string
}

export const cardDeck: ICardData[] = [
  { name: 'Ahearts', image: hearts_A, title: 'กินคนเดียว' },
  { name: '2hearts', image: hearts_2, title: 'หาเพื่อนกินด้วย 1 คน' },
  { name: '3hearts', image: hearts_3, title: 'หาเพื่อนกินด้วย 2 คน' },
  { name: '4hearts', image: hearts_4, title: 'คนขวากิน' },
  { name: '5hearts', image: hearts_5, title: 'กินทุกคน' },
  { name: '6hearts', image: hearts_6, title: 'คนซ้ายกิน' },
  { name: '7hearts', image: hearts_7, title: 'เลือก 1 คนมาดวลเกมกัน คนแพ้กิน คนจับคิดเกม' },
  { name: '8hearts', image: hearts_8, title: 'พักผ่อน' },
  { name: '9hearts', image: hearts_9, title: 'เล่นเกมกันทั้งวง คนจับคิดเกม' },
  { name: '10hearts', image: hearts_10, title: 'ทาแป้งให้หน้าขาว' },
  {
    name: 'Jhearts',
    image: hearts_J,
    title: 'จับหน้า ใครจับตามช้าสุดหรือผิดกิน ต่อ1การจั่วของใครก็ได้',
  },
  { name: 'Qhearts', image: hearts_Q, title: 'เพื่อนห้ามตอบคนที่จับได้ไพ่ใบนี้ ใครตอบมีเสียงกิน' },
  { name: 'Khearts', image: hearts_K, title: 'สั่งใครกินก็ได้ ตามจำนวน ไพ่ K ที่ออกไปแล้ว' },

  { name: 'Aclubs', image: clubs_A, title: 'กินคนเดียว' },
  { name: '2clubs', image: clubs_2, title: 'หาเพื่อนกินด้วย 1 คน' },
  { name: '3clubs', image: clubs_3, title: 'หาเพื่อนกินด้วย 2 คน' },
  { name: '4clubs', image: clubs_4, title: 'คนขวากิน' },
  { name: '5clubs', image: clubs_5, title: 'กินทุกคน' },
  { name: '6clubs', image: clubs_6, title: 'คนซ้ายกิน' },
  { name: '7clubs', image: clubs_7, title: 'เลือก 1 คนมาดวลเกมกัน คนแพ้กิน คนจับคิดเกม' },
  { name: '8clubs', image: clubs_8, title: 'พักผ่อน' },
  { name: '9clubs', image: clubs_9, title: 'เล่นเกมกันทั้งวง คนจับคิดเกม' },
  { name: '10clubs', image: clubs_10, title: 'ทาแป้งให้หน้าขาว' },
  {
    name: 'Jclubs',
    image: clubs_J,
    title: 'จับหน้า ใครจับตามช้าสุดหรือผิดกิน ต่อ1การจั่วของใครก็ได้',
  },
  { name: 'Qclubs', image: clubs_Q, title: 'เพื่อนห้ามตอบคนที่จับได้ไพ่ใบนี้ ใครตอบมีเสียงกิน' },
  { name: 'Kclubs', image: clubs_K, title: 'สั่งใครกินก็ได้ ตามจำนวน ไพ่ K ที่ออกไปแล้ว' },

  { name: 'Aspades', image: spades_A, title: 'กินคนเดียว' },
  { name: '2spades', image: spades_2, title: 'หาเพื่อนกินด้วย 1 คน' },
  { name: '3spades', image: spades_3, title: 'หาเพื่อนกินด้วย 2 คน' },
  { name: '4spades', image: spades_4, title: 'คนขวากิน' },
  { name: '5spades', image: spades_5, title: 'กินทุกคน' },
  { name: '6spades', image: spades_6, title: 'คนซ้ายกิน' },
  { name: '7spades', image: spades_7, title: 'เลือก 1 คนมาดวลเกมกัน คนแพ้กิน คนจับคิดเกม' },
  { name: '8spades', image: spades_8, title: 'พักผ่อน' },
  { name: '9spades', image: spades_9, title: 'เล่นเกมกันทั้งวง คนจับคิดเกม' },
  { name: '10spades', image: spades_10, title: 'ทาแป้งให้หน้าขาว' },
  {
    name: 'Jspades',
    image: spades_J,
    title: 'จับหน้า ใครจับตามช้าสุดหรือผิดกิน ต่อ1การจั่วของใครก็ได้',
  },
  { name: 'Qspades', image: spades_Q, title: 'เพื่อนห้ามตอบคนที่จับได้ไพ่ใบนี้ ใครตอบมีเสียงกิน' },
  { name: 'Kspades', image: spades_K, title: 'สั่งใครกินก็ได้ ตามจำนวน ไพ่ K ที่ออกไปแล้ว' },

  { name: 'Adiamonds', image: diamonds_A, title: 'กินคนเดียว' },
  { name: '2diamonds', image: diamonds_2, title: 'หาเพื่อนกินด้วย 1 คน' },
  { name: '3diamonds', image: diamonds_3, title: 'หาเพื่อนกินด้วย 2 คน' },
  { name: '4diamonds', image: diamonds_4, title: 'คนขวากิน' },
  { name: '5diamonds', image: diamonds_5, title: 'กินทุกคน' },
  { name: '6diamonds', image: diamonds_6, title: 'คนซ้ายกิน' },
  { name: '7diamonds', image: diamonds_7, title: 'เลือก 1 คนมาดวลเกมกัน คนแพ้กิน คนจับคิดเกม' },
  { name: '8diamonds', image: diamonds_8, title: 'พักผ่อน' },
  { name: '9diamonds', image: diamonds_9, title: 'เล่นเกมกันทั้งวง คนจับคิดเกม' },
  { name: '10diamonds', image: diamonds_10, title: 'ทาแป้งให้หน้าขาว' },
  {
    name: 'Jdiamonds',
    image: diamonds_J,
    title: 'จับหน้า ใครจับตามช้าสุดหรือผิดกิน ต่อ1การจั่วของใครก็ได้',
  },
  {
    name: 'Qdiamonds',
    image: diamonds_Q,
    title: 'เพื่อนห้ามตอบคนที่จับได้ไพ่ใบนี้ ใครตอบมีเสียงกิน',
  },
  { name: 'Kdiamonds', image: diamonds_K, title: 'สั่งใครกินก็ได้ ตามจำนวน ไพ่ K ที่ออกไปแล้ว' },
]
