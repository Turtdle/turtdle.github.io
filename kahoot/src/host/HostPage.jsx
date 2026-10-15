import { useEffect, useRef, useState } from 'react'
import { ANSWER_MAX, MAX_ANSWERS, QUESTION_MAX, QUIZ_MAX_BYTES, QUIZ_MAX_QUESTIONS } from '../config.js'
import { CSV_HEADER, parseQuizCsv } from '../lib/quiz.js'
import { unlockPresets, WrongPassword } from '../lib/presetCrypto.js'
import { cleanText } from '../lib/text.js'
import Screen, { Notice, Spinner } from '../components/Screen.jsx'
import { useHostGame } from './useHostGame.js'
import HostLobby from './HostLobby.jsx'
import HostQuestion from './HostQuestion.jsx'
import HostResults from './HostResults.jsx'

// Anyone can host by uploading a quiz CSV. The saved quiz sets are encrypted
// (see lib/presetCrypto.js) and need the host password.
export default function HostPage() {
  const [quiz, setQuiz] = useState(null) // { name, questions, problems }
  if (!quiz) return <QuizChooser onReady={setQuiz} />
  return <HostGame quiz={quiz} onNewQuiz={() => setQuiz(null)} />
}

function QuizChooser({ onReady }) {
  return (
    <Screen wide>
      <h1 className="hero-title">Host a game</h1>
      <p className="hero-sub">
        The game runs in this tab, and players join from their phones with a code or a QR code.
      </p>
      <div className="chooser">
        <UploadCard onReady={onReady} />
        <PresetsCard onReady={onReady} />
      </div>
    </Screen>
  )
}

// ---- Upload a CSV ----

const quizNameFromFile = (fileName) =>
  cleanText(fileName.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ')).slice(0, 60) || 'My quiz'

function UploadCard({ onReady }) {
  const [parsed, setParsed] = useState(null) // { name, questions, problems }
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  async function readFile(file) {
    if (!file) return
    const name = quizNameFromFile(file.name)
    if (file.size > QUIZ_MAX_BYTES) {
      setParsed({ name, questions: [], problems: [`The file is too big (the limit is ${QUIZ_MAX_BYTES / 1024} KB).`] })
    } else if (!/\.(csv|txt)$/i.test(file.name)) {
      setParsed({ name, questions: [], problems: ['That isn’t a CSV file. Save your spreadsheet as CSV first.'] })
    } else {
      setParsed({ name, ...parseQuizCsv(await file.text()) })
    }
    if (inputRef.current) inputRef.current.value = '' // choosing the same file again re-reads it
  }

  return (
    <section className="card chooser-card">
      <h2>Upload your own quiz</h2>
      <label
        className={`dropzone${dragging ? ' over' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          readFile(e.dataTransfer.files[0])
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="visually-hidden"
          onChange={(e) => readFile(e.target.files[0])}
        />
        <span className="dropzone-icon" aria-hidden="true">⬆</span>
        <span>
          <strong>Choose a CSV file</strong> or drop it here
        </span>
      </label>

      {parsed && <ParseResult parsed={parsed} onHost={() => onReady(parsed)} />}
      <FormatHelp />
    </section>
  )
}

function ParseResult({ parsed, onHost }) {
  const { questions, problems } = parsed
  const shown = problems.slice(0, 5)
  return (
    <div className={`parse-result ${questions.length ? 'ok' : 'bad'}`}>
      {questions.length > 0 ? (
        <p>
          <strong>
            ✓ {questions.length} question{questions.length === 1 ? '' : 's'} ready
          </strong>{' '}
          from “{parsed.name}”
          {problems.length > 0 && `, ${problems.length} row${problems.length === 1 ? '' : 's'} skipped`}
        </p>
      ) : (
        <p>
          <strong>No questions could be read from “{parsed.name}”.</strong>
        </p>
      )}
      {shown.length > 0 && (
        <ul className="problems">
          {shown.map((p) => (
            <li key={p}>{p}</li>
          ))}
          {problems.length > shown.length && <li>…and {problems.length - shown.length} more</li>}
        </ul>
      )}
      {questions.length > 0 && (
        <button className="btn btn-go btn-block" onClick={onHost}>
          Host this quiz
        </button>
      )}
    </div>
  )
}

function FormatHelp() {
  return (
    <details className="format-help" open>
      <summary>How to write the CSV</summary>
      <p>One question per row. The first row must be these column names:</p>
      <code className="csv-header">{CSV_HEADER}</code>
      <div className="table-scroll">
        <table className="csv-example">
          <thead>
            <tr>
              {CSV_HEADER.split(',').map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>What do pandas mainly eat?</td>
              <td>Bamboo</td>
              <td>Fish</td>
              <td>Honey</td>
              <td>Grass</td>
              <td>1</td>
            </tr>
            <tr>
              <td>Is a tomato a fruit?</td>
              <td>Yes</td>
              <td>No</td>
              <td></td>
              <td></td>
              <td>1</td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul>
        <li>
          Each question has 2 to {MAX_ANSWERS} answers: <b>answer3</b> and <b>answer4</b> can be left empty.
        </li>
        <li>
          <b>correct</b> is the number of the right answer (1 for answer1, 2 for answer2, …).
        </li>
        <li>
          Make it in Google Sheets or Excel, then use <b>File → Download → CSV</b> (or <b>Save as → CSV</b>).
          Spreadsheets handle the commas and quotes for you.
        </li>
        <li>
          Writing it by hand? Wrap text that contains a comma in double quotes: <code>"Paris, France"</code>.
        </li>
        <li>
          Up to {QUIZ_MAX_QUESTIONS} questions; questions up to {QUESTION_MAX} characters, answers up to{' '}
          {ANSWER_MAX}.
        </li>
        <li>The file stays on this device. Players only see each question while it's being played.</li>
      </ul>
      <a className="btn btn-ghost-dark" href={`${import.meta.env.BASE_URL}kahoot/template.csv`} download="temu-kahoot-template.csv">
        Download a template
      </a>
    </details>
  )
}

// ---- Saved quiz sets (encrypted) ----

// Unlocked quiz sets stay in memory for this visit, so "Change quiz" doesn't
// ask for the password again. Never written to storage.
let unlocked = null

function PresetsCard({ onReady }) {
  const [quizzes, setQuizzes] = useState(unlocked)
  const [pw, setPw] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function unlock(e) {
    e.preventDefault()
    if (!pw || busy) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}kahoot/presets.enc.json`, { cache: 'no-cache' })
      if (!res.ok) throw new Error(res.status === 404 ? 'There are no saved quizzes yet.' : `Couldn't load them (HTTP ${res.status}).`)
      const payload = await unlockPresets(await res.json(), pw)
      unlocked = (payload.quizzes || []).map((q) => ({ name: cleanText(q.name).slice(0, 60), ...parseQuizCsv(q.csv) }))
      setQuizzes(unlocked)
      setPw('')
    } catch (err) {
      setError(err instanceof WrongPassword ? 'Wrong password.' : err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="card chooser-card">
      <h2>Saved quizzes 🔒</h2>
      {quizzes ? (
        <div className="preset-list">
          {quizzes.map((q, i) => (
            <button key={i} className="preset" disabled={!q.questions.length} onClick={() => onReady(q)}>
              <span className="preset-name">{q.name}</span>
              <span className="preset-count">{q.questions.length} questions</span>
            </button>
          ))}
        </div>
      ) : (
        <form className="stack" onSubmit={unlock}>
          <p className="muted">Sam&rsquo;s quiz sets. They&rsquo;re encrypted; the host password unlocks them.</p>
          <input
            type="password"
            className="text-input"
            value={pw}
            onChange={(e) => {
              setPw(e.target.value)
              setError(null)
            }}
            placeholder="Host password"
            aria-label="Host password"
            autoComplete="current-password"
          />
          <button type="submit" className="btn btn-primary" disabled={!pw || busy}>
            {busy ? 'Unlocking…' : 'Unlock'}
          </button>
          {error && <p className="form-error">{error}</p>}
        </form>
      )}
    </section>
  )
}

// ---- The game itself ----

function HostGame({ quiz, onNewQuiz }) {
  const { snapshot, status, actions } = useHostGame(quiz.questions)
  const hasPlayers = (snapshot?.players.length ?? 0) > 0

  // Closing or refreshing this tab ends the game for everyone: ask first.
  useEffect(() => {
    if (!hasPlayers) return
    const onBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [hasPlayers])

  function newQuiz() {
    if (!hasPlayers || confirm('Pick another quiz? This ends the game, and players will need to join again.')) onNewQuiz()
  }

  if (status.state === 'error') {
    return (
      <Screen center>
        <Notice title={status.error.title} detail={status.error.detail} tone="bad">
          <button className="btn btn-primary" onClick={() => location.reload()}>
            Try again
          </button>
        </Notice>
      </Screen>
    )
  }
  if (status.state !== 'ready' || !snapshot) {
    return (
      <Screen center>
        <Spinner label="Setting up the game…" />
      </Screen>
    )
  }

  switch (snapshot.phase) {
    case 'lobby':
      return <HostLobby snapshot={snapshot} code={status.code} quiz={quiz} actions={actions} onNewQuiz={newQuiz} />
    case 'question':
      return <HostQuestion snapshot={snapshot} actions={actions} />
    case 'results':
    case 'gameover':
      return <HostResults snapshot={snapshot} actions={actions} onNewQuiz={newQuiz} />
    default:
      return null
  }
}
