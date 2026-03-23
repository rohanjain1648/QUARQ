'use client'

import { useState, useEffect, useRef } from 'react'
import { RefreshCw, FileText, Unlink, Brain, Database, Zap, Mic, Eye, Layers, GitBranch, X, Github, Menu } from 'lucide-react'

// ─── PARTICLE CANVAS ───────────────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    let animId: number
    const pts: { x: number; y: number; vx: number; vy: number }[] = []
    const N = 60

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < N; i++) {
      pts.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < N; i++) {
        const p = pts[i]
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(79,110,247,0.5)'
        ctx.fill()
        for (let j = i + 1; j < N; j++) {
          const q = pts[j]
          const dx = p.x - q.x, dy = p.y - q.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 120) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = `rgba(79,110,247,${0.15 * (1 - d / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ opacity: 0.6 }} />
}

// ─── WAITLIST FORM ─────────────────────────────────────────────────────────────
function WaitlistForm({ variant = 'hero' }: { variant?: 'hero' | 'cta' }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) { setStatus('done'); setMsg(data.message || 'You\'re on the list!') }
      else { setStatus('error'); setMsg(data.error || 'Something went wrong.') }
    } catch { setStatus('error'); setMsg('Network error. Try again.') }
  }

  const isHero = variant === 'hero'
  return status === 'done' ? (
    <p className={`${isHero ? 'text-lg' : 'text-base'} text-[#4F6EF7] font-medium`}>✓ {msg}</p>
  ) : (
    <form onSubmit={submit} className={`flex ${isHero ? 'flex-col sm:flex-row' : 'flex-col sm:flex-row'} gap-3`}>
      <input
        type="email" required value={email} onChange={e => setEmail(e.target.value)}
        placeholder="you@example.com"
        className={`flex-1 bg-white/5 border border-white/10 rounded-lg px-4 ${isHero ? 'py-3 text-base' : 'py-3 text-sm'} text-white placeholder:text-white/30 focus:outline-none focus:border-[#4F6EF7]/60 transition-colors`}
      />
      <button type="submit" disabled={status === 'loading'}
        className={`${isHero ? 'px-6 py-3 text-base' : 'px-6 py-3 text-sm'} bg-[#4F6EF7] hover:bg-[#3D5CE5] disabled:opacity-60 text-white font-semibold rounded-lg transition-all duration-200 whitespace-nowrap`}>
        {status === 'loading' ? 'Joining...' : isHero ? 'Get Early Access' : 'Request Access'}
      </button>
      {status === 'error' && <p className="text-red-400 text-sm">{msg}</p>}
    </form>
  )
}

// ─── NAV ───────────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5' : ''}`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#" className="text-[#4F6EF7] font-bold text-xl tracking-tight">Quarq</a>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          <a href="#why-quarq" className="hover:text-white transition-colors">Why Quarq</a>
          <a href="#team" className="hover:text-white transition-colors">Team</a>
        </div>
        <a href="#waitlist" className="hidden md:block px-4 py-2 bg-[#4F6EF7] hover:bg-[#3D5CE5] text-white text-sm font-semibold rounded-lg transition-colors">
          Join Waitlist
        </a>
        <button onClick={() => setOpen(!open)} className="md:hidden text-white/60 hover:text-white">
          <Menu size={20} />
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-[#0A0A0A]/95 backdrop-blur-md border-t border-white/5 px-6 py-4 flex flex-col gap-4 text-sm">
          <a href="#how-it-works" onClick={() => setOpen(false)} className="text-white/60 hover:text-white">How it works</a>
          <a href="#why-quarq" onClick={() => setOpen(false)} className="text-white/60 hover:text-white">Why Quarq</a>
          <a href="#team" onClick={() => setOpen(false)} className="text-white/60 hover:text-white">Team</a>
          <a href="#waitlist" onClick={() => setOpen(false)} className="text-[#4F6EF7] font-semibold">Join Waitlist →</a>
        </div>
      )}
    </nav>
  )
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <main className="bg-[#0A0A0A] text-white">
      <Nav />

      {/* SECTION 2: HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <ParticleCanvas />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A]/20 to-[#0A0A0A]" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#4F6EF7]/10 border border-[#4F6EF7]/20 rounded-full text-[#4F6EF7] text-xs font-medium mb-10 tracking-wide uppercase">
            Coming soon · Private beta
          </div>
          <h1 className="font-[var(--font-playfair)] text-5xl sm:text-6xl md:text-7xl leading-tight mb-4">
            Every AI today is a session.
          </h1>
          <h1 className="font-[var(--font-playfair)] text-5xl sm:text-6xl md:text-7xl leading-tight text-[#4F6EF7] mb-8">
            Quarq is a presence.
          </h1>
          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            An always-on AI that learns who you are — not from notes, but from its weights.
            Your behavioral fingerprint, baked into the model itself.
          </p>
          <div className="max-w-lg mx-auto mb-4">
            <WaitlistForm variant="hero" />
          </div>
          <p className="text-white/25 text-sm">Be among the first. No spam. No noise.</p>
        </div>
      </section>

      {/* SECTION 3: THE PROBLEM */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Every conversation starts from zero.</h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">AI assistants are powerful. But they don't know you. They never will — unless we fix the architecture.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <RefreshCw size={22} />, title: 'Stateless by design', desc: 'Cursor, ChatGPT, Claude — every session resets. Your preferences, your patterns, your context: gone.' },
              { icon: <FileText size={22} />, title: 'Memory is just notes', desc: 'Mem0, Supermemory, Letta — they store what you said. But reading about you isn\'t the same as knowing you.' },
              { icon: <Unlink size={22} />, title: 'Sessions, not relationships', desc: 'AI assistants are powerful tools. But tools don\'t grow with you. Relationships do.' },
            ].map((c, i) => (
              <div key={i} className="glass rounded-2xl p-8 hover:border-white/15 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-lg bg-[#4F6EF7]/10 flex items-center justify-center text-[#4F6EF7] mb-5 group-hover:bg-[#4F6EF7]/20 transition-colors">{c.icon}</div>
                <h3 className="font-semibold text-lg mb-3">{c.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: HOW IT WORKS */}
      <section id="how-it-works" className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Three layers. One presence.</h2>
            <p className="text-white/40 text-lg max-w-2xl mx-auto">Quarq uses a three-tier memory architecture — each layer optimized for what it stores best.</p>
          </div>
          <div className="relative flex flex-col gap-0">
            {[
              { icon: <Brain size={24} />, label: 'Behavioral Layer', tier: 'Model Weights (SLM)', badge: 'Continual LoRA fine-tuning', desc: 'Your communication style, decision patterns, and implicit preferences — baked directly into the model. No retrieval needed. The model just is this way.', color: '#4F6EF7' },
              { icon: <Database size={24} />, label: 'Knowledge Layer', tier: 'Memory Database', badge: 'Semantic knowledge graph', desc: 'Facts, events, relationships, documents. Structured and searchable. Fast tier for recent access, slow tier for deep history.', color: '#6B7EF7' },
              { icon: <Zap size={24} />, label: 'Working Memory', tier: 'Context Window', badge: 'Real-time', desc: 'The active session — current task, pointers to what matters now. Small, focused, purposeful.', color: '#F59E0B' },
            ].map((t, i) => (
              <div key={i} className="relative">
                <div className="glass rounded-2xl p-8 hover:border-white/15 glow-blue transition-all duration-300 group">
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: t.color + '15', color: t.color }}>{t.icon}</div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: t.color }}>{t.label}</span>
                        <span className="text-xs text-white/30">·</span>
                        <span className="text-white/50 text-sm">{t.tier}</span>
                        <span className="ml-auto px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: t.color + '15', color: t.color }}>{t.badge}</span>
                      </div>
                      <p className="text-white/55 text-sm leading-relaxed">{t.desc}</p>
                    </div>
                  </div>
                </div>
                {i < 2 && (
                  <div className="flex justify-center my-1">
                    <div className="w-px h-6 bg-gradient-to-b from-[#4F6EF7]/40 to-[#4F6EF7]/10" />
                  </div>
                )}
              </div>
            ))}
            <p className="text-center text-white/35 text-sm mt-8 italic">The SLM routes between all three — because it knows you.</p>
          </div>
        </div>
      </section>

      {/* SECTION 5: THE DIFFERENCE */}
      <section id="why-quarq" className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Memory vs. Knowing.</h2>
            <p className="text-white/40 text-lg">There's a fundamental difference between reading about someone and knowing them.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Others */}
            <div className="glass rounded-2xl p-8 border-red-500/10">
              <div className="text-red-400/70 text-xs font-semibold uppercase tracking-widest mb-4">Others — Context injection</div>
              <ul className="space-y-3 mb-6">
                {['Reads your history before every session', 'Stores notes. Retrieves them.', 'Hits a ceiling as context grows', 'Stateless at the core'].map((t, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-white/40 text-sm">
                    <span className="text-red-400/50 mt-0.5">✗</span>{t}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2 text-xs text-white/20 border-t border-white/5 pt-4">
                {['ChatGPT', 'Cursor', 'Letta', 'Mem0', 'Supermemory'].map(n => <span key={n} className="px-2 py-1 bg-white/5 rounded">{n}</span>)}
              </div>
            </div>
            {/* Quarq */}
            <div className="rounded-2xl p-8 border border-[#4F6EF7]/30 bg-[#4F6EF7]/5 glow-blue">
              <div className="text-[#4F6EF7] text-xs font-semibold uppercase tracking-widest mb-4">Quarq — Weight-based learning</div>
              <ul className="space-y-3 mb-6">
                {['Internalizes your patterns into model weights', "Doesn't read about you. Knows you.", 'Improves over every interaction', 'Presence at the core'].map((t, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-white/80 text-sm">
                    <span className="text-[#4F6EF7] mt-0.5">✓</span>{t}
                  </li>
                ))}
              </ul>
              <blockquote className="border-t border-[#4F6EF7]/20 pt-4 text-white/40 text-xs italic">
                "Letta builds smarter notes. Quarq builds genuine memory."
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: WHY NOW */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">The timing is right.</h2>
            <p className="text-white/40 text-lg">Three converging shifts make Quarq possible today.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: '1M', label: 'Context windows hit 1M tokens', desc: 'Long enough to hold everything in a session. Perfect for flushing to weight training after.' },
              { num: '7B', label: 'SLMs are small enough for on-device', desc: '7B parameter models run on modern phones. Your AI, your device, your data.' },
              { num: '∞', label: 'Continual learning is solvable', desc: 'LoRA adapter versioning, EWC, experience replay — the research is catching up to the vision.' },
            ].map((c, i) => (
              <div key={i} className="glass rounded-2xl p-8 text-center hover:border-white/15 transition-all">
                <div className="text-5xl font-bold text-[#4F6EF7] mb-4 font-[var(--font-playfair)]">{c.num}</div>
                <h3 className="font-semibold mb-3 text-base">{c.label}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: ALWAYS ON */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-3">Your AI should be there when you need it.</h2>
            <p className="text-[#F59E0B]/80 text-xl font-medium">Not when you open an app.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { icon: <Mic size={22} />, title: 'Always Listening', desc: 'Push-to-talk. "Quarq, did you hear that?" — your AI is in the room with you.', color: '#4F6EF7' },
              { icon: <Eye size={22} />, title: 'Always Watching', desc: 'Visual context via wearables. "Quarq, did you see that?" — see what you see.', color: '#6B7EF7' },
              { icon: <Layers size={22} />, title: 'Cross-Modal', desc: 'Voice, vision, text — unified. One agent, every modality.', color: '#F59E0B' },
              { icon: <GitBranch size={22} />, title: 'Cross-Session', desc: 'Your Telegram, your meetings, your code reviews — one continuous context.', color: '#F59E0B' },
            ].map((f, i) => (
              <div key={i} className="glass rounded-2xl p-8 hover:border-white/15 transition-all group">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-colors" style={{ background: f.color + '15', color: f.color }}>{f.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: FOUNDER */}
      <section id="team" className="py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-16">Built by someone who ships.</h2>
          <div className="glass rounded-2xl p-10 glow-blue text-left flex flex-col sm:flex-row gap-8 items-start">
            <div className="w-16 h-16 rounded-2xl bg-[#4F6EF7]/20 flex items-center justify-center text-[#4F6EF7] font-bold text-2xl font-[var(--font-playfair)] flex-shrink-0">VK</div>
            <div>
              <div className="font-bold text-xl mb-1">Vaibhav Khanna</div>
              <div className="text-[#4F6EF7] text-sm mb-4">Founder, Quarq</div>
              <p className="text-white/55 text-sm leading-relaxed mb-6">
                Built BlockFlow at IIT Roorkee. Wrote smart contracts handling billions in TVL.
                Acquired by Fluid/InstaDapp at 23. Now building the personal AI I always wanted.
              </p>
              <div className="flex items-center gap-4">
                <a href="https://x.com/0xvk__" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors">
                  <X size={15} /> @0xvk__
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9: WAITLIST CTA */}
      <section id="waitlist" className="py-28 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="glass rounded-3xl p-12 border-[#4F6EF7]/20 glow-blue">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Be part of what's coming.</h2>
            <p className="text-white/40 text-lg mb-8">Early access. Invite only. Builders first.</p>
            <WaitlistForm variant="cta" />
            <p className="text-white/25 text-sm mt-5">Join founders, engineers, and researchers building the future with presence AI.</p>
          </div>
        </div>
      </section>

      {/* SECTION 10: FOOTER */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-[#4F6EF7] font-bold text-lg mb-1">Quarq</div>
            <p className="text-white/25 text-xs">Every AI today is a session. Quarq is a presence.</p>
          </div>
          <div className="flex items-center gap-6 text-white/30 text-sm">
            <a href="https://x.com/0xvk__" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5"><X size={14} /> Twitter</a>
            <a href="https://github.com/vk-agent-labs" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5"><Github size={14} /> GitHub</a>
            <span className="text-white/15">© 2026 Quarq. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
