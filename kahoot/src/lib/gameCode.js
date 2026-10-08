// No O/0, I/1/l — codes get read aloud across the living room.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

export function newGameCode(length = 4) {
  let code = ''
  for (let i = 0; i < length; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return code
}
