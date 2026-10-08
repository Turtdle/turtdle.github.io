import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Deployed as the user site (turtdle.github.io), which serves from the
// domain root. Each page is its own entry: the homepage at /, Temu Kahoot
// at /kahoot/. public/ is copied verbatim, which is how the clan bot's
// public/coc/lovely/ ends up at /coc/lovely/ — keep publicDir and base as is.
export default defineConfig({
  plugins: [react()],
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
