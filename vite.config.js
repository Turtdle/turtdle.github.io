import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Content Security Policy for Temu Kahoot: our own scripts only, Google Fonts,
// and the PeerJS signalling server (WebRTC itself isn't covered by CSP).
// Added at build time only; the dev server needs inline scripts for HMR.
const KAHOOT_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  'font-src https://fonts.gstatic.com',
  "img-src 'self' data:",
  "connect-src 'self' https://0.peerjs.com wss://0.peerjs.com",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "frame-src 'none'",
].join('; ')

function kahootCsp() {
  return {
    name: 'kahoot-csp',
    apply: 'build',
    transformIndexHtml(html, ctx) {
      if (!ctx.filename.replace(/\\/g, '/').endsWith('/kahoot/index.html')) return html
      return html.replace(
        '<meta charset="UTF-8" />',
        `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${KAHOOT_CSP}" />`
      )
    },
  }
}

// Deployed as the user site (turtdle.github.io), which serves from the
// domain root. Each page is its own entry: the homepage at /, Temu Kahoot
// at /kahoot/. public/ is copied verbatim.
export default defineConfig({
  plugins: [react(), kahootCsp()],
  base: '/',
  build: {
    rollupOptions: {
      input: {
        home: fileURLToPath(new URL('./index.html', import.meta.url)),
        kahoot: fileURLToPath(new URL('./kahoot/index.html', import.meta.url)),
      },
    },
  },
})
