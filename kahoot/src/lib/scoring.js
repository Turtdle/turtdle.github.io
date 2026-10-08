import { SCORE_BASE, SCORE_FLOOR, SCORE_HALF_LIFE_S } from '../config.js'

export function scoreFor(elapsedMs) {
  const seconds = elapsedMs / 1000
  const raw = SCORE_BASE * Math.pow(0.5, seconds / SCORE_HALF_LIFE_S)
  return Math.max(SCORE_FLOOR, Math.round(raw))
}
