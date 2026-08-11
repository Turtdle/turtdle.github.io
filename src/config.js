// Gate for the Host screen. NOT security — anything in a static bundle is
// visible to whoever looks. It only stops guests wandering into #/host.
export const HOST_PASSWORD = 'letmein'

// Namespaces our peer IDs on the shared free PeerJS cloud so game codes
// can't collide with other apps' peers.
export const PEER_PREFIX = 'kahoot-local-'

// Scoring: BASE points for an instant answer, halving every HALF_LIFE_S
// seconds, never below FLOOR. Wrong answers always score 0.
export const SCORE_BASE = 1000
export const SCORE_FLOOR = 100
export const SCORE_HALF_LIFE_S = 30

// How long a player waits for the host before giving up.
export const CONNECT_TIMEOUT_MS = 10000
