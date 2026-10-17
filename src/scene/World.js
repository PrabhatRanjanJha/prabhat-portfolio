import * as THREE from 'three'
import { BG, CHAPTERS, COLORS, FLIGHT, NODE } from './config.js'
import { LAST } from './flight.js'
import { projects } from '../data/content.js'

const N = CHAPTERS.length
const lerp = (a, b, t) => a + (b - a) * t
const clamp01 = (x) => Math.min(1, Math.max(0, x))
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const color = (hex) => new THREE.Color(hex)
const EDGE_C = color(COLORS.nodeEdge)
const AMBER_C = color(COLORS.amber)
const WIRE_C = color(COLORS.wire)
const _pos = new THREE.Vector3()
const _look = new THREE.Vector3()

const BASE = import.meta.env.BASE_URL || '/'
const VIDEO_ASPECT = 1280 / 712
const BACK_ASPECT = 2400 / 1340
// star positions in the night picture (pixels in a 1998 x 1116 view), used for the twinkle
const STAR_UVS = [
  [190, 92], [432, 102], [1071, 43], [712, 183], [1558, 150],
  [1240, 135], [362, 232], [1160, 240], [1872, 68], [80, 48],
].map(([x, y]) => new THREE.Vector2(x / 1998, 1 - y / 1116))

export function webglAvailable() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

function roundedRectShape(w, h, r) {
  const s = new THREE.Shape()
  const x = -w / 2
  const y = -h / 2
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false)
  s.lineTo(x + w, y + h - r)
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false)
  s.lineTo(x + r, y + h)
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false)
  s.lineTo(x, y + r)
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false)
  return s
}

function radialTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.35, 'rgba(255,255,255,0.35)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 256, 256)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

const STATES = {
  done: { dot: COLORS.success, text: 'Executed' },
  running: { dot: COLORS.amber, text: 'Running' },
  waiting: { dot: '#6B6280', text: 'Waiting' },
  success: { dot: COLORS.success, text: 'Execution successful' },
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function diamond(ctx, x, y, s) {
  ctx.beginPath()
  ctx.moveTo(x, y - s)
  ctx.lineTo(x + s, y)
  ctx.lineTo(x, y + s)
  ctx.lineTo(x - s, y)
  ctx.closePath()
  ctx.fill()
}

// A small eight-petal lotus.
function lotus(ctx, cx, cy, r) {
  for (let k = 0; k < 8; k++) {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate((k * Math.PI) / 4)
    ctx.beginPath()
    ctx.ellipse(0, -r * 0.58, r * 0.2, r * 0.46, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.16, 0, Math.PI * 2)
  ctx.stroke()
}

const MONO = '"DM Mono", ui-monospace, monospace'
const TITLE = '600 74px "Cinzel", "Bricolage Grotesque Variable", serif'
const SANSKRIT = '66px "Yatra One", "Tiro Devanagari Hindi", serif'

function drawLabel(node, chapter, state, logCount) {
  const { canvas, ctx, tex } = node.userData
  const W = canvas.width
  const H = canvas.height
  ctx.clearRect(0, 0, W, H)
  ctx.textBaseline = 'alphabetic'

  // carved double frame with corner diamonds
  ctx.strokeStyle = 'rgba(227,179,90,0.6)'
  ctx.lineWidth = 3
  roundRectPath(ctx, 28, 28, W - 56, H - 56, 40)
  ctx.stroke()
  ctx.strokeStyle = 'rgba(227,179,90,0.25)'
  ctx.lineWidth = 2
  roundRectPath(ctx, 44, 44, W - 88, H - 88, 28)
  ctx.stroke()
  ctx.fillStyle = COLORS.gold
  diamond(ctx, 28, 28, 9)
  diamond(ctx, W - 28, 28, 9)
  diamond(ctx, 28, H - 28, 9)
  diamond(ctx, W - 28, H - 28, 9)

  ctx.strokeStyle = 'rgba(227,179,90,0.85)'
  ctx.lineWidth = 3
  lotus(ctx, W - 124, 148, 60)

  ctx.fillStyle = COLORS.muted
  ctx.font = `500 30px ${MONO}`
  if ('letterSpacing' in ctx) ctx.letterSpacing = '4px'
  ctx.fillText(chapter.kind.toUpperCase(), 84, 118)
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px'

  ctx.fillStyle = COLORS.text
  ctx.font = TITLE
  ctx.fillText(chapter.title, 80, 216)

  if (chapter.id === 'hero') {
    const lines = ['Profile loaded', `${projects.length} projects found`, 'Ready to run']
    ctx.font = `500 34px ${MONO}`
    lines.slice(0, logCount).forEach((line, k) => {
      const y = 288 + k * 50
      ctx.fillStyle = COLORS.success
      ctx.fillText('✓', 84, y)
      ctx.fillStyle = COLORS.text
      ctx.fillText(line, 130, y)
    })
  } else {
    ctx.fillStyle = COLORS.gold
    ctx.font = SANSKRIT
    ctx.fillText(chapter.sanskrit, 80, 322)
  }

  const s = STATES[state]
  ctx.fillStyle = s.dot
  ctx.beginPath()
  ctx.arc(92, 436, 11, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = COLORS.muted
  ctx.font = `500 28px ${MONO}`
  ctx.fillText(s.text, 116, 446)

  tex.needsUpdate = true
}

export class World {
  constructor(canvas) {
    this.canvas = canvas
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    this.scene = new THREE.Scene()
    this.scene.background = color(COLORS.bg)
    this.camera = new THREE.PerspectiveCamera(FLIGHT.fov, 1, 0.1, 400)

    this.flight = { i: 0, f: 0, drift: 0, t: 0 }
    this.pointer = { x: 0, y: 0 }
    this.smoothPointer = { x: 0, y: 0 }
    this.introState = { v: 0 }
    this.active = 0
    this.onActive = null
    this.reducedMotion = false

    this.glowTex = radialTexture()
    this.nodes = []
    this.segments = []
    this.disposables = []
    this.timers = []
    this.logCount = 0

    this.poses = CHAPTERS.map((c) => {
      const [x, y, z] = c.pos
      const cx = x - c.side * (c.offset ?? FLIGHT.offsetX)
      return {
        pos: new THREE.Vector3(cx, y + FLIGHT.height, z + FLIGHT.dist),
        look: new THREE.Vector3(cx + FLIGHT.lookAhead, y - 0.2, z),
      }
    })

    this.buildLights()
    this.buildBackdrop()
    this.buildNodes()
    this.buildWires()
    this.buildPulse()
    this.buildEmbers()
    this.resize()
    this.refreshLabels()
    this.startLog()
  }

  // ---------- building ----------

  buildLights() {
    this.scene.add(new THREE.AmbientLight(0xb9a8e0, 0.7))
    const sun = new THREE.DirectionalLight(0xffc98a, 1.0)
    sun.position.set(6, 5, 6)
    this.scene.add(sun)
    this.focusLight = new THREE.PointLight(0xf2b84b, 60, 22, 2)
    this.scene.add(this.focusLight)
  }

  // The night valley picture, drawn as one full-screen quad behind everything.
  buildBackdrop() {
    const stars = []
    for (let i = 0; i < 10; i++) {
      const s = BG.stars[i]
      stars.push(s ? new THREE.Vector2(s[0], 1 - s[1]) : new THREE.Vector2(-9, -9))
    }
    this.backTex = new THREE.TextureLoader().load(`${BASE}${BG.image}`, (tex) => {
      const img = tex.image
      if (img && img.width && img.height) this.bgMat.uniforms.uAspectImg.value = img.width / img.height
    })
    this.backTex.colorSpace = THREE.SRGBColorSpace
    this.backTex.minFilter = THREE.LinearFilter
    this.backTex.generateMipmaps = false

    this.bgMat = new THREE.ShaderMaterial({
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uBack: { value: this.backTex },
        uAspect: { value: 1.78 },
        uAspectImg: { value: 1.79 },
        uZoom: { value: BG.zoom },
        uCenter: { value: new THREE.Vector2(0.5, 0.5) },
        uPointer: { value: new THREE.Vector2(0.5, 0.5) },
        uBright: { value: BG.bright },
        uBottom: { value: BG.bottomShade },
        uLeft: { value: BG.leftShade },
        uRipple: { value: BG.ripple },
        uTime: { value: 0 },
        uFade: { value: 0 },
        uStars: { value: stars },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.9999, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D uBack;
        uniform float uAspect;
        uniform float uAspectImg;
        uniform float uZoom;
        uniform vec2 uCenter;
        uniform vec2 uPointer;
        uniform float uBright;
        uniform float uBottom;
        uniform float uLeft;
        uniform float uRipple;
        uniform float uTime;
        uniform float uFade;
        uniform vec2 uStars[10];
        varying vec2 vUv;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
        void main() {
          vec2 d = (vUv - uPointer) * vec2(uAspect, 1.0);
          float r = length(d);
          vec2 wob = normalize(d + vec2(0.00001)) * sin(r * 38.0 - uTime * 2.4) * uRipple * exp(-r * 5.0);
          vec2 s = uAspect > uAspectImg ? vec2(1.0, uAspectImg / uAspect) : vec2(uAspect / uAspectImg, 1.0);
          vec2 uv = (vUv - 0.5) * s / uZoom + uCenter + wob;
          vec3 c = texture2D(uBack, uv).rgb * uBright;
          for (int i = 0; i < 10; i++) {
            vec2 dv = (uv - uStars[i]) * vec2(uAspectImg, 1.0);
            float tw = 0.5 + 0.5 * sin(uTime * (0.7 + 0.13 * float(i)) + float(i) * 1.7);
            c += vec3(1.0, 0.82, 0.5) * exp(-dot(dv, dv) * 30000.0) * tw * 0.5;
          }
          c *= uFade;
          float bottom = smoothstep(0.62, 0.0, vUv.y);
          float left = smoothstep(0.7, 0.05, vUv.x);
          c *= 1.0 - uBottom * bottom * 0.4;
          c *= 1.0 - uLeft * left * 0.4;
          vec2 q = vUv - 0.5;
          c *= 1.0 - dot(q, q) * 0.9;
          c += (hash(gl_FragCoord.xy + fract(uTime) * 100.0) - 0.5) * 0.02;
          gl_FragColor = vec4(c, 1.0);
          #include <colorspace_fragment>
        }`,
    })
    this.backdrop = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.bgMat)
    this.backdrop.renderOrder = -10
    this.backdrop.frustumCulled = false
    this.scene.add(this.backdrop)
  }

  buildNodes() {
    const shape = roundedRectShape(NODE.w, NODE.h, NODE.radius)
    const bodyGeo = new THREE.ExtrudeGeometry(shape, { depth: NODE.depth, bevelEnabled: false, curveSegments: 12 })
    bodyGeo.translate(0, 0, -NODE.depth / 2)
    const outlineGeo = new THREE.BufferGeometry().setFromPoints(
      shape.getPoints(32).map((p) => new THREE.Vector3(p.x, p.y, NODE.depth / 2 + 0.004)),
    )
    const portGeo = new THREE.SphereGeometry(0.13, 16, 12)
    const labelGeo = new THREE.PlaneGeometry(NODE.w * 0.96, NODE.h * 0.96)
    const glowGeo = new THREE.PlaneGeometry(10, 6.5)
    this.disposables.push(bodyGeo, outlineGeo, portGeo, labelGeo, glowGeo)

    CHAPTERS.forEach((c, i) => {
      const g = new THREE.Group()
      g.position.set(...c.pos)

      g.add(
        new THREE.Mesh(
          bodyGeo,
          new THREE.MeshStandardMaterial({ color: COLORS.node, roughness: 0.5, metalness: 0.35, emissive: '#140F26' }),
        ),
      )

      const outlineMat = new THREE.LineBasicMaterial({ color: COLORS.nodeEdge })
      g.add(new THREE.LineLoop(outlineGeo, outlineMat))

      const canvas = document.createElement('canvas')
      canvas.width = 1024
      canvas.height = 512
      const tex = new THREE.CanvasTexture(canvas)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = 8
      const label = new THREE.Mesh(
        labelGeo,
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }),
      )
      label.position.z = NODE.depth / 2 + 0.01
      g.add(label)

      const portMats = []
      const addPort = (x) => {
        const m = new THREE.MeshBasicMaterial({ color: COLORS.wire })
        const p = new THREE.Mesh(portGeo, m)
        p.position.set(x, 0, 0)
        g.add(p)
        portMats.push(m)
      }
      if (i > 0) addPort(-NODE.w / 2)
      if (i < LAST) addPort(NODE.w / 2)

      const glow = new THREE.Mesh(
        glowGeo,
        new THREE.MeshBasicMaterial({
          map: this.glowTex,
          color: COLORS.amber,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      )
      glow.position.z = -0.4
      g.add(glow)

      g.userData = {
        canvas,
        ctx: canvas.getContext('2d'),
        tex,
        outlineMat,
        portMats,
        glow,
        base: new THREE.Vector3(...c.pos),
      }
      this.scene.add(g)
      this.nodes.push(g)
    })
  }

  portPoint(i, side) {
    const [x, y, z] = CHAPTERS[i].pos
    return new THREE.Vector3(x + side * (NODE.w / 2), y, z)
  }

  buildWires() {
    const tubular = 120
    const radial = 8
    for (let j = 0; j < N - 1; j++) {
      const p0 = this.portPoint(j, 1)
      const p3 = this.portPoint(j + 1, -1)
      const d = (p3.x - p0.x) * 0.5
      const curve = new THREE.CubicBezierCurve3(
        p0,
        p0.clone().add(new THREE.Vector3(d, 0, 0)),
        p3.clone().sub(new THREE.Vector3(d, 0, 0)),
        p3,
      )
      const base = new THREE.Mesh(
        new THREE.TubeGeometry(curve, tubular, 0.045, radial, false),
        new THREE.MeshBasicMaterial({ color: COLORS.wire }),
      )
      const lit = new THREE.Mesh(
        new THREE.TubeGeometry(curve, tubular, 0.065, radial, false),
        new THREE.MeshBasicMaterial({ color: COLORS.amber }),
      )
      const glow = new THREE.Mesh(
        new THREE.TubeGeometry(curve, tubular, 0.22, radial, false),
        new THREE.MeshBasicMaterial({
          color: COLORS.amber,
          transparent: true,
          opacity: 0.18,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      )
      lit.geometry.setDrawRange(0, 0)
      glow.geometry.setDrawRange(0, 0)
      this.scene.add(base, lit, glow)
      this.segments.push({ curve, lit, glow, tubular, radial })
    }
  }

  buildPulse() {
    this.pulse = new THREE.Group()
    this.pulse.add(new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 12), new THREE.MeshBasicMaterial({ color: COLORS.amberSoft })))
    const halo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.glowTex,
        color: COLORS.amber,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    )
    halo.scale.set(1.8, 1.8, 1)
    this.pulse.add(halo)
    this.pulse.position.copy(this.portPoint(0, 1))
    this.scene.add(this.pulse)
  }

  // Warm sparks that rise slowly, in front of the video.
  buildEmbers() {
    const count = 200
    this.emberX0 = CHAPTERS[0].pos[0] - 10
    this.emberX1 = CHAPTERS[LAST].pos[0] + 10
    const pos = new Float32Array(count * 3)
    this.emberSpeed = new Float32Array(count)
    this.emberPhase = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = lerp(this.emberX0, this.emberX1, Math.random())
      pos[i * 3 + 1] = lerp(-2.4, 8, Math.random())
      pos[i * 3 + 2] = lerp(-10, 9, Math.random())
      this.emberSpeed[i] = lerp(0.12, 0.4, Math.random())
      this.emberPhase[i] = Math.random() * 6.28
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    this.embers = new THREE.Points(
      g,
      new THREE.PointsMaterial({
        color: 0xffb84a,
        size: 0.085,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    )
    this.embers.frustumCulled = false
    this.scene.add(this.embers)
  }

  // The hero node "runs": its log lines appear one after another.
  startLog() {
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      this.logCount = 3
      this.refreshLabels()
      return
    }
    ;[1500, 2100, 2700].forEach((ms) => {
      this.timers.push(
        setTimeout(() => {
          this.logCount += 1
          this.refreshLabels()
        }, ms),
      )
    })
  }

  // ---------- public API ----------

  refreshLabels() {
    this.nodes.forEach((n, i) => {
      let state
      if (i === 0) state = this.logCount >= 3 ? 'done' : 'running'
      else if (i < this.active) state = 'done'
      else if (i === this.active) state = i === LAST ? 'success' : 'running'
      else state = 'waiting'
      drawLabel(n, CHAPTERS[i], state, this.logCount)
    })
  }

  setFlight(flight) {
    this.flight = flight
  }

  setPointer(x, y) {
    this.pointer.x = x
    this.pointer.y = y
  }

  resize() {
    const w = window.innerWidth
    const h = window.innerHeight
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.bgMat.uniforms.uAspect.value = w / h
  }

  update(time, dt) {
    const { i, f, drift, t } = this.flight
    const a = this.poses[i]
    const b = this.poses[Math.min(i + 1, LAST)]
    const hop = Math.sin(Math.PI * f)

    const pos = _pos.lerpVectors(a.pos, b.pos, f)
    const look = _look.lerpVectors(a.look, b.look, f)
    pos.y += hop * FLIGHT.hopLift
    pos.z += hop * FLIGHT.hopPull
    const sway = drift * FLIGHT.drift
    pos.x += sway
    look.x += sway

    const k = 1 - Math.exp(-dt * 4)
    this.smoothPointer.x = lerp(this.smoothPointer.x, this.reducedMotion ? 0 : this.pointer.x, k)
    this.smoothPointer.y = lerp(this.smoothPointer.y, this.reducedMotion ? 0 : this.pointer.y, k)
    pos.x += this.smoothPointer.x * 0.6
    pos.y += this.smoothPointer.y * 0.35

    const intro = 1 - Math.pow(1 - this.introState.v, 3)
    pos.z += (1 - intro) * 14
    pos.y += (1 - intro) * 4

    this.camera.position.copy(pos)
    this.camera.lookAt(look)
    this.camera.rotateZ(hop * FLIGHT.hopRoll)

    // background picture: slow parallax, a gentle breathing zoom, ripple at the cursor
    const prog = t / LAST
    const u = this.bgMat.uniforms
    u.uTime.value = time
    u.uFade.value = intro
    const zoom = BG.zoom + BG.zoomGain * prog + 0.006 * Math.sin(time * 0.2)
    u.uZoom.value = zoom
    const aspect = u.uAspect.value
    const ia = u.uAspectImg.value
    const sy = aspect > ia ? ia / aspect : 1
    const sx = aspect > ia ? 1 : aspect / ia
    const h = (0.5 * sy) / zoom
    const hw = (0.5 * sx) / zoom
    const px = this.smoothPointer.x
    // keep the temple in view: the right edge of the view slides from edgeStart to edgeEnd
    const edge = BG.edgeStart + (BG.edgeEnd - BG.edgeStart) * prog + px * 0.01
    const cx = Math.min(Math.max(edge - hw, hw), 1 - hw)
    u.uCenter.value.set(cx, h + (1 - 2 * h) * BG.anchor)
    u.uPointer.value.set((px + 1) / 2, (this.smoothPointer.y + 1) / 2)
    u.uBright.value = BG.bright

    // nodes
    this.nodes.forEach((n, idx) => {
      const near = 1 - smooth(0, 0.6, Math.abs(t - idx))
      const ud = n.userData
      n.position.y = ud.base.y + Math.sin(time * 0.8 + idx * 1.7) * 0.08
      const tiltY = this.smoothPointer.x * 0.35 * near
      const tiltX = -this.smoothPointer.y * 0.18 * near
      n.rotation.y = lerp(n.rotation.y, tiltY, k)
      n.rotation.x = lerp(n.rotation.x, tiltX, k)
      ud.outlineMat.color.lerpColors(EDGE_C, AMBER_C, near)
      ud.glow.material.opacity = near * 0.32
      const reached = idx <= Math.round(t)
      ud.portMats.forEach((m) => m.color.copy(reached ? AMBER_C : WIRE_C))
    })

    // wires and pulse
    this.segments.forEach((s, j) => {
      const frac = j < i ? 1 : j === i ? f : 0
      const count = Math.floor(frac * s.tubular) * s.radial * 6
      s.lit.geometry.setDrawRange(0, count)
      s.glow.geometry.setDrawRange(0, count)
    })
    if (i < LAST) {
      const p = this.segments[i].curve.getPoint(f)
      this.pulse.position.copy(p)
    } else {
      this.pulse.position.copy(this.portPoint(LAST, -1))
    }
    const flicker = this.reducedMotion ? 1 : 1 + Math.sin(time * 6) * 0.12
    this.pulse.scale.setScalar(flicker)

    // focus light follows the camera's attention
    const fa = CHAPTERS[i].pos
    const fb = CHAPTERS[Math.min(i + 1, LAST)].pos
    this.focusLight.position.set(lerp(fa[0], fb[0], f), lerp(fa[1], fb[1], f) + 1.6, lerp(fa[2], fb[2], f) + 4)

    // embers rise and sway
    const ep = this.embers.geometry.attributes.position
    for (let n = 0; n < ep.count; n++) {
      let y = ep.getY(n) + this.emberSpeed[n] * dt
      if (y > 8.5) y = -2.6
      ep.setY(n, y)
      ep.setX(n, ep.getX(n) + Math.sin(time * 0.6 + this.emberPhase[n]) * 0.0025)
    }
    ep.needsUpdate = true

    // active chapter
    const active = Math.round(t)
    if (active !== this.active) {
      this.active = active
      this.refreshLabels()
      if (this.onActive) this.onActive(active)
    }

    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.timers.forEach(clearTimeout)
    this.backTex.dispose()
    this.scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose()
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
        mats.forEach((m) => {
          if (m.map && m.map !== this.backTex) m.map.dispose()
          m.dispose()
        })
      }
    })
    this.disposables.forEach((d) => d.dispose())
    this.glowTex.dispose()
    // No forceContextLoss(): React StrictMode remounts onto the same canvas in
    // dev, and a force-lost context cannot be reused.
    this.renderer.dispose()
  }
}
