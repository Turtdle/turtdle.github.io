const SHAPES = ['▲', '◆', '●']

// Kahoot-style answer distribution: one bar per answer in that answer's
// color, count labeled above in plain ink, shape below so identity is never
// color-alone. Bars anchor to the baseline; wrong answers are dimmed.
export default function AnswerBars({ counts, correctIndex }) {
  const max = Math.max(...counts, 1)
  return (
    <div className="answer-bars">
      {counts.map((count, i) => (
        <div key={i} className="bar-col">
          <span className="bar-count">{count}</span>
          <div className="bar-track">
            <div
              className={`bar a${i} ${i === correctIndex ? '' : 'bar-dim'}`}
              style={{ height: `${Math.max((count / max) * 100, 4)}%` }}
            />
          </div>
          <span className="bar-shape">{SHAPES[i]}</span>
        </div>
      ))}
    </div>
  )
}
