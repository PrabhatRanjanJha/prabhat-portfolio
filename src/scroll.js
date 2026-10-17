// Tiny shared handle so any component can pause smooth scrolling (for example
// while a project panel is open) or jump to a chapter.

import { CHAPTERS } from './scene/config.js'
import { progressForChapter } from './scene/flight.js'

let lenis = null

export const setLenis = (instance) => {
  lenis = instance
}

export function lockScroll(locked) {
  document.documentElement.classList.toggle('modal-open', locked)
  if (!lenis) return
  if (locked) lenis.stop()
  else lenis.start()
}

// Desktop: scrolls to the resting point of a chapter. Flat layout: scrolls to its section.
export function jumpToChapter(i) {
  if (lenis) {
    const max = document.documentElement.scrollHeight - window.innerHeight
    lenis.scrollTo(progressForChapter(i) * max, { duration: 1.8 })
    return
  }
  const el = document.getElementById(`chapter-${CHAPTERS[i].id}`)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
