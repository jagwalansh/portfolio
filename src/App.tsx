import { useEffect, useRef, useState } from 'react'
import PointerCat from './components/PointerCat'

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

const HERO_SUBTITLE =
  'I build modern, responsive, and interactive web applications with a focus on clean design and great user experiences.'

const pageNavItems = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'services', label: 'Services' },
  { id: 'contact', label: 'Contact' },
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


function Navbar({ isVisible }: { isVisible: boolean }) {
  return (
    <header
      className={`pixel-navbar absolute inset-x-0 top-0 z-20 border-b border-[#171411]/10 bg-[var(--hero-bg)] transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-4 opacity-0'}`}
      style={{
        opacity: 'var(--hero-opacity)',
        filter: 'blur(var(--hero-blur))',
      }}
    >
      <div className="pixel-navbar-inner mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-16">
        <a href="#" className="pixel-brand text-sm font-bold uppercase tracking-tight text-[#171411]">
          JA
        </a>
        <a
          href="mailto:hello@example.com"
          className="pixel-button border border-[#171411]/70 px-4 py-2 text-sm font-semibold transition hover:bg-[#171411] hover:text-[#f6f1e8]"
        >
          Book a call
        </a>
      </div>
    </header>
  )
}

function PageRail({ activeSection }: { activeSection: string }) {
  const activeIndex = pageNavItems.findIndex((item) => item.id === activeSection)
  const railItemHeight = 3.15
  const railGap = 0.26
  const highlightOffset = activeIndex >= 0 ? activeIndex * (railItemHeight + railGap) : 0

  return (
    <nav
      className="page-rail"
      aria-label="Current page section"
      style={{ '--rail-offset': `${highlightOffset}rem` } as React.CSSProperties}
    >
      <span className="page-rail-highlight" aria-hidden="true" />
      {pageNavItems.map((item) => {
        const isActive = activeSection === item.id

        return (
          <a
            aria-current={isActive ? 'page' : undefined}
            className={`page-rail-link ${isActive ? 'page-rail-link-active' : ''}`}
            href={`#${item.id}`}
            key={item.id}
          >
            <span className="page-rail-dot" aria-hidden="true" />
            <span>{item.label}</span>
          </a>
        )
      })}
    </nav>
  )
}

function App() {
  const pageRef = useRef<HTMLDivElement>(null)
  const [isContentVisible] = useState(true)
  const [activeSection, setActiveSection] = useState(pageNavItems[0].id)

  useEffect(() => {
    const page = pageRef.current
    if (!page) return

    let frame = 0

    const updateScrollMotion = () => {
      const rawProgress = Math.min(Math.max(window.scrollY / (window.innerHeight * 1.15), 0), 1)
      const easedProgress = 1 - Math.pow(1 - rawProgress, 3)

      page.style.setProperty('--hero-opacity', String(1 - easedProgress * 0.72))
      page.style.setProperty('--hero-scale', String(1 - easedProgress * 0.055))
      page.style.setProperty('--hero-y', `${easedProgress * -5.5}vh`)
      page.style.setProperty('--hero-blur', `${easedProgress * 1.4}px`)
      page.style.setProperty('--content-y', `${(1 - easedProgress) * 16}vh`)
      page.style.setProperty('--content-shadow', String(0.18 + easedProgress * 0.2))
    }

    const requestUpdate = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(updateScrollMotion)
    }

    updateScrollMotion()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [])

  useEffect(() => {
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))

    if (!('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('is-visible'))
      return
    }

    revealItems.forEach((item, index) => {
      item.style.setProperty('--reveal-index', String(index % 4))
    })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return

          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      {
        rootMargin: '0px 0px -14% 0px',
        threshold: 0.12,
      },
    )

    revealItems.forEach((item) => observer.observe(item))

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const sectionElements = pageNavItems
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => Boolean(section))

    if (sectionElements.length === 0) return

    const updateActiveSection = () => {
      const anchorY = window.innerHeight * 0.42
      const currentSection = sectionElements.reduce((current, section) => {
        const sectionTop = section.getBoundingClientRect().top

        if (sectionTop <= anchorY) return section

        return current
      }, sectionElements[0])

      setActiveSection(currentSection.id)
    }

    updateActiveSection()
    window.addEventListener('scroll', updateActiveSection, { passive: true })
    window.addEventListener('resize', updateActiveSection)

    return () => {
      window.removeEventListener('scroll', updateActiveSection)
      window.removeEventListener('resize', updateActiveSection)
    }
  }, [])

  const contentRevealClass = isContentVisible
    ? 'translate-y-0 opacity-100'
    : 'pointer-events-none translate-y-8 opacity-0'

  return (
    <main className="min-h-screen bg-white text-[#171411]">
      <PageRail activeSection={activeSection} />
      <div className="site-frame" ref={pageRef}>
        <section id="home" className="pixel-hero min-h-screen overflow-hidden bg-[var(--hero-bg)]">
          <Navbar isVisible={isContentVisible} />

          <div
            className={`hero-content pointer-events-none relative z-10 grid min-h-screen place-items-center px-5 py-28 text-center transition-all duration-900 ease-[cubic-bezier(0.19,1,0.22,1)] sm:px-8 lg:px-16 ${contentRevealClass}`}
          >
            <div className="pointer-events-auto mx-auto max-w-2xl">
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

              <h1 className="hero-intro text-[#ebe7d5]">
                Hey, I am{' '}
                <span
                  id="hero-name"
                  className="hero-name relative inline-block"
                >
                  <PointerCat />
                  <span className="hero-name-text">Ansh Jagwal</span>
                </span>
                .
              </h1>

              <p className="hero-subtitle mx-auto mt-7">
                {HERO_SUBTITLE}
              </p>

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
          className={`overlap-content transition-all delay-150 duration-900 ease-[cubic-bezier(0.19,1,0.22,1)] ${contentRevealClass}`}
        >
          <section id="about" className="reveal-section border-y border-[#d7cfc1] bg-[#f6f1e8]" data-reveal>
            <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.42fr_1fr] lg:px-10">
              <div className="reveal-item min-h-48 border-b border-[#d7cfc1] pb-8 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-12" data-reveal>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#3f7df4]">About me</p>
                <div className="mt-8 h-px w-full bg-[#d7cfc1]" />
              </div>

              <div className="reveal-item lg:pl-12" data-reveal>
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

          <section id="work" className="reveal-section border-y border-[#d7cfc1] bg-[#fffaf1]" data-reveal>
            <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.35fr_1fr] lg:px-10">
              <div className="reveal-item" data-reveal>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#3f7df4]">Selected work</p>
                <h2 className="mt-4 text-4xl font-semibold leading-tight">Recent outcomes</h2>
              </div>

              <div className="divide-y divide-[#d7cfc1] border-t border-[#d7cfc1]">
                {projects.map((project) => (
                  <article
                    className="reveal-item grid gap-5 py-8 transition hover:bg-[#f6f1e8] md:grid-cols-[0.18fr_1fr_0.6fr]"
                    data-reveal
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
            className="reveal-section mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:px-10"
            data-reveal
          >
            <div className="reveal-item" data-reveal>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#3f7df4]">Capabilities</p>
              <h2 className="mt-4 max-w-xl text-5xl font-semibold leading-tight">
                A calm process for websites that need to feel expensive.
              </h2>
            </div>
            <div className="grid content-start gap-4 sm:grid-cols-2">
              {services.map((service) => (
                <div className="reveal-item border border-[#d7cfc1] bg-[#fffaf1] p-6" data-reveal key={service}>
                  <p className="text-xl font-semibold">{service}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="reveal-section mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-10" data-reveal>
            <div className="reveal-item grid gap-10 bg-[#dce8ff] p-8 sm:p-10 lg:grid-cols-[0.8fr_1.2fr]" data-reveal>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#315fae]">Client note</p>
              <blockquote className="text-3xl font-semibold leading-tight text-[#13264a]">
                “Ansh translated a loose idea into a site that finally makes our offer feel as premium as the work
                itself.”
              </blockquote>
            </div>
          </section>

          <footer id="contact" className="reveal-section bg-[#171411] text-[#f6f1e8]" data-reveal>
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
