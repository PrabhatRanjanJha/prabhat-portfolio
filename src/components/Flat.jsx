import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CHAPTERS } from '../scene/config.js'
import { PANELS } from './Panels.jsx'

// Used on phones, with reduced motion, or when WebGL is unavailable.
// Same workflow idea, as a plain vertical page: a wire runs down the side and
// each section lights up as you reach it.
export default function Flat({ onOpenProject }) {
  const rootRef = useRef(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      const nodes = gsap.utils.toArray('.flat-node')
      if (reduced) {
        nodes.forEach((el) => el.classList.add('is-lit'))
        gsap.set('.flat-fill', { scaleY: 1 })
        return
      }
      gsap.fromTo(
        '.flat-fill',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.flat-flow', start: 'top 70%', end: 'bottom 85%', scrub: true },
        },
      )
      nodes.forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 70%',
          end: 'max',
          toggleClass: { targets: el, className: 'is-lit' },
        })
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={rootRef} className="flat">
      <div className="flat-flow">
        <span className="flat-wire" aria-hidden="true">
          <span className="flat-fill" />
        </span>
        {CHAPTERS.map((c) => {
          const Panel = PANELS[c.id]
          return (
            <section key={c.id} id={`chapter-${c.id}`} className={`flat-node flat-${c.id}`} aria-label={c.title}>
              <Panel onOpenProject={onOpenProject} />
            </section>
          )
        })}
      </div>
    </div>
  )
}
