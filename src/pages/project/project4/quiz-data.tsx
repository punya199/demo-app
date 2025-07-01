interface QuizChoice {
  name: string
  isCorrect?: boolean
}
export interface QuizData {
  name: string
  choices: QuizChoice[]
}
export const quizList: QuizData[] = [
  {
    name: 'แมวมีกี่ขา ?',
    choices: [
      { name: '2 ขา' },
      { name: '4 ขา', isCorrect: true },
      { name: '6 ขา' },
      { name: '400 ขา' },
    ],
  },
  {
    name: 'แมวมีเสียงร้องยังไง ?',
    choices: [
      { name: 'เหมี้ยว', isCorrect: true },
      { name: 'มอ' },
      { name: 'โฮ่ง' },
      { name: 'กากากา' },
    ],
  },
  {
    name: 'แมวคิดยังไงกับคุณ ?',
    choices: [
      { name: 'ผู้มีพระคุณ' },
      { name: 'ทาสชั้นต่ำ' },
      { name: 'ผู้มีค่าเมื่อเวลาเทอาหาร' },
      { name: 'ไม่มีใครรู้ เพราะแมวคือแมว', isCorrect: true },
    ],
  },
  {
    name: '"เมี้ยว~ งื๊อ~ ง้าวว~ เหมียว~ เหมี้ยววว~ งื้อออ~" จากประโยคนี้ แมวมีอารมเช่นไร ?',
    choices: [
      { name: 'อยากอ้อน', isCorrect: true },
      { name: 'โกธร' },
      { name: 'ง่วงนอน' },
      { name: 'สงสัย' },
    ],
  },
  {
    name: 'อาหารชนิดใดที่เป็นอันตรายต่อแมว ?',
    choices: [
      { name: 'อาหารแมวกระป๋อง' },
      { name: 'ปลาแซลมอน' },
      { name: 'นมวัว', isCorrect: true },
      { name: 'ไก่ต้มสุก' },
    ],
  },
  {
    name: 'เวลาแมวกระโดดใช้อะไรควบคุมทิศทาง ?',
    choices: [{ name: 'ปาก' }, { name: 'หาง', isCorrect: true }, { name: 'ขา' }, { name: 'ลำตัว' }],
  },
]
