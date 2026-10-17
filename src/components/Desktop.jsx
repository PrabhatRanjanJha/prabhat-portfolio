import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import Lenis from 'lenis'
import { World } from '../scene/World.js'
import { flightAt, TOTAL } from '../scene/flight.js'
import { CHAPTERS, FLIGHT } from '../scene/config.js'
import { jumpToChapter, setLenis } from '../scroll.js'
import { PANELS } from './Panels.jsx'

const clamp01 = (x) => Math.min(1, Math.max(0, x))
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

export default function Desktop({ onOpenProject }) {
  const rootRef = useRef(null)
  const canvasRef = useRef(null)
  const panelRefs = useRef([])
  const markRef = useRef(null)
  const fillRef = useRef(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const world = new World(canvasRef.current)
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true })
    setLenis(lenis)
    gsap.ticker.lagSmoothing(0)

    world.onActive = (i) => setActive(i)

    const onMove = (e) => {
      world.setPointer((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1))
    }
    const onResize = () => world.resize()
    window.addEventListener('pointermove', onMove)
    window.addEventListener('resize', onResize)

    // Node labels are drawn on canvas, so redraw once the fonts have loaded.
    if (document.fonts && document.fonts.load) {
      Promise.all([
        document.fonts.load('600 74px "Cinzel"'),
        document.fonts.load('66px "Yatra One"'),
        document.fonts.load('500 34px "DM Mono"'),
      ])
        .then(() => world.refreshLabels())
        .catch(() => {})
    }

    // The one orchestrated moment: the camera settles in and the name rises.
    const ctx = gsap.context(() => {
      gsap.to(world.introState, { v: 1, duration: 2.8, ease: 'power2.out' })
      gsap.fromTo('.hero-char', { yPercent: 115 }, { yPercent: 0, duration: 1.2, stagger: 0.06, ease: 'power4.out', delay: 0.35 })
      gsap.fromTo('.hero-rise', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power2.out', delay: 1.0 })
      gsap.fromTo('.hint', { opacity: 0 }, { opacity: 1, duration: 0.8, delay: 2.0 })
    }, rootRef)

    let p = 0
    const tick = (time, dtMs) => {
      lenis.raf(time * 1000)
      const dt = Math.max(dtMs, 1)
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const target = clamp01(lenis.scroll / max)
      p = target // Lenis already smooths the scroll; a second filter made hops feel stuck

      const fl = flightAt(p)
      world.setFlight(fl)
      world.update(time, Math.min(dt / 1000, 0.05))

      // Chapter text follows the camera: fades out as it leaves, drifts with the pan.
      panelRefs.current.forEach((el, i) => {
        if (!el) return
        const op = 1 - smooth(0.08, 0.36, Math.abs(fl.t - i))
        el.style.opacity = op.toFixed(3)
        el.style.visibility = op < 0.01 ? 'hidden' : 'visible'
        el.style.pointerEvents = op > 0.6 ? 'auto' : 'none'
        el.inert = op < 0.5
        el.style.transform = `translate3d(${((i - fl.t) * 36).toFixed(1)}px,0,0)`
      })
      if (markRef.current) markRef.current.style.opacity = smooth(0.55, 1.1, fl.t).toFixed(3)
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${p.toFixed(4)})`
    }
    gsap.ticker.add(tick)

    return () => {
      gsap.ticker.remove(tick)
      ctx.revert()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', onResize)
      lenis.destroy()
      setLenis(null)
      world.dispose()
    }
  }, [])

  return (
    <div ref={rootRef} className="desktop">
      <canvas ref={canvasRef} className="stage" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />

      <button ref={markRef} type="button" className="mark" onClick={() => jumpToChapter(0)} aria-label="Back to the start">
        Prabhat
      </button>

      <nav className="rail" aria-label="Chapters">
        <span className="rail-line" aria-hidden="true">
          <span ref={fillRef} className="rail-fill" />
        </span>
        {CHAPTERS.map((c, i) => (
          <button
            key={c.id}
            type="button"
            className={`rail-dot${i === active ? ' is-active' : ''}`}
            onClick={() => jumpToChapter(i)}
            aria-label={c.title}
            aria-current={i === active ? 'true' : undefined}
          >
            <span className="rail-label">{c.title}</span>
          </button>
        ))}
      </nav>

      {CHAPTERS.map((c, i) => {
        const Panel = PANELS[c.id]
        return (
          <section
            key={c.id}
            id={`chapter-${c.id}`}
            ref={(el) => (panelRefs.current[i] = el)}
            className={`panel panel-${c.side === 1 ? 'left' : 'right'} panel-${c.id}`}
            aria-label={c.title}
          >
            <Panel onOpenProject={onOpenProject} />
          </section>
        )
      })}

      <div className="spacer" style={{ height: `${TOTAL * FLIGHT.vhPerWeight + 100}vh` }} />
    </div>
  )
}
