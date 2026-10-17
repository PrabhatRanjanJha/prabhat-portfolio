import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react'
import Desktop from './components/Desktop.jsx'
import Flat from './components/Flat.jsx'
import Palette from './components/Palette.jsx'
import { CHAPTERS } from './scene/config.js'
import { webglAvailable } from './scene/World.js'
import { jumpToChapter } from './scroll.js'
import { profile, projects } from './data/content.js'

// The project panel pulls in the node-graph library, so load it on demand.
const ProjectDetail = lazy(() => import('./components/ProjectDetail.jsx'))

function useLayoutMode() {
  const decide = () => {
    const small = window.matchMedia('(max-width: 820px)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return small || reduced || !webglAvailable() ? 'flat' : 'desktop'
  }
  const [mode, setMode] = useState(decide)
  useEffect(() => {
    const queries = [window.matchMedia('(max-width: 820px)'), window.matchMedia('(prefers-reduced-motion: reduce)')]
    const onChange = () => setMode(decide())
    queries.forEach((q) => q.addEventListener('change', onChange))
    return () => queries.forEach((q) => q.removeEventListener('change', onChange))
  }, [])
  return mode
}

export default function App() {
  const mode = useLayoutMode()
  const [projectId, setProjectId] = useState(null)
  const [paletteOpen, setPaletteOpen] = useState(false)

  const closeProject = useCallback(() => setProjectId(null), [])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const items = useMemo(
    () => [
      ...CHAPTERS.map((c, i) => ({ label: `Go to ${c.title}`, hint: 'Section', run: () => jumpToChapter(i) })),
      ...projects.map((p) => ({ label: `Open ${p.name}`, hint: 'Project', run: () => setProjectId(p.id) })),
      { label: 'Open GitHub', hint: 'Link', run: () => window.open(profile.github, '_blank', 'noopener') },
      { label: 'Open LinkedIn', hint: 'Link', run: () => window.open(profile.linkedin, '_blank', 'noopener') },
      { label: 'Send an email', hint: 'Link', run: () => (window.location.href = `mailto:${profile.email}`) },
    ],
    [],
  )

  return (
    <>
      <a className="skip" href="#chapter-contact">
        Skip to contact
      </a>
      {mode === 'desktop' ? <Desktop onOpenProject={setProjectId} /> : <Flat onOpenProject={setProjectId} />}

      <button type="button" className="jump-btn" onClick={() => setPaletteOpen(true)}>
        Jump to <kbd>Ctrl K</kbd>
      </button>
      <Palette open={paletteOpen} onClose={() => setPaletteOpen(false)} items={items} />

      {projectId && (
        <Suspense fallback={null}>
          <ProjectDetail projectId={projectId} onClose={closeProject} />
        </Suspense>
      )}
    </>
  )
}
