import { useMemo } from 'react'
import { encode } from 'uqr'

// The join link as a QR code, drawn as one SVG path (no images, no canvas).
export default function QrCode({ text, size = 180 }) {
  const { path, n } = useMemo(() => {
    const { data, size: n } = encode(text, { ecc: 'M', border: 2 })
    let path = ''
    data.forEach((row, y) =>
      row.forEach((dark, x) => {
        if (dark) path += `M${x} ${y}h1v1h-1z`
      })
    )
    return { path, n }
  }, [text])
  return (
    <svg
      className="qr"
      viewBox={`0 0 ${n} ${n}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      role="img"
      aria-label="QR code with the join link"
    >
      <rect width={n} height={n} fill="#fff" />
      <path d={path} fill="#1b1033" />
    </svg>
  )
}
