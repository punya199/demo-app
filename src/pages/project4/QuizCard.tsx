import { useState } from 'react'
import { QuizData } from './PageQuiz'

interface QuizCardProps {
  data: QuizData
}
const QuizCard = (props: QuizCardProps) => {
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null)
  return (
    <div>
      <div>
        <p>ข้อที่ 1 {props.data.name}</p>
        <ul>
          {props.data.choices.map((e, index) => {
            return (
              <li key={index} onClick={() => setSelectedChoice(index)}>
                <input type="radio" value={index} checked={selectedChoice === index} />

                <span>
                  คำตอบที่ {index + 1} {e.name}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export default QuizCard
