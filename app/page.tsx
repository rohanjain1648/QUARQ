'use client'

import { useEffect, useRef, useState, FormEvent } from 'react'

/* ─── Waitlist Form ─── */
function WaitlistForm({ btnLabel = 'Join Waitlist' }: { btnLabel?: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.ok) { setStatus('done'); setMsg(data.message) }
      else { setStatus('error'); setMsg(data.message || 'Something went wrong') }
    } catch {
      setStatus('error'); setMsg('Something went wrong. Try again.')
    }
  }

  if (status === 'done') return (
    <p style={{ color: '#5a8a5a', fontSize: '15px', fontWeight: 500, padding: '16px 0' }}>✓ {msg}</p>
  )

  return (
    <form className="email-form" onSubmit={submit}>
      <input
        type="email"
        className="email-input"
        placeholder="you@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        disabled={status === 'loading'}
      />
      <button type="submit" className="email-btn" disabled={status === 'loading'}>
        {status === 'loading' ? '...' : btnLabel}
      </button>
      {status === 'error' && <p style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '8px' }}>{msg}</p>}
    </form>
  )
}
import { Brain, Layers, Fingerprint, Eye, Wifi, Radio } from 'lucide-react'

/* ─── Particle Canvas ─── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let particles: { x: number; y: number; vx: number; vy: number; r: number; o: number }[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
        o: Math.random() * 0.04 + 0.01,
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
        ctx.fillStyle = `rgba(41,41,41,${p.o * 0.4})`
        ctx.fill()
      })
      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(41,41,41,${0.02 * (1 - dist / 150)})`
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

  return <canvas ref={canvasRef} className="hero-canvas" />
}

/* ─── Nav ─── */
function Nav() {
  return (
    <nav className="nav">
      <div className="nav-pill">
        <a href="#" className="nav-logo">
          <img src="/quarq-logo.svg" alt="Quarq" style={{ height: '28px', width: 'auto', display: 'block' }} />
        </a>
        <div className="nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#why-quarq">Why Quarq</a>
        </div>
        <a href="#waitlist" className="nav-cta">Join Waitlist</a>
      </div>
    </nav>
  )
}

/* ─── Section Wrapper ─── */
function Section({ id, children, className = '' }: { id?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`section ${className}`}>
      <div className="container">
        {children}
      </div>
    </section>
  )
}

/* ─── Icon wrapper for cards ─── */
function CardIcon({ children, amber = false }: { children: React.ReactNode; amber?: boolean }) {
  return (
    <div className={`card-icon ${amber ? 'card-icon-amber' : ''}`}>
      {children}
    </div>
  )
}

/* ─── Main Page ─── */
export default function Home() {
  return (
    <>
      <Nav />

      {/* ─── JSON-LD ─── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          'name': 'Quarq',
          'url': 'https://quarq.io',
          'description': 'A personal AI that grows with you through continual learning and behavioral fingerprinting.',
          'applicationCategory': 'AIApplication',
          'operatingSystem': 'Web',
          'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        })}}
      />

      {/* ─── HERO ─── */}
      <div className="hero">
        <ParticleCanvas />
        <div className="hero-gradient" />
        <div className="hero-content">
          <div className="hero-badge">Coming soon · Private beta</div>
          <h1 className="hero-title gradient-text" style={{ whiteSpace: 'nowrap' }}>
            Every AI today is a session.
          </h1>
          <h2 className="hero-title gradient-text" style={{ marginBottom: '24px' }}>
            Quarq is a presence.
          </h2>
          <p className="hero-subtitle">
            The AI that actually grows with you.
          </p>
          <div id="waitlist" style={{ scrollMarginTop: '80px' }}><WaitlistForm btnLabel="Join Waitlist" /></div>
          <p className="micro-copy">No spam. Early access only.</p>
        </div>
      </div>

      {/* ─── HOW IT WORKS ─── */}
      <Section id="how-it-works">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p className="section-label">How it works</p>
          <h2 className="section-title gradient-text">Three layers of continual learning.</h2>
          <p className="section-sub">
            Quarq doesn&apos;t use one memory approach. It uses all three. Different patterns belong in
            different places. Quarq routes between them automatically, because it knows you.
          </p>
        </div>

        {/* Step 1 */}
        <div className="card" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', marginBottom: '0' }}>
          <CardIcon><Brain size={20} /></CardIcon>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span className="tag">Step 1</span>
              <h3 className="card-title" style={{ marginBottom: 0 }}>Behavioral Fingerprinting</h3>
            </div>
            <p className="card-text">
              Quarq observes how you think, decide, and communicate. It builds a continuous behavioral model: not a list of facts, but a deep understanding of your patterns.
            </p>
          </div>
        </div>
        <div className="connector" />

        {/* Step 2 */}
        <div className="card" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', marginBottom: '0' }}>
          <CardIcon><Layers size={20} /></CardIcon>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span className="tag">Step 2</span>
              <h3 className="card-title" style={{ marginBottom: 0 }}>Hybrid Memory Routing</h3>
            </div>
            <p className="card-text">
              Not all memories are equal. Behavioral patterns get baked into weights, with zero retrieval cost.
              Explicit facts go into a structured memory database. Active context stays in the window.
              Quarq routes between all three, using each layer for exactly what it does best.
            </p>
          </div>
        </div>
        <div className="connector" />

        {/* Step 3 */}
        <div className="card" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          <CardIcon><Fingerprint size={20} /></CardIcon>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span className="tag">Step 3</span>
              <h3 className="card-title" style={{ marginBottom: 0 }}>Personal AI Assistant</h3>
            </div>
            <p className="card-text">
              Your Quarq AI assistant runs continuously: always observing, always routing, always updating.
              It decides what belongs in your weights, what belongs in your memory database, and what
              belongs in the active session. Automatically.
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontStyle: 'italic', color: 'var(--text-faint)', marginTop: '48px', fontSize: '15px', lineHeight: '1.7' }}>
          &ldquo;The best AI won&apos;t be the smartest one. It&apos;ll be the one that knows you.&rdquo;
        </p>
      </Section>

      {/* ─── MEMORY STACK VISUAL ─── */}
      <Section id="memory-stack">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p className="section-label">Architecture</p>
          <h2 className="section-title gradient-text">The Quarq Memory Stack</h2>
          <p className="section-sub">Three layers. Each optimized for what it does best. One unified presence.</p>
        </div>
        <div style={{ maxWidth: '640px', margin: '0 auto', position: 'relative' }}>
          {/* Layer 3: Context (top) */}
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '28px 32px',
            marginBottom: '0',
            position: 'relative',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a0a0a0' }} />
                <span style={{ fontSize: '11px', fontFamily: 'ui-monospace, monospace', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--text-muted)' }}>Layer 3: Context Window</span>
              </div>
              <span className="tag">Real-time</span>
            </div>
            <p style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px', letterSpacing: '-0.02em' }}>Working Memory</p>
            <p className="card-text">Active session, current task, routing index. Small, fast, purposeful. Cleared and rebuilt each session.</p>
          </div>

          {/* Arrow down */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', padding: '12px 0' }}>
            <div style={{ width: '1px', height: '20px', background: 'linear-gradient(to bottom, var(--border), transparent)' }} />
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M5 6L0 0h10L5 6z" fill="var(--text-faint)"/></svg>
          </div>

          {/* Layer 2: Memory DB (middle) */}
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '28px 32px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#909090' }} />
                <span style={{ fontSize: '11px', fontFamily: 'ui-monospace, monospace', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--text-muted)' }}>Layer 2: Memory Database</span>
              </div>
              <span className="tag">Semantic graph</span>
            </div>
            <p style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px', letterSpacing: '-0.02em' }}>Knowledge Layer</p>
            <p className="card-text">Facts, events, relationships, documents. Fast tier for recent access. Slow tier for deep history. Structured and searchable.</p>
          </div>

          {/* Arrow down */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', padding: '12px 0' }}>
            <div style={{ width: '1px', height: '20px', background: 'linear-gradient(to bottom, var(--border), transparent)' }} />
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M5 6L0 0h10L5 6z" fill="var(--text-faint)"/></svg>
          </div>

          {/* Layer 1: Weights (foundation) */}
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid #d8d0c8',
            borderRadius: '16px',
            padding: '28px 32px',
            boxShadow: '0 0 40px rgba(201,190,176,0.12)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#b8a89a', animation: 'pulse-slow 3s ease-in-out infinite' }} />
                <span style={{ fontSize: '11px', fontFamily: 'ui-monospace, monospace', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--text-muted)' }}>Layer 1: Model Weights (SLM)</span>
              </div>
              <span className="tag">Continual LoRA</span>
            </div>
            <p style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px', letterSpacing: '-0.02em' }}>Behavioral Layer: The Foundation</p>
            <p className="card-text">Your communication style, decision patterns, and implicit preferences, baked into the model itself. No retrieval. No prompting. The model <em>is</em> this way because of you.</p>

          </div>

          <p style={{ textAlign: 'center', fontStyle: 'italic', color: 'var(--text-faint)', marginTop: '32px', fontSize: '14px' }}>
            The SLM knows what&apos;s stored where, routing between all three.
          </p>
        </div>
      </Section>

      {/* ─── COMPARISON ─── */}
      <Section id="why-quarq">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p className="section-label">Why Quarq</p>
          <h2 className="section-title gradient-text">Memory vs. Continual Learning.</h2>
          <p className="section-sub">
            Every AI assistant today resets when you close the tab. They store notes.
            They retrieve fragments. They don&apos;t grow. Quarq is built differently, from the ground up, for continuity.
          </p>

        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Others */}
          <div className="comparison-card-left">
            <p style={{ fontSize: '11px', fontFamily: 'ui-monospace, monospace', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#b04040', marginBottom: '24px' }}>
              Today&apos;s AI Assistants
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                'Every session starts from zero',
                'Memory is just stored text fragments',
                'No relationship, only isolated sessions',
                'DB based "memory"',
                'Retrieval-based recall',
                'Same model for everyone',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#b04040', fontSize: '14px' }}>✗</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quarq */}
          <div className="comparison-card-right">
            <p style={{ fontSize: '11px', fontFamily: 'ui-monospace, monospace', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#8a7460', marginBottom: '24px' }}>
              Quarq
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                'Continuous. Never resets.',
                'Behavioral fingerprint baked into the model',
                'A presence, not a session',
                'Hybrid memory: weights + DB + context',
                'Learns your patterns, not just your facts',
                'Unique SLM per person',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#8a7460', fontSize: '14px' }}>✓</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ─── ALWAYS ON ─── */}
      <Section>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p className="section-label">Always on</p>
          <h2 className="section-title gradient-text">Your AI is always running.</h2>
          <p className="section-sub">
            Not when you open an app.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div className="card">
            <CardIcon amber><Radio size={20} /></CardIcon>
            <h3 className="card-title">Persistent Runtime</h3>
            <p className="card-text">
              Quarq runs in the background, continuously processing and learning.
              No cold starts, no context loading, no warmup time.
            </p>
          </div>
          <div className="card">
            <CardIcon amber><Eye size={20} /></CardIcon>
            <h3 className="card-title">Ambient Awareness</h3>
            <p className="card-text">
              It observes patterns across your digital life: how you write, what you prioritize,
              when you&apos;re focused vs. scattered.
            </p>
          </div>
          <div className="card">
            <CardIcon amber><Wifi size={20} /></CardIcon>
            <h3 className="card-title">Cross-Platform</h3>
            <p className="card-text">
              One model, every surface. Desktop, mobile, voice. Your Quarq
              is the same presence everywhere.
            </p>
          </div>
        </div>
      </Section>

      {/* ─── FOUNDER ─── */}


      {/* ─── BOTTOM CTA ─── */}
      <Section className="section-cta">
        <div className="card glow" style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center', padding: '48px 40px' }}>
          <h2 className="section-title gradient-text" style={{ fontSize: '32px', marginBottom: '12px' }}>
            Be first to experience Quarq.
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '32px' }}>
            We&apos;re building the AI assistant that actually grows with you: behavioral fingerprinting,
            hybrid memory, and a presence that never resets. Join the waitlist for early access.
          </p>
          <WaitlistForm btnLabel="Get Early Access" />
          <p className="micro-copy">Limited spots. No spam.</p>
        </div>
      </Section>

      {/* ─── FOOTER ─── */}
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <img src="/quarq-logo.svg" alt="Quarq" style={{ height: '24px', width: 'auto', display: 'block', marginBottom: '6px' }} />
            <p style={{ fontSize: '13px', color: 'var(--text-faint)' }}>AI that knows you.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <a href="https://x.com/QuarqLabs" target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              X
            </a>
            <a href="https://github.com/quarqlabs" target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              GitHub
            </a>
            <span style={{ fontSize: '13px', color: 'var(--text-faint)' }}>
              © 2026 Quarq
            </span>
          </div>
        </div>
      </footer>
    </>
  )
}
