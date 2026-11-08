import { stageLabel } from '../core/tamagotchi-helper'
import { IWikiData } from '../core/tamagotchi-interface'
import { percent } from './wiki-helper'
import { Heading, List, Table } from './WikiParts'

export const SocialWikiTab = (props: { wiki: IWikiData }) => {
  const { wiki } = props
  const { social } = wiki
  return (
    <>
      <Heading>เพื่อน</Heading>
      <List
        items={[
          'เพิ่มเพื่อนด้วยรหัสเพื่อนที่เจ้าตัวแจกให้เท่านั้น ไม่ค้นหาจากชื่อผู้ใช้หรืออีเมล คนอื่นเห็นเฉพาะชื่อที่ตั้งเอง (ชื่อเดียวกับในสนามประลองและอันดับบอสโลก)',
          `มีเพื่อนได้ ${social.friendLimit} คน (รวมคำขอที่ส่งไปแล้วรออยู่) แต่ละคนมีคำขอค้างได้ไม่เกิน ${social.requestLimit} คำขอ ถ้าสองคนขอพร้อมกัน จะกลายเป็นเพื่อนกัน`,
          `เยี่ยมมอนเพื่อนดูได้อย่างเดียว ทักทายวันละ ${social.greetsPerDayPerFriend} ครั้งต่อเพื่อน (+${social.pointsGreet} แต้มมิตรภาพ)`,
          `ส่งของขวัญได้วันละ ${social.giftsPerDay} ชิ้น เป็นไอเทมจากกระเป๋าของคุณเอง ไม่ส่งเหรียญหรือเพชร (+${social.pointsGift} แต้ม)`,
        ]}
      />
      <Heading>ตัวซัพพอร์ตและเช่าตัว</Heading>
      <List
        items={[
          `ตั้งมอนของคุณเป็นตัวซัพพอร์ตให้เพื่อนเช่า (ร่างโตขึ้นไป เปลี่ยนได้ทุก ${social.supportCooldownMinutes} นาที) ระบบจำค่าพลังรวมอุปกรณ์ตอนตั้งไว้`,
          'เช่าได้เฉพาะตัวของเพื่อน ใช้ตีบอสโลกพร้อมกัน ตัวเช่าต่อสู้เอง (AI) ไม่ได้ EXP หรือรางวัล ใช้ในสนามประลอง (PvP) ไม่ได้',
          `ผู้เช่าจ่ายเจ้าของ 🪙 ${social.rentalFee} ต่อครั้ง เจ้าของรับได้สูงสุด 🪙 ${social.rentalOwnerDailyCap} ต่อวัน เกินแล้วเช่าได้ฟรี (ผู้เช่าไม่ต้องเสียส่วนที่เจ้าของรับไม่ได้) และได้ +${social.pointsRental} แต้มมิตรภาพ`,
          'ดาเมจของตัวเช่าลด HP รวมของบอสจริง แต่ไม่นับในอันดับดาเมจของผู้เช่า',
        ]}
      />
    </>
  )
}

export const PvpWikiTab = (props: { wiki: IWikiData }) => {
  const { wiki } = props
  const { pvp } = wiki
  return (
    <>
      <Heading>วิธีเล่น</Heading>
      <List
        items={[
          `ต้องเป็นร่างโตขึ้นไปถึงเข้าสนามได้ ตั้ง "ทีมป้องกัน" ไว้ก่อน (ระบบจำค่าพลังรวมอุปกรณ์ของมอนตอนนั้น) ถึงจะท้าคนอื่นได้ เปลี่ยนทีมได้ทุก ${pvp.defenseCooldownMinutes} นาที`,
          `ท้าได้วันละ ${pvp.dailyAttempts} ครั้ง ระบบเสนอ ${pvp.opponentCount} คนที่เป็นร่างเดียวกัน เรตติ้งห่างไม่เกิน ${pvp.ratingWindow} คนเดิมท้าได้ไม่เกิน ${pvp.maxFightsPerOpponentPerDay} ครั้งต่อวัน`,
          `ท้าด้วยค่าพลังสดของมอนคุณ ผลไม่นับเป็นชนะ/แพ้ของมอนสำหรับเงื่อนไขวิวัฒนาการ`,
          `ชนะได้ 🪙 ${pvp.winCoin} แพ้ได้ 🪙 ${pvp.lossCoin}`,
          'ผู้ที่ถูกท้าก็ได้/เสียเรตติ้งแม้ไม่ได้ออนไลน์ และดูการต่อสู้ย้อนหลังได้ในประวัติ',
          'ชื่อที่คนอื่นเห็นคือชื่อสนามที่คุณตั้งเอง ไม่แสดงชื่อผู้ใช้',
        ]}
      />
      <Heading>เรตติ้ง (ELO)</Heading>
      <List
        items={[
          `เริ่ม ${pvp.startRating} ผู้ท้าเปลี่ยนสูงสุด ${pvp.kAttacker / 2} แต้ม/ครั้งในแมตช์สูสี ผู้ป้องกันเปลี่ยนสูงสุด ${pvp.kDefender / 2}`,
          `ชนะคนเรตติ้งสูงกว่าได้แต้มมากกว่า ซีซันละสัปดาห์ (รีเซ็ตเที่ยงคืนเวลาไทยคืนวันอาทิตย์ ตรงกับ 00:00 น. วันจันทร์) เริ่มซีซันใหม่ด้วยครึ่งหนึ่งของส่วนต่างจาก ${pvp.startRating} (${percent(pvp.seasonResetKeep)})`,
          `ไม่มีผู้เล่นพอ ระบบเติมคู่ต่อสู้ NPC ให้ (เรตติ้งคงที่ ไม่เปลี่ยน)`,
        ]}
      />
      <Table
        head={['NPC', 'ร่าง', 'เรตติ้ง']}
        rows={pvp.npcs.map((npc) => [
          `${npc.emoji} ${npc.name}`,
          stageLabel[npc.stage],
          npc.rating,
        ])}
      />
      <Heading>รางวัลซีซัน</Heading>
      <p className="mb-1 text-xs">
        รับได้หลังซีซันจบ ต้องสู้อย่างน้อย {pvp.seasonMinFights} ครั้ง
        จัดอันดับในกลุ่มที่สู้ถึงเกณฑ์
      </p>
      <Table
        head={['อันดับ', 'รางวัล']}
        rows={pvp.seasonRewards.map((tier, index) => [
          tier.maxRank === null
            ? 'ผู้เข้าร่วม'
            : tier.maxRank === 1
              ? 'อันดับ 1'
              : `อันดับ ${(pvp.seasonRewards[index - 1]?.maxRank ?? 0) + 1}–${tier.maxRank}`,
          `🪙 ${tier.coin} + 💎 ${tier.gem} + 🎖️ ${tier.raidToken}`,
        ])}
      />
    </>
  )
}
