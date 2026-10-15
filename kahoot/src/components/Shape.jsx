// Kahoot's answer shapes, in answer order: triangle, diamond, circle, square.
// Each answer has a shape as well as a colour, so it's never colour alone.
const PATHS = [
  'M12 3 22 20H2Z',
  'M12 2 22 12 12 22 2 12Z',
  'M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20Z',
  'M3 3h18v18H3Z',
]
export const SHAPE_NAMES = ['triangle', 'diamond', 'circle', 'square']

export default function Shape({ i, size = 22 }) {
  return (
    <svg className="shape" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d={PATHS[i]} fill="currentColor" />
    </svg>
  )
}
