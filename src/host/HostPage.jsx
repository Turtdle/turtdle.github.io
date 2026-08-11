import { useEffect, useState } from 'react'
import { HOST_PASSWORD } from '../config.js'
import { loadQuestions } from '../lib/questions.js'
import { useHostGame } from './useHostGame.js'
import HostLobby from './HostLobby.jsx'
import HostQuestion from './HostQuestion.jsx'
import HostResults from './HostResults.jsx'

const AUTH_KEY = 'kahoot-host-auth'

// sessionStorage throws in browsers that block all site data; fall back to
// in-memory auth (just re-enter the password after a refresh).
function readAuth() {
  try {
    return sessionStorage.getItem(AUTH_KEY) === '1'
  } catch {
    return false
  }
}

function writeAuth() {
  try {
    sessionStorage.setItem(AUTH_KEY, '1')
  } catch {
    // Storage blocked — in-memory state still unlocks this visit.
  }
}

export default function HostPage() {
  const [authed, setAuthed] = useState(readAuth)
  if (!authed) return <PasswordGate onAuthed={() => setAuthed(true)} />
  return <HostGame />
}

function PasswordGate({ onAuthed }) {
  const [pw, setPw] = useState('')
  const [wrong, setWrong] = useState(false)

  function submit(e) {
    e.preventDefault()
    if (pw === HOST_PASSWORD) {
      writeAuth()
      onAuthed()
    } else {
      setWrong(true)
    }
  }

  return (
    <div className="page center">
      <h1 className="logo">Host a game</h1>
      <div className="card">
        <form onSubmit={submit} className="stack">
          <input
            type="password"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setWrong(false) }}
            placeholder="Host password"
            autoFocus
            aria-label="Host password"
          />
          <button type="submit" className="btn primary">Enter</button>
          {wrong && <p className="error">Wrong password</p>}
        </form>
      </div>
      <a className="subtle-link" href="#/">← Back</a>
    </div>
  )
}

// Separate component so the PeerJS peer is only created once the password
// gate has been passed and questions are loaded.
function HostGame() {
  const [loaded, setLoaded] = useState(null) // { questions, skipped } | { error }
  useEffect(() => {
    loadQuestions()
      .then(setLoaded)
      .catch((err) => setLoaded({ error: err.message }))
  }, [])

  const questions = loaded?.questions?.length ? loaded.questions : null
  const { snapshot, status, start, next } = useHostGame(questions)

  if (!loaded) {
    return <Centered>Loading questions…</Centered>
  }
  if (loaded.error) {
    return <Centered className="error">Couldn't load questions: {loaded.error}</Centered>
  }
  if (loaded.questions.length === 0) {
    return <Centered className="error">questions.csv has no valid questions.</Centered>
  }
  if (status.state === 'error') {
    return (
      <Centered className="error">
        Couldn't set up the game: {status.error}
        <button className="btn primary" onClick={() => location.reload()}>Try again</button>
      </Centered>
    )
  }
  if (status.state !== 'ready' || !snapshot) {
    return <Centered>Setting up game…</Centered>
  }

  switch (snapshot.phase) {
    case 'lobby':
      return <HostLobby snapshot={snapshot} code={status.code} skipped={loaded.skipped} onStart={start} />
    case 'question':
      return <HostQuestion snapshot={snapshot} />
    case 'results':
    case 'gameover':
      return <HostResults snapshot={snapshot} onNext={next} />
    default:
      return null
  }
}

function Centered({ children, className = '' }) {
  return (
    <div className="page center">
      <div className={`status-box ${className}`}>{children}</div>
    </div>
  )
}
