import { useEffect, useRef, useState } from 'react'

interface ProductCardData {
  id: string
  code: string
  name: string
  taxon: string
  days: string
  count: string
  lot: string
  purity: string
  germ: string
  weight: string
  price: string
  canvasType: 'tomato' | 'brassica' | 'vine' | 'carrot' | 'beet' | 'corn'
}

const PRODUCTS: ProductCardData[] = [
  {
    id: 'fr-01',
    code: 'FR-01',
    name: 'CHEROKEE PURPLE',
    taxon: 'Solanum lycopersicum',
    days: '80 DAYS',
    count: '45 SEEDS',
    lot: 'FR-26-948A',
    purity: '99.8%',
    germ: '96.4%',
    weight: '140mg',
    price: '$6.50',
    canvasType: 'tomato',
  },
  {
    id: 'fr-02',
    code: 'FR-02',
    name: 'BLACK BEAUTY',
    taxon: 'Brassica oleracea',
    days: '68 DAYS',
    count: '120 SEEDS',
    lot: 'FR-26-412C',
    purity: '99.4%',
    germ: '94.8%',
    weight: '220mg',
    price: '$5.80',
    canvasType: 'brassica',
  },
  {
    id: 'fr-03',
    code: 'FR-03',
    name: 'BRANDYWINE SUN',
    taxon: 'Solanum pimpinellifolium',
    days: '75 DAYS',
    count: '50 SEEDS',
    lot: 'FR-26-108B',
    purity: '99.9%',
    germ: '98.1%',
    weight: '110mg',
    price: '$6.90',
    canvasType: 'vine',
  },
  {
    id: 'fr-04',
    code: 'FR-04',
    name: 'SCARLET NANTES',
    taxon: 'Daucus carota',
    days: '65 DAYS',
    count: '350 SEEDS',
    lot: 'FR-26-554A',
    purity: '99.2%',
    germ: '91.2%',
    weight: '410mg',
    price: '$5.40',
    canvasType: 'carrot',
  },
  {
    id: 'fr-05',
    code: 'FR-05',
    name: 'CHIOGGIA CYLINDRA',
    taxon: 'Beta vulgaris',
    days: '55 DAYS',
    count: '85 SEEDS',
    lot: 'FR-26-729D',
    purity: '99.5%',
    germ: '95.0%',
    weight: '680mg',
    price: '$5.90',
    canvasType: 'beet',
  },
  {
    id: 'fr-06',
    code: 'FR-06',
    name: 'GLASS GEM FLINT',
    taxon: 'Zea mays',
    days: '110 DAYS',
    count: '60 SEEDS',
    lot: 'FR-26-301G',
    purity: '99.7%',
    germ: '97.5%',
    weight: '950mg',
    price: '$7.20',
    canvasType: 'corn',
  },
]

interface GitHubRepository {
  id: number
  name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  updated_at: string
  fork: boolean
}

// Word Split Helper for 38ms staggered kinetic typography
function SplitWords({ text, baseDelay = 0, step = 38 }: { text: string; baseDelay?: number; step?: number }) {
  const words = text.split(' ')
  return (
    <span className="inline-block">
      {words.map((word, i) => (
        <span key={i} className="word-wrap">
          <span className="word-inner" style={{ transitionDelay: `${baseDelay + i * step}ms` }}>
            {word}
          </span>
        </span>
      ))}
    </span>
  )
}

export default function App() {
  // Discrete stage states (strictly updated only on integer change)
const [, setArtifactPhase] = useState<number>(0)
const [, setSeasonChapter] = useState<number>(0)
const [navOnLight, setNavOnLight] = useState<boolean>(false)

  const [githubRepos, setGithubRepos] = useState<GitHubRepository[]>([])
  const [reposLoading, setReposLoading] = useState<boolean>(true)
  const [reposError, setReposError] = useState<boolean>(false)

  useEffect(() => {
    const controller = new AbortController()
    fetch('https://api.github.com/users/VITTHAL21singh/repos?per_page=100&sort=updated', {
      headers: { Accept: 'application/vnd.github+json' },
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load GitHub repositories')
        return response.json() as Promise<GitHubRepository[]>
      })
      .then((repositories) => {
        setGithubRepos(repositories)
        setReposLoading(false)
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return
        setReposError(true)
        setReposLoading(false)
      })
    return () => controller.abort()
  }, [])


  // Repository cards arrive after the initial page observer has run.
  useEffect(() => {
    document.querySelectorAll('#stage-rail .repo-card[data-rev]').forEach((card) => {
      card.classList.add('rev-revealed')
    })
  }, [githubRepos])

  // Element refs
  const heroCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const seasonCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const packetCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const cardCanvasRefs = useRef<(HTMLCanvasElement | null)[]>([])

  const heroLine1Ref = useRef<HTMLHeadingElement | null>(null)
  const heroLine2Ref = useRef<HTMLHeadingElement | null>(null)
  const manifestoBaseRef = useRef<HTMLDivElement | null>(null)
  const manifestoDupRef = useRef<HTMLDivElement | null>(null)
  const railTrackRef = useRef<HTMLDivElement | null>(null)

  // Current index refs to avoid frame-by-frame DOM churn
  const currentArtifactPhaseRef = useRef<number>(0)
  const currentSeasonChapterRef = useRef<number>(0)
  const isNavLightRef = useRef<boolean>(false)

  // 1. Unified Kinetic Scroll Controller with RequestAnimationFrame and Re-entrancy Flag
  useEffect(() => {
    let ticking = false
    const root = document.documentElement

    const updateScrollMetrics = () => {
      ticking = false
      const innerH = window.innerHeight || 800

      // Stage 1: Hero (280svh on dark loam)
      const heroStage = document.getElementById('stage-hero')
      if (heroStage) {
        const rect = heroStage.getBoundingClientRect()
        const maxScroll = heroStage.offsetHeight - innerH
        const p = maxScroll > 0 ? Math.max(0, Math.min(1, -rect.top / maxScroll)) : 0

        // --hero-type-y from 0 to -90px
        const typeY = -90 * p
        // --hero-type-scale from 1 to 0.74
        const typeScale = 1 - 0.26 * p
        // --hero-type-alpha from 1 to 0
        const typeAlpha = Math.max(0, 1 - p * 1.45)
        // --hero-meta-alpha
        const metaAlpha = Math.max(0, 1 - p * 2.2)

        root.style.setProperty('--hero-type-y', `${typeY.toFixed(2)}px`)
        root.style.setProperty('--hero-type-scale', `${typeScale.toFixed(3)}`)
        root.style.setProperty('--hero-type-alpha', `${typeAlpha.toFixed(3)}`)
        root.style.setProperty('--hero-meta-alpha', `${metaAlpha.toFixed(3)}`)
      }

      // Stage 2: Manifesto (260svh on cream)
      const manifestoStage = document.getElementById('stage-manifesto')
      if (manifestoStage) {
        const rect = manifestoStage.getBoundingClientRect()
        const maxScroll = manifestoStage.offsetHeight - innerH
        const p = maxScroll > 0 ? Math.max(0, Math.min(1, -rect.top / maxScroll)) : 0

        // --manifesto-wipe from 0% to 100%
        const wipe = p * 100
        // --manifesto-scale from 1 to 1.05
        const scale = 1 + 0.05 * p

        root.style.setProperty('--manifesto-wipe', `${wipe.toFixed(2)}%`)
        root.style.setProperty('--manifesto-scale', `${scale.toFixed(3)}`)
      }

      // Stage 3: Horizontal Card Rail (340svh on cream)
      const railStage = document.getElementById('stage-rail')
      const track = railTrackRef.current
      if (railStage && track) {
        const rect = railStage.getBoundingClientRect()
        const maxScroll = railStage.offsetHeight - innerH
        const p = maxScroll > 0 ? Math.max(0, Math.min(1, -rect.top / maxScroll)) : 0

        // overflowWidth = track.scrollWidth - window.innerWidth + 80 (padding buffer)
        const overflow = Math.max(0, track.scrollWidth - window.innerWidth + 80)
        const tx = -1 * p * overflow
        root.style.setProperty('--rail-x', `${tx.toFixed(2)}px`)
        root.style.setProperty('--rail-meter', `${(p * 100).toFixed(2)}%`)
      }

      // Stage 4: Artifact (420svh on dark loam)
      const artifactStage = document.getElementById('stage-artifact')
      if (artifactStage) {
        const rect = artifactStage.getBoundingClientRect()
        const maxScroll = artifactStage.offsetHeight - innerH
        const p = maxScroll > 0 ? Math.max(0, Math.min(1, -rect.top / maxScroll)) : 0

        // --packet-alpha from 0 to 1
        const alpha = Math.min(1, p * 3.2)
        // --packet-enter from 38px to 0px
        const enter = Math.max(0, 38 * (1 - p * 3.0))
        // --packet-scale from 0.78 to 1
        const scale = 0.78 + 0.22 * Math.min(1, p * 2.6)
        // --packet-cut from 0 to 1 (triggers in last 25%)
        const cut = Math.max(0, Math.min(1, (p - 0.72) / 0.28))
        // --packet-meter
        const meter = p * 100
        // --packet-copy-x from -24px to 0px
        const copyX = -24 * (1 - Math.min(1, p * 2.2))

        root.style.setProperty('--packet-alpha', alpha.toFixed(3))
        root.style.setProperty('--packet-enter', `${enter.toFixed(2)}px`)
        root.style.setProperty('--packet-scale', scale.toFixed(3))
        root.style.setProperty('--packet-cut', cut.toFixed(3))
        root.style.setProperty('--packet-meter', `${meter.toFixed(2)}%`)
        root.style.setProperty('--packet-copy-x', `${copyX.toFixed(2)}px`)

        // Derive integer phase index 0..3 (ONLY trigger state change when integer advances)
        const phaseIdx = Math.min(3, Math.floor(p * 4))
        if (phaseIdx !== currentArtifactPhaseRef.current) {
          currentArtifactPhaseRef.current = phaseIdx
          setArtifactPhase(phaseIdx)
        }
      }

      // Stage 5: Season Band (300svh on cream)
      const seasonStage = document.getElementById('stage-season')
      if (seasonStage) {
        const rect = seasonStage.getBoundingClientRect()
        const maxScroll = seasonStage.offsetHeight - innerH
        const p = maxScroll > 0 ? Math.max(0, Math.min(1, -rect.top / maxScroll)) : 0

        // --season-y from -4% to 4%
        const seasonY = -4 + 8 * p
        // --season-scale from 1.10 to 1.055
        const seasonScale = 1.1 - 0.045 * p
        // active chapter: floor(p * 3)
        const chIdx = Math.min(2, Math.floor(p * 3))

        root.style.setProperty('--season-y', `${seasonY.toFixed(2)}%`)
        root.style.setProperty('--season-scale', seasonScale.toFixed(3))
        root.style.setProperty('--season-active-idx', `${chIdx}`)

        if (chIdx !== currentSeasonChapterRef.current) {
          currentSeasonChapterRef.current = chIdx
          setSeasonChapter(chIdx)
        }
      }

      // Check current nav background contrast (light vs dark stages)
      const scrollY = window.scrollY
      const heroHeight = heroStage ? heroStage.offsetHeight : 2000
      const manifestoHeight = manifestoStage ? manifestoStage.offsetHeight : 2000
      const railHeight = railStage ? railStage.offsetHeight : 2000
      const artifactHeight = artifactStage ? artifactStage.offsetHeight : 2000

      const inLightStage =
        (scrollY >= heroHeight && scrollY < heroHeight + manifestoHeight + railHeight) ||
        (scrollY >= heroHeight + manifestoHeight + railHeight + artifactHeight &&
          scrollY < heroHeight + manifestoHeight + railHeight + artifactHeight + 3000)

      if (inLightStage !== isNavLightRef.current) {
        isNavLightRef.current = inLightStage
        setNavOnLight(inLightStage)
      }
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollMetrics)
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    updateScrollMetrics()

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  // 2. Poster Lockup Character Clamp & Bounding Rect Verification
  useEffect(() => {
    const adjustPosterSize = () => {
      const line1 = heroLine1Ref.current
      const line2 = heroLine2Ref.current
      const vw = window.innerWidth

      if (line1) {
        const chars1 = 38 // "HEIRLOOM SEED SPECIMENS · ARCHIVAL STRAINS"
        const calculatedVw1 = 92 / (chars1 * 0.44)
        const maxVw1 = 5.2
        const finalVw1 = Math.min(maxVw1, calculatedVw1)
        line1.style.fontSize = `${(vw * finalVw1) / 100}px`

        // Runtime check: check each line's scrollWidth against clientWidth
        if (line1.scrollWidth > line1.clientWidth && line1.clientWidth > 0) {
          const ratio = line1.clientWidth / line1.scrollWidth
          line1.style.fontSize = `${((vw * finalVw1) / 100) * ratio * 0.98}px`
        }
      }

      if (line2) {
        const chars2 = 10 // "FALLOW ROW"
        const calculatedVw2 = 92 / (chars2 * 0.44)
        const maxVw2 = 17.5
        const finalVw2 = Math.min(maxVw2, calculatedVw2)
        line2.style.fontSize = `${(vw * finalVw2) / 100}px`

        // Check scrollWidth vs clientWidth
        if (line2.scrollWidth > line2.clientWidth && line2.clientWidth > 0) {
          const ratio = line2.clientWidth / line2.scrollWidth
          line2.style.fontSize = `${((vw * finalVw2) / 100) * ratio * 0.98}px`
        }
      }

      // Verify manifesto duplicate exact bounding rect match (0px offset on all 4 edges)
      const base = manifestoBaseRef.current
      const dup = manifestoDupRef.current
      if (base && dup) {
        const baseRect = base.getBoundingClientRect()
        const dupRect = dup.getBoundingClientRect()
        const diffX = Math.abs(baseRect.left - dupRect.left)
        const diffY = Math.abs(baseRect.top - dupRect.top)
        const diffW = Math.abs(baseRect.width - dupRect.width)
        const diffH = Math.abs(baseRect.height - dupRect.height)
        if (diffX > 1 || diffY > 1 || diffW > 1 || diffH > 1) {
          dup.style.width = `${baseRect.width}px`
          dup.style.height = `${baseRect.height}px`
        }
      }
    }

    adjustPosterSize()
    window.addEventListener('resize', adjustPosterSize)
    return () => window.removeEventListener('resize', adjustPosterSize)
  }, [])

  // 3. Per-Atom Motion Budget: Single IntersectionObserver for ~200 elements
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('rev-revealed')
            // Also reveal word-inner spans if this container holds them
            const wordContainers = entry.target.querySelectorAll('.word-wrap')
            wordContainers.forEach((wc) => wc.parentElement?.classList.add('word-revealed'))
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 },
    )

    const revElements = document.querySelectorAll('[data-rev]')
    revElements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  // 4. Hero Full-Bleed Canvas: Drifting Tilled-Soil Strokes Grid
  useEffect(() => {
    const canvas = heroCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let startTime = performance.now()

    const resizeCanvas = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.resetTransform()
      ctx.scale(dpr, dpr)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const drawSoilStrokes = (now: number) => {
      const elapsed = (now - startTime) * 0.001
      const rect = canvas.getBoundingClientRect()
      const w = rect.width
      const h = rect.height

      ctx.clearRect(0, 0, w, h)

      // Grid of short strokes drifting on sines of time and index (tilled soil)
      const cols = Math.ceil(w / 36) + 2
      const rows = Math.ceil(h / 30) + 2

      ctx.lineWidth = 1.4

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c
          // Alpha between 5% and 19%
          const alphaWave = 0.05 + 0.14 * (0.5 + 0.5 * Math.sin(elapsed * 0.7 + idx * 0.12))

          const baseX = c * 36 - 18
          const baseY = r * 30 - 15

          // Sine drift
          const driftX = Math.sin(elapsed * 0.8 + r * 0.25 + c * 0.18) * 5.0
          const driftY = Math.cos(elapsed * 0.6 + r * 0.2 + c * 0.3) * 3.5

          const startX = baseX + driftX
          const startY = baseY + driftY
          const strokeLen = 14 + 6 * Math.sin(idx * 0.45)
          const angle = -0.08 + 0.05 * Math.sin(elapsed * 0.5 + idx * 0.2) // slight furrow angle

          const endX = startX + Math.cos(angle) * strokeLen
          const endY = startY + Math.sin(angle) * strokeLen

          // Alternating hot red and deep red strokes
          const isHotRed = (r + c) % 3 === 0
          ctx.strokeStyle = isHotRed
            ? `rgba(239, 73, 60, ${alphaWave.toFixed(3)})`
            : `rgba(185, 39, 37, ${(alphaWave * 0.85).toFixed(3)})`

          ctx.beginPath()
          ctx.moveTo(startX, startY)
          ctx.lineTo(endX, endY)
          ctx.stroke()
        }
      }

      animId = requestAnimationFrame(drawSoilStrokes)
    }

    animId = requestAnimationFrame(drawSoilStrokes)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  // 5. Product Cards Procedural Botanical Canvas Rendering (3/4 Aspect)
  useEffect(() => {
    PRODUCTS.forEach((prod, index) => {
      const canvas = cardCanvasRefs.current[index]
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.resetTransform()
      ctx.scale(dpr, dpr)

      const w = rect.width
      const h = rect.height
      const cx = w / 2
      const cy = h / 2

      ctx.clearRect(0, 0, w, h)

      // Background paper tint & subtle grid
      ctx.fillStyle = '#faf7ef'
      ctx.fillRect(0, 0, w, h)

      // Hairline calibration grid
      ctx.strokeStyle = 'rgba(23, 23, 23, 0.08)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(cx, 16)
      ctx.lineTo(cx, h - 16)
      ctx.moveTo(16, cy)
      ctx.lineTo(w - 16, cy)
      ctx.stroke()

      // Corner coordinate tick marks
      ctx.strokeStyle = '#ef493c'
      ctx.lineWidth = 1.2
      const tick = 6
      ctx.beginPath()
      ctx.moveTo(12, 12 + tick)
      ctx.lineTo(12, 12)
      ctx.lineTo(12 + tick, 12)
      ctx.moveTo(w - 12 - tick, 12)
      ctx.lineTo(w - 12, 12)
      ctx.lineTo(w - 12, 12 + tick)
      ctx.moveTo(12, h - 12 - tick)
      ctx.lineTo(12, h - 12)
      ctx.lineTo(12 + tick, h - 12)
      ctx.moveTo(w - 12 - tick, h - 12)
      ctx.lineTo(w - 12, h - 12)
      ctx.lineTo(w - 12, h - 12 - tick)
      ctx.stroke()

      // Procedural botanical drawing by strain type
      ctx.strokeStyle = '#171717'
      ctx.lineWidth = 1.3

      if (prod.canvasType === 'tomato') {
        // Cherokee Purple: heirloom tomato cross section locules and seed pulp chambers
        ctx.beginPath()
        ctx.ellipse(cx, cy, 64, 52, 0, 0, Math.PI * 2)
        ctx.stroke()

        // Inner concentric ribs
        ctx.beginPath()
        ctx.ellipse(cx, cy, 54, 43, 0, 0, Math.PI * 2)
        ctx.stroke()

        // Locular chambers
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI * 2) / 6
          const lx = cx + Math.cos(angle) * 30
          const ly = cy + Math.sin(angle) * 24
          ctx.beginPath()
          ctx.ellipse(lx, ly, 10, 8, angle, 0, Math.PI * 2)
          ctx.stroke()

          // Seeds inside locules
          ctx.fillStyle = '#ef493c'
          ctx.beginPath()
          ctx.arc(lx + 2, ly, 2, 0, Math.PI * 2)
          ctx.fill()
        }
      } else if (prod.canvasType === 'brassica') {
        // Black Beauty: Spiral cabbage leaf venation
        for (let r = 16; r <= 62; r += 10) {
          ctx.beginPath()
          ctx.arc(cx, cy, r, 0, Math.PI * 2)
          ctx.stroke()
        }
        for (let a = 0; a < 8; a++) {
          const angle = (a * Math.PI * 2) / 8
          ctx.beginPath()
          ctx.moveTo(cx, cy)
          ctx.lineTo(cx + Math.cos(angle) * 64, cy + Math.sin(angle) * 64)
          ctx.stroke()
        }
        ctx.fillStyle = '#ef493c'
        ctx.beginPath()
        ctx.arc(cx, cy, 4, 0, Math.PI * 2)
        ctx.fill()
      } else if (prod.canvasType === 'vine') {
        // Brandywine Sun: Botanical vine truss with calyx stars
        ctx.beginPath()
        ctx.moveTo(cx - 40, cy + 60)
        ctx.bezierCurveTo(cx - 20, cy + 10, cx + 20, cy - 20, cx + 45, cy - 60)
        ctx.stroke()

        // Calyx stars and tomatoes
        const nodes = [
          { x: cx - 25, y: cy + 30, r: 18 },
          { x: cx + 5, y: cy, r: 22 },
          { x: cx + 32, y: cy - 35, r: 16 },
        ]
        nodes.forEach((node) => {
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2)
          ctx.stroke()

          // Calyx star
          ctx.strokeStyle = '#ef493c'
          ctx.beginPath()
          for (let k = 0; k < 5; k++) {
            const ka = (k * Math.PI * 2) / 5 - Math.PI / 2
            ctx.moveTo(node.x, node.y - node.r)
            ctx.lineTo(node.x + Math.cos(ka) * (node.r * 0.7), node.y - node.r + Math.sin(ka) * (node.r * 0.7))
          }
          ctx.stroke()
          ctx.strokeStyle = '#171717'
        })
      } else if (prod.canvasType === 'carrot') {
        // Scarlet Nantes: Slender taproot with lateral fine root hairs & top fronds
        ctx.beginPath()
        ctx.moveTo(cx - 20, cy - 40)
        ctx.lineTo(cx + 20, cy - 40)
        ctx.lineTo(cx + 3, cy + 65)
        ctx.lineTo(cx - 3, cy + 65)
        ctx.closePath()
        ctx.stroke()

        // Horizontal lenticel rings
        for (let y = cy - 30; y < cy + 50; y += 12) {
          const wOff = 18 * (1 - (y - (cy - 40)) / 105)
          ctx.beginPath()
          ctx.moveTo(cx - wOff, y)
          ctx.lineTo(cx + wOff, y)
          ctx.stroke()
        }

        // Taproot tip filament
        ctx.strokeStyle = '#ef493c'
        ctx.beginPath()
        ctx.moveTo(cx, cy + 65)
        ctx.lineTo(cx + 4, cy + 82)
        ctx.stroke()
        ctx.strokeStyle = '#171717'
      } else if (prod.canvasType === 'beet') {
        // Chioggia Cylindra: Target rings
        for (let ring = 12; ring <= 60; ring += 10) {
          ctx.beginPath()
          ctx.ellipse(cx, cy, ring, ring * 0.88, 0, 0, Math.PI * 2)
          if ((ring / 10) % 2 === 0) {
            ctx.strokeStyle = '#ef493c'
          } else {
            ctx.strokeStyle = '#171717'
          }
          ctx.stroke()
        }
      } else if (prod.canvasType === 'corn') {
        // Glass Gem: Mosaic kernel grid
        const kRows = 6
        const kCols = 5
        const kw = 14
        const kh = 16
        const startX = cx - (kCols * kw) / 2
        const startY = cy - (kRows * kh) / 2

        for (let kr = 0; kr < kRows; kr++) {
          for (let kc = 0; kc < kCols; kc++) {
            const kx = startX + kc * kw + ((kr % 2) * kw) / 2
            const ky = startY + kr * kh
            ctx.beginPath()
            ctx.rect(kx, ky, kw - 2, kh - 2)
            ctx.stroke()
            if ((kr + kc) % 4 === 0) {
              ctx.fillStyle = '#ef493c'
              ctx.fillRect(kx + 3, ky + 3, kw - 8, kh - 8)
            }
          }
        }
      }

      // Specimen plate Latin label at bottom
      ctx.fillStyle = '#171717'
      ctx.font = '8px "Martian Mono", monospace'
      ctx.textAlign = 'center'
      ctx.fillText(`PL. ${prod.code} · ${prod.taxon.toUpperCase()}`, cx, h - 20)
    })
  }, [])

  // 6. Artifact Packet Center Plate Canvas (High-Detail Antique Specimen Plate)
  useEffect(() => {
    const canvas = packetCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.resetTransform()
    ctx.scale(dpr, dpr)

    const w = rect.width
    const h = rect.height
    const cx = w / 2
    const cy = h / 2

    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#f8f5ed'
    ctx.fillRect(0, 0, w, h)

    // Border inner frame
    ctx.strokeStyle = 'rgba(23, 23, 23, 0.25)'
    ctx.lineWidth = 1
    ctx.strokeRect(8, 8, w - 16, h - 16)

    // Antique crosshatching botanical specimen
    ctx.strokeStyle = '#171717'
    ctx.lineWidth = 1.3

    // Central botanical vine & heirloom tomato cross-section
    ctx.beginPath()
    ctx.ellipse(cx, cy, 48, 40, 0, 0, Math.PI * 2)
    ctx.stroke()

    ctx.beginPath()
    ctx.ellipse(cx, cy, 38, 30, 0, 0, Math.PI * 2)
    ctx.stroke()

    // 5 seed chambers with red marks
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5
      const px = cx + Math.cos(angle) * 22
      const py = cy + Math.sin(angle) * 16
      ctx.beginPath()
      ctx.arc(px, py, 6, 0, Math.PI * 2)
      ctx.stroke()

      ctx.fillStyle = '#ef493c'
      ctx.beginPath()
      ctx.arc(px + 1, py, 2, 0, Math.PI * 2)
      ctx.fill()
    }

    // Calyx stars at top
    ctx.strokeStyle = '#ef493c'
    ctx.lineWidth = 1.2
    for (let j = 0; j < 5; j++) {
      const ca = (j * Math.PI * 2) / 5 - Math.PI / 2
      ctx.beginPath()
      ctx.moveTo(cx, cy - 40)
      ctx.lineTo(cx + Math.cos(ca) * 18, cy - 40 + Math.sin(ca) * 18)
      ctx.stroke()
    }

    // Micro scale bar
    ctx.strokeStyle = '#171717'
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.moveTo(cx - 24, h - 18)
    ctx.lineTo(cx + 24, h - 18)
    ctx.moveTo(cx - 24, h - 22)
    ctx.lineTo(cx - 24, h - 14)
    ctx.moveTo(cx + 24, h - 22)
    ctx.lineTo(cx + 24, h - 14)
    ctx.stroke()

    ctx.fillStyle = '#171717'
    ctx.font = '8px "Martian Mono", monospace'
    ctx.textAlign = 'center'
    ctx.fillText('SCALE: 10MM VERIFIED', cx, h - 26)
  }, [])

  // 7. Season Band Canvas: 22 Stacked Contour Lines (Every 5th in Red)
  useEffect(() => {
    const canvas = seasonCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const startTime = performance.now()

    const resizeCanvas = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.resetTransform()
      ctx.scale(dpr, dpr)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const drawContours = (now: number) => {
      const elapsed = (now - startTime) * 0.001
      const rect = canvas.getBoundingClientRect()
      const w = rect.width
      const h = rect.height

      ctx.clearRect(0, 0, w, h)

      const lineCount = 22
      const stepY = h / (lineCount + 1)

      for (let i = 0; i < lineCount; i++) {
        const baseY = stepY * (i + 1)
        const isRed = i % 5 === 0

        ctx.beginPath()
        ctx.lineWidth = isRed ? 1.6 : 1.1
        ctx.strokeStyle = isRed ? 'rgba(239, 73, 60, 0.85)' : 'rgba(23, 23, 23, 0.22)'

        const pts = 80
        const stepX = w / pts

        for (let p = 0; p <= pts; p++) {
          const x = p * stepX
          // Stacked contour: sine of x + slower harmonic drifting on time
          const wave1 = Math.sin(x * 0.004 + elapsed * 0.7 + i * 0.32) * 14
          const wave2 = Math.sin(x * 0.0015 - elapsed * 0.4 + i * 0.18) * 22
          const y = baseY + wave1 + wave2

          if (p === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.stroke()
      }

      animId = requestAnimationFrame(drawContours)
    }

    animId = requestAnimationFrame(drawContours)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <div className="site-wrapper">
      {/* 0. Top Architectural Navigation Bar */}
      <nav className={`fallow-nav ${navOnLight ? 'nav-on-light' : ''}`} role="navigation">
        <div className="nav-brand">
          <span className="nav-logo" data-rev style={{ '--d': '40ms' } as React.CSSProperties}>
            MY <span className="mark-red">PORTFOLIO</span>
          </span>
          <span className="nav-meta" data-rev style={{ '--d': '80ms' } as React.CSSProperties}>
            BORN. 2006 · VITTHAL SINGH
          </span>
        </div>
        <div className="nav-links">
          <a href="#stage-hero" className="nav-link" data-rev style={{ '--d': '120ms' } as React.CSSProperties}>
            01 / LANDING-PAGE
          </a>
          <a href="#stage-manifesto" className="nav-link" data-rev style={{ '--d': '160ms' } as React.CSSProperties}>
            02 / MAIN
          </a>
          <a href="#stage-rail" className="nav-link" data-rev style={{ '--d': '200ms' } as React.CSSProperties}>
            03 / REPOSITORY
          </a>
          <a href="#stage-season" className="nav-link" data-rev style={{ '--d': '280ms' } as React.CSSProperties}>
            04 / ENGINEERING PHILOSOPHY
          </a>
          <a href="#band-table" className="nav-link" data-rev style={{ '--d': '320ms' } as React.CSSProperties}>
            05 / ACHIVEMENTS / EDUCATION
          </a>
        </div>
      </nav>

      {/* =========================================================================
          STAGE 1: POSTER HERO ON THREE VARIABLES (280svh on Dark Loam)
          --hero-type-y from 0 to -90px
          --hero-type-scale from 1 to 0.74
          --hero-type-alpha from 1 to 0
          drifting tilled-soil strokes canvas
          ========================================================================= */}
      <section id="stage-hero" className="stage stage-hero">
        <div className="stage-sticky">
          <canvas ref={heroCanvasRef} className="hero-canvas" />

          <div className="hero-content">
            <div className="hero-top-kicker">
              <span className="font-mono-label" data-rev style={{ '--d': '60ms' } as React.CSSProperties}>
                WEBSITE 03 PART 02
              </span>
              <span className="font-mono-label" data-rev style={{ '--d': '100ms' } as React.CSSProperties}>
                LAT 27.1767° N · LON 78.0081° E
              </span>
            </div>

            <div className="hero-lockup-container">
              <div className="hero-poster-lockup">
                <h2 ref={heroLine1Ref} className="hero-poster-line1">
                   CYBERSECURITY & AI INTIGRATION
                </h2>
                <h1 ref={heroLine2Ref} className="hero-poster-line2">
                  VITTHAL <span className="mark-red">SINGH</span>
                </h1>
              </div>
            </div>

            <div className="hero-metadata-bar">
              <div className="hero-meta-cell" data-rev style={{ '--d': '140ms' } as React.CSSProperties}>
                <span className="font-mono-label" style={{ opacity: 0.55 }}>
                  BENCHMARK
                </span>
                <span className="font-mono-label mark-red">BUILD NEXUS AI</span>
              </div>
              <div className="hero-meta-cell" data-rev style={{ '--d': '180ms' } as React.CSSProperties}>
                <span className="font-mono-label" style={{ opacity: 0.55 }}>
                  BIRTH REGISTRATION
                </span>
                <span className="font-mono-label">18-05-2006</span>
              </div>
              <div className="hero-meta-cell" data-rev style={{ '--d': '220ms' } as React.CSSProperties}>
                <span className="font-mono-label" style={{ opacity: 0.55 }}>
                  PRODUCTS
                </span>
                <span className="font-mono-label">DELIVERABILITY IN 5 DAYS</span>
              </div>
              <div className="hero-meta-cell" data-rev style={{ '--d': '260ms' } as React.CSSProperties}>
                <span className="font-mono-label" style={{ opacity: 0.55 }}>
                  PEAK WINDOW
                </span>
                <span className="font-mono-label mark-red">IN COLD WEATHER</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          STAGE 2: CLIP-WIPE MANIFESTO (260svh on Cream Ground)
          Sentence in 34% ink filled from bottom up by
          clip-path: inset(calc(100% - var(--manifesto-wipe)) 0 0)
          with whole line scaled on --manifesto-scale
          ========================================================================= */}
      <section id="stage-manifesto" className="stage stage-manifesto">
        <div className="stage-sticky">
          <div className="manifesto-header">
            <span className="font-mono-label" data-rev style={{ '--d': '60ms' } as React.CSSProperties}>
              SECTION 02 / PHILOSOPHY OF DEVELOPMENT
            </span>
            <span className="font-mono-label" data-rev style={{ '--d': '100ms' } as React.CSSProperties}>
              A DEVELOPER'S GUILD
            </span>
          </div>

         <div className="manifesto-section-container">
  {/* Left Column: The Portrait */}
  <div className="manifesto-image-wrapper">
    <img 
      src="Vitthal_Singh.jpeg" 
      alt="Vitthal Singh" 
      className="manifesto-portrait"
    />
    <div className="portrait-overlay-badge">SEC. 02 // PORTRAIT IDENTITY</div>
  </div>

  {/* Right Column: The Centered/Aligned Quote Lockup */}
  <div className="manifesto-center">
    <div className="manifesto-lockup-wrapper">
      {/* Base sentence in 34-percent ink */}
      <div ref={manifestoBaseRef} className="manifesto-sentence-base">
        INTELLIGENCE WITHOUT SECURITY IS AN ILLUSION; IN A WORLD SYNTHESIZED BY AI, CODE IS NOT JUST INFRASTRUCTURE—IT IS POWER AND SOVEREIGNTY      
        </div>

      {/* Exact duplicate in full ink clipped bottom-up */}
      <div ref={manifestoDupRef} className="manifesto-sentence-fill" aria-hidden="true">
        INTELLIGENCE WITHOUT SECURITY IS AN ILLUSION; IN A WORLD SYNTHESIZED BY AI, CODE IS NOT JUST INFRASTRUCTURE—IT IS POWER AND SOVEREIGNTY
      </div>
    </div>
  </div>
</div>

          <div className="manifesto-footer">
            <span className="font-mono-label" data-rev style={{ '--d': '140ms' } as React.CSSProperties}>
              JIIT SEC128· EST. 2009
            </span>
            <span className="font-mono-label" data-rev style={{ '--d': '180ms' } as React.CSSProperties}>
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          STAGE 3: GITHUB REPOSITORY RAIL
          Public repositories are loaded from the GitHub REST API.
          ========================================================================= */}
      <section id="stage-rail" className="stage stage-rail">
        <div className="stage-sticky">
          <div className="rail-top-furniture">
            <div>
              <span className="font-mono-label" data-rev style={{ '--d': '60ms' } as React.CSSProperties}>
                SECTION 03 / GITHUB REPOSITORIES
              </span>
              <h2 className="font-display text-4xl mt-1" data-rev style={{ '--d': '90ms' } as React.CSSProperties}>
                <SplitWords text="OPEN SOURCE WORK" baseDelay={90} />
              </h2>
            </div>
            <span className="font-mono-label" data-rev style={{ '--d': '120ms' } as React.CSSProperties}>
              {reposLoading ? '[FETCHING PUBLIC REPOSITORIES...]' : `[${githubRepos.length} PUBLIC REPOSITORIES · LATEST UPDATED FIRST]`}
            </span>
          </div>

          <div className="rail-track-outer">
            <div ref={railTrackRef} className="rail-track-inner">
              {reposLoading && (
                <div className="repo-state-card">
                  <span className="font-mono-label mark-red">GITHUB API / 001</span>
                  <h3 className="card-title">FETCHING REPOSITORIES</h3>
                  <p className="repo-description">Loading public projects from github.com/VITTHAL21singh</p>
                </div>
              )}
              {!reposLoading && reposError && (
                <div className="repo-state-card">
                  <span className="font-mono-label mark-red">CONNECTION ERROR</span>
                  <h3 className="card-title">REPOSITORIES UNAVAILABLE</h3>
                  <p className="repo-description">GitHub could not be reached. Open the profile to browse repositories directly.</p>
                  <a className="repo-link" href="https://github.com/VITTHAL21singh" target="_blank" rel="noreferrer">OPEN GITHUB PROFILE ↗</a>
                </div>
              )}
              {!reposLoading && !reposError && githubRepos.length === 0 && (
                <div className="repo-state-card">
                  <span className="font-mono-label mark-red">NO PUBLIC REPOSITORIES</span>
                  <h3 className="card-title">NOTHING TO DISPLAY</h3>
                  <a className="repo-link" href="https://github.com/VITTHAL21singh" target="_blank" rel="noreferrer">OPEN GITHUB PROFILE ↗</a>
                </div>
              )}
              {githubRepos.map((repo, index) => (
                <article
                  key={repo.id}
                  className="repo-card"
                  data-rev
                  style={{ '--d': `${Math.min(140 + index * 35, 700)}ms` } as React.CSSProperties}
                >
                  <div className="repo-card-topline">
                    <span className="font-mono-label">SPECIMEN / {String(index + 1).padStart(2, '0')}</span>
                    <span className="repo-mark">{repo.fork ? 'FORKED' : 'OPEN SOURCE'}</span>
                  </div>

                  <div className="repo-card-plate" aria-hidden="true">
                    <div className="repo-plate-grid" />
                    <span className="repo-plate-kicker">VITTHAL SINGH · GITHUB</span>
                    <span className="repo-plate-index">{String(index + 1).padStart(2, '0')}</span>
                    <span className="repo-plate-name">{repo.name.replace(/[-_]/g, ' ')}</span>
                    <span className="repo-plate-foot">REPOSITORY ARCHIVE / PUBLIC</span>
                  </div>

                  <h3 className="card-title repo-card-title">{repo.name.replace(/[-_]/g, ' ')}</h3>
                  <p className="repo-card-language">
                    <span className="repo-language">{repo.language || 'MULTI-LANGUAGE'}</span>
                    <span className="repo-description-inline">{repo.description || 'Open-source project by Vitthal Singh.'}</span>
                  </p>

                  <div className="repo-card-bottom">
                    <div className="repo-stats">
                      <span>★ {repo.stargazers_count}</span>
                      <span>⑂ {repo.forks_count}</span>
                    </div>
                    <a className="repo-link" href={repo.html_url} target="_blank" rel="noreferrer" aria-label={`View ${repo.name} on GitHub`}>EXPLORE ↗</a>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rail-meter-container">
            <div className="rail-meter-track">
              <div className="rail-meter-fill" />
            </div>
            <div className="rail-meter-labels">
              <span className="font-mono-label" style={{ opacity: 0.6 }}>
                REPOSITORY RAIL [01 – {String(Math.max(githubRepos.length, 1)).padStart(2, '0')}]
              </span>
              <a className="font-mono-label mark-red repo-profile-link" href="https://github.com/VITTHAL21singh" target="_blank" rel="noreferrer">
                VIEW FULL GITHUB PROFILE ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      
      {/* =========================================================================
          STAGE 5: PARALLAX SEASON BAND (300svh on Cream Ground)
          Background canvas with 22 stacked contour lines drifting on time
          Parallax on --season-y and --season-scale
          Headline & 3 chapters swapping cleanly on floor(progress * 3)
          ========================================================================= */}

{/* =========================================================================
    SECTION 05: ENGINEERING PHILOSOPHY
    ========================================================================= */}
<section id="stage-season" className="stage stage-season">
  <div className="stage-sticky">

    <div className="season-canvas-layer">
      <canvas ref={seasonCanvasRef} className="season-canvas" />
    </div>

    <div className="season-content-layer">
      <div className="season-heading-block">
        <div>
          <span
            className="font-mono-label"
            data-rev
            style={{ '--d': '60ms' } as React.CSSProperties}
          >
            SECTION 04 / ENGINEERING PHILOSOPHY
          </span>

          <h2
            className="season-headline"
            data-rev
            style={{ '--d': '90ms' } as React.CSSProperties}
          >
            <SplitWords
              text="THREE STAGES OF CREATION"
              baseDelay={90}
            />
          </h2>
        </div>

        <span
          className="font-mono-label mark-red"
          data-rev
          style={{ '--d': '120ms' } as React.CSSProperties}
        >
          MY APPROACH / 03 PRINCIPLES
        </span>
      </div>

      <div className="chapters-row engineering-row">

        {/* STAGE I */}
        <div
          className="chapter-cell engineering-cell"
          data-rev
          style={{ '--d': '160ms' } as React.CSSProperties}
        >
          <div className="engineering-card-top">
            <span className="font-mono-label mark-red">
              STAGE I
            </span>
            <span className="engineering-number">01</span>
          </div>

          <h3 className="chapter-title">
            DISCOVER
          </h3>

          <div className="engineering-divider" />

          <p className="chapter-body">
            Research problems, explore ideas, understand users
            and identify opportunities.
          </p>

          <div className="engineering-card-footer">
            <span className="font-mono-label">01 / RESEARCH</span>
            <span className="font-mono-label">01</span>
          </div>
        </div>

        {/* STAGE II */}
        <div
          className="chapter-cell engineering-cell"
          data-rev
          style={{ '--d': '220ms' } as React.CSSProperties}
        >
          <div className="engineering-card-top">
            <span className="font-mono-label mark-red">
              STAGE II
            </span>
            <span className="engineering-number">02</span>
          </div>

          <h3 className="chapter-title">
            ENGINEER
          </h3>

          <div className="engineering-divider" />

          <p className="chapter-body">
            Develop software, experiment with AI/ML and turn
            concepts into working systems.
          </p>

          <div className="engineering-card-footer">
            <span className="font-mono-label">02 / DEVELOPMENT</span>
            <span className="font-mono-label">02</span>
          </div>
        </div>

        {/* STAGE III */}
        <div
          className="chapter-cell engineering-cell"
          data-rev
          style={{ '--d': '280ms' } as React.CSSProperties}
        >
          <div className="engineering-card-top">
            <span className="font-mono-label mark-red">
              STAGE III
            </span>
            <span className="engineering-number">03</span>
          </div>

          <h3 className="chapter-title">
            DEPLOY
          </h3>

          <div className="engineering-divider" />

          <p className="chapter-body">
            Test, refine, document and release projects for
            real-world use.
          </p>

          <div className="engineering-card-footer">
            <span className="font-mono-label">03 / EXECUTION</span>
            <span className="font-mono-label">03</span>
          </div>
        </div>

      </div>
    </div>
  </div>
</section>

      {/* =========================================================================
          BAND 1: RULED PRICE TABLE (After the Pins, on Cream Ground)
          Strict 1px & 1.5px ink hairlines, tabular data, Anton + Martian Mono,
          red prices
          ========================================================================= */}
      {/* =========================================================================
    BAND 1: EDUCATION & ACHIEVEMENTS REGISTER
    ========================================================================= */}
<section id="band-table" className="band-section band-cream">
  <div className="band-container">

    <div className="band-kicker">
      <span
        className="font-mono-label"
        data-rev
        style={{ '--d': '60ms' } as React.CSSProperties}
      >
        SECTION 05 / EDUCATION &amp; ACHIEVEMENTS
      </span>

      <span
        className="font-mono-label mark-red"
        data-rev
        style={{ '--d': '100ms' } as React.CSSProperties}
      >
        PERSONAL RECORD / 2026
      </span>
    </div>

    <h2
      className="band-title"
      data-rev
      style={{ '--d': '120ms' } as React.CSSProperties}
    >
      <SplitWords
        text="EDUCATION &amp; ACHIEVEMENTS"
        baseDelay={120}
      />
    </h2>

    <div
      className="price-table-wrapper"
      data-rev
      style={{ '--d': '160ms' } as React.CSSProperties}
    >
      <table className="ruled-table">
        <thead>
          <tr>
            <th>CODE</th>
            <th>CATEGORY</th>
            <th>INSTITUTION / EVENT</th>
            <th>DESCRIPTION</th>
            <th>YEAR / RESULT</th>
          </tr>
        </thead>

        <tbody>
          {/* EDUCATION */}
          <tr data-rev>
            <td className="font-mono-label text-stone-500">ED-01</td>
            <td className="specimen-cell-title">EDUCATION</td>
            <td className="specimen-cell-title">
              Jaypee Institute of Information Technology
            </td>
            <td className="specimen-cell-taxon">
              Bachelor of Computer Applications (BCA)
            </td>
            <td className="font-mono-label">2025–2029</td>
          </tr>

          <tr data-rev>
            <td className="font-mono-label text-stone-500">ED-02</td>
            <td className="specimen-cell-title">EDUCATION</td>
            <td className="specimen-cell-title">
              St. Peter's College
            </td>
            <td className="specimen-cell-taxon">
              School Education
            </td>
            <td className="font-mono-label">2013–2025</td>
          </tr>

          {/* ACHIEVEMENTS */}
          <tr data-rev>
            <td className="font-mono-label text-stone-500">AC-01</td>
            <td className="specimen-cell-title mark-red">AWARD</td>
            <td className="specimen-cell-title">
              Hacktoberfest / Team OSDC
            </td>
            <td className="specimen-cell-taxon">
              Best Open Source AI Project — SyntexSentinal
            </td>
            <td className="font-mono-label mark-red">
              WINNER
              <a
                href="https://lnkd.in/p/gQTuaKuR"
                target="_blank"
                rel="noopener noreferrer"
                className="record-link"
              >
                VIEW RECORD ↗
              </a>
            </td>
          </tr>

          <tr data-rev>
            <td className="font-mono-label text-stone-500">AC-02</td>
            <td className="specimen-cell-title mark-red">HACKATHON</td>
            <td className="specimen-cell-title">
              DTU SynapseAI Hackathon
            </td>
            <td className="specimen-cell-taxon">
              Vallam_AI — AI-powered Vallam Kali race prediction
            </td>
            <td className="font-mono-label mark-red">
              TOP 61 TEAMS
              <a
                href="https://lnkd.in/p/gBG82gEu"
                target="_blank"
                rel="noopener noreferrer"
                className="record-link"
              >
                VIEW RECORD ↗
              </a>
            </td>
          </tr>

          {/* EXPERIENCE */}
          <tr data-rev>
            <td className="font-mono-label text-stone-500">EX-01</td>
            <td className="specimen-cell-title">LEADERSHIP</td>
            <td className="specimen-cell-title">
              INNOVATION JIIT
            </td>
            <td className="specimen-cell-taxon">
              Management Lead · Noida, Uttar Pradesh
            </td>
            <td className="font-mono-label">
              SEP 2025–PRESENT
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div className="record-footer" data-rev>
      <span className="font-mono-label">
        VITTHAL SINGH / ACADEMIC &amp; PROFESSIONAL RECORD
      </span>
    </div>

  </div>
</section>
      {/* =========================================================================
          BAND 3: DARK LOAM FOOTER
          Dark loam ground (#241a12), massive Anton wordmark, 0-radius newsletter
          dispatch form, colophon, lat/long, seed treaty declaration
          ========================================================================= */}
      
{/* =========================================================================
    BAND 3: PORTFOLIO CONTACT FOOTER
    ========================================================================= */}
<footer className="fallow-footer">
  <div className="band-container">

    {/* TOP FOOTER */}
    <div className="footer-top-grid">

      {/* LEFT: PERSONAL BRANDING */}
      <div className="footer-brand-column">
        <div
          className="footer-wordmark"
          data-rev
          style={{ '--d': '60ms' } as React.CSSProperties}
        >
          VITTHAL <span className="mark-red">SINGH</span>
        </div>

        <p
          className="font-mono-label footer-description"
          data-rev
          style={{ '--d': '100ms' } as React.CSSProperties}
        >
          BUILDING SOFTWARE, EXPLORING AI,
          SOLVING PROBLEMS AND TURNING IDEAS
          INTO WORKING SYSTEMS.
        </p>

        <span className="font-mono-label footer-location">
          BASED IN NOIDA, INDIA
        </span>
      </div>

      {/* RIGHT: CONTACT */}
      <div
        className="footer-contact-box"
        data-rev
        style={{ '--d': '140ms' } as React.CSSProperties}
      >
        <span className="font-mono-label mark-red">
          FINAL SECTION / GET IN TOUCH
        </span>

        <h2 className="footer-contact-heading">
          HAVE AN IDEA?
          <br />
          <span className="mark-red">LET'S BUILD IT.</span>
        </h2>

        <p className="font-body text-stone-300 text-sm footer-contact-copy">
          Open to collaborations, hackathons, interesting
          projects and opportunities to build something meaningful.
        </p>

        <a
          href="mailto:vitthalsingh74530@gmail.com"
          className="footer-email-button"
        >
          LET'S TALK <span>↗</span>
        </a>

        <span className="font-mono-label footer-email-address">
          vitthalsingh74530@gmail.com
        </span>
      </div>
    </div>

    {/* SOCIAL LINKS */}
    <div className="footer-social-section">
      <span className="font-mono-label footer-section-label">
        DIGITAL PRESENCE / FIND ME ONLINE
      </span>

      <div className="footer-social-links">
        <a
          href="https://github.com/VITTHAL21singh"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-social-link"
        >
          <span>GITHUB</span>
          <span>↗</span>
        </a>

        <a
          href="https://www.linkedin.com/in/vitthal-singh-a62a56385/"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-social-link"
        >
          <span>LINKEDIN</span>
          <span>↗</span>
        </a>

        <a
          href="mailto:vitthalsingh74530@gmail.com"
          className="footer-social-link"
        >
          <span>EMAIL</span>
          <span>↗</span>
        </a>
      </div>
    </div>

    {/* BOTTOM COLOPHON */}
    <div className="footer-bottom-grid">

      <div data-rev>
        <span className="font-mono-label footer-muted">
          IDENTITY
        </span>
        <p className="font-mono-label mt-2">
          VITTHAL SINGH<br />
          DEVELOPER &amp; BUILDER<br />
          NOIDA, INDIA
        </p>
      </div>

      <div data-rev>
        <span className="font-mono-label footer-muted">
          TECHNICAL INTERESTS
        </span>
        <p className="font-mono-label mt-2">
          ARTIFICIAL INTELLIGENCE<br />
          SOFTWARE DEVELOPMENT<br />
          CYBERSECURITY
        </p>
      </div>

      <div data-rev>
        <span className="font-mono-label footer-muted">
          TYPOGRAPHY
        </span>
        <p className="font-mono-label mt-2">
          ANTON / DISPLAY<br />
          INTER / BODY<br />
          MARTIAN MONO / LABELS
        </p>
      </div>

      <div data-rev>
        <span className="font-mono-label footer-muted">
          COPYRIGHT
        </span>
        <p className="font-mono-label mt-2">
          INDEPENDENT PORTFOLIO<br />
          DESIGNED &amp; DEVELOPED BY<br />
          © 2026 VITTHAL SINGH
        </p>
      </div>

    </div>

    {/* BACK TO TOP */}
    <div className="footer-last-line">
      <span className="font-mono-label footer-muted">
        END OF TRANSMISSION / 001
      </span>

      <a href="#stage-hero" className="footer-back-top">
        BACK TO TOP ↑
      </a>
    </div>

  </div>
</footer>

    </div>
  )
}
