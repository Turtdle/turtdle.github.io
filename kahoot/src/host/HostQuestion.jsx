import Leaderboard from '../components/Leaderboard.jsx'

const SHAPES = ['▲', '◆', '●']

export default function HostQuestion({ snapshot }) {
  const connected = snapshot.players.filter((p) => p.connected)
  const answeredCount = connected.filter((p) => p.answered).length

  return (
    <div className="page">
      <p className="question-counter">
        Question {snapshot.questionIndex + 1} of {snapshot.questionCount}
      </p>
      <h1 className="question-text">{snapshot.question.text}</h1>

      <div className="answers">
        {snapshot.question.answers.map((answer, i) => (
          <div key={i} className={`answer a${i}`}>
            <span className="answer-shape">{SHAPES[i]}</span>
            {answer}
          </div>
        ))}
      </div>

      <div className="tally">
        {answeredCount} / {connected.length} answered
      </div>

      <div className="card">
        <h2>Leaderboard</h2>
        <Leaderboard players={snapshot.players} showAnswered />
      </div>
    </div>
  )
}
