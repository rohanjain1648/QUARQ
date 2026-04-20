'use client'

import { useEffect, useRef, useState } from 'react'

/* ═══════════════════════════════════════════════════════
   PARTICLE CANVAS — Dark-themed with amber connections
   ═══════════════════════════════════════════════════════ */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const particles: { x: number; y: number; vx: number; vy: number; r: number; o: number }[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        o: Math.random() * 0.3 + 0.05,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201,164,97,${p.o * 0.3})`
        ctx.fill()
      })
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(201,164,97,${0.06 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="particle-canvas" />
}

/* ═══════════════════════════════════════════════════════
   Q-MARK SVG
   ═══════════════════════════════════════════════════════ */
function QMark({ size = 40, className = '' }: { size?: number; className?: string }) {
  const scale = size / 60
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" className={className}>
      <path
        d="M 42 30 A 16 16 0 1 1 32.8 15.1"
        stroke="var(--text-primary)"
        strokeWidth={5 / scale > 10 ? 10 : Math.max(5, 8 * scale)}
        strokeLinecap="round"
        strokeLinejoin="round"
        transform={`scale(${scale})`}
        style={{ transformOrigin: 'center' }}
      />
      <path
        d="M 38.5 40 L 45 45.5"
        stroke="var(--text-primary)"
        strokeWidth={5 / scale > 10 ? 10 : Math.max(5, 8 * scale)}
        strokeLinecap="round"
        strokeLinejoin="round"
        transform={`scale(${scale})`}
        style={{ transformOrigin: 'center' }}
      />
      <circle cx={41 * scale} cy={19 * scale} r={4 * scale} fill="#c9a461" />
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════
   QUARQ FULL LOGO SVG — Theme Aware
   ═══════════════════════════════════════════════════════ */
function QuarqLogo({ height = 24 }: { height?: number }) {
  return (
    <svg 
      viewBox="0 0 340 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      style={{ height, width: 'auto' }}
    >
      <path 
        d="M 78 50 A 30 30 0 1 1 60.6 22.7" 
        stroke="var(--text-primary)" 
        strokeWidth="10" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M 71 69 L 83 79" 
        stroke="var(--text-primary)" 
        strokeWidth="10" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <circle cx="77" cy="32" r="7" fill="#c9a461"/>
      <text 
        x="108" 
        y="68" 
        fontFamily="'Space Grotesk', system-ui, sans-serif" 
        fontSize="52" 
        fontWeight="600" 
        letterSpacing="-0.03em" 
        fill="var(--text-primary)"
      >
        Quarq
      </text>
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════
   THEME TOGGLE HOOK
   ═══════════════════════════════════════════════════════ */
function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('quarq_theme') as 'dark' | 'light' | null
    const initial = saved || 'dark'
    setTheme(initial)
    document.documentElement.setAttribute('data-theme', initial)
  }, [])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('quarq_theme', next)
  }

  return { theme, toggle }
}

/* ═══════════════════════════════════════════════════════
   THEME TOGGLE ICON
   ═══════════════════════════════════════════════════════ */
function ThemeIcon({ theme }: { theme: string }) {
  if (theme === 'light') {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    )
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M13.5 8.5a5.5 5.5 0 01-6-6A5.5 5.5 0 108 14a5.5 5.5 0 005.5-5.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════════════════════ */
function Nav({ theme, onToggleTheme }: { theme: string; onToggleTheme: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
    if (!isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
    document.body.style.overflow = 'unset'
  }

  return (
    <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
      <div className="nav-pill">
        <a href="/" className="nav-logo" onClick={closeMenu}>
          <QuarqLogo height={24} />
        </a>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#architecture">Architecture</a>
          <a href="#why-quarq">Why Quarq</a>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            id="theme-toggle-nav"
          >
            <ThemeIcon theme={theme} />
          </button>
          <a href="/auth" className="nav-cta">Get Started</a>
          
          <button 
            className={`hamburger ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-inner">
          <div className="mobile-menu-links">
            <a href="#features" onClick={closeMenu}>Features</a>
            <a href="#architecture" onClick={closeMenu}>Architecture</a>
            <a href="#why-quarq" onClick={closeMenu}>Why Quarq</a>
            <a href="/auth" className="mobile-menu-cta" onClick={closeMenu}>Get Started</a>
          </div>
        </div>
      </div>
    </nav>
  )
}

/* ═══════════════════════════════════════════════════════
   AURORA BACKGROUND
   ═══════════════════════════════════════════════════════ */
function AuroraBackground() {
  return (
    <div className="aurora-bg">
      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      <div className="aurora-blob aurora-blob-3" />
      <div className="aurora-blob aurora-blob-4" />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   Q-MARK ORBIT HERO
   ═══════════════════════════════════════════════════════ */
function QMarkOrbit() {
  return (
    <div className="qmark-orbit">
      <div className="qmark-ring qmark-ring-1">
        <div className="qmark-ring-dot" />
      </div>
      <div className="qmark-ring qmark-ring-2">
        <div className="qmark-ring-dot" style={{ top: 'auto', bottom: '-3px' }} />
      </div>
      <div className="qmark-center">
        <QMark size={48} />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════ */
export default function Home() {
  const { theme, toggle: toggleTheme } = useTheme()

  return (
    <div className="page-container">
      <AuroraBackground />
      <ParticleCanvas />
      <Nav theme={theme} onToggleTheme={toggleTheme} />

      {/* ─── JSON-LD ─── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          'name': 'Quarq',
          'url': 'https://quarq.io',
          'description': 'Cognitive AI agents with three-tier memory that learn, remember, and evolve with you.',
          'applicationCategory': 'AIApplication',
          'operatingSystem': 'Web',
          'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        })}}
      />

      {/* ═══ HERO ═══ */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge animate-in">
            <span className="hero-badge-dot" />
            <span className="hero-badge-text">Now in Private Beta</span>
          </div>

          <QMarkOrbit />

          <h1 className="display-xl gradient-text hero-title animate-in animate-delay-1" style={{ marginBottom: '8px' }}>
            Every AI today is a session.
          </h1>
          <h2 className="display-lg gradient-text-amber hero-title animate-in animate-delay-2" style={{ marginBottom: '28px' }}>
            Quarq is a presence.
          </h2>
          <p className="hero-subtitle animate-in animate-delay-3">
            The cognitive AI agent that learns your patterns, remembers your context, 
            and evolves with every conversation. Not just memory — a living understanding.
          </p>
          <div className="hero-ctas animate-in animate-delay-4">
            <a href="/auth" className="btn-primary" id="hero-get-started">
              <span>Get Started</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3.5 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
            <a href="#architecture" className="btn-secondary" id="hero-learn-more">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v7M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>Learn More</span>
            </a>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="section" id="features">
        <div className="container">
          <div className="section-header animate-in">
            <p className="section-label">Core Capabilities</p>
            <h2 className="section-title gradient-text">Three layers of continual learning.</h2>
            <p className="section-subtitle">
              Quarq doesn&apos;t use one memory approach. It uses all three. Different patterns belong in
              different places. Quarq routes between them automatically.
            </p>
          </div>

          <div className="features-grid">
            {/* Feature 1 */}
            <div className="glass-card animate-in animate-delay-1" id="feature-memory">
              <div className="feature-icon">🧠</div>
              <h3 className="feature-title">Cognitive Memory</h3>
              <p className="feature-text">
                Three-tier architecture: Semantic memory for facts, Episodic memory for experiences, 
                and Procedural memory for behavioral rules. Each optimized for what it does best.
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                <span className="tag">Semantic</span>
                <span className="tag">Episodic</span>
                <span className="tag">Procedural</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="glass-card animate-in animate-delay-2" id="feature-learning">
              <div className="feature-icon">🔄</div>
              <h3 className="feature-title">Continual Learning</h3>
              <p className="feature-text">
                Every conversation makes your agent smarter. It learns new facts, updates existing knowledge, 
                and resolves contradictions autonomously — all in the background, zero latency.
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                <span className="tag">Background Learning</span>
                <span className="tag">Auto-Update</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="glass-card animate-in animate-delay-3" id="feature-skills">
              <div className="feature-icon">🛠️</div>
              <h3 className="feature-title">Extensible Skills</h3>
              <p className="feature-text">
                Plug-and-play tool system with progressive disclosure. Email, Calendar, and custom skills 
                are auto-discovered. Add a new skill by dropping in a folder — zero config.
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                <span className="tag-amber tag">Email</span>
                <span className="tag-amber tag">Calendar</span>
                <span className="tag-amber tag">Custom</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ARCHITECTURE ═══ */}
      <section className="section" id="architecture">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Architecture</p>
            <h2 className="section-title gradient-text">The Four-Loop Cognitive Engine.</h2>
            <p className="section-subtitle">
              Every message flows through four specialized loops. The first two generate your response. 
              The other two run silently in the background — learning, optimizing, evolving.
            </p>
          </div>

          <div className="arch-flow">
            {/* Loop 1 */}
            <div className="arch-node animate-in animate-delay-1">
              <div className="arch-node-header">
                <div className="arch-node-label">
                  <div className="arch-node-dot" />
                  <span className="mono-label" style={{ color: 'var(--accent)', margin: 0 }}>Loop 1</span>
                </div>
                <span className="tag-amber tag">Blocks Response</span>
              </div>
              <h3 className="arch-node-title">Memory Retrieval</h3>
              <p className="arch-node-desc">
                Fires three concurrent searches across semantic, episodic, and procedural memory. 
                LLM-filtered retrieval — the model decides what&apos;s relevant, not keyword matching.
              </p>
            </div>

            <div className="arch-connector">
              <div className="arch-connector-line" />
              <div className="arch-connector-arrow" />
            </div>

            {/* Loop 2 */}
            <div className="arch-node animate-in animate-delay-2">
              <div className="arch-node-header">
                <div className="arch-node-label">
                  <div className="arch-node-dot" />
                  <span className="mono-label" style={{ color: 'var(--accent)', margin: 0 }}>Loop 2</span>
                </div>
                <span className="tag-amber tag">Blocks Response</span>
              </div>
              <h3 className="arch-node-title">Cognitive Reasoning</h3>
              <p className="arch-node-desc">
                Builds a context-rich system prompt with prioritized memory. Generates response, then 
                passes through a procedural compliance gate to enforce behavioral rules.
              </p>
            </div>

            <div className="arch-connector">
              <div className="arch-connector-line" />
              <div className="arch-connector-arrow" />
            </div>

            {/* Response sent */}
            <div style={{ 
              textAlign: 'center', 
              padding: '16px', 
              background: 'var(--accent-dim)', 
              border: '1px solid var(--accent-border)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '0'
            }} className="animate-in animate-delay-3">
              <span className="mono-label" style={{ color: 'var(--accent)', margin: 0, fontSize: '12px' }}>
                ⚡ Response Sent to User
              </span>
            </div>

            <div className="arch-connector">
              <div className="arch-connector-line" />
              <div className="arch-connector-arrow" />
            </div>

            {/* Loop 3 & 4 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="arch-node animate-in animate-delay-4">
                <div className="arch-node-header">
                  <div className="arch-node-label">
                    <div className="arch-node-dot" style={{ background: 'var(--success)' }} />
                    <span className="mono-label" style={{ color: 'var(--success)', margin: 0 }}>Loop 3</span>
                  </div>
                  <span className="tag">Background</span>
                </div>
                <h3 className="arch-node-title">Learning</h3>
                <p className="arch-node-desc">
                  Analyzes every interaction. Learns new facts, updates existing knowledge, fires and forgets.
                </p>
              </div>

              <div className="arch-node animate-in animate-delay-5">
                <div className="arch-node-header">
                  <div className="arch-node-label">
                    <div className="arch-node-dot" style={{ background: 'var(--info)' }} />
                    <span className="mono-label" style={{ color: 'var(--info)', margin: 0 }}>Loop 4</span>
                  </div>
                  <span className="tag">Periodic</span>
                </div>
                <h3 className="arch-node-title">Context Engineering</h3>
                <p className="arch-node-desc">
                  Every 10 turns: deduplicates, merges, resolves contradictions, rewrites for retrieval.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WHY QUARQ — COMPARISON ═══ */}
      <section className="section" id="why-quarq">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Why Quarq</p>
            <h2 className="section-title gradient-text">Memory vs. Continual Learning.</h2>
            <p className="section-subtitle">
              Every AI assistant today resets when you close the tab. They store notes.
              They retrieve fragments. They don&apos;t grow. Quarq is built differently.
            </p>
          </div>

          <div className="comparison-grid">
            <div className="comparison-card comparison-card-others animate-in animate-delay-1">
              <p className="comparison-label" style={{ color: 'var(--danger)' }}>
                Today&apos;s AI Assistants
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  'Every session starts from zero',
                  'Memory is just stored text fragments',
                  'No relationship, only isolated sessions',
                  'Database-based "memory"',
                  'Retrieval-based recall only',
                  'Static server controls orchestration',
                ].map((item) => (
                  <div key={item} className="comparison-item">
                    <span className="comparison-icon" style={{ color: 'var(--danger)' }}>✗</span>
                    <span className="comparison-text">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="comparison-card comparison-card-quarq animate-in animate-delay-2">
              <p className="comparison-label" style={{ color: 'var(--accent)' }}>
                Quarq
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  'Continuous. Never resets.',
                  'Behavioral fingerprint baked into the model',
                  'A presence, not a session',
                  'Hybrid memory: weights + DB + context',
                  'Learns your patterns, not just your facts',
                  'Dynamic cognitive engine controls orchestration',
                ].map((item) => (
                  <div key={item} className="comparison-item">
                    <span className="comparison-icon" style={{ color: 'var(--accent)' }}>✓</span>
                    <span className="comparison-text">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ALWAYS ON ═══ */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Always On</p>
            <h2 className="section-title gradient-text">Your AI is always running.</h2>
            <p className="section-subtitle">Not when you open an app. Always.</p>
          </div>

          <div className="features-grid">
            <div className="glass-card animate-in animate-delay-1">
              <div className="feature-icon">📡</div>
              <h3 className="feature-title">Persistent Runtime</h3>
              <p className="feature-text">
                Quarq runs in the background, continuously processing and learning. 
                No cold starts, no context loading, no warmup time.
              </p>
            </div>
            <div className="glass-card animate-in animate-delay-2">
              <div className="feature-icon">👁️</div>
              <h3 className="feature-title">Ambient Awareness</h3>
              <p className="feature-text">
                It observes patterns across your interactions: how you write, what you prioritize, 
                when you&apos;re focused vs. scattered.
              </p>
            </div>
            <div className="glass-card animate-in animate-delay-3">
              <div className="feature-icon">🌐</div>
              <h3 className="feature-title">Cross-Platform</h3>
              <p className="feature-text">
                One agent, every surface. Web, Telegram, and more coming. 
                Your Quarq is the same presence everywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BOTTOM CTA ═══ */}
      <section className="section" style={{ paddingBottom: '60px' }}>
        <div className="container">
          <div className="glass-card-amber glass-card" style={{ 
            maxWidth: '640px', 
            margin: '0 auto', 
            textAlign: 'center',
            padding: 'clamp(32px, 5vw, 56px) clamp(24px, 5vw, 48px)',
          }}>
            <QMarkOrbit />
            <h2 className="display-md gradient-text-amber" style={{ marginBottom: '16px' }}>
              Be the first to experience Quarq.
            </h2>
            <p className="body-lg" style={{ marginBottom: '36px', maxWidth: '460px', margin: '0 auto 36px' }}>
              We&apos;re building the AI agent that actually grows with you — cognitive memory, 
              behavioral fingerprinting, and a presence that never resets.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/auth" className="btn-primary" id="cta-get-started">
                Get Early Access
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3.5 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
            </div>
            <p className="body-sm" style={{ marginTop: '16px' }}>Limited spots · Private beta</p>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <QuarqLogo height={20} />
            <span className="footer-tagline">AI that knows you.</span>
          </div>
          <div className="footer-links">
            <a href="https://x.com/QuarqLabs" target="_blank" rel="noopener noreferrer" className="footer-link">X</a>
            <a href="https://github.com/quarqlabs" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              id="theme-toggle-footer"
            >
              <ThemeIcon theme={theme} />
            </button>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-legal">
            <a href="#" className="footer-legal-link">Terms of Service</a>
            <a href="#" className="footer-legal-link">Privacy Policy</a>
            <a href="#" className="footer-legal-link">Cookie Policy</a>
            <a href="#" className="footer-legal-link">Contact</a>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>© 2026 Quarq Labs. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}
