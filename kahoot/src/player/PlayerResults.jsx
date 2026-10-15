import Screen from '../components/Screen.jsx'
import Leaderboard from '../components/Leaderboard.jsx'
import AnswerBars from '../components/AnswerBars.jsx'

export default function PlayerResults({ snapshot, me, myId }) {
  const gameover = snapshot.phase === 'gameover'
  const rank = snapshot.players.findIndex((p) => p.pid === myId) + 1
  const total = snapshot.players.length

  let verdict = null
  if (me && !gameover) {
    if (me.lastCorrect === true) verdict = { tone: 'good', emoji: '✅', text: 'Correct!', extra: `+${me.lastGain}` }
    else if (me.lastCorrect === false) verdict = { tone: 'bad', emoji: '❌', text: 'Not this time' }
    else verdict = { tone: 'none', emoji: '⏱️', text: 'No answer' }
  }

  return (
    <Screen>
      {gameover ? (
        <div className="final-rank">
          <p className="big-emoji">{rank === 1 ? '🏆' : rank <= 3 ? '🎉' : '👏'}</p>
          <h1 className="hero-title">{rank > 0 ? `You finished #${rank} of ${total}` : 'Game over!'}</h1>
          {me && <p className="hero-sub">{me.score} points</p>}
        </div>
      ) : (
        verdict && (
          <div className={`verdict ${verdict.tone}`}>
            <span className="verdict-emoji">{verdict.emoji}</span>
            <span className="verdict-text">{verdict.text}</span>
            {verdict.extra && <span className="verdict-gain">{verdict.extra}</span>}
          </div>
        )
      )}

      {!gameover && snapshot.answerCounts && (
        <AnswerBars counts={snapshot.answerCounts} correctIndex={snapshot.correctAnswerIndex} />
      )}

      {!gameover && me && rank > 0 && (
        <p className="rank-line">
          You&rsquo;re <strong>#{rank}</strong> with <strong>{me.score}</strong> points
        </p>
      )}

      <section className="card">
        <h2>{gameover ? 'Final standings' : 'Leaderboard'}</h2>
        <Leaderboard players={snapshot.players} showGains={!gameover} myId={myId} limit={gameover ? 0 : 5} />
      </section>

      {!gameover && <p className="muted-light center-text">Waiting for the host to continue…</p>}
    </Screen>
  )
}
