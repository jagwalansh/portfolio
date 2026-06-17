import { type ReactNode, useEffect, useRef, useState } from 'react'

const TEXT = 'jagwalansh'
const FONT_SIZE = 130
const COLOR = '#111111'
const STROKE_W = 2
const DURATION = 2800
const HOLD = 600
const SVG_W = 700
const SVG_H = 200
const PAD = 20

type Phase = 'drawing' | 'fading' | 'done'
type Point = [number, number]

type PixelData = {
  pixels: Point[]
  minX: number
  maxX: number
  minY: number
  maxY: number
}

type Skeleton = {
  pts: Point[]
  pw: number
  ph: number
}

type Segment = {
  el: SVGPathElement
  len: number
  start: number
  frac: number
}

type HandwritingIntroProps = {
  children: ReactNode
}

function waitForFont(family: string, size: number) {
  return new Promise<void>((resolve) => {
    let tries = 0
    const id = window.setInterval(() => {
      if (document.fonts.check(`${size}px '${family}'`) || ++tries > 80) {
        window.clearInterval(id)
        resolve()
      }
    }, 50)
  })
}

function rasterize(text: string, fontStr: string, fontSize: number): PixelData | null {
  const cw = 1400
  const ch = 400
  const cv = document.createElement('canvas')
  cv.width = cw
  cv.height = ch

  const ctx = cv.getContext('2d')
  if (!ctx) return null

  ctx.font = `${fontSize}px ${fontStr}`
  ctx.fillStyle = '#000'
  ctx.textBaseline = 'middle'

  const tw = ctx.measureText(text).width
  ctx.fillText(text, (cw - tw) / 2, ch / 2)

  const { data } = ctx.getImageData(0, 0, cw, ch)
  const pixels: Point[] = []

  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      if (data[(y * cw + x) * 4 + 3] > 60) pixels.push([x, y])
    }
  }

  if (!pixels.length) return null

  const minX = pixels.reduce((min, point) => Math.min(min, point[0]), Infinity)
  const maxX = pixels.reduce((max, point) => Math.max(max, point[0]), -Infinity)
  const minY = pixels.reduce((min, point) => Math.min(min, point[1]), Infinity)
  const maxY = pixels.reduce((max, point) => Math.max(max, point[1]), -Infinity)

  return { pixels, minX, maxX, minY, maxY }
}

function buildSkeleton({ pixels, minX, maxX, minY, maxY }: PixelData): Skeleton {
  const pw = maxX - minX + 1
  const ph = maxY - minY + 1
  const grid = new Uint8Array(pw * ph)

  for (const [x, y] of pixels) grid[(y - minY) * pw + (x - minX)] = 1

  const thinned = new Uint8Array(grid)
  const dx8 = [-1, 0, 1, 1, 1, 0, -1, -1]
  const dy8 = [-1, -1, -1, 0, 1, 1, 1, 0]
  let changed = true

  for (let iter = 0; iter < 10 && changed; iter++) {
    changed = false

    for (let y = 1; y < ph - 1; y++) {
      for (let x = 1; x < pw - 1; x++) {
        if (!thinned[y * pw + x]) continue

        let neighbors = 0
        for (let d = 0; d < 8; d++) neighbors += thinned[(y + dy8[d]) * pw + (x + dx8[d])] ? 1 : 0
        if (neighbors < 2 || neighbors > 6) continue

        let transitions = 0
        for (let d = 0; d < 8; d++) {
          if (
            !thinned[(y + dy8[d]) * pw + (x + dx8[d])] &&
            thinned[(y + dy8[(d + 1) % 8]) * pw + (x + dx8[(d + 1) % 8])]
          ) {
            transitions++
          }
        }

        if (transitions === 1) {
          thinned[y * pw + x] = 0
          changed = true
        }
      }
    }
  }

  const pts: Point[] = []
  for (let i = 0; i < thinned.length; i++) {
    if (thinned[i]) pts.push([i % pw, Math.floor(i / pw)])
  }

  return { pts, pw, ph }
}

function tracePaths({ pts, pw }: Skeleton) {
  const visited = new Set<number>()
  const map = new Map<number, Point>()

  for (const [x, y] of pts) map.set(y * pw + x, [x, y])

  const neighborsFor = ([x, y]: Point) => {
    const result: Point[] = []

    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        if (!dx && !dy) continue
        if (Math.abs(dx) + Math.abs(dy) > 3) continue

        const point = map.get((y + dy) * pw + (x + dx))
        if (point) result.push(point)
      }
    }

    return result
  }

  const paths: Point[][] = []

  for (const [x, y] of pts) {
    const key = y * pw + x
    if (visited.has(key)) continue

    visited.add(key)
    const path: Point[] = [[x, y]]
    let cur: Point = [x, y]
    let ext = true

    while (ext) {
      ext = false
      const candidates = neighborsFor(cur).filter(([nx, ny]) => !visited.has(ny * pw + nx))

      if (candidates.length) {
        candidates.sort(
          (a, b) =>
            Math.hypot(a[0] - cur[0], a[1] - cur[1]) - Math.hypot(b[0] - cur[0], b[1] - cur[1]),
        )

        const next = candidates[0]
        visited.add(next[1] * pw + next[0])
        path.push(next)
        cur = next
        ext = true
      }
    }

    if (path.length > 2) paths.push(path)
  }

  return paths
}

function smooth(pts: Point[], k = 5): Point[] {
  return pts.map((_, i) => {
    let sx = 0
    let sy = 0
    let n = 0

    for (let j = Math.max(0, i - k); j <= Math.min(pts.length - 1, i + k); j++) {
      sx += pts[j][0]
      sy += pts[j][1]
      n++
    }

    return [sx / n, sy / n]
  })
}

function toD(pts: Point[]) {
  if (pts.length < 2) return ''

  let d = `M ${pts[0][0]} ${pts[0][1]}`

  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2
    const my = (pts[i][1] + pts[i + 1][1]) / 2
    d += ` Q ${pts[i][0]} ${pts[i][1]} ${mx} ${my}`
  }

  d += ` L ${pts[pts.length - 1][0]} ${pts[pts.length - 1][1]}`
  return d
}

function scalePaths(paths: Point[][], pw: number, ph: number, svgW: number, svgH: number, pad: number) {
  const scale = Math.min((svgW - pad * 2) / pw, (svgH - pad * 2) / ph)
  const ox = pad + (svgW - pad * 2 - pw * scale) / 2
  const oy = pad + (svgH - pad * 2 - ph * scale) / 2

  return paths.map((path) => path.map(([x, y]): Point => [x * scale + ox, y * scale + oy]))
}

function pathLength(pts: Point[]) {
  let length = 0

  for (let i = 1; i < pts.length; i++) {
    length += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
  }

  return length
}

export default function HandwritingIntro({ children }: HandwritingIntroProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const rafRef = useRef<number | null>(null)
  const bodyOverflowRef = useRef<string | null>(null)
  const scrollBehaviorRef = useRef<string | null>(null)
  const [phase, setPhase] = useState<Phase>('drawing')

  useEffect(() => {
    if (phase === 'done') {
      document.body.style.overflow = bodyOverflowRef.current ?? ''
      document.documentElement.style.scrollBehavior = scrollBehaviorRef.current ?? ''
      return
    }

    if (bodyOverflowRef.current === null) {
      bodyOverflowRef.current = document.body.style.overflow
      scrollBehaviorRef.current = document.documentElement.style.scrollBehavior
    }

    document.body.style.overflow = 'hidden'
    document.documentElement.style.scrollBehavior = 'auto'
    window.scrollTo(0, 0)

    return () => {
      document.body.style.overflow = bodyOverflowRef.current ?? ''
      document.documentElement.style.scrollBehavior = scrollBehaviorRef.current ?? ''
    }
  }, [phase])

  useEffect(() => {
    let cancelled = false

    async function run() {
      await document.fonts.ready
      await waitForFont('Pencerio', FONT_SIZE)
      await new Promise((resolve) => window.setTimeout(resolve, 80))
      if (cancelled) return

      const pixelData = rasterize(TEXT, "'Pencerio', cursive", FONT_SIZE)
      if (!pixelData) {
        setPhase('done')
        return
      }

      const skeleton = buildSkeleton(pixelData)
      const raw = tracePaths(skeleton)
      const top = raw.sort((a, b) => b.length - a.length).slice(0, 100)
      const smoothed = top.map((path) => smooth(path, 5))
      const scaled = scalePaths(smoothed, skeleton.pw, skeleton.ph, SVG_W, SVG_H, PAD)
      const svg = svgRef.current

      if (!svg || cancelled) return

      svg.replaceChildren()

      const totalLen = scaled.reduce((sum, path) => sum + pathLength(path), 0)
      const segments: Segment[] = []
      let cumulative = 0

      for (const pts of scaled) {
        const d = toD(pts)
        if (!d) continue

        const el = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        el.setAttribute('d', d)
        el.setAttribute('fill', 'none')
        el.setAttribute('stroke', COLOR)
        el.setAttribute('stroke-width', String(STROKE_W))
        el.setAttribute('stroke-linecap', 'round')
        el.setAttribute('stroke-linejoin', 'round')
        svg.appendChild(el)

        const len = el.getTotalLength()
        el.style.strokeDasharray = String(len)
        el.style.strokeDashoffset = String(len)

        const segmentLength = pathLength(pts)

        segments.push({
          el,
          len,
          start: totalLen > 0 ? cumulative / totalLen : 0,
          frac: totalLen > 0 ? segmentLength / totalLen : 1 / scaled.length,
        })

        cumulative += segmentLength
      }

      const t0 = performance.now()

      function frame(now: number) {
        if (cancelled) return

        const t = Math.min((now - t0) / DURATION, 1)

        for (const { el, len, start, frac } of segments) {
          const localT = frac > 0 ? Math.max(0, Math.min(1, (t - start) / frac)) : 1
          const eased = localT < 0.5 ? 2 * localT * localT : -1 + (4 - 2 * localT) * localT
          el.style.strokeDashoffset = String(len * (1 - eased))
        }

        if (t < 1) {
          rafRef.current = window.requestAnimationFrame(frame)
          return
        }

        window.setTimeout(() => {
          if (!cancelled) setPhase('fading')

          window.setTimeout(() => {
            if (!cancelled) setPhase('done')
          }, 650)
        }, HOLD)
      }

      rafRef.current = window.requestAnimationFrame(frame)
    }

    run()

    return () => {
      cancelled = true

      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
    }
  }, [])

  if (phase === 'done') return <>{children}</>

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          opacity: phase === 'fading' ? 0 : 1,
          transition: phase === 'fading' ? 'opacity 0.6s ease' : 'none',
          pointerEvents: phase === 'fading' ? 'none' : 'auto',
        }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={SVG_W}
          height={SVG_H}
          style={{ overflow: 'visible', maxWidth: '90vw' }}
        />
      </div>

      <div
        style={{
          opacity: phase === 'fading' ? 1 : 0,
          transition: phase === 'fading' ? 'opacity 0.6s ease 0.2s' : 'none',
        }}
      >
        {children}
      </div>
    </>
  )
}
