// Shared by host and player screens. Players arrive pre-sorted by score.
// showAnswered: put a ✓ next to players who've locked in (question phase).
// showGains: show the +points from the question that just ended.
export default function Leaderboard({ players, showAnswered = false, showGains = false, myId = null }) {
  if (players.length === 0) {
    return <p className="muted">No players yet…</p>
  }
  return (
    <ol className="leaderboard">
      {players.map((p, i) => (
        <li
          key={p.id}
          className={`lb-row ${p.connected ? '' : 'disconnected'} ${p.id === myId ? 'me' : ''}`}
        >
          <span className="lb-rank">{i + 1}</span>
          <span className="lb-name">
            {p.name}
            {!p.connected && <span className="lb-tag"> (left)</span>}
          </span>
          {showAnswered && <span className="lb-check">{p.answered ? '✓' : ''}</span>}
          {showGains && p.lastGain > 0 && <span className="lb-gain">+{p.lastGain}</span>}
          <span className="lb-score">{p.score}</span>
        </li>
      ))}
    </ol>
  )
}
