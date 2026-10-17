import { useEffect, useMemo, useRef, useState } from 'react'

// Ctrl+K (or Cmd+K) jump menu. items: [{ label, hint, run }]
export default function Palette({ open, onClose, items }) {
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const inputRef = useRef(null)

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? items.filter((it) => it.label.toLowerCase().includes(q)) : items
  }, [items, query])

  useEffect(() => {
    if (open) {
      setQuery('')
      setIndex(0)
      const id = requestAnimationFrame(() => inputRef.current && inputRef.current.focus())
      return () => cancelAnimationFrame(id)
    }
  }, [open])

  useEffect(() => {
    setIndex(0)
  }, [query])

  if (!open) return null

  const run = (item) => {
    onClose()
    if (item) item.run()
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIndex((i) => Math.min(i + 1, shown.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      run(shown[index])
    }
  }

  return (
    <div className="palette-backdrop" onClick={onClose}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Jump to" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="palette-input"
          placeholder="Jump to a section or project"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          aria-label="Search"
        />
        <ul className="palette-list" role="listbox">
          {shown.length === 0 && <li className="palette-empty">Nothing matches that. Try a section name.</li>}
          {shown.map((it, i) => (
            <li
              key={it.label}
              role="option"
              aria-selected={i === index}
              className={`palette-item${i === index ? ' is-on' : ''}`}
              onMouseEnter={() => setIndex(i)}
              onClick={() => run(it)}
            >
              <span>{it.label}</span>
              <span className="palette-hint">{it.hint}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
