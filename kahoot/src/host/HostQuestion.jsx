import Screen from '../components/Screen.jsx'
import Shape from '../components/Shape.jsx'

export default function HostQuestion({ snapshot, actions }) {
  const connected = snapshot.players.filter((p) => p.connected)
  const answeredCount = connected.filter((p) => p.answered).length
  const { question } = snapshot

  return (
    <Screen wide>
      <div className="q-head">
        <span className="pill">
          Question {snapshot.questionIndex + 1} of {snapshot.questionCount}
        </span>
        <span className="pill">
          {answeredCount} / {connected.length} answered
        </span>
      </div>
      <div className="progress" aria-hidden="true">
        <div style={{ width: `${connected.length ? (answeredCount / connected.length) * 100 : 0}%` }} />
      </div>

      <h1 className="question-card" key={snapshot.questionIndex}>
        {question.text}
      </h1>

      <div className={`answers answers-${question.answers.length}`}>
        {question.answers.map((answer, i) => (
          <div key={i} className={`answer a${i}`} style={{ animationDelay: `${i * 60}ms` }}>
            <Shape i={i} size={28} />
            <span className="answer-text">{answer}</span>
          </div>
        ))}
      </div>

      <div className="host-row">
        <ul className="answered-list" aria-label="Who has answered">
          {connected.map((p) => (
            <li key={p.pid} className={p.answered ? 'done' : ''}>
              {p.answered ? '✓ ' : ''}
              {p.name}
            </li>
          ))}
        </ul>
        <button className="btn btn-light" onClick={actions.reveal}>
          Show answer now
        </button>
      </div>
    </Screen>
  )
}
