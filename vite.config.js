import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Deployed as the user site (turtdle.github.io), which serves from the
// domain root. If this ever moves to a project repo, set base to
// '/<repo-name>/' (case-sensitive).
export default defineConfig({
  plugins: [react()],
  base: '/',
})
