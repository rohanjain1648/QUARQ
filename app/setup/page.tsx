'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

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

function QuarqLogo({ height = 24 }: { height?: number }) {
  return (
    <svg viewBox="0 0 340 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ height, width: 'auto' }}>
      <path d="M 78 50 A 30 30 0 1 1 60.6 22.7" stroke="var(--text-primary)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M 71 69 L 83 79" stroke="var(--text-primary)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="77" cy="32" r="7" fill="#c9a461"/>
      <text x="108" y="68" fontFamily="'Space Grotesk', system-ui, sans-serif" fontSize="52" fontWeight="600" letterSpacing="-0.03em" fill="var(--text-primary)">Quarq</text>
    </svg>
  )
}

function AgentAvatar({ name, size = 80 }: { name: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const drawAvatar = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = size * 2
    canvas.height = size * 2
    ctx.scale(2, 2)

    let hash = 0
    const seedStr = name || 'Quarq'
    for (let i = 0; i < seedStr.length; i++) {
      hash = seedStr.charCodeAt(i) + ((hash << 5) - hash)
    }

    const hue = Math.abs(hash % 60) + 20
    ctx.fillStyle = `hsl(${hue}, 35%, 12%)`
    ctx.fillRect(0, 0, size, size)

    const numShapes = 5 + Math.abs(hash % 4)
    for (let i = 0; i < numShapes; i++) {
      const seed = Math.abs((hash * (i + 1) * 7919) % 10000) / 10000
      const x = seed * size
      const y = (Math.abs((hash * (i + 2) * 6271) % 10000) / 10000) * size
      const r = 4 + seed * 12
      const opacity = 0.15 + seed * 0.3

      ctx.beginPath()
      ctx.fillStyle = `hsla(${hue}, 60%, 65%, ${opacity})`

      if (i % 3 === 0) {
        ctx.arc(x, y, r, 0, Math.PI * 2)
      } else if (i % 3 === 1) {
        ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y)
      } else {
        for (let a = 0; a < 6; a++) {
          const angle = (Math.PI / 3) * a - Math.PI / 6
          const px = x + r * Math.cos(angle)
          const py = y + r * Math.sin(angle)
          if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
        }
      }
      ctx.closePath()
      ctx.fill()
    }

    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size * 0.22, 0, Math.PI * 2)
    ctx.strokeStyle = `hsla(${hue}, 55%, 60%, 0.3)`
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(size / 2, size / 2, 4, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${hue}, 65%, 65%, 0.8)`
    ctx.fill()

    ctx.strokeStyle = `hsla(${hue}, 30%, 50%, 0.06)`
    ctx.lineWidth = 0.5
    for (let g = 0; g < size; g += 8) {
      ctx.beginPath(); ctx.moveTo(g, 0); ctx.lineTo(g, size); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, g); ctx.lineTo(size, g); ctx.stroke()
    }
  }, [name, size])

  useEffect(() => { drawAvatar() }, [drawAvatar])

  return <canvas ref={canvasRef} style={{ width: size, height: size, borderRadius: 'var(--radius-md)' }} />
}

function WizardProgress({ step, total }: { step: number; total: number }) {
  const labels = ['Name', 'Personality', 'Use Cases', 'Deploy']
  return (
    <div className="wizard-progress">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="wizard-step">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className={`wizard-dot ${i + 1 === step ? 'wizard-dot-active' : ''} ${i + 1 < step ? 'wizard-dot-done' : ''}`}>
              {i + 1 < step ? '✓' : i + 1}
            </div>
            <span className={`wizard-label ${i + 1 === step ? 'wizard-label-active' : ''}`}>{labels[i]}</span>
          </div>
          {i < total - 1 && <div className={`wizard-line ${i + 1 < step ? 'wizard-line-active' : ''}`} />}
        </div>
      ))}
    </div>
  )
}

const PERSONALITIES = [
  { id: 'professional', emoji: '🎯', name: 'Professional', desc: 'Precise, formal, detail-oriented. Perfect for work tasks.' },
  { id: 'creative', emoji: '💡', name: 'Creative', desc: 'Imaginative, exploratory, expressive. Thinks outside the box.' },
  { id: 'friendly', emoji: '🤝', name: 'Friendly', desc: 'Warm, casual, encouraging. Like chatting with a friend.' },
  { id: 'technical', emoji: '🧪', name: 'Technical', desc: 'Analytical, code-focused, systematic. Built for engineers.' },
  { id: 'mentor', emoji: '🎓', name: 'Mentor', desc: 'Patient, teaching-oriented, explains concepts deeply.' },
  { id: 'custom', emoji: '🎭', name: 'Custom', desc: 'Define your own personality with a custom prompt.' },
]

const USE_CASES = [
  'Daily Assistant', 'Code Review', 'Writing Help', 'Research',
  'Email Management', 'Calendar', 'Data Analysis', 'Creative Writing',
  'Study Aid', 'Project Planning', 'Brainstorming', 'Debugging',
]

export default function SetupWizard() {
  const router = useRouter()
  const { theme, toggle: toggleTheme } = useTheme()
  const [step, setStep] = useState(1)
  const [agentName, setAgentName] = useState('')
  const [personality, setPersonality] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [useCases, setUseCases] = useState<string[]>([])
  const [customUseCase, setCustomUseCase] = useState('')
  const [slideDir, setSlideDir] = useState<'right' | 'left'>('right')
  const [deploying, setDeploying] = useState(false)
  const [deployError, setDeployError] = useState('')
  const [checking, setChecking] = useState(true)

  // If user already completed setup, skip straight to chat
  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(({ profile }) => {
        if (profile?.agent_name) {
          router.replace('/chat')
        } else {
          setChecking(false)
        }
      })
      .catch(() => setChecking(false))
  }, [])

  const goNext = () => { setSlideDir('right'); setStep(s => Math.min(s + 1, 4)) }
  const goBack = () => { setSlideDir('left'); setStep(s => Math.max(s - 1, 1)) }

  const toggleUseCase = (uc: string) => {
    setUseCases(prev => prev.includes(uc) ? prev.filter(u => u !== uc) : [...prev, uc])
  }

  const addCustomUseCase = () => {
    if (customUseCase.trim() && !useCases.includes(customUseCase.trim())) {
      setUseCases(prev => [...prev, customUseCase.trim()])
      setCustomUseCase('')
    }
  }

  const handleDeploy = async () => {
    setDeploying(true)
    setDeployError('')

    try {
        // 1. Save agent config to profiles table
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_name: agentName || 'Quarq Agent',
          agent_personality: personality || 'friendly',
          agent_use_cases: useCases,
          agent_custom_prompt: customPrompt || null,
        }),
      })

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error || 'Failed to save agent config')
      }

      // 2. Ensure a 'web' channel exists for this user
      const channelsRes = await fetch('/api/channels')
      const { channels } = await channelsRes.json()
      const hasWeb = channels?.some((c: { channel_type: string }) => c.channel_type === 'web')

      if (!hasWeb) {
        await fetch('/api/channels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channel_type: 'web' }),
        })
      }

      // Also keep localStorage in sync for the chat page to read agent name quickly
      localStorage.setItem('quarq_agent', JSON.stringify({
        name: agentName || 'Quarq Agent',
        personality: personality || 'friendly',
      }))

      router.push('/deploying')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Deployment failed.'
      setDeployError(msg)
      setDeploying(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1: return agentName.trim().length > 0
      case 2: return personality !== ''
      case 3: return useCases.length > 0
      case 4: return true
      default: return false
    }
  }

  if (checking) return null

  return (
    <div className="page-container">
      <AuroraBackground />

      <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 100 }}>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          <ThemeIcon theme={theme} />
        </button>
      </div>

      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 2, padding: '80px 24px 40px',
      }}>
        <a href="/" style={{ marginBottom: '40px' }}><QuarqLogo height={28} /></a>

        <WizardProgress step={step} total={4} />

        <div
          key={step}
          style={{
            width: '100%', maxWidth: '640px',
            animation: `${slideDir === 'right' ? 'slide-in-right' : 'slide-in-left'} 0.4s var(--ease-out-expo)`,
          }}
        >
          {/* ─── STEP 1: NAME ─── */}
          {step === 1 && (
            <div className="glass-elevated" style={{ padding: '48px 40px', borderRadius: 'var(--radius-xl)', textAlign: 'center' }}>
              <h2 className="display-md gradient-text" style={{ marginBottom: '8px' }}>Name your agent</h2>
              <p className="body-md" style={{ marginBottom: '36px' }}>Give your AI agent a name. This is how it&apos;ll introduce itself.</p>
              <input
                id="agent-name-input"
                type="text"
                className="glass-input glass-input-lg"
                placeholder="e.g., Atlas, Nova, Echo..."
                value={agentName}
                onChange={e => setAgentName(e.target.value)}
                autoFocus
                maxLength={24}
                style={{ textAlign: 'center', marginBottom: '32px' }}
              />
              {agentName && (
                <div className="animate-in" style={{ display: 'flex', justifyContent: 'center' }}>
                  <div className="agent-card" style={{ maxWidth: '320px', width: '100%' }}>
                    <div className="agent-avatar"><AgentAvatar name={agentName} size={44} /></div>
                    <div className="agent-info">
                      <div className="agent-name">{agentName}</div>
                      <div className="agent-status"><div className="agent-status-dot" /><span>Ready to configure</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── STEP 2: PERSONALITY ─── */}
          {step === 2 && (
            <div className="glass-elevated" style={{ padding: '48px 40px', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 className="display-md gradient-text" style={{ marginBottom: '8px' }}>Define personality</h2>
                <p className="body-md">Choose how {agentName || 'your agent'} communicates.</p>
              </div>
              <div className="personality-grid">
                {PERSONALITIES.map(p => (
                  <div
                    key={p.id}
                    className={`personality-card ${personality === p.id ? 'personality-card-selected' : ''}`}
                    onClick={() => setPersonality(p.id)}
                    id={`personality-${p.id}`}
                  >
                    <div className="personality-emoji">{p.emoji}</div>
                    <div className="personality-name">{p.name}</div>
                    <div className="personality-desc">{p.desc}</div>
                  </div>
                ))}
              </div>
              {personality === 'custom' && (
                <div className="animate-in" style={{ marginTop: '20px' }}>
                  <textarea
                    className="glass-textarea"
                    placeholder="Describe how you want your agent to behave..."
                    value={customPrompt}
                    onChange={e => setCustomPrompt(e.target.value)}
                    rows={4}
                    id="custom-personality-prompt"
                  />
                </div>
              )}
            </div>
          )}

          {/* ─── STEP 3: USE CASES ─── */}
          {step === 3 && (
            <div className="glass-elevated" style={{ padding: '48px 40px', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 className="display-md gradient-text" style={{ marginBottom: '8px' }}>What will you use it for?</h2>
                <p className="body-md">Select tasks {agentName || 'your agent'} might help with.</p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '24px' }}>
                {USE_CASES.map(uc => (
                  <button key={uc} className={`chip ${useCases.includes(uc) ? 'chip-selected' : ''}`} onClick={() => toggleUseCase(uc)} type="button">
                    {useCases.includes(uc) && <span style={{ fontSize: '11px' }}>✓</span>}
                    {uc}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px', maxWidth: '400px', margin: '0 auto' }}>
                <input type="text" className="glass-input" placeholder="Add your own..." value={customUseCase} onChange={e => setCustomUseCase(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomUseCase()} id="custom-usecase-input" />
                <button type="button" className="btn-secondary btn-sm" onClick={addCustomUseCase} disabled={!customUseCase.trim()}>Add</button>
              </div>
              {useCases.length > 0 && <p className="body-sm" style={{ textAlign: 'center', marginTop: '20px' }}>{useCases.length} selected</p>}
            </div>
          )}

          {/* ─── STEP 4: REVIEW & DEPLOY ─── */}
          {step === 4 && (
            <div className="glass-elevated" style={{ padding: '48px 40px', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                <h2 className="display-md gradient-text" style={{ marginBottom: '8px' }}>Review & deploy</h2>
                <p className="body-md">Everything looks good? Let&apos;s bring {agentName || 'your agent'} to life.</p>
              </div>

              <div className="glass-card glass-card-amber" style={{ maxWidth: '420px', margin: '0 auto 32px', padding: '32px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                  <AgentAvatar name={agentName} size={80} />
                </div>
                <h3 className="heading-lg" style={{ marginBottom: '8px' }}>{agentName || 'Quarq Agent'}</h3>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
                  <span className="tag-amber tag">
                    {PERSONALITIES.find(p => p.id === personality)?.emoji}{' '}
                    {PERSONALITIES.find(p => p.id === personality)?.name || 'Friendly'}
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                  {useCases.map(uc => <span key={uc} className="tag">{uc}</span>)}
                </div>
                {personality === 'custom' && customPrompt && (
                  <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', textAlign: 'left' }}>
                    <p className="mono-label" style={{ marginBottom: '6px' }}>Custom Prompt</p>
                    <p className="body-sm" style={{ color: 'var(--text-secondary)' }}>{customPrompt}</p>
                  </div>
                )}
              </div>

              {deployError && (
                <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: '#f87171', marginBottom: '16px', textAlign: 'center' }}>
                  {deployError}
                </div>
              )}

              <div style={{ textAlign: 'center' }}>
                <button className="btn-primary" onClick={handleDeploy} disabled={deploying} style={{ padding: '16px 48px', fontSize: '17px' }} id="deploy-agent-btn">
                  {deploying ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="18" height="18" viewBox="0 0 18 18" style={{ animation: 'rotate-slow 1s linear infinite' }}>
                        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="30 15" />
                      </svg>
                      Deploying...
                    </span>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 2v16M4 8l6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Deploy {agentName || 'Agent'}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '640px', marginTop: '24px' }}>
          <button className="btn-secondary btn-sm" onClick={goBack} disabled={step === 1} style={{ opacity: step === 1 ? 0.3 : 1, visibility: step === 1 ? 'hidden' : 'visible' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back
          </button>
          {step < 4 && (
            <button className="btn-primary btn-sm" onClick={goNext} disabled={!canProceed()} style={{ opacity: canProceed() ? 1 : 0.4 }} id="wizard-next-btn">
              Continue
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
