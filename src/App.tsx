import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Center, Environment, useGLTF } from '@react-three/drei'
import type { Group, Mesh, MeshStandardMaterial } from 'three'

const INITIAL_HAND_ROTATION: [number, number, number] = [2.3, 1.0, 7.0]
const INITIAL_HAND_SCALE = 17.2
const INITIAL_HAND_LANDING: [number, number] = [0.12, 0.14]
const CONTENT_REVEAL_DELAY_MS = 2300

const projects = [
  {
    year: '2026',
    title: 'Northstar Studio',
    type: 'Brand site + booking flow',
    result: '+38% consultation requests',
  },
  {
    year: '2025',
    title: 'Ledgerly',
    type: 'SaaS dashboard redesign',
    result: '2.1x faster onboarding',
  },
  {
    year: '2025',
    title: 'Maison Vale',
    type: 'Editorial commerce experience',
    result: '+24% product discovery',
  },
]

const services = [
  'Landing pages',
  'Portfolio systems',
  'SaaS interfaces',
  'Design systems',
  'Framer builds',
  'React frontends',
]

// const heroSteps = [
//   {
//     step: '01',
//     title: 'Discover',
//   },
//   {
//     step: '02',
//     title: 'Design',
//   },
//   {
//     step: '03',
//     title: 'Build',
//   },
//   {
//     step: '04',
//     title: 'Launch',
//   },
// ]

declare global {
  interface Window {
    hand?: Group
    setHandRotation?: (x: number, y: number, z: number) => void
    setHandScale?: (scale: number) => void
    setHandLanding?: (x: number, y: number) => void
  }
}

function HeroHandModel() {
  const groupRef = useRef<Group>(null)
  const elapsedRef = useRef(0)
  const hoverAmountRef = useRef(0)
  const isHoveredRef = useRef(false)
  const baseRotationRef = useRef<[number, number, number]>(INITIAL_HAND_ROTATION)
  const landingRef = useRef<[number, number]>(INITIAL_HAND_LANDING)
  const baseScaleRef = useRef(INITIAL_HAND_SCALE)
  const { scene } = useGLTF('/model/hand.glb')

  useEffect(() => {
    scene.traverse((child) => {
      const mesh = child as Mesh

      if (!mesh.isMesh) return

      const blueSkin = mesh.material as MeshStandardMaterial
      blueSkin.color.set('#3f7df4')
      blueSkin.roughness = 0.62
      blueSkin.metalness = 0.04
    })
  }, [scene])

  useEffect(() => {
    window.hand = groupRef.current ?? undefined
    window.setHandRotation = (x: number, y: number, z: number) => {
      baseRotationRef.current = [x, y, z]
      groupRef.current?.rotation.set(x, y, z)
    }
    window.setHandScale = (scale: number) => {
      baseScaleRef.current = scale
      groupRef.current?.scale.setScalar(scale)
    }
    window.setHandLanding = (x: number, y: number) => {
      landingRef.current = [x, y]
    }

    return () => {
      delete window.hand
      delete window.setHandRotation
      delete window.setHandScale
      delete window.setHandLanding
      document.body.style.cursor = ''
    }
  }, [])

  useFrame(({ viewport, pointer }, delta) => {
    if (!groupRef.current) return

    elapsedRef.current += delta
    hoverAmountRef.current +=
      ((isHoveredRef.current ? 1 : 0) - hoverAmountRef.current) * Math.min(delta * 8, 1)

    const duration = 2.15
    const progress = Math.min(elapsedRef.current / duration, 1)
    const eased =
      progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2

    const startX = -viewport.width * 0.68
    const startY = viewport.height * 0.56
    const [landingX, landingY] = landingRef.current
    const endX = viewport.width * landingX
    const endY = viewport.height * landingY
    const idleFloat = progress === 1 ? Math.sin(elapsedRef.current * 0.75) * 0.06 : 0
    const hoverAmount = hoverAmountRef.current
    const hoverX = pointer.x * viewport.width * 0.035 * hoverAmount
    const hoverY = pointer.y * viewport.height * 0.025 * hoverAmount
    const hoverFloat = Math.sin(elapsedRef.current * 3.2) * 0.08 * hoverAmount

    groupRef.current.position.set(
      startX + (endX - startX) * eased + hoverX,
      startY + (endY - startY) * eased + idleFloat + hoverY + hoverFloat,
      0,
    )
    const [baseX, baseY, baseZ] = baseRotationRef.current
    groupRef.current.rotation.x = baseX - Math.sin(progress * Math.PI) * 0.08 + pointer.y * 0.08 * hoverAmount
    groupRef.current.rotation.y = baseY + Math.sin(elapsedRef.current * 0.42) * 0.035 + pointer.x * 0.1 * hoverAmount
    groupRef.current.rotation.z = baseZ + Math.sin(elapsedRef.current * 0.55) * 0.035 + pointer.x * 0.06 * hoverAmount
    groupRef.current.scale.setScalar(baseScaleRef.current + hoverAmount * 0.55)
  })

  return (
    <>
      <ambientLight intensity={1.15} />
      <directionalLight position={[1.5, 3.5, 4]} intensity={2.2} />
      <directionalLight position={[-3, 1, 2]} intensity={0.7} color="#dce8ff" />
      <Environment preset="studio" />
      <group
        ref={groupRef}
        rotation={INITIAL_HAND_ROTATION}
        scale={INITIAL_HAND_SCALE}
        onPointerOver={(event) => {
          event.stopPropagation()
          isHoveredRef.current = true
          document.body.style.cursor = 'grab'
        }}
        onPointerOut={() => {
          isHoveredRef.current = false
          document.body.style.cursor = ''
        }}
      >
        <Center>
          <primitive object={scene} />
        </Center>
      </group>
    </>
  )
}

useGLTF.preload('/model/hand.glb')

function BlueHand({ hasLanded }: { hasLanded: boolean }) {
  return (
    <div className={`hand-stage ${hasLanded ? 'hand-stage-landed' : ''}`} aria-hidden="true">
      <Canvas orthographic camera={{ position: [0, 0, 10], zoom: 34 }}>
        <Suspense fallback={null}>
          <HeroHandModel />
        </Suspense>
      </Canvas>
    </div>
  )
}

function Navbar({ isVisible }: { isVisible: boolean }) {
  return (
    <header
      className={`absolute inset-x-0 top-0 z-20 px-4 py-4 transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] sm:px-6 lg:px-8 ${isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-4 opacity-0'
        }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between border border-[#171411]/10 bg-[#fffaf1]/72 px-4 py-3 shadow-2xl shadow-[#171411]/8 backdrop-blur-2xl sm:px-5">
        <a href="#" className="text-sm font-bold uppercase tracking-tight text-[#171411]">
          JA
        </a>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-[#5e574d] md:flex">
          <a className="transition hover:text-[#171411]" href="#about">
            About
          </a>
          <a className="transition hover:text-[#171411]" href="#work">
            Work
          </a>
          <a className="transition hover:text-[#171411]" href="#services">
            Services
          </a>
          <a className="transition hover:text-[#171411]" href="#contact">
            Contact
          </a>
        </nav>
        <a
          href="mailto:hello@example.com"
          className="rounded-full border border-[#171411]/70 px-4 py-2 text-sm font-semibold transition hover:bg-[#171411] hover:text-[#f6f1e8]"
        >
          Book a call
        </a>
      </div>
    </header>
  )
}

function App() {
  const [isContentVisible, setIsContentVisible] = useState(false)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setIsContentVisible(true)
    }, CONTENT_REVEAL_DELAY_MS)

    return () => window.clearTimeout(timeout)
  }, [])

  const contentRevealClass = isContentVisible
    ? 'translate-y-0 opacity-100'
    : 'pointer-events-none translate-y-8 opacity-0'

  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#171411]">
      <div className="site-frame">
        <Navbar isVisible={isContentVisible} />
        <section className="relative min-h-screen overflow-hidden bg-[#dfe6dc]">
          <BlueHand hasLanded={isContentVisible} />

          <div
            className={`pointer-events-none relative z-10 grid min-h-screen content-end gap-12 px-5 pb-10 pt-32 transition-all duration-900 ease-[cubic-bezier(0.19,1,0.22,1)] sm:px-8 sm:pb-12 lg:grid-cols-[0.48fr_0.52fr] lg:px-16 ${contentRevealClass}`}
          >
            <div className="pointer-events-auto max-w-2xl pb-2 lg:pb-24">
              {/* <div className="mb-8 flex items-center gap-3">
                <div className="flex -space-x-2">
                  <span className="grid size-8 place-items-center rounded-full border border-white bg-[#171411] text-[0.65rem] font-bold text-white">
                    AJ
                  </span>
                  <span className="grid size-8 place-items-center rounded-full border border-white bg-[#3f7df4] text-[0.65rem] font-bold text-white">
                    NS
                  </span>
                  <span className="grid size-8 place-items-center rounded-full border border-white bg-[#dce8ff] text-[0.65rem] font-bold text-[#171411]">
                    LV
                  </span>
                </div>
                <p className="text-sm font-semibold text-[#5e574d]">42+ teams trust the work</p>
              </div> */}

              <h1 className="text-6xl font-semibold my-26 leading-[0.9] tracking-normal text-[#171411] sm:text-7xl lg:text-[7.4rem]">
                I create <span className="font-serif italic font-normal text-[#3f7df4]">what</span> stands out
              </h1>

              {/* <p className="mt-7 max-w-lg text-lg leading-8 text-[#5e574d]">
                Independent digital designer and frontend developer building portfolio, product, and brand sites that
                feel sharper from the first glance.
              </p>
            </div>

            <div className="pointer-events-none hidden min-h-[34rem] lg:block" aria-hidden="true" />

            <div className="grid gap-3 sm:grid-cols-4 lg:col-span-2 lg:max-w-[40rem]">
              {heroSteps.map((item) => (
                <div
                  className="border border-white/40 bg-[#fffaf1]/28 p-4 text-[#171411] shadow-sm shadow-[#171411]/5 backdrop-blur-xl"
                  key={item.step}
                >
                  <p className="text-xs font-semibold text-[#6f675c]">{item.step}</p>
                  <p className="mt-4 text-sm font-semibold">{item.title}</p>
                </div>
              ))} */}
            </div>
          </div>
        </section>

        <div
          className={`transition-all delay-150 duration-900 ease-[cubic-bezier(0.19,1,0.22,1)] ${contentRevealClass}`}
        >
          <section id="about" className="border-y border-[#d7cfc1] bg-[#f6f1e8]">
            <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.42fr_1fr] lg:px-10">
              <div className="min-h-48 border-b border-[#d7cfc1] pb-8 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-12">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#3f7df4]">About me</p>
                <div className="mt-8 h-px w-full bg-[#d7cfc1]" />
              </div>

              <div className="lg:pl-12">
                <h2 className="max-w-3xl text-5xl font-semibold leading-tight">
                  Designing interfaces with taste, motion, and a builder's eye.
                </h2>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6f675c]">
                  I am Ansh, a frontend developer and digital designer learning by building real things. I care about
                  clean layouts, sharp interactions, and websites that feel memorable without becoming noisy.
                </p>
                <p className="mt-8 max-w-3xl border-t border-[#d7cfc1] pt-8 text-2xl font-semibold leading-10">
                  I like websites that feel calm at first, then reveal a little energy when people interact with them.
                </p>
              </div>
            </div>
          </section>

          <section id="work" className="border-y border-[#d7cfc1] bg-[#fffaf1]">
            <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.35fr_1fr] lg:px-10">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#3f7df4]">Selected work</p>
                <h2 className="mt-4 text-4xl font-semibold leading-tight">Recent outcomes</h2>
              </div>

              <div className="divide-y divide-[#d7cfc1] border-t border-[#d7cfc1]">
                {projects.map((project) => (
                  <article
                    className="grid gap-5 py-8 transition hover:bg-[#f6f1e8] md:grid-cols-[0.18fr_1fr_0.6fr]"
                    key={project.title}
                  >
                    <p className="text-sm text-[#6f675c]">{project.year}</p>
                    <div>
                      <h3 className="text-3xl font-semibold">{project.title}</h3>
                      <p className="mt-2 text-[#6f675c]">{project.type}</p>
                    </div>
                    <p className="text-lg font-medium text-[#3f7df4] md:text-right">{project.result}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section
            id="services"
            className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:px-10"
          >
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#3f7df4]">Capabilities</p>
              <h2 className="mt-4 max-w-xl text-5xl font-semibold leading-tight">
                A calm process for websites that need to feel expensive.
              </h2>
            </div>
            <div className="grid content-start gap-4 sm:grid-cols-2">
              {services.map((service) => (
                <div className="border border-[#d7cfc1] bg-[#fffaf1] p-6" key={service}>
                  <p className="text-xl font-semibold">{service}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-10">
            <div className="grid gap-10 bg-[#dce8ff] p-8 sm:p-10 lg:grid-cols-[0.8fr_1.2fr]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#315fae]">Client note</p>
              <blockquote className="text-3xl font-semibold leading-tight text-[#13264a]">
                “Ansh translated a loose idea into a site that finally makes our offer feel as premium as the work
                itself.”
              </blockquote>
            </div>
          </section>

          <footer id="contact" className="bg-[#171411] text-[#f6f1e8]">
            <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_auto] lg:px-10">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#8db7ff]">Start a project</p>
                <h2 className="mt-4 max-w-3xl text-5xl font-semibold leading-tight">
                  Have a portfolio, product, or brand site that needs sharper taste?
                </h2>
              </div>
              <div className="flex flex-col justify-end gap-4 sm:flex-row lg:flex-col">
                <a
                  href="mailto:hello@example.com"
                  className="rounded-full bg-[#f6f1e8] px-6 py-3 text-center text-sm font-semibold text-[#171411] transition hover:bg-white"
                >
                  hello@example.com
                </a>
                <a
                  href="https://www.linkedin.com"
                  className="rounded-full border border-white/25 px-6 py-3 text-center text-sm font-semibold transition hover:border-white"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </main>
  )
}

export default App
