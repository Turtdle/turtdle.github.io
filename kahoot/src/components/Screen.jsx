import TopBar from './TopBar.jsx'

// Page frame: top bar plus a centred column. wide = room for the host's
// big-screen layouts; center = vertically centred (status screens).
export default function Screen({ children, wide = false, center = false }) {
  return (
    <div className="screen">
      <TopBar />
      <main className={`page${wide ? ' wide' : ''}${center ? ' center' : ''}`}>{children}</main>
    </div>
  )
}

// A status card: what happened and, if it helps, what to do about it.
export function Notice({ title, detail = null, tone = '', children = null }) {
  return (
    <div className={`card notice ${tone}`}>
      <h2>{title}</h2>
      {detail && <p className="muted">{detail}</p>}
      {children}
    </div>
  )
}

export function Spinner({ label }) {
  return (
    <div className="spinner-wrap" role="status">
      <span className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  )
}
