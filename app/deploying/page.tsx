'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

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
   DEPLOYMENT ANIMATION SEQUENCE
   ═══════════════════════════════════════════════════════ */
export default function DeployingPage() {
  const router = useRouter()
  const { theme, toggle: toggleTheme } = useTheme()
  const [phase, setPhase] = useState(0)
  const [agentName, setAgentName] = useState('Agent')

  // Load agent name from localStorage
  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem('quarq_agent') || '{}')
      if (data.name) setAgentName(data.name)
    } catch {
      // fallback
    }
  }, [])

  // Animation timeline
  const startSequence = useCallback(() => {
    const delays = [0, 800, 2000, 3200, 4200, 5200, 6400]
    delays.forEach((delay, i) => {
      setTimeout(() => setPhase(i), delay)
    })
    // Navigate to chat after the full sequence
    setTimeout(() => {
      router.push('/chat')
    }, 7500)
  }, [router])

  useEffect(() => {
    startSequence()
  }, [startSequence])

  const phases = [
    'Initializing cognitive architecture...',
    'Building semantic memory layer...',
    'Building episodic memory layer...',
    'Building procedural memory layer...',
    'Loading neural pathways...',
    `${agentName} is ready.`,
  ]

  return (
    <div className="page-container">
      <AuroraBackground />

      <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 100 }}>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <ThemeIcon theme={theme} />
        </button>
      </div>

      <div className="deploy-container">
        <div className="deploy-center">
          {/* Orbital Rings */}
          <div className="deploy-orbit" style={{ width: '220px', height: '220px', margin: '0 auto 56px' }}>
            {/* Ring 1 - innermost */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100px',
              height: '100px',
              margin: '-50px 0 0 -50px',
              border: '1px solid var(--glass-border)',
              borderRadius: '50%',
              opacity: phase >= 0 ? 1 : 0,
              animation: phase >= 0 ? 'orbit-spin 8s linear infinite' : 'none',
              transition: 'opacity 0.8s ease',
            }}>
              <div style={{
                position: 'absolute',
                width: '6px',
                height: '6px',
                background: 'var(--accent)',
                borderRadius: '50%',
                top: '-3px',
                left: '50%',
                marginLeft: '-3px',
                boxShadow: '0 0 10px var(--accent-glow)',
              }} />
            </div>

            {/* Ring 2 - middle */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '150px',
              height: '150px',
              margin: '-75px 0 0 -75px',
              border: '1px solid',
              borderColor: phase >= 2 ? 'var(--accent-border)' : 'var(--glass-border)',
              borderRadius: '50%',
              opacity: phase >= 1 ? 1 : 0,
              animation: phase >= 1 ? 'orbit-spin 12s linear infinite reverse' : 'none',
              transition: 'all 0.8s ease',
            }}>
              <div style={{
                position: 'absolute',
                width: '5px',
                height: '5px',
                background: phase >= 2 ? 'var(--accent)' : 'var(--text-tertiary)',
                borderRadius: '50%',
                bottom: '-2.5px',
                left: '50%',
                marginLeft: '-2.5px',
                boxShadow: phase >= 2 ? '0 0 10px var(--accent-glow)' : 'none',
                transition: 'all 0.5s ease',
              }} />
            </div>

            {/* Ring 3 - outermost */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '200px',
              height: '200px',
              margin: '-100px 0 0 -100px',
              border: '1px solid',
              borderColor: phase >= 3 ? 'var(--accent)' : 'var(--glass-border)',
              borderRadius: '50%',
              opacity: phase >= 2 ? 1 : 0,
              animation: phase >= 2 ? 'orbit-spin 16s linear infinite' : 'none',
              transition: 'all 0.8s ease',
              boxShadow: phase >= 4 ? '0 0 30px var(--accent-dim)' : 'none',
            }}>
              <div style={{
                position: 'absolute',
                width: '4px',
                height: '4px',
                background: phase >= 3 ? 'var(--accent-bright)' : 'var(--text-tertiary)',
                borderRadius: '50%',
                top: '-2px',
                right: '30%',
                boxShadow: phase >= 3 ? '0 0 8px var(--accent-glow)' : 'none',
                transition: 'all 0.5s ease',
              }} />
            </div>

            {/* Center Q-Mark */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: phase >= 0 ? 1 : 0,
              transition: 'opacity 0.5s ease',
            }}>
              <svg width="52" height="52" viewBox="0 0 100 100" fill="none">
                <path d="M 68 50 A 24 24 0 1 1 54.1 28.3" stroke="#f0ece6" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M 62 62 L 72 71" stroke="#f0ece6" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="67" cy="33" r="6" fill="#c9a461">
                  <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="r" values="5;7;5" dur="1.5s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>

            {/* Pulse ring on final phase */}
            {phase >= 5 && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '220px',
                height: '220px',
                margin: '-110px 0 0 -110px',
                border: '2px solid var(--accent)',
                borderRadius: '50%',
                animation: 'pulse-glow 2s ease-in-out infinite',
              }} />
            )}
          </div>

          {/* Phase Text */}
          <div style={{ minHeight: '60px' }}>
            {phase < phases.length && (
              <p
                key={phase}
                className="deploy-text"
                style={{
                  fontSize: phase >= 5 ? '20px' : '14px',
                  color: phase >= 5 ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  fontFamily: phase >= 5 ? 'var(--font-display)' : 'var(--font-mono)',
                  fontWeight: phase >= 5 ? 600 : 400,
                  letterSpacing: phase >= 5 ? '-0.02em' : '0.02em',
                  animation: 'text-fade-in 0.5s ease forwards',
                }}
              >
                {phases[phase]}
              </p>
            )}
          </div>

          {/* Memory Layer Indicators */}
          <div className="deploy-memory-layers" style={{ marginTop: '40px' }}>
            <div className={`deploy-layer ${phase >= 1 ? 'deploy-layer-active' : ''}`}>
              📘 Semantic
            </div>
            <div className={`deploy-layer ${phase >= 2 ? 'deploy-layer-active' : ''}`}>
              📗 Episodic
            </div>
            <div className={`deploy-layer ${phase >= 3 ? 'deploy-layer-active' : ''}`}>
              📕 Procedural
            </div>
          </div>

          {/* Progress bar */}
          <div style={{
            width: '300px',
            height: '2px',
            background: 'var(--glass-border)',
            borderRadius: '1px',
            margin: '32px auto 0',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              background: 'var(--accent-gradient)',
              borderRadius: '1px',
              width: `${Math.min((phase / 5) * 100, 100)}%`,
              transition: 'width 0.8s var(--ease-out-expo)',
              boxShadow: '0 0 8px var(--accent-glow)',
            }} />
          </div>
        </div>
      </div>
    </div>
  )
}
