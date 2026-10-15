// The preset quizzes ship encrypted (public/kahoot/presets.enc.json), so the
// host password actually protects them: a static site can't hide a plain file,
// and a password check in JavaScript can be read and skipped. The key comes
// from the password via PBKDF2-SHA256; the data is AES-256-GCM, so a wrong
// password simply fails to decrypt. Shared by the browser (unlock) and
// scripts/presets.mjs (lock), both using Web Crypto.
const ITERATIONS = 600_000

function toBase64(bytes) {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s)
}
const fromBase64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))

async function deriveKey(password, salt, iterations) {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password.normalize('NFKC')),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

// payload: { quizzes: [{ name, csv }] }
export async function lockPresets(payload, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(password, salt, ITERATIONS)
  const plain = new TextEncoder().encode(JSON.stringify(payload))
  const data = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain))
  return { v: 1, kdf: 'PBKDF2-SHA256', iterations: ITERATIONS, salt: toBase64(salt), iv: toBase64(iv), data: toBase64(data) }
}

export class WrongPassword extends Error {}

export async function unlockPresets(blob, password) {
  if (blob?.v !== 1 || !Number.isInteger(blob.iterations)) throw new Error('Unknown presets file format')
  const key = await deriveKey(password, fromBase64(blob.salt), blob.iterations)
  let plain
  try {
    plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(blob.iv) }, key, fromBase64(blob.data))
  } catch {
    throw new WrongPassword('Wrong password')
  }
  return JSON.parse(new TextDecoder().decode(plain))
}
