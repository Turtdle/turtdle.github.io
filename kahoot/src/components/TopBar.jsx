import Shape from './Shape.jsx'

// Wordmark (back to the join screen) and a way back to the main site.
export default function TopBar({ right = null }) {
  return (
    <header className="topbar">
      <a className="wordmark" href="#/">
        <span className="wordmark-shapes" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`a${i}-ink`}>
              <Shape i={i} size={14} />
            </span>
          ))}
        </span>
        Temu Kahoot
      </a>
      {right ?? (
        <a className="topbar-link" href="/">
          turtdle.github.io
        </a>
      )}
    </header>
  )
}
