import { useEffect, useRef, useState } from 'react'
import '../sound.css'

const BASE = import.meta.env.BASE_URL || '/'
const VOLUME = 0.65 // audible while staying in the background
const FADE_MS = 1600
const KEY = 'sound'

// Background music with a mute button. Browsers do not allow sound to start by itself,
// so it is off until the visitor turns it on. If they turned it on last time, it
// starts again on their first click or key press.
export default function SoundToggle() {
  const audio = useRef(null)
  const fade = useRef(0)
  const [on, setOn] = useState(false)
  const wants = useRef(false)

  const getAudio = () => {
    if (!audio.current) {
      const a = new Audio(`${BASE}music.mp3`)
      a.loop = true
      a.preload = 'none'
      a.volume = 0
      audio.current = a
    }
    return audio.current
  }

  const rampTo = (target, done) => {
    const a = getAudio()
    cancelAnimationFrame(fade.current)
    const from = a.volume
    const t0 = performance.now()
    const step = (now) => {
      const k = Math.min((now - t0) / FADE_MS, 1)
      a.volume = Math.max(0, Math.min(1, from + (target - from) * k))
      if (k < 1) fade.current = requestAnimationFrame(step)
      else if (done) done()
    }
    fade.current = requestAnimationFrame(step)
  }

  const start = () => {
    const a = getAudio()
    wants.current = true
    const p = a.play()
    if (p && p.catch) {
      p.catch(() => {
        wants.current = false
        setOn(false)
      })
    }
    rampTo(VOLUME)
    setOn(true)
    try {
      localStorage.setItem(KEY, 'on')
    } catch {}
  }

  const stop = () => {
    wants.current = false
    setOn(false)
    rampTo(0, () => audio.current && audio.current.pause())
    try {
      localStorage.setItem(KEY, 'off')
    } catch {}
  }

  // Came back and had sound on last time: start on the first real gesture.
  useEffect(() => {
    let saved = null
    try {
      saved = localStorage.getItem(KEY)
    } catch {}
    if (saved !== 'on') return
    const events = ['pointerdown', 'keydown', 'touchend']
    const go = () => {
      events.forEach((e) => window.removeEventListener(e, go))
      start()
    }
    events.forEach((e) => window.addEventListener(e, go, { once: true }))
    return () => events.forEach((e) => window.removeEventListener(e, go))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Pause while the tab is hidden.
  useEffect(() => {
    const onVis = () => {
      const a = audio.current
      if (!a || !wants.current) return
      if (document.hidden) a.pause()
      else a.play().catch(() => {})
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  useEffect(
    () => () => {
      cancelAnimationFrame(fade.current)
      if (audio.current) audio.current.pause()
    },
    [],
  )

  return (
    <button
      type="button"
      className={`sound-btn${on ? ' is-on' : ''}`}
      onClick={on ? stop : start}
      aria-pressed={on}
      aria-label={on ? 'Turn background music off' : 'Turn background music on'}
    >
      <span className="sound-ico" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" fill="currentColor" stroke="none" />
          {on ? (
            <>
              <path d="M15.5 9a4 4 0 0 1 0 6" />
              <path d="M18 6.5a8 8 0 0 1 0 11" />
            </>
          ) : (
            <path d="M16 9.5l5 5M21 9.5l-5 5" />
          )}
        </svg>
      </span>
      <span className="sound-label">{on ? 'Sound on' : 'Sound off'}</span>
      <span className="sound-bars" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    </button>
  )
}