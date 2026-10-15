// Namespaces our peer IDs on the shared free PeerJS cloud so game codes
// can't collide with other apps' peers. Bump PROTOCOL when host and player
// messages change shape, so a stale tab gets "refresh the page" instead of
// silently misbehaving.
export const PEER_PREFIX = 'kahoot-local-'
export const PROTOCOL = 2

// How phones reach the host's browser. STUN finds a direct path; when the
// network blocks one (mobile data, some routers when everyone is on the same
// Wi-Fi, privacy settings that hide local IPs), TURN relays the traffic
// through coturn on Sam's Lightsail box (see the README). Browsers need the
// relay login, so it ships in the page; coturn's limits (32 KB/s per session,
// 100 sessions, no relaying into private networks) are what protect it.
// The build reads it from VITE_TURN_CREDENTIAL: .env.local locally, a
// repository secret in the deploy workflow. (The ?. keeps this file
// importable from Node, for scripts/presets.mjs.)
const TURN_HOST = '184.32.58.214'
const TURN_CREDENTIAL = import.meta.env?.VITE_TURN_CREDENTIAL
export const ICE_SERVERS = [
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun.cloudflare.com:3478'] },
  ...(TURN_CREDENTIAL
    ? [
        {
          urls: [`turn:${TURN_HOST}:3478?transport=udp`, `turn:${TURN_HOST}:3478?transport=tcp`],
          username: 'kahoot',
          credential: TURN_CREDENTIAL,
        },
      ]
    : []),
]

// Scoring: BASE points for an instant answer, halving every HALF_LIFE_S
// seconds, never below FLOOR. Wrong answers always score 0.
export const SCORE_BASE = 1000
export const SCORE_FLOOR = 100
export const SCORE_HALF_LIFE_S = 30

// How long a player waits for the host before giving up. Relayed
// connections on slow mobile networks can take a while to come up.
export const CONNECT_TIMEOUT_MS = 20000

// Limits that keep a public game (and a hostile player) in check.
export const MAX_PLAYERS = 60
export const NAME_MAX = 20
export const HELLO_TIMEOUT_MS = 10000 // a connection must say who it is by then
export const MSG_BURST = 20 // per-connection rate limit: burst size...
export const MSG_PER_SEC = 5 // ...refilled at this rate

// Uploaded and preset quizzes.
export const QUIZ_MAX_BYTES = 256 * 1024
export const QUIZ_MAX_QUESTIONS = 200
export const QUESTION_MAX = 280
export const ANSWER_MAX = 200 // two-truths-and-a-lie answers are whole sentences
export const MIN_ANSWERS = 2
export const MAX_ANSWERS = 4
