import { useEffect, useRef, useState } from 'react'
import { Magnetic } from './Magnetic'

const TYPING_LINES = [
  { lyric: "I'm blinding lights on the road", artist: "The Weeknd" },
  { lyric: "Shape of you, every day discovering", artist: "Ed Sheeran" },
  { lyric: "Levitating, don't you wanna stay?", artist: "Dua Lipa" },
]

const FEATURES = [
  { icon: '♪', label: 'Sync to lyrics' },
  { icon: '⌨', label: 'Type in rhythm' },
  { icon: '🏆', label: 'Leaderboards' },
]

export function KeyverseCard() {
  const [isHovered, setIsHovered] = useState(false)
  const [typedText, setTypedText] = useState('')
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [cursorVisible, setCursorVisible] = useState(true)
  const typingInterval = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cursorInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  // Lazy-load the iframe after the page mounts to optimize performance
  const [shouldLoadIframe, setShouldLoadIframe] = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState(false)

  const currentLine = TYPING_LINES[currentLineIndex]

  useEffect(() => {
    // Start loading the iframe 1.5 seconds after mount
    const timer = setTimeout(() => {
      setShouldLoadIframe(true)
    }, 1500)

    cursorInterval.current = setInterval(() => {
      setCursorVisible((v) => !v)
    }, 530)

    return () => {
      clearTimeout(timer)
      if (cursorInterval.current) clearInterval(cursorInterval.current)
    }
  }, [])

  useEffect(() => {
    // Only animate typing when not showing the live iframe
    if (isHovered && !iframeLoaded) {
      setTypedText('')
      let charIndex = 0
      const fullText = currentLine.lyric

      const typeNext = () => {
        if (charIndex < fullText.length) {
          charIndex++
          setTypedText(fullText.slice(0, charIndex))
          const delay = 40 + Math.random() * 60
          typingInterval.current = setTimeout(typeNext, delay)
        } else {
          typingInterval.current = setTimeout(() => {
            setCurrentLineIndex((i) => (i + 1) % TYPING_LINES.length)
          }, 1200)
        }
      }

      typingInterval.current = setTimeout(typeNext, 300)
    } else {
      if (typingInterval.current) clearTimeout(typingInterval.current)
      setTypedText('')
    }

    return () => {
      if (typingInterval.current) clearTimeout(typingInterval.current)
    }
  }, [isHovered, currentLineIndex, currentLine.lyric, iframeLoaded])

  const typed = typedText
  const remaining = currentLine.lyric.slice(typed.length)

  return (
    <section className="keyverse-section mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10" data-reveal>
      <div className="keyverse-label-row mb-6 flex items-center gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#3f7df4]">Featured project</p>
        <div className="h-px flex-1 bg-[#d7cfc1]" />
      </div>

      <Magnetic>
        <a
          href="https://keyverse.me"
          target="_blank"
          rel="noopener noreferrer"
          className="keyverse-card group"
          data-cursor="Visit"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Background grid pattern */}
          <div className="keyverse-card-grid" aria-hidden="true" />

          {/* Glow effect on hover */}
          <div className="keyverse-card-glow" aria-hidden="true" />

          {/* Main content */}
          <div className="keyverse-card-content">
            {/* Left side - Info */}
            <div className="keyverse-card-info">
              <div className="keyverse-card-badge">
                <span className="keyverse-badge-dot" />
                <span>Live project</span>
              </div>

              <h3 className="keyverse-card-title">
                <span className="keyverse-title-key">key</span>
                <span className="keyverse-title-verse">Verse</span>
                <span className="keyverse-title-domain">.me</span>
              </h3>

              <p className="keyverse-card-tagline">
                Feel the rhythm in every keystroke.
              </p>

              <p className="keyverse-card-description">
                A typing game where you race to type the lyrics of songs in real time. Search your favorite tracks, lock into the beat, and type in perfect sync.
              </p>

              {/* Features */}
              <div className="keyverse-card-features">
                {FEATURES.map((f) => (
                  <div className="keyverse-feature" key={f.label}>
                    <span className="keyverse-feature-icon">{f.icon}</span>
                    <span>{f.label}</span>
                  </div>
                ))}
              </div>

              <div className="keyverse-card-cta">
                <span>Visit keyverse.me</span>
                <span className="keyverse-cta-arrow">→</span>
              </div>
            </div>

            {/* Right side - Interactive preview */}
            <div className="keyverse-card-preview">
              {/* Mini player mockup */}
              <div className="keyverse-preview-player relative">
                {/* Top bar */}
                <div className="keyverse-player-bar">
                  <div className="keyverse-player-dots">
                    <span /><span /><span />
                  </div>
                  <span className="keyverse-player-url">keyverse.me</span>
                  <div style={{ width: '2.5rem' }} />
                </div>

                {/* Body container: overlays the iframe on top of typing simulation when hovered and loaded */}
                <div className="relative overflow-hidden w-full h-[230px]">
                  {/* Iframe for the real website */}
                  {shouldLoadIframe && (
                    <iframe
                      src="https://keyverse.me"
                      title="KeyVerse.me Live Preview"
                      className={`absolute inset-0 w-[166.67%] h-[166.67%] border-0 transition-opacity duration-700 ease-in-out`}
                      style={{
                        transform: 'scale(0.6)',
                        transformOrigin: 'top left',
                        pointerEvents: 'none', // Prevents capturing scroll/clicks so parent link works
                        zIndex: 10,
                        opacity: isHovered && iframeLoaded ? 1 : 0,
                      }}
                      onLoad={() => setIframeLoaded(true)}
                    />
                  )}

                  {/* Connecting Loader when hovering and site is still loading */}
                  {isHovered && !iframeLoaded && (
                    <div 
                      className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f0e1a]/95 z-20 gap-3"
                      style={{ height: '100%' }}
                    >
                      <div className="w-8 h-8 border-2 border-[#3f7df4] border-t-transparent animate-spin rounded-full" />
                      <span className="text-[10px] uppercase tracking-[0.22em] text-[#8db7ff] font-semibold">Connecting to KeyVerse...</span>
                    </div>
                  )}

                  {/* Fallback Typing Simulation Screen */}
                  <div className="flex flex-col justify-between h-full w-full">
                    {/* Typing area */}
                    <div className="keyverse-typing-area flex-1 flex flex-col justify-center">
                      <div className="keyverse-typing-song">
                        <div className="keyverse-song-pulse" />
                        <span className="keyverse-song-artist">
                          {currentLine.artist}
                        </span>
                      </div>

                      <div className="keyverse-typing-line">
                        <span className="keyverse-typed">{typed}</span>
                        <span
                          className="keyverse-cursor"
                          style={{ opacity: cursorVisible ? 1 : 0 }}
                        />
                        <span className="keyverse-remaining">{remaining}</span>
                      </div>

                      {/* Accuracy bar */}
                      <div className="keyverse-accuracy mt-4">
                        <div className="keyverse-accuracy-bar">
                          <div
                            className="keyverse-accuracy-fill"
                            style={{
                              width: isHovered
                                ? `${Math.min((typed.length / currentLine.lyric.length) * 100, 100)}%`
                                : '0%',
                            }}
                          />
                        </div>
                        <span className="keyverse-accuracy-label">
                          {isHovered
                            ? `${Math.round((typed.length / currentLine.lyric.length) * 100)}%`
                            : 'Hover me'}
                        </span>
                      </div>
                    </div>

                    {/* Keyboard hint */}
                    <div className="keyverse-keyboard-row">
                      {['Q', 'W', 'E', 'R', 'T', 'Y'].map((k, i) => (
                        <span
                          className={`keyverse-key ${
                            isHovered && typed.length > 0 && typed[typed.length - 1]?.toUpperCase() === k
                              ? 'keyverse-key-active'
                              : ''
                          }`}
                          key={k}
                          style={{ animationDelay: `${i * 60}ms` }}
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a>
      </Magnetic>
    </section>
  )
}
