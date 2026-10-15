import { NAME_MAX } from '../config.js'

// Bidi overrides and isolates (which can flip how a leaderboard reads),
// zero-width space, and the line/paragraph separators. Built from code
// points so the source stays free of invisible characters.
const INVISIBLE = String.fromCodePoint(
  0x202a, 0x202b, 0x202c, 0x202d, 0x202e, 0x2066, 0x2067, 0x2068, 0x2069, 0x200b, 0x2028, 0x2029
)
const STRIP = new RegExp(`[\\p{Cc}${INVISIBLE}]`, 'gu')

// Text from strangers (player names, uploaded quizzes): normalise it, drop
// control characters and the invisible ones above, and collapse whitespace.
// React escapes everything it renders, so this is about display tricks, not
// script injection.
export function cleanText(raw) {
  return String(raw ?? '')
    .normalize('NFKC')
    .replace(STRIP, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// A player name: clean, no formatting characters, at most NAME_MAX
// characters. '' when nothing usable is left.
export function cleanName(raw) {
  return Array.from(cleanText(raw).replace(/\p{Cf}/gu, '')).slice(0, NAME_MAX).join('').trim()
}
