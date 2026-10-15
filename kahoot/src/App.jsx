import { useEffect, useState } from 'react'
import HostPage from './host/HostPage.jsx'
import PlayerPage from './player/PlayerPage.jsx'
import Screen from './components/Screen.jsx'

// Hash routing (#/, #/host, #/play/CODE) — the fragment never reaches the
// server, so GitHub Pages needs no SPA rewrite tricks.
function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

export function navigate(path) {
  window.location.hash = path
}

const cleanCode = (s) => s.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)

function Home() {
  const [code, setCode] = useState('')

  function join(e) {
    e.preventDefault()
    if (code) navigate('/play/' + code)
  }

  return (
    <Screen center>
      <h1 className="hero-title">Join a game</h1>
      <form className="card join-card" onSubmit={join}>
        <label className="label" htmlFor="game-code">
          Game code
        </label>
        <input
          id="game-code"
          className="code-input"
          value={code}
          onChange={(e) => setCode(cleanCode(e.target.value))}
          placeholder="ABCD"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          autoFocus
        />
        <button type="submit" className="btn btn-primary btn-block" disabled={!code}>
          Join
        </button>
      </form>
      <div className="host-cta">
        <p>Want to run your own quiz?</p>
        <a className="btn btn-light" href="#/host">
          Host a game
        </a>
      </div>
    </Screen>
  )
}

export default function App() {
  const hash = useHashRoute()
  const path = hash.replace(/^#/, '')

  if (path.startsWith('/host')) return <HostPage />

  const playMatch = path.match(/^\/play\/([A-Za-z0-9]{1,8})/)
  if (playMatch) return <PlayerPage key={playMatch[1]} code={playMatch[1].toUpperCase()} />

  return <Home />
}
