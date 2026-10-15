import { useEffect, useState } from 'react'
import { NAME_MAX } from '../config.js'
import { cleanName } from '../lib/text.js'
import { lastName, saveName, savedName, usePlayerConnection } from './usePlayerConnection.js'
import Screen, { Notice, Spinner } from '../components/Screen.jsx'
import Leaderboard from '../components/Leaderboard.jsx'
import PlayerQuestion from './PlayerQuestion.jsx'
import PlayerResults from './PlayerResults.jsx'

export default function PlayerPage({ code }) {
  // Already joined this game in this tab (refresh, phone lock): straight back in.
  const [joinedName, setJoinedName] = useState(() => savedName(code))
  if (!joinedName) {
    return (
      <NameForm
        code={code}
        onJoin={(name) => {
          saveName(code, name)
          setJoinedName(name)
        }}
      />
    )
  }
  return <PlayerGame code={code} name={joinedName} />
}

function NameForm({ code, onJoin }) {
  const [name, setName] = useState(lastName)
  const clean = cleanName(name)
  return (
    <Screen center>
      <h1 className="hero-title">Join game {code}</h1>
      <form
        className="card join-card"
        onSubmit={(e) => {
          e.preventDefault()
          if (clean) onJoin(clean)
        }}
      >
        <label className="label" htmlFor="player-name">
          Your name
        </label>
        <input
          id="player-name"
          className="text-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={NAME_MAX * 2}
          autoComplete="nickname"
          autoFocus
        />
        <button type="submit" className="btn btn-primary btn-block" disabled={!clean}>
          Join
        </button>
      </form>
    </Screen>
  )
}

function PlayerGame({ code, name }) {
  const { snapshot, status, error, myId, myAnswer, sendAnswer, retry } = usePlayerConnection(code, name)
  const slow = useAfter(6000, status === 'connecting')

  if (status === 'connecting' || (status === 'connected' && !snapshot)) {
    return (
      <Screen center>
        <Spinner label={`Joining game ${code}…`} />
        {slow && <p className="muted small hint">Still connecting. Some networks take a few extra seconds.</p>}
      </Screen>
    )
  }
  if (status === 'failed' || status === 'removed') {
    return (
      <Screen center>
        <Notice title={error.title} detail={error.detail} tone="bad">
          <div className="notice-actions">
            {status === 'failed' && (
              <button className="btn btn-primary" onClick={retry}>
                Try again
              </button>
            )}
            <a className="btn btn-ghost-dark" href="#/">
              Enter another code
            </a>
          </div>
        </Notice>
      </Screen>
    )
  }
  if (status === 'ended') {
    return (
      <Screen center>
        <Notice title="The host ended the game" detail="Thanks for playing!">
          {snapshot && <Leaderboard players={snapshot.players} myId={myId} limit={5} />}
        </Notice>
      </Screen>
    )
  }

  const me = snapshot.players.find((p) => p.pid === myId)

  switch (snapshot.phase) {
    case 'lobby':
      return (
        <Screen center>
          <div className="youre-in">
            <p className="big-emoji">🎉</p>
            <h1 className="hero-title">You&rsquo;re in{me ? `, ${me.name}` : ''}!</h1>
            <p className="hero-sub">Look for your name on the host&rsquo;s screen. The game starts soon.</p>
          </div>
        </Screen>
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

// true once `ms` have passed while `active` stays true.
function useAfter(ms, active) {
  const [done, setDone] = useState(false)
  useEffect(() => {
    setDone(false)
    if (!active) return
    const t = setTimeout(() => setDone(true), ms)
    return () => clearTimeout(t)
  }, [ms, active])
  return done
}
