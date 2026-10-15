import Screen from '../components/Screen.jsx'
import Shape from '../components/Shape.jsx'

export default function PlayerQuestion({ snapshot, me, myAnswer, onAnswer }) {
  // Local echo (myAnswer) makes the buttons lock instantly; the host's
  // snapshot (me.answered) covers rejoins where local state was lost.
  const answeredIndex = myAnswer?.questionIndex === snapshot.questionIndex ? myAnswer.answerIndex : null
  const hasAnswered = answeredIndex !== null || me?.answered
  const { question } = snapshot

  return (
    <Screen>
      <p className="q-counter">
        Question {snapshot.questionIndex + 1} of {snapshot.questionCount}
      </p>
      <h1 className="question-card small" key={snapshot.questionIndex}>
        {question.text}
      </h1>

      {hasAnswered ? (
        <div className="locked-in">
          {answeredIndex !== null && (
            <div className={`answer a${answeredIndex}`}>
              <Shape i={answeredIndex} size={26} />
              <span className="answer-text">{question.answers[answeredIndex]}</span>
            </div>
          )}
          <p className="locked-title">Answer locked in!</p>
          <p className="muted-light">Waiting for the others…</p>
        </div>
      ) : (
        <div className={`answers player answers-${question.answers.length}`}>
          {question.answers.map((answer, i) => (
            <button key={i} className={`answer a${i}`} onClick={() => onAnswer(i)} style={{ animationDelay: `${i * 50}ms` }}>
              <Shape i={i} size={26} />
              <span className="answer-text">{answer}</span>
            </button>
          ))}
        </div>
      )}
    </Screen>
  )
}
