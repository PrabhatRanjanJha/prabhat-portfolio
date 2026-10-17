import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { resume } from '../data/resume.js'
import { lockScroll } from '../scroll.js'
import '../manuscript.css'


// Ragged, torn side edges: a polygon with a slightly different bite on every step.
// Seeded, so the tear is the same every time the scroll opens.
function tornEdges() {
  let a = 20261017
  const rand = () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const N = 64
  const left = []
  const right = []
  for (let i = 0; i <= N; i++) {
    const y = ((i / N) * 100).toFixed(2)
    const bite = (r) => (r > 0.93 ? 11 + r * 8 : 1 + r * 6).toFixed(1)
    left.push(`${bite(rand())}px ${y}%`)
    right.push(`calc(100% - ${bite(rand())}px) ${y}%`)
  }
  return `polygon(${left.join(',')},${right.reverse().join(',')})`
}

// The résumé on an old manuscript that unrolls in front of the page.
// Opens when the Résumé button is pressed; Esc, the Close button or a click outside rolls it back up.
export default function Manuscript({ pdf, onClose }) {
  const [open, setOpen] = useState(false)
  const closing = useRef(false)
  const closeBtn = useRef(null)
  const paper = useRef(null)
  const tear = useMemo(tornEdges, [])
  const sheet = useRef(null)
  const overlay = useRef(null)

  const close = () => {
    if (closing.current) return
    closing.current = true
    const el = paper.current
    if (el) {
      el.style.height = `${el.offsetHeight}px` // from 'auto' to a number, so it can animate
      void el.offsetHeight
      el.style.height = '0px'
    }
    setOpen(false)
    setTimeout(onClose, 900)
  }

  useEffect(() => {
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const target = Math.min(sheet.current ? sheet.current.scrollHeight : 600, window.innerHeight - 230)
        if (paper.current) paper.current.style.height = `${target}px`
        setOpen(true)
      }),
    )
    const onKey = (e) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    // Freeze the page behind the scroll (smooth scroll paused, page overflow hidden) so only the
    // résumé moves, and focus it so the arrow keys and Page Down scroll it.
    lockScroll(true)
    sheet.current?.focus({ preventScroll: true })
    // Wheel or touch outside the résumé itself must not move anything.
    const el = overlay.current
    const block = (e) => {
      if (!sheet.current || !sheet.current.contains(e.target)) e.preventDefault()
    }
    el?.addEventListener('wheel', block, { passive: false })
    el?.addEventListener('touchmove', block, { passive: false })
    return () => {
      lockScroll(false)
      el?.removeEventListener('wheel', block)
      el?.removeEventListener('touchmove', block)
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const r = resume
  return createPortal(
    <div
      ref={overlay}
      className={`ms-overlay${open ? ' is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Résumé"
      data-lenis-prevent
      onClick={close}
    >
      <div className="ms" onClick={(e) => e.stopPropagation()}>
        <div className="ms-roller" />
        <div
          className="ms-paper"
          ref={paper}
          style={{ clipPath: tear }}
          onTransitionEnd={(e) => {
            if (e.propertyName === 'height' && !closing.current && paper.current) paper.current.style.height = 'auto'
          }}
        >
          <div className="ms-clip">
            <div className="ms-sheet" ref={sheet} tabIndex={0}>
              <header className="ms-head">
                <h2>{r.name}</h2>
                <p>
                  {r.place} · <a href={`mailto:${r.email}`}>{r.email}</a>
                </p>
                <p>
                  {r.links.map((l, i) => (
                    <span key={l.href}>
                      {i > 0 && ' · '}
                      <a href={l.href} target="_blank" rel="noreferrer">
                        {l.label}
                      </a>
                    </span>
                  ))}
                </p>
              </header>

              <h3>Education</h3>
              {r.education.map((e) => (
                <div className="ms-row" key={e.what}>
                  <span>
                    <b>{e.what}</b> — {e.detail}
                  </span>
                  <i>{e.when}</i>
                </div>
              ))}

              <h3>Experience</h3>
              {r.experience.map((x) => (
                <div key={x.what}>
                  <div className="ms-row">
                    <span>
                      <b>{x.what}</b> — {x.where}
                    </span>
                    <i>{x.when}</i>
                  </div>
                  <ul>
                    {x.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              ))}

              <h3>Projects</h3>
              {r.projects.map((p) => (
                <div key={p.what}>
                  <div className="ms-row">
                    <span>
                      <b>{p.what}</b> — {p.tag}
                    </span>
                    <i>{p.stack}</i>
                  </div>
                  <ul>
                    {p.points.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              ))}

              <h3>Other projects</h3>
              <ul>
                {r.other.map((o) => (
                  <li key={o.what}>
                    <b>{o.what}</b> ({o.stack}) — {o.text}
                  </li>
                ))}
              </ul>

              <h3>Technical skills</h3>
              {r.skills.map((s) => (
                <p className="ms-skill" key={s.label}>
                  <b>{s.label}:</b> {s.text}
                </p>
              ))}

              <h3>Achievements &amp; activities</h3>
              <ul>
                {r.achievements.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="ms-roller" />
      </div>

      <div className="ms-actions" onClick={(e) => e.stopPropagation()}>
        {pdf && (
          <a className="btn" href={pdf} download="Prabhat_Ranjan_Jha_Resume.pdf">
            Download PDF
          </a>
        )}
        <button className="btn" type="button" ref={closeBtn} onClick={close}>
          Close
        </button>
      </div>
    </div>,
    document.body,
  )
}