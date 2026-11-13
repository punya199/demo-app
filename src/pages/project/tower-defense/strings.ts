import type { SkillId } from '../../../../td-sim/src'

export type Lang = 'th' | 'en'

const th = {
  title: 'ป้องกันฐาน',
  back: 'กลับหน้าเกม',
  lost: 'ฐานแตก!',
  playAgain: 'เล่นใหม่',
  hint: 'แตะช่องว่างเพื่อเรียกเฟือง ({n} ทอง) · ต้องต่อกับแถบเหลือง · แตะเฟืองเหมือนกันสองตัวเพื่อรวม',
  keys: 'คีย์ลัด: P พัก · F เร็ว · R เริ่มใหม่ · L ภาษา',
  pause: 'พัก',
  resume: 'เล่นต่อ',
  restart: 'เริ่มใหม่',
  lang: 'EN',
  menu: 'เมนู',
  gacha: 'สุ่มฮีโร่',
  goals: 'ภารกิจ',
  cores: 'คอร์ธาตุ',
  relics: 'เรลิก',
  round: 'รอบ {n}/{total}',
  boss: 'บอส!',
  won: 'ชนะแล้ว!',
  pickTitle: 'เลือกสกิล 1 อย่าง',
  netStarting: 'กำลังเริ่มด่าน…',
  netNoEnergy: 'พลังงานไม่พอ รอฟื้นฟูก่อนนะ',
  netStartError: 'เริ่มด่านไม่สำเร็จ ลองใหม่อีกครั้ง',
  netFinishing: 'กำลังตรวจผลการเล่น…',
  netPaid: 'ได้รับ {n} เหรียญ {stars}',
  netPaidClear: 'ผ่านด่านครั้งแรก! ได้รับ {n} เหรียญ และ {gems} เพชร {stars}',
  netLocked: 'ด่านนี้ยังล็อกอยู่ ผ่านด่านก่อนหน้าก่อน',
  stages: 'เลือกด่าน',
  stage: 'ด่าน {n}',
  netFinishError: 'ส่งผลการเล่นไม่สำเร็จ ไม่ได้รับเหรียญ',
  netRetry: 'ลองใหม่',
  skill_power: 'พลังโจมตี +25%',
  skill_haste: 'ชาร์จเร็วขึ้น +25%',
  skill_crit: 'คริติคอล +10%',
  skill_bounty: 'ค่าหัวศัตรู +2 ทอง',
  skill_bank: 'รับทอง +25 ทันที',
  skill_repair: 'ซ่อมฐาน +3',
  'skill_ember-surge': 'เรลิกไฟ: แม่มดเถ้าถ่านแรงขึ้น +50%',
  'skill_glacial-edge': 'เรลิกน้ำแข็ง: ผู้ประกาศน้ำแข็งแรงขึ้น +50%',
  'skill_verdant-bloom': 'เรลิกธรรมชาติ: หมอมอสแรงขึ้น +50%',
  'skill_void-rend': 'เรลิกกายภาพ: ดาบว่างเปล่าแรงขึ้น +50%',
  wiki_open: 'คู่มือและข่าวอัปเดต',
  wiki_battle_title: 'กติกาการต่อสู้',
  wiki_battle_1: 'ฐานมีพลังชีวิต {hp} ศัตรูที่เดินถึงฐานจะลดพลังชีวิต หมดเมื่อไรก็แพ้',
  wiki_battle_2:
    'แต่ละด่านมี {rounds} รอบ ตามด้วยบอส (มี {stages} ด่าน) ท้ายทุกรอบเลือกสกิล 1 จาก 3',
  wiki_battle_3:
    'แตะช่องว่างเพื่อเรียกเฟือง ราคา {summon} ทอง ทองหาได้จากเวลาที่ผ่านไปและการกำจัดศัตรู',
  wiki_charging_title: 'การชาร์จ',
  wiki_charging_1:
    'เฟืองจะชาร์จได้ก็ต่อเมื่อเชื่อมกับแถบเหลืองของแหล่งพลังงาน ไม่ว่าจะติดตรง ๆ หรือต่อกันเป็นแถวเฟืองที่ติดกัน',
  wiki_charging_2:
    'ยิ่งติดกับเฟืองอื่นหลายด้านยิ่งชาร์จเร็ว และแต่ละด้านที่ติดเพิ่มพลังโจมตี +{side}%',
  wiki_charging_3: 'ช่องที่มีเครื่องหมาย -2 ทำให้เฟืองที่ยืนอยู่ให้พลังแค่ {penalty}%',
  wiki_merging_title: 'การรวมเฟือง',
  wiki_merging_1:
    'เฟืองฮีโร่เดียวกันและเลเวลเท่ากันสองตัว แตะเพื่อรวมเป็นเลเวลถัดไป สูงสุดเลเวล {maxLevel}',
  wiki_merging_2: 'รวมแล้วแรงขึ้นเสมอ เลเวลสูงสุดโจมตีเป็น {maxLevelPct}% ของเลเวล 1',
  wiki_resonance_title: 'เรโซแนนซ์',
  wiki_resonance_1:
    'เฟืองฮีโร่เดียวกันที่วางติดกันให้โอกาสคริติคอล +{res}% ต่อตัว สูงสุด {resCap}%',
  wiki_resonance_2: 'คริติคอลทำดาเมจเป็น {crit}%',
  wiki_energy_title: 'พลังงาน',
  wiki_energy_1: 'เริ่มแต่ละด่านใช้พลังงาน {stageCost} เก็บได้สูงสุด {cap}',
  wiki_energy_2: 'พลังงานฟื้นเอง 1 หน่วยทุก {regen} นาที แม้ปิดเกมอยู่ ฟื้นเต็มแล้วจะหยุดนับ',
  wiki_gacha_title: 'สุ่มฮีโร่',
  wiki_gacha_1: 'สุ่มครั้งละ {single} เพชร หรือ 10 ครั้ง {ten} เพชร และมีสุ่มฟรีให้เมื่อพร้อม',
  wiki_gacha_2:
    'อัตราออก: ธรรมดา {rate_common}% · หายาก {rate_rare}% · เอปิก {rate_epic}% · ตำนาน {rate_legendary}%',
  wiki_gacha_3: 'การันตีตำนานภายใน {pity} ครั้ง นับสะสมจนกว่าจะได้ตำนาน',
  wiki_gacha_4:
    'ได้ฮีโร่ซ้ำจะแปลงเป็นชิ้นส่วน: ธรรมดา {dup_common} · หายาก {dup_rare} · เอปิก {dup_epic} · ตำนาน {dup_legendary}',
  wiki_stars_title: 'ดาว',
  wiki_stars_1:
    'ดาวฮีโร่: ใช้ชิ้นส่วนอัปดาว สูงสุด {maxStar} ดาว ดาวสูงโจมตีแรงขึ้นถึง {starPct}% ของดาว 1',
  wiki_stars_2: 'ตั้งแต่ {strongStar} ดาวขึ้นไปปลดล็อกสกิลที่แรงกว่า ยิงถี่ขึ้น',
  wiki_stars_3:
    'ดาวด่าน: ผ่านด่านได้ 1 ถึง 3 ดาวตามผลการป้องกัน ระบบเซิร์ฟเวอร์เป็นผู้ตัดสิน ได้ดาวเพิ่มได้เมื่อเล่นซ้ำ',
  wiki_cores_title: 'คอร์และธาตุ',
  wiki_cores_1:
    'มีช่องคอร์ {slots} ช่อง คอร์ที่ใส่ให้ฮีโร่ธาตุเดียวกันโจมตีเพิ่ม: ธรรมดา +{core_common}% · หายาก +{core_rare}% · เอปิก +{core_epic}% · ตำนาน +{core_legendary}% (คอร์ธาตุเดียวกันรวมกัน)',
  wiki_cores_2:
    'ธาตุมีวงชนะทาง: {cycle} ผู้โจมตีที่ชนะธาตุศัตรูทำดาเมจ {adv}% ถ้าแพ้ทางจะเหลือ {dis}% ธาตุกายภาพไม่ชนะและไม่แพ้ใคร',
  wiki_relics_title: 'เรลิก',
  wiki_relics_1: 'ปลดล็อกเรลิกได้เมื่อมีฮีโร่ประจำเรลิกและคอร์ธาตุเดียวกับฮีโร่นั้น',
  wiki_relics_2: 'สกิลเฉพาะของเรลิกจะโผล่ในดราฟต์ ทุกครั้งที่เลือก ฮีโร่ประจำเรลิกโจมตี +{relic}%',
  wiki_sweep_title: 'กวาดด่าน',
  wiki_sweep_1: 'ด่านที่ได้ {sweepStars} ดาวกดกวาดเพื่อรับรางวัลได้เลยโดยไม่ต้องเล่นซ้ำ',
  wiki_sweep_2: 'ค่าพลังงานและรางวัลคิดโดยเซิร์ฟเวอร์ ดูในหน้าเลือกด่าน',
  el_fire: 'ไฟ',
  el_ice: 'น้ำแข็ง',
  el_nature: 'ธรรมชาติ',
  el_physical: 'กายภาพ',
  patch_title: 'ข่าวอัปเดต',
} as const

export const STRINGS: Record<Lang, Record<keyof typeof th, string>> = {
  th,
  en: {
    title: 'Base Defense',
    back: 'Back to games',
    lost: 'Base destroyed!',
    playAgain: 'Play again',
    hint: 'Tap an empty tile to summon a gear ({n} gold) · link to the yellow source · tap two identical gears to merge',
    keys: 'Keys: P pause · F speed · R restart · L language',
    pause: 'Pause',
    resume: 'Resume',
    restart: 'Restart',
    lang: 'ไทย',
    menu: 'Menu',
    gacha: 'Summon',
    goals: 'Goals',
    cores: 'Cores',
    relics: 'Relics',
    round: 'Round {n}/{total}',
    boss: 'Boss!',
    won: 'Victory!',
    pickTitle: 'Pick 1 skill',
    netStarting: 'Starting the stage…',
    netNoEnergy: 'Not enough energy, wait for it to refill',
    netStartError: 'Could not start the stage, please retry',
    netFinishing: 'Checking your run…',
    netPaid: 'Earned {n} coins {stars}',
    netPaidClear: 'First clear! Earned {n} coins and {gems} gems {stars}',
    netLocked: 'This stage is locked. Clear the previous stage first.',
    stages: 'Stages',
    stage: 'Stage {n}',
    netFinishError: 'Could not submit the run, no coins paid',
    netRetry: 'Retry',
    skill_power: 'Attack power +25%',
    skill_haste: 'Charge speed +25%',
    skill_crit: 'Crit chance +10%',
    skill_bounty: 'Kill bounty +2 gold',
    skill_bank: 'Gain 25 gold now',
    skill_repair: 'Repair HQ +3',
    'skill_ember-surge': 'Fire relic: Cinder Witch +50% damage',
    'skill_glacial-edge': 'Ice relic: Frost Herald +50% damage',
    'skill_verdant-bloom': 'Nature relic: Moss Healer +50% damage',
    'skill_void-rend': 'Physical relic: Void Blade +50% damage',
    wiki_open: 'Guide and patch notes',
    wiki_battle_title: 'Battle rules',
    wiki_battle_1:
      'The HQ has {hp} health. Each enemy that reaches it costs health; at zero you lose.',
    wiki_battle_2:
      'A stage is {rounds} rounds followed by a boss ({stages} stages). After every round, pick 1 of 3 skills.',
    wiki_battle_3:
      'Tap an empty tile to summon a gear for {summon} gold. You earn gold over time and from kills.',
    wiki_charging_title: 'Charging',
    wiki_charging_1:
      'A gear only charges while linked to the yellow energy source, directly or through a chain of touching gears.',
    wiki_charging_2:
      'More touching sides charge it faster, and each touching side adds +{side}% attack power.',
    wiki_charging_3: 'A -2 tile cuts the gear standing on it to {penalty}% output.',
    wiki_merging_title: 'Merging',
    wiki_merging_1:
      'Tap two identical gears (same hero, same level) to merge them one level up, to a maximum of level {maxLevel}.',
    wiki_merging_2:
      'A merge is always worth it: a top-level gear hits for {maxLevelPct}% of a level 1 gear.',
    wiki_resonance_title: 'Resonance',
    wiki_resonance_1:
      'Touching gears of the same hero give +{res}% crit chance each, up to {resCap}%.',
    wiki_resonance_2: 'A crit deals {crit}% damage.',
    wiki_energy_title: 'Energy',
    wiki_energy_1: 'Starting a stage costs {stageCost} energy. You can hold up to {cap}.',
    wiki_energy_2:
      'Energy refills by 1 every {regen} minutes, even while the game is closed, and stops counting when full.',
    wiki_gacha_title: 'Summon heroes',
    wiki_gacha_1:
      'One pull costs {single} gems, a 10-pull costs {ten} gems, and a free pull is offered when it is ready.',
    wiki_gacha_2:
      'Rates: Common {rate_common}% · Rare {rate_rare}% · Epic {rate_epic}% · Legendary {rate_legendary}%',
    wiki_gacha_3:
      'A Legendary is guaranteed within {pity} pulls; the count carries over until you get one.',
    wiki_gacha_4:
      'A duplicate hero turns into shards: Common {dup_common} · Rare {dup_rare} · Epic {dup_epic} · Legendary {dup_legendary}',
    wiki_stars_title: 'Stars',
    wiki_stars_1:
      'Hero stars: spend shards to raise a hero up to {maxStar} stars. A top-star hero hits for {starPct}% of a 1-star hero.',
    wiki_stars_2: 'From {strongStar} stars a hero unlocks a stronger skill that fires more often.',
    wiki_stars_3:
      'Stage stars: clearing a stage earns 1 to 3 stars based on how well you defended; the server decides. Replay to earn more.',
    wiki_cores_title: 'Cores and elements',
    wiki_cores_1:
      'You have {slots} core slots. An equipped core boosts heroes of its element: Common +{core_common}% · Rare +{core_rare}% · Epic +{core_epic}% · Legendary +{core_legendary}% (cores of one element add up).',
    wiki_cores_2:
      "Elements beat each other in a loop: {cycle}. An attacker that beats the target's element deals {adv}% damage; one that loses deals {dis}%. Physical neither beats nor loses to anything.",
    wiki_relics_title: 'Relics',
    wiki_relics_1: "Unlock a relic once you own its hero and a core of that hero's element.",
    wiki_relics_2:
      'Its exclusive skill joins your skill draft; each time you pick it, that hero deals +{relic}% damage.',
    wiki_sweep_title: 'Sweep',
    wiki_sweep_1:
      'Once a stage has {sweepStars} stars you can sweep it to claim its rewards without replaying.',
    wiki_sweep_2: 'Energy cost and rewards are decided by the server; see the stage list.',
    el_fire: 'Fire',
    el_ice: 'Ice',
    el_nature: 'Nature',
    el_physical: 'Physical',
    patch_title: 'Patch notes',
  },
}

export type StringKey = keyof typeof th

export function t(lang: Lang, key: keyof typeof th, params?: Record<string, string | number>) {
  const s = STRINGS[lang][key]
  return params ? s.replace(/\{(\w+)\}/g, (m, k) => String(params[k] ?? m)) : s
}

export const skillLabel = (lang: Lang, id: SkillId) => t(lang, `skill_${id}`)
