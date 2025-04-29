import { QuizData } from './quiz-data'

interface QuizCardProps {
  data: QuizData
  questionNumber: number
  selectedChoice: number | null
  onSelectChoice: (choiceIndex: number) => void
  className?: string
}
const QuizCard = (props: QuizCardProps) => {
  return (
    <div className="p-4 border rounded-lg shadow-md my-4 animate-shake">
      <div>
        <p className="text-xl font-semibold mb-2 h-15">
          ข้อที่ {props.questionNumber} {props.data.name}
        </p>
      </div>
      <ul className="flex flex-col gap-2">
        {props.data.choices.map((choice, index) => (
          <li
            key={index}
            onClick={() => props.onSelectChoice(index)}
            className="flex items-baseline gap-2 border shadow rounded-2xl px-3 py-1 cursor-pointer hover:bg-gray-300"
          >
            <input
              type="radio"
              name={`quiz-${props.questionNumber}`}
              value={index}
              checked={props.selectedChoice === index}
              className="w-4 h-4 accent-green-500 cursor-pointer"
              onChange={() => props.onSelectChoice(index)}
            />

            <span>
              {index + 1}. {choice.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default QuizCard
