// Shared by host and player screens. Players arrive pre-sorted by score.
// showAnswered: put a ✓ next to players who've locked in (question phase).
// showGains: show the +points from the question that just ended.
// limit: only the top N (the player's own row is always kept).
export default function Leaderboard({ players, showAnswered = false, showGains = false, myId = null, limit = 0 }) {
  if (players.length === 0) {
    return <p className="muted empty-note">No players yet…</p>
  }
  const rows = players.map((p, i) => ({ ...p, rank: i + 1 }))
  const shown = limit ? rows.filter((p) => p.rank <= limit || p.pid === myId) : rows
  return (
    <ol className="leaderboard">
      {shown.map((p) => (
        <li
          key={p.pid}
          className={`lb-row ${p.connected ? '' : 'disconnected'} ${p.pid === myId ? 'me' : ''}`}
        >
          <span className={`lb-rank rank-${p.rank}`}>{p.rank}</span>
          <span className="lb-name">
            {p.name}
            {p.pid === myId && <span className="lb-tag"> (you)</span>}
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
