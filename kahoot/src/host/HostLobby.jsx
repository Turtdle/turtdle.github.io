import { useState } from 'react'
import Screen from '../components/Screen.jsx'
import QrCode from '../components/QrCode.jsx'

export default function HostLobby({ snapshot, code, quiz, actions, onNewQuiz }) {
  const [copied, setCopied] = useState(false)
  const link = `${location.origin}${location.pathname}#/play/${code}`
  const joinAt = `${location.host}${location.pathname}`.replace(/\/$/, '')
  const connected = snapshot.players.filter((p) => p.connected).length

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked — the code and QR are on screen anyway.
    }
  }

  return (
    <Screen wide>
      <div className="lobby">
        <section className="card join-panel">
          <p className="label">
            Go to <strong>{joinAt}</strong> and enter
          </p>
          <div className="code-tiles" aria-label={`Game code ${code}`}>
            {[...code].map((c, i) => (
              <span key={i}>{c}</span>
            ))}
          </div>
          <div className="qr-wrap">
            <QrCode text={link} size={176} />
            <p className="muted small">or scan to join</p>
          </div>
          <button className="btn btn-ghost-dark" onClick={copyLink}>
            {copied ? 'Link copied!' : 'Copy join link'}
          </button>
        </section>

        <section className="card players-panel">
          <div className="panel-head">
            <h2>
              Players <span className="count">{connected}</span>
            </h2>
            <label className="toggle">
              <input type="checkbox" checked={snapshot.locked} onChange={(e) => actions.setLocked(e.target.checked)} />
              <span>Lock lobby</span>
            </label>
          </div>
          {snapshot.players.length === 0 ? (
            <p className="muted empty-note">Waiting for players to join…</p>
          ) : (
            <ul className="chips">
              {snapshot.players.map((p) => (
                <li key={p.pid} className={`chip${p.connected ? '' : ' gone'}`}>
                  <span className="chip-name">{p.name}</span>
                  <button className="chip-x" onClick={() => actions.kick(p.pid)} aria-label={`Remove ${p.name}`} title="Remove">
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
          {snapshot.locked && <p className="muted small">Locked: new players can&rsquo;t join, but anyone who drops out can rejoin.</p>}
        </section>
      </div>

      <div className="lobby-foot">
        <p className="quiz-meta">
          <strong>{quiz.name}</strong> · {snapshot.questionCount} questions
          {quiz.problems.length > 0 && ` · ${quiz.problems.length} row${quiz.problems.length === 1 ? '' : 's'} skipped`}
          <button className="link-btn" onClick={onNewQuiz}>
            Change quiz
          </button>
        </p>
        <button className="btn btn-go btn-big" onClick={actions.start} disabled={connected === 0}>
          {connected === 0 ? 'Waiting for players…' : `Start game (${connected})`}
        </button>
      </div>
      <p className="keep-open">Keep this tab open: the game runs in it.</p>
    </Screen>
  )
}
