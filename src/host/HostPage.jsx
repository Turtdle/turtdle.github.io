import { useEffect, useState } from 'react'
import { HOST_PASSWORD } from '../config.js'
import { loadQuestions, loadQuizList } from '../lib/questions.js'
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
  const [quiz, setQuiz] = useState(null) // { name, file }
  if (!authed) return <PasswordGate onAuthed={() => setAuthed(true)} />
  if (!quiz) return <QuizPicker onPick={setQuiz} />
  return <HostGame quiz={quiz} />
}

function QuizPicker({ onPick }) {
  const [list, setList] = useState(null) // null | { error } | array
  useEffect(() => {
    loadQuizList()
      .then(setList)
      .catch((err) => setList({ error: err.message }))
  }, [])

  return (
    <div className="page center">
      <h1 className="logo">Pick a quiz</h1>
      {!list && <div className="status-box">Loading quizzes…</div>}
      {list?.error && <div className="status-box error">Couldn't load quizzes.json: {list.error}</div>}
      {Array.isArray(list) &&
        (list.length === 0 ? (
          <div className="status-box error">quizzes.json has no quizzes.</div>
        ) : (
          <div className="quiz-list">
            {list.map((q) => (
              <button key={q.file} className="btn quiz-choice" onClick={() => onPick(q)}>
                {q.name}
              </button>
            ))}
          </div>
        ))}
      <a className="subtle-link" href="#/">← Back</a>
    </div>
  )
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
// gate has been passed and the chosen quiz is loaded.
function HostGame({ quiz }) {
  const [loaded, setLoaded] = useState(null) // { questions, skipped } | { error }
  useEffect(() => {
    loadQuestions(quiz.file)
      .then(setLoaded)
      .catch((err) => setLoaded({ error: err.message }))
  }, [quiz])

  const questions = loaded?.questions?.length ? loaded.questions : null
  const { snapshot, status, start, next } = useHostGame(questions)

  if (!loaded) {
    return <Centered>Loading questions…</Centered>
  }
  if (loaded.error) {
    return <Centered className="error">Couldn't load questions: {loaded.error}</Centered>
  }
  if (loaded.questions.length === 0) {
    return <Centered className="error">"{quiz.name}" has no valid questions.</Centered>
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
      return (
        <HostLobby
          snapshot={snapshot}
          code={status.code}
          skipped={loaded.skipped}
          quizName={quiz.name}
          onStart={start}
        />
      )
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
