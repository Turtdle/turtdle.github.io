import { useState } from 'react'
import { usePlayerConnection } from './usePlayerConnection.js'
import PlayerQuestion from './PlayerQuestion.jsx'
import PlayerResults from './PlayerResults.jsx'
import Leaderboard from '../components/Leaderboard.jsx'

export default function PlayerPage({ code }) {
  const [name, setName] = useState('')
  const [joinedName, setJoinedName] = useState(null)

  if (!joinedName) {
    return (
      <div className="page center">
        <h1 className="logo">Join game {code}</h1>
        <div className="card">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (name.trim()) setJoinedName(name.trim())
            }}
            className="stack"
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={20}
              autoFocus
              aria-label="Your name"
            />
            <button type="submit" className="btn primary">Join</button>
          </form>
        </div>
      </div>
    )
  }

  return <PlayerGame code={code} name={joinedName} />
}

function PlayerGame({ code, name }) {
  const { snapshot, status, myId, myAnswer, sendAnswer, retry } = usePlayerConnection(code, name)

  if (status === 'connecting') {
    return <Centered>Connecting to game {code}…</Centered>
  }
  if (status === 'failed') {
    return (
      <Centered className="error">
        <p>Couldn't connect. Check the code and make sure the host has the game open.</p>
        <button className="btn primary" onClick={retry}>Retry</button>
      </Centered>
    )
  }
  if (status === 'ended') {
    return (
      <Centered>
        <p>The host disconnected — game over!</p>
        {snapshot && (
          <div className="card">
            <h2>Last standings</h2>
            <Leaderboard players={snapshot.players} myId={myId} />
          </div>
        )}
      </Centered>
    )
  }
  if (!snapshot) {
    return <Centered>Joining…</Centered>
  }

  const me = snapshot.players.find((p) => p.id === myId)

  switch (snapshot.phase) {
    case 'lobby':
      return (
        <Centered>
          <p className="big-emoji">🎉</p>
          <p>You're in{me ? `, ${me.name}` : ''}!</p>
          <p className="muted">Waiting for the host to start…</p>
        </Centered>
      )
    case 'question':
      return (
        <PlayerQuestion
          snapshot={snapshot}
          me={me}
          myAnswer={myAnswer}
          onAnswer={(i) => sendAnswer(snapshot.questionIndex, i)}
        />
      )
    case 'results':
    case 'gameover':
      return <PlayerResults snapshot={snapshot} me={me} myId={myId} />
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
