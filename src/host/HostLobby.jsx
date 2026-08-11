import { useState } from 'react'
import Leaderboard from '../components/Leaderboard.jsx'

export default function HostLobby({ snapshot, code, skipped, quizName, onStart }) {
  const [copied, setCopied] = useState(false)
  const link = location.origin + location.pathname + '#/play/' + code
  const connectedCount = snapshot.players.filter((p) => p.connected).length

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked — the link is shown on screen, copy it by hand.
    }
  }

  return (
    <div className="page center">
      <h1 className="logo">Game lobby</h1>

      <div className="card lobby-card">
        <p className="muted">Game code</p>
        <div className="game-code">{code}</div>
        <p className="join-link">{link}</p>
        <button className="btn primary" onClick={copyLink}>
          {copied ? 'Copied!' : 'Copy join link'}
        </button>
        <p className="muted small">
          {quizName} — {snapshot.questionCount} questions
          {skipped > 0 && ` (${skipped} invalid row${skipped > 1 ? 's' : ''} skipped)`}
        </p>
      </div>

      <div className="card">
        <h2>Players ({connectedCount})</h2>
        <Leaderboard players={snapshot.players} />
      </div>

      <button className="btn start" onClick={onStart} disabled={connectedCount === 0}>
        {connectedCount === 0 ? 'Waiting for players…' : 'Start game!'}
      </button>
      <p className="muted small">Keep this tab open — the game runs in it. Don't refresh!</p>
    </div>
  )
}
