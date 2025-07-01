import { shuffle } from 'lodash'
import { useCallback, useMemo, useState } from 'react'
import QuizCard from './QuizCard'
import { QuizData, quizList } from './quiz-data'

const PageQuiz = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(Array(quizList.length).fill(null))
  const [score, setScore] = useState<number | null>(null)

  const shuffleQuiz = useMemo(() => {
    const randomQuiz = [...quizList]
    return shuffle(randomQuiz).map((e): QuizData => ({ ...e, choices: shuffle(e.choices) }))
  }, [])
  const handleNext = useCallback(() => {
    if (answers[currentIndex] === null) {
      alert('ต้องเลือกคำตอบก่อนครับ')
      return
    }
    setCurrentIndex(prev => prev + 1)
  }, [answers, currentIndex])
  const handleBack = useCallback(() => {
    setCurrentIndex(prev => prev - 1)
  }, [])
  const handleSubmit = useCallback(() => {
    const confirmSubmit = confirm('ส่งคำตอบไหม')
    if (!confirmSubmit) return
    let tempScore = 0
    for (let i = 0; i < quizList.length; i++) {
      const correctChoiceIndex = shuffleQuiz[i].choices.findIndex(choice => choice.isCorrect)
      if (answers[i] === correctChoiceIndex) {
        tempScore += 1
      }
    }
    setScore(tempScore)
  }, [answers, shuffleQuiz])
  const handleSelectChoice = useCallback(
    (choiceIndex: number) => {
      const newAnswers = [...answers]
      newAnswers[currentIndex] = choiceIndex
      setAnswers(newAnswers)
    },
    [answers, currentIndex]
  )
  const handleReset = useCallback(() => {
    setScore(null)
    setAnswers([null])
    setCurrentIndex(0)
  }, [])

  return (
    <div>
      <div>
        {score === null ? (
          <div>
            <QuizCard
              key={currentIndex}
              data={shuffleQuiz[currentIndex]}
              questionNumber={currentIndex + 1}
              selectedChoice={answers[currentIndex]}
              onSelectChoice={handleSelectChoice}
            />
            <div className="flex justify-between px-10">
              {currentIndex == 0 ? (
                <div></div>
              ) : (
                <button
                  onClick={handleBack}
                  className="border-amber-500 shadow-2xl rounded-lg py-2 px-4 bg-blue-300 hover:bg-blue-500"
                >
                  Back
                </button>
              )}

              {currentIndex >= quizList.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  className="border-amber-500 shadow-2xl rounded-lg py-2 px-4 bg-blue-300 hover:bg-blue-500"
                >
                  Submit
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="border-amber-500 shadow-2xl rounded-lg py-2 px-4 bg-blue-300 hover:bg-blue-500"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6 text-center space-y-6">
            <h2 className="text-2xl font-bold text-green-600">🎉 แบบทดสอบเสร็จสิ้น!</h2>
            <p className="text-lg font-medium">
              คะแนนของคุณคือ <span className="text-blue-600 text-xl font-bold">{score}</span>{' '}
              จากทั้งหมด <span className="font-bold">{quizList.length}</span> ข้อ
            </p>
            <button
              onClick={handleReset}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-full shadow hover:bg-blue-600 transition"
            >
              🔁 เริ่มทำแบบทดสอบใหม่
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PageQuiz
