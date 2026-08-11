import { useEffect, useState } from 'react'
import HostPage from './host/HostPage.jsx'
import PlayerPage from './player/PlayerPage.jsx'

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

function Home() {
  const [code, setCode] = useState('')

  function join(e) {
    e.preventDefault()
    const clean = code.trim().toUpperCase()
    if (clean) navigate('/play/' + clean)
  }

  return (
    <div className="page center">
      <h1 className="logo">Family Quiz!</h1>
      <div className="card">
        <h2>Join a game</h2>
        <form onSubmit={join} className="stack">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Game code"
            maxLength={8}
            autoFocus
            aria-label="Game code"
          />
          <button type="submit" className="btn primary">Join</button>
        </form>
      </div>
      <a className="subtle-link" href="#/host">Host a game</a>
    </div>
  )
}

export default function App() {
  const hash = useHashRoute()
  const path = hash.replace(/^#/, '')

  if (path.startsWith('/host')) return <HostPage />

  const playMatch = path.match(/^\/play\/([A-Za-z0-9]+)/)
  if (playMatch) return <PlayerPage code={playMatch[1].toUpperCase()} />

  return <Home />
}
