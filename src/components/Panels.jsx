import { useEffect, useState } from 'react'
import { about, contact, profile, projects, services, skills } from '../data/content.js'
import { CHAPTERS } from '../scene/config.js'
import Manuscript from './Manuscript.jsx'
import { jumpToChapter } from '../scroll.js'

// Small Sanskrit label above each chapter heading, e.g. परिचय · Parichay.
function Sk({ id }) {
  const c = CHAPTERS.find((x) => x.id === id)
  return (
    <p className="sk">
      <span lang="hi">{c.sanskrit}</span>
      <i aria-hidden="true">·</i>
      <span>{c.roman}</span>
    </p>
  )
}

// Shows the résumé button only if public/resume.pdf actually exists.
function useResume() {
  const [url, setUrl] = useState(null)
  useEffect(() => {
    let dead = false
    const href = `${import.meta.env.BASE_URL}resume.pdf`
    fetch(href, { method: 'HEAD' })
      .then((r) => {
        const type = r.headers.get('content-type') || ''
        if (!dead && r.ok && type.includes('pdf')) setUrl(href)
      })
      .catch(() => {})
    return () => {
      dead = true
    }
  }, [])
  return url
}

export function HeroPanel() {
  return (
    <div className="hero">
      <p className="hero-eyebrow hero-rise">
        <span className="dot" aria-hidden="true" />
        Web Dev TA at Scaler · Open for freelance work
      </p>
      <h1 className="hero-name" aria-label={profile.fullName}>
        {['Prabhat', 'Ranjan Jha'].map((word, wi) => (
          <span className="name-line" key={wi} aria-hidden="true">
                        {[...word].map((ch, i) =>
              ch === ' ' ? (
                <span className="name-gap" key={i} />
              ) : (
                <span className="char-wrap" key={i}>
                  <span className="hero-char">{ch}</span>
                </span>
              ),
            )}
          </span>
        ))}
      </h1>
      <p className="hero-deva hero-rise" lang="hi" aria-hidden="true">
        प्रभात <span>· the dawn</span>
      </p>
      <p className="hero-sub hero-rise">
        I build automations, AI workflows and web apps, and I like making them feel good to use.
      </p>
      <ul className="hero-tags hero-rise">
        <li>n8n automation</li>
        <li>AI agents &amp; RAG</li>
        <li>MERN stack</li>
      </ul>
      <div className="hero-actions hero-rise">
        <button type="button" className="btn btn-primary" onClick={() => jumpToChapter(3)}>
          See my work
        </button>
        <button type="button" className="btn" onClick={() => jumpToChapter(5)}>
          Say hello
        </button>
      </div>
      <p className="hint">Scroll to run the workflow</p>
    </div>
  )
}

export function AboutPanel() {
  return (
    <div>
      <Sk id="about" />
      <h2>{about.title}</h2>
      <p className="about-tag">{profile.tagline.join(' ')}</p>
      {about.paragraphs.map((p) => (
        <p key={p}>{p}</p>
      ))}
      <dl className="facts">
        {about.facts.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export function SkillsPanel() {
  return (
    <div>
      <Sk id="skills" />
      <h2>{skills.title}</h2>
      <div className="skill-groups">
        {skills.groups.map((g) => (
          <div key={g.name} className="skill-group">
            <h3>{g.name}</h3>
            <ul className="chips">
              {g.items.map((s) => (
                <li key={s} className="chip">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProjectsPanel({ onOpenProject }) {
  return (
    <div>
      <Sk id="projects" />
      <h2>Projects</h2>
      <div className="proj-list">
        {projects.map((p) => (
          <button key={p.id} type="button" className="proj-row" onClick={() => onOpenProject(p.id)} aria-label={`Open ${p.name}`}>
            <span className="proj-head">
              <span className="proj-name">{p.name}</span>
              {p.status && <span className="tag">{p.status}</span>}
            </span>
            <span className="proj-line">{p.line}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function ServicesPanel() {
  return (
    <div>
      <Sk id="services" />
      <h2>{services.title}</h2>
      <p>{services.intro}</p>
      <ul className="svc-list">
        {services.items.map((s) => (
          <li key={s.name}>
            <h3>{s.name}</h3>
            <p>{s.text}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ContactPanel() {
  const resume = useResume()
  const [showResume, setShowResume] = useState(false)
  return (
    <div>
      <Sk id="contact" />
      <h2>{contact.title}</h2>
      <p>{contact.text}</p>
      <a className="mail" href={`mailto:${profile.email}`}>
        {profile.email}
      </a>
      <div className="btn-row">
        <a className="btn" href={profile.github} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a className="btn" href={profile.linkedin} target="_blank" rel="noreferrer">
          LinkedIn
        </a>
        {resume && (
          <button className="btn" type="button" onClick={() => setShowResume(true)}>
            Résumé
          </button>
        )}
      </div>
      {showResume && <Manuscript pdf={resume} onClose={() => setShowResume(false)} />}
    </div>
  )
}

export const PANELS = {
  hero: HeroPanel,
  about: AboutPanel,
  skills: SkillsPanel,
  projects: ProjectsPanel,
  services: ServicesPanel,
  contact: ContactPanel,
}
