// No O/0, I/1/l — codes get read aloud across the living room.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const TOKEN_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

// Uniformly random characters from the browser's CSPRNG (rejection sampling,
// so no modulo bias).
function randomString(alphabet, length) {
  const limit = 256 - (256 % alphabet.length)
  let out = ''
  while (out.length < length) {
    for (const byte of crypto.getRandomValues(new Uint8Array(length * 2))) {
      if (byte < limit && out.length < length) out += alphabet[byte % alphabet.length]
    }
  }
  return out
}

export const newGameCode = (length = 4) => randomString(ALPHABET, length)

// Player IDs shown to everyone, and the private rejoin token only that player
// and the host know.
export const newPlayerId = () => randomString(TOKEN_ALPHABET, 10)
export const newToken = () => randomString(TOKEN_ALPHABET, 32)
export const isToken = (t) => typeof t === 'string' && /^[A-Za-z0-9]{32}$/.test(t)
