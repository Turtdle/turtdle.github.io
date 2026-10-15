import Screen from '../components/Screen.jsx'
import Shape from '../components/Shape.jsx'
import Leaderboard from '../components/Leaderboard.jsx'
import AnswerBars from '../components/AnswerBars.jsx'

export default function HostResults({ snapshot, actions, onNewQuiz }) {
  if (snapshot.phase === 'gameover') return <FinalResults snapshot={snapshot} actions={actions} onNewQuiz={onNewQuiz} />

  const isLastQuestion = snapshot.questionIndex + 1 >= snapshot.questionCount
  const { question } = snapshot
  return (
    <Screen wide>
      <div className="q-head">
        <span className="pill">
          Question {snapshot.questionIndex + 1} of {snapshot.questionCount}
        </span>
      </div>
      <h1 className="question-card">{question.text}</h1>

      <div className="results-grid">
        <div>
          <div className={`answers answers-${question.answers.length}`}>
            {question.answers.map((answer, i) => {
              const correct = i === snapshot.correctAnswerIndex
              return (
                <div key={i} className={`answer a${i} ${correct ? 'correct' : 'dim'}`}>
                  <Shape i={i} size={28} />
                  <span className="answer-text">{answer}</span>
                  {correct && <span className="answer-check">✓</span>}
                </div>
              )
            })}
          </div>
          {snapshot.answerCounts && <AnswerBars counts={snapshot.answerCounts} correctIndex={snapshot.correctAnswerIndex} />}
        </div>
        <section className="card">
          <h2>Leaderboard</h2>
          <Leaderboard players={snapshot.players} showGains limit={8} />
        </section>
      </div>

      <div className="host-actions">
        <button className="btn btn-go btn-big" onClick={actions.next}>
          {isLastQuestion ? 'Show final results 🏆' : 'Next question →'}
        </button>
      </div>
    </Screen>
  )
}

function FinalResults({ snapshot, actions, onNewQuiz }) {
  const top3 = snapshot.players.slice(0, 3)
  return (
    <Screen wide>
      <h1 className="hero-title">Final results</h1>
      <div className="podium">
        {/* visual order: 2nd, 1st, 3rd */}
        {[
          [top3[1], 2],
          [top3[0], 1],
          [top3[2], 3],
        ].map(([p, place]) =>
          p ? (
            <div key={p.pid} className={`podium-spot place-${place}`}>
              <div className="podium-medal">{place === 1 ? '🥇' : place === 2 ? '🥈' : '🥉'}</div>
              <div className="podium-name">{p.name}</div>
              <div className="podium-score">{p.score}</div>
            </div>
          ) : (
            <div key={place} className="podium-spot empty" />
          )
        )}
      </div>
      <section className="card">
        <h2>Final standings</h2>
        <Leaderboard players={snapshot.players} />
      </section>
      <div className="host-actions">
        <button className="btn btn-go btn-big" onClick={actions.restart}>
          Play again
        </button>
        <button className="btn btn-light" onClick={onNewQuiz}>
          New quiz
        </button>
      </div>
    </Screen>
  )
}
