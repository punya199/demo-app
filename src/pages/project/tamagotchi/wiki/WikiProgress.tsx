import { stageLabel } from '../core/tamagotchi-helper'
import { IWikiData } from '../core/tamagotchi-interface'
import { Heading, List, Table } from './WikiParts'

export const PassiveWikiTab = (props: { wiki: IWikiData }) => {
  const { wiki } = props
  const { passive } = wiki
  return (
    <>
      <Heading>ต้นไม้ของผู้ฝึก</Heading>
      <List
        items={[
          'ผูกกับบัญชี ไม่หายเมื่อมอนตาย ใช้ได้ทุกโหมดรวมถึง PvP',
          'เริ่มจากจุดกลาง เลือกได้เฉพาะโหนดที่ติดกับโหนดที่มีอยู่ ถอนได้เฉพาะโหนดที่ไม่ตัดสายอื่นขาด',
          'โหนดคีย์สโตนแลกกัน: ค่าหนึ่งเพิ่มมาก อีกค่าลดลง',
          `ในไฟต์ผจญภัยแบบเรียลไทม์: ฟื้น HP ใช้ค่า % ต่อวินาทีตามที่เขียนไว้ (ไฟต์แบบเทิร์น 1 เทิร์น นับเป็นประมาณ ${Math.round(passive.secondsPerTurn)} วินาที), เผาไหม้มีโอกาสติด ${passive.arenaBurnChance}% ต่อการตีธรรมดาและนานเท่าจำนวนเทิร์นเป็นวินาที, ตีสองครั้งใช้กับตีธรรมดา, โล่เริ่มต้นอยู่จนกว่าจะแตก, ตีก่อนทำให้ตีธรรมดาและสกิลพร้อมใช้ตั้งแต่เริ่มไฟต์, SPD % ที่เพิ่มจากต้นไม้และอุปกรณ์ทำให้โจมตีเร็วขึ้น ${passive.arenaAttackSpeedPct}% ของค่านั้น (สูงสุด ${passive.arenaAttackSpeedCap}%)`,
          `แต้มได้จาก Dex ร่างละ 1, เคลียร์เรดครั้งแรกบอสละระดับ 1, เคลียร์ด่านผจญภัยครั้งแรกด่านละ 1 (สูงสุด ${passive.adventureMaxPoints}), ชนะสะสมทุก ${passive.winsPerPoint} ครั้ง 1 แต้ม (สูงสุด ${passive.winMaxPoints}), ล้มบอสโลก 1 และจบซีซัน PvP ที่ผ่านเกณฑ์ (${passive.pvpSeasonPoints
            .map(
              (tier) => `${tier.maxRank ? `อันดับ ≤ ${tier.maxRank}` : 'ที่เหลือ'}: ${tier.points}`
            )
            .join(' · ')}) รวมสูงสุด ${passive.maxPoints} แต้ม`,
          `ถอนแต้มคืนได้ ${passive.freeRefunds} แต้มแรกฟรี หลังจากนั้นแต้มละ 💎 ${passive.respecGemPrice} (ถอนทั้งสายสูงสุด 💎 ${passive.branchRefundCap} ต่อครั้ง)`,
          `โหนดเหรียญสำรวจและโอกาสดรอปอุปกรณ์รวมกันได้ไม่เกิน +${passive.economyCap}% อย่างละ`,
          `มาสเตอรีเลือก 1 จาก 3 ตัวเลือก เลือกครั้งแรกฟรี เปลี่ยนใช้ 💎 ${passive.masteryRepickGemPrice}`,
          `เส้นทางสูงสุด 3 เส้นทาง เลือกได้เส้นทางเดียว ใช้แต้มแยก (สูงสุด ${passive.ascendancyMaxPoints} แต้ม จากเรด Nightmare และบอสโลก) เริ่มใหม่ใช้ 💎 ${passive.ascendancyResetGemPrice}`,
        ]}
      />
    </>
  )
}

export const ReturnHomeWikiTab = (props: { wiki: IWikiData }) => {
  const { wiki } = props
  const { petCore } = wiki
  return (
    <>
      <Heading>กลับดาว</Heading>
      <List
        items={[
          `ปุ่ม "กลับดาว" ในหน้าเลี้ยงมอน ส่งมอนตัวที่เลือกอยู่กลับดาวบ้านเกิดถาวร ได้ 🔮 แกนสัตว์เลี้ยง ×${petCore.perReturn} ต่อครั้ง`,
          `กดได้เมื่อมอนเป็น ${petCore.stages.map((stage) => stageLabel[stage]).join(' / ')} และไม่ได้ออกสำรวจอยู่ (รับกลับมาก่อน)`,
          'แกนแยกตามสายพันธุ์ (รวมร่างของมอนนั้นด้วย) สายพันธุ์เดียวกันซ้อนกองได้ ดูได้ที่ถุงวัตถุดิบ',
          'อุปกรณ์ที่สวมอยู่กลับเข้ากระเป๋า คอสตูม สกิล และ passive เป็นของบัญชี จึงอยู่กับคุณเหมือนเดิม',
          'ช่องเลี้ยงที่ว่างรับไข่ใหม่ได้ทันที ตอนนี้แกนยังไม่มีที่ใช้ จะนำไปคราฟต์ในอัปเดตถัดไป',
        ]}
      />
    </>
  )
}

export const CostumeWikiTab = () => {
  return (
    <>
      <Heading>ชุดแต่งตัว</Heading>
      <List
        items={[
          'แต่งตัวมอนได้ 5 ช่อง: หมวก หน้า หลัง ออร่า ฉากหลัง ช่องละ 1 ชิ้น ผสมกันได้',
          'เป็นความสวยงามล้วน ไม่มีผลกับค่าพลัง ซื้อขายหรือแลกเปลี่ยนไม่ได้',
          'ซื้อครั้งเดียวเป็นของบัญชี ใช้ได้กับมอนทุกตัว แต่มอนแต่ละตัวใส่ชุดของตัวเอง',
          'จ่ายด้วยเหรียญ เพชร หรือเหรียญบอส บางชิ้นเป็นรางวัลซีซัน PvP (3 อันดับแรก) ซื้อไม่ได้',
          'ลองใส่ฟรีก่อนซื้อ สะสมหมวก หน้า หลังครบธีมได้เหรียญตรา',
          'เพื่อน คู่ต่อสู้ในสนามประลอง อันดับ และตัวเช่า จะเห็นชุดของมอนตัวที่คุณเลือกอยู่ ปิดการแสดงได้ในแท็บชุดแต่งตัว',
        ]}
      />
    </>
  )
}

export const EconomyWikiTab = (props: { wiki: IWikiData }) => {
  const { wiki } = props
  const { economy } = wiki
  return (
    <>
      <Table
        head={['', 'ได้จาก', 'ใช้ทำอะไร']}
        rows={[
          ['🪙 เหรียญ', 'ชนะด่านผจญภัย · ภารกิจประจำวัน', 'ซื้อของในร้านค้า'],
          [
            '💎 เพชร',
            `ชนะบอสครั้งแรก · ค้นพบร่างใหม่ใน Dex (+${economy.dexDiscoveryGems})`,
            'ซื้อวัตถุดิบตีบวกบางชนิด',
          ],
        ]}
      />
      <Heading>ร้านค้า (ซื้อเก็บในกระเป๋า แล้วกดใช้กับมอนทีหลัง)</Heading>
      <Table
        head={['ไอเทม', 'ราคา', 'ผล']}
        rows={economy.shopItems.map((item) => [
          `${item.emoji} ${item.name}`,
          `🪙 ${item.price}`,
          item.description,
        ])}
      />
      <Heading>ภารกิจประจำวัน (รีเซ็ตเที่ยงคืนเวลาไทย)</Heading>
      <Table
        head={['ภารกิจ', 'รางวัล']}
        rows={economy.dailyQuests.map((quest) => [
          `${quest.emoji} ${quest.name}`,
          `🪙 ${quest.coinReward}${quest.gemReward ? ` 💎 ${quest.gemReward}` : ''}`,
        ])}
      />
      <Heading>ภารกิจประจำสัปดาห์ (รีเซ็ตเที่ยงคืนวันจันทร์เวลาไทย)</Heading>
      <Table
        head={['ภารกิจ', 'รางวัล']}
        rows={economy.weeklyQuests.map((quest) => [
          `${quest.emoji} ${quest.name}`,
          `🪙 ${quest.coinReward} 💎 ${quest.gemReward}`,
        ])}
      />
    </>
  )
}
