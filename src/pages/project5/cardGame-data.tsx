import clubs_10 from '../../assets/images/cards/clubs_10.webp?inline'
import clubs_2 from '../../assets/images/cards/clubs_2.webp?inline'
import clubs_3 from '../../assets/images/cards/clubs_3.webp?inline'
import clubs_4 from '../../assets/images/cards/clubs_4.webp?inline'
import clubs_5 from '../../assets/images/cards/clubs_5.webp?inline'
import clubs_6 from '../../assets/images/cards/clubs_6.webp?inline'
import clubs_7 from '../../assets/images/cards/clubs_7.webp?inline'
import clubs_8 from '../../assets/images/cards/clubs_8.webp?inline'
import clubs_9 from '../../assets/images/cards/clubs_9.webp?inline'
import clubs_A from '../../assets/images/cards/clubs_A.webp?inline'
import clubs_J from '../../assets/images/cards/clubs_J.webp?inline'
import clubs_K from '../../assets/images/cards/clubs_K.webp?inline'
import clubs_Q from '../../assets/images/cards/clubs_Q.webp?inline'
import diamonds_10 from '../../assets/images/cards/diamonds_10.webp?inline'
import diamonds_2 from '../../assets/images/cards/diamonds_2.webp?inline'
import diamonds_3 from '../../assets/images/cards/diamonds_3.webp?inline'
import diamonds_4 from '../../assets/images/cards/diamonds_4.webp?inline'
import diamonds_5 from '../../assets/images/cards/diamonds_5.webp?inline'
import diamonds_6 from '../../assets/images/cards/diamonds_6.webp?inline'
import diamonds_7 from '../../assets/images/cards/diamonds_7.webp?inline'
import diamonds_8 from '../../assets/images/cards/diamonds_8.webp?inline'
import diamonds_9 from '../../assets/images/cards/diamonds_9.webp?inline'
import diamonds_A from '../../assets/images/cards/diamonds_A.webp?inline'
import diamonds_J from '../../assets/images/cards/diamonds_J.webp?inline'
import diamonds_K from '../../assets/images/cards/diamonds_K.webp?inline'
import diamonds_Q from '../../assets/images/cards/diamonds_Q.webp?inline'
import hearts_10 from '../../assets/images/cards/hearts_10.webp?inline'
import hearts_2 from '../../assets/images/cards/hearts_2.webp?inline'
import hearts_3 from '../../assets/images/cards/hearts_3.webp?inline'
import hearts_4 from '../../assets/images/cards/hearts_4.webp?inline'
import hearts_5 from '../../assets/images/cards/hearts_5.webp?inline'
import hearts_6 from '../../assets/images/cards/hearts_6.webp?inline'
import hearts_7 from '../../assets/images/cards/hearts_7.webp?inline'
import hearts_8 from '../../assets/images/cards/hearts_8.webp?inline'
import hearts_9 from '../../assets/images/cards/hearts_9.webp?inline'
import hearts_A from '../../assets/images/cards/hearts_A.webp?inline'
import hearts_J from '../../assets/images/cards/hearts_J.webp?inline'
import hearts_K from '../../assets/images/cards/hearts_K.webp?inline'
import hearts_Q from '../../assets/images/cards/hearts_Q.webp?inline'
import spades_10 from '../../assets/images/cards/spades_10.webp?inline'
import spades_2 from '../../assets/images/cards/spades_2.webp?inline'
import spades_3 from '../../assets/images/cards/spades_3.webp?inline'
import spades_4 from '../../assets/images/cards/spades_4.webp?inline'
import spades_5 from '../../assets/images/cards/spades_5.webp?inline'
import spades_6 from '../../assets/images/cards/spades_6.webp?inline'
import spades_7 from '../../assets/images/cards/spades_7.webp?inline'
import spades_8 from '../../assets/images/cards/spades_8.webp?inline'
import spades_9 from '../../assets/images/cards/spades_9.webp?inline'
import spades_A from '../../assets/images/cards/spades_A.webp?inline'
import spades_J from '../../assets/images/cards/spades_J.webp?inline'
import spades_K from '../../assets/images/cards/spades_K.webp?inline'
import spades_Q from '../../assets/images/cards/spades_Q.webp?inline'

export interface ICardData {
  name: string
  image: string
}

export const cardDeck: ICardData[] = [
  { name: 'Ahearts', image: hearts_A },
  { name: '2hearts', image: hearts_2 },
  { name: '3hearts', image: hearts_3 },
  { name: '4hearts', image: hearts_4 },
  { name: '5hearts', image: hearts_5 },
  { name: '6hearts', image: hearts_6 },
  { name: '7hearts', image: hearts_7 },
  { name: '8hearts', image: hearts_8 },
  { name: '9hearts', image: hearts_9 },
  { name: '10hearts', image: hearts_10 },
  { name: 'Jhearts', image: hearts_J },
  { name: 'Qhearts', image: hearts_Q },
  { name: 'Khearts', image: hearts_K },

  { name: 'Aclubs', image: clubs_A },
  { name: '2clubs', image: clubs_2 },
  { name: '3clubs', image: clubs_3 },
  { name: '4clubs', image: clubs_4 },
  { name: '5clubs', image: clubs_5 },
  { name: '6clubs', image: clubs_6 },
  { name: '7clubs', image: clubs_7 },
  { name: '8clubs', image: clubs_8 },
  { name: '9clubs', image: clubs_9 },
  { name: '10clubs', image: clubs_10 },
  { name: 'Jclubs', image: clubs_J },
  { name: 'Qclubs', image: clubs_Q },
  { name: 'Kclubs', image: clubs_K },

  { name: 'Aspades', image: spades_A },
  { name: '2spades', image: spades_2 },
  { name: '3spades', image: spades_3 },
  { name: '4spades', image: spades_4 },
  { name: '5spades', image: spades_5 },
  { name: '6spades', image: spades_6 },
  { name: '7spades', image: spades_7 },
  { name: '8spades', image: spades_8 },
  { name: '9spades', image: spades_9 },
  { name: '10spades', image: spades_10 },
  { name: 'Jspades', image: spades_J },
  { name: 'Qspades', image: spades_Q },
  { name: 'Kspades', image: spades_K },

  { name: 'Adiamonds', image: diamonds_A },
  { name: '2diamonds', image: diamonds_2 },
  { name: '3diamonds', image: diamonds_3 },
  { name: '4diamonds', image: diamonds_4 },
  { name: '5diamonds', image: diamonds_5 },
  { name: '6diamonds', image: diamonds_6 },
  { name: '7diamonds', image: diamonds_7 },
  { name: '8diamonds', image: diamonds_8 },
  { name: '9diamonds', image: diamonds_9 },
  { name: '10diamonds', image: diamonds_10 },
  { name: 'Jdiamonds', image: diamonds_J },
  { name: 'Qdiamonds', image: diamonds_Q },
  { name: 'Kdiamonds', image: diamonds_K },
]
