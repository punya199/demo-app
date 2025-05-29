import { QuizData } from './quiz-data'

interface QuizCardProps {
  data: QuizData
  questionNumber: number
  selectedChoice: number | null
  onSelectChoice: (choiceIndex: number) => void
  className?: string
  h?: number
}
const QuizCard = (props: QuizCardProps) => {
  return (
    <div
      className={`p-6 bg-white border rounded-2xl shadow-lg my-6 transition-all duration-300 ${props.className ?? ''}`}
    >
      <div className="mb-4">
        <p className="text-2xl font-bold text-gray-800">
          ข้อที่ {props.questionNumber} {props.data.name}
        </p>
      </div>
      <ul className="flex flex-col gap-4">
        {props.data.choices.map((choice, index) => {
          const isSelected = props.selectedChoice === index
          return (
            <li
              key={index}
              onClick={() => props.onSelectChoice(index)}
              className={`flex items-center gap-3 rounded-xl border transition cursor-pointer pl-2
             ${isSelected ? 'bg-green-100 border-green-500' : 'hover:bg-gray-100 border-gray-300'} `}
            >
              <input
                type="radio"
                name={`quiz-${props.questionNumber}`}
                value={index}
                checked={props.selectedChoice === index}
                className="w-5 h-5 accent-green-500 cursor-pointer "
                onChange={() => props.onSelectChoice(index)}
              />

              <span className="text-lg">
                {index + 1}. {choice.name}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default QuizCard
