import Leaderboard from '../components/Leaderboard.jsx'

export default function PlayerResults({ snapshot, me, myId }) {
  const gameover = snapshot.phase === 'gameover'
  const rank = snapshot.players.findIndex((p) => p.id === myId) + 1

  let verdict
  if (!me) {
    verdict = null
  } else if (me.lastCorrect === true) {
    verdict = (
      <>
        <p className="big-emoji">✅</p>
        <p className="verdict correct-text">Correct! +{me.lastGain}</p>
      </>
    )
  } else if (me.lastCorrect === false) {
    verdict = (
      <>
        <p className="big-emoji">❌</p>
        <p className="verdict wrong-text">Wrong…</p>
      </>
    )
  } else {
    verdict = (
      <>
        <p className="big-emoji">🤷</p>
        <p className="verdict">No answer</p>
      </>
    )
  }

  return (
    <div className="page center">
      {gameover ? (
        <h1 className="logo">🏆 Game over!</h1>
      ) : (
        <div className="status-box">{verdict}</div>
      )}

      {me && rank > 0 && (
        <p className="rank-line">
          You're <strong>#{rank}</strong> with <strong>{me.score}</strong> points
        </p>
      )}

      <div className="card">
        <h2>{gameover ? 'Final standings' : 'Leaderboard'}</h2>
        <Leaderboard players={snapshot.players} showGains={!gameover} myId={myId} />
      </div>

      {!gameover && <p className="muted next-note">Waiting for the host to continue…</p>}
    </div>
  )
}
