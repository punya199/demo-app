import QuizCard from './QuizCard'

interface QuizChoice {
  name: string
  isCorrect?: boolean
}
export interface QuizData {
  name: string
  choices: QuizChoice[]
}
const quiz: QuizData[] = [
  {
    name: 'แมวมีกี่ขา?',
    choices: [{ name: '1ขา' }, { name: '2ขา' }, { name: '3ขา' }, { name: '4ขา', isCorrect: true }],
  },
]
const d = quiz[0]
const PageQuiz = () => {
  return (
    <div>
      <QuizCard data={d} />
    </div>
  )
}

export default PageQuiz
