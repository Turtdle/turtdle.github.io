import Leaderboard from '../components/Leaderboard.jsx'

const SHAPES = ['▲', '◆', '●']

export default function HostResults({ snapshot, onNext }) {
  const gameover = snapshot.phase === 'gameover'
  const isLastQuestion = snapshot.questionIndex + 1 >= snapshot.questionCount
  const top3 = snapshot.players.slice(0, 3)

  return (
    <div className="page">
      {gameover ? (
        <>
          <h1 className="logo">🏆 Final results</h1>
          <div className="podium">
            {/* visual order: 2nd, 1st, 3rd */}
            {[top3[1], top3[0], top3[2]].map((p, col) =>
              p ? (
                <div key={p.id} className={`podium-spot place-${col === 1 ? 1 : col === 0 ? 2 : 3}`}>
                  <div className="podium-medal">{col === 1 ? '🥇' : col === 0 ? '🥈' : '🥉'}</div>
                  <div className="podium-name">{p.name}</div>
                  <div className="podium-score">{p.score}</div>
                </div>
              ) : (
                <div key={col} className="podium-spot empty" />
              )
            )}
          </div>
        </>
      ) : (
        <>
          <p className="question-counter">
            Question {snapshot.questionIndex + 1} of {snapshot.questionCount}
          </p>
          <h1 className="question-text">{snapshot.question.text}</h1>
          <div className="answers">
            {snapshot.question.answers.map((answer, i) => (
              <div
                key={i}
                className={`answer a${i} ${i === snapshot.correctAnswerIndex ? 'correct' : 'dim'}`}
              >
                <span className="answer-shape">{SHAPES[i]}</span>
                {answer}
                {i === snapshot.correctAnswerIndex && <span className="answer-check"> ✓</span>}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="card">
        <h2>Leaderboard</h2>
        <Leaderboard players={snapshot.players} showGains />
      </div>

      {gameover ? (
        <button className="btn start" onClick={() => location.reload()}>
          Play again
        </button>
      ) : (
        <button className="btn start" onClick={onNext}>
          {isLastQuestion ? 'Show final results 🏆' : 'Next question →'}
        </button>
      )}
    </div>
  )
}
