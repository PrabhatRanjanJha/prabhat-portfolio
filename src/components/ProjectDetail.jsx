import { useEffect, useMemo, useRef, useState } from 'react'
import { Background, Handle, MarkerType, Position, ReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { projects } from '../data/content.js'
import { graphs } from '../data/flows.js'
import { lockScroll } from '../scroll.js'

function FlowNode({ data }) {
  return (
    <div className="fnode">
      <Handle type="target" position={Position.Left} isConnectable={false} />
      <span>{data.label}</span>
      <Handle type="source" position={Position.Right} isConnectable={false} />
    </div>
  )
}
const nodeTypes = { flow: FlowNode }

const LINE = '#4A5668'
const AMBER = '#F2B84B'

function WorkflowCanvas({ workflow }) {
  const [selected, setSelected] = useState(workflow.nodes[0].id)
  const current = workflow.nodes.find((n) => n.id === selected) || workflow.nodes[0]

  const nodes = useMemo(
    () =>
      workflow.nodes.map((n) => ({
        id: n.id,
        type: 'flow',
        position: { x: n.x, y: n.y },
        data: { label: n.label },
        selected: n.id === selected,
      })),
    [workflow, selected],
  )

  const edges = useMemo(
    () =>
      workflow.edges.map(([source, target, label], k) => {
        const hot = source === selected || target === selected
        const stroke = hot ? AMBER : LINE
        return {
          id: `${source}-${target}-${k}`,
          source,
          target,
          label,
          style: { stroke, strokeWidth: hot ? 2.5 : 2 },
          labelStyle: { fill: '#8C98AB', fontSize: 12, fontFamily: '"DM Mono", monospace' },
          labelBgStyle: { fill: '#10141A' },
          markerEnd: { type: MarkerType.ArrowClosed, color: stroke },
        }
      }),
    [workflow, selected],
  )

  return (
    <div className="flow-wrap">
      <div className="flow-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          colorMode="dark"
          fitView
          fitViewOptions={{ padding: 0.18 }}
          minZoom={0.25}
          maxZoom={1.6}
          nodesDraggable={false}
          nodesConnectable={false}
          onNodeClick={(_, node) => setSelected(node.id)}
        >
          <Background gap={22} size={1.2} color="#2A3340" />
        </ReactFlow>
      </div>
      <div className="flow-desc" aria-live="polite">
        <h4>{current.label}</h4>
        <p>{current.desc}</p>
      </div>
    </div>
  )
}

export default function ProjectDetail({ projectId, onClose }) {
  const project = projects.find((p) => p.id === projectId)
  const graph = project && project.graph ? graphs[project.graph] : null
  const [wfKey, setWfKey] = useState(graph ? graph.default : null)
  const closeRef = useRef(null)

  useEffect(() => {
    lockScroll(true)
    const previous = document.activeElement
    if (closeRef.current) closeRef.current.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      lockScroll(false)
      if (previous && previous.focus) previous.focus()
    }
  }, [onClose])

  if (!project) return null
  const workflow = graph ? graph.workflows[wfKey] : null

  return (
    <div className="detail" role="dialog" aria-modal="true" aria-label={project.name} data-lenis-prevent onClick={onClose}>
      <div className={`detail-card${graph ? ' has-graph' : ''}`} onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} type="button" className="detail-close" onClick={onClose} aria-label="Close">
          Close
        </button>

        <div className="detail-info">
          <h2>{project.name}</h2>
          {project.status && <span className="tag">{project.status}</span>}
          <p>{project.summary}</p>
          <ul className="detail-points">
            {project.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
          <ul className="chips">
            {project.stack.map((s) => (
              <li key={s} className="chip">
                {s}
              </li>
            ))}
          </ul>
          <div className="btn-row">
            {project.links.github && (
              <a className="btn" href={project.links.github} target="_blank" rel="noreferrer">
                View on GitHub
              </a>
            )}
            {project.links.live && (
              <a className="btn btn-primary" href={project.links.live} target="_blank" rel="noreferrer">
                Live demo
              </a>
            )}
          </div>
        </div>

        {graph && (
          <div className="detail-graph">
            {Object.keys(graph.workflows).length > 1 && (
              <div className="wf-tabs" role="tablist" aria-label="Workflows">
                {Object.entries(graph.workflows).map(([key, wf]) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={key === wfKey}
                    className={`wf-tab${key === wfKey ? ' is-on' : ''}`}
                    onClick={() => setWfKey(key)}
                  >
                    {wf.label}
                  </button>
                ))}
              </div>
            )}
            <WorkflowCanvas key={`${project.id}-${wfKey}`} workflow={workflow} />
          </div>
        )}
      </div>
    </div>
  )
}
