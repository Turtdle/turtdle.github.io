const SHAPES = ['▲', '◆', '●']

export default function PlayerQuestion({ snapshot, me, myAnswer, onAnswer }) {
  // Local echo (myAnswer) makes the buttons lock instantly; the host's
  // snapshot (me.answered) covers rejoins where local state was lost.
  const answeredIndex =
    myAnswer?.questionIndex === snapshot.questionIndex ? myAnswer.answerIndex : null
  const hasAnswered = answeredIndex !== null || me?.answered

  return (
    <div className="page center">
      <p className="question-counter">
        Question {snapshot.questionIndex + 1} of {snapshot.questionCount}
      </p>
      <h1 className="question-text">{snapshot.question.text}</h1>

      {hasAnswered ? (
        <div className="status-box">
          <p className="big-emoji">🔒</p>
          <p>Answer locked in!</p>
          <p className="muted">Waiting for the others…</p>
        </div>
      ) : (
        <div className="answers">
          {snapshot.question.answers.map((answer, i) => (
            <button key={i} className={`answer a${i}`} onClick={() => onAnswer(i)}>
              <span className="answer-shape">{SHAPES[i]}</span>
              {answer}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
