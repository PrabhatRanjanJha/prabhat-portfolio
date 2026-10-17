import { CHAPTERS, FLIGHT } from './config.js'

const W = CHAPTERS.map((c) => c.weight)
export const TOTAL = W.reduce((a, b) => a + b, 0)
export const LAST = CHAPTERS.length - 1

// smootherstep: soft start and end, but no long flat stretch like a cubic
const ease = (x) => x * x * x * (x * (x * 6 - 15) + 10)

// Maps scroll progress p (0..1) to a position in chapter space.
//   i     chapter the camera is resting on or leaving
//   f     0..1 progress of the hop to chapter i + 1 (eased)
//   drift small sway while resting, zero at both ends so the motion is continuous
//   t     i + f, the camera's position in chapter space
export function flightAt(p) {
  let x = Math.min(Math.max(p, 0), 1) * TOTAL
  let i = 0
  while (i < LAST && x > W[i]) {
    x -= W[i]
    i++
  }
  const local = Math.min(x / W[i], 1)
  if (i === LAST) return { i, f: 0, drift: Math.sin(local * Math.PI) * 0.5, t: i }
  const dwell = 1 - FLIGHT.hop
  if (local < dwell) {
    return { i, f: 0, drift: Math.sin((local / dwell) * Math.PI) * 0.5, t: i }
  }
  const f = ease((local - dwell) / FLIGHT.hop)
  return { i, f, drift: 0, t: i + f }
}

// Scroll progress that rests in the middle of chapter i.
export function progressForChapter(i) {
  let start = 0
  for (let k = 0; k < i; k++) start += W[k]
  const span = i === LAST ? W[i] * 0.5 : W[i] * (1 - FLIGHT.hop) * 0.5
  return (start + span) / TOTAL
}
