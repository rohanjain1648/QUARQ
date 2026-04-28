'use client'

import { SignUp } from '@clerk/nextjs'
import { useState, useEffect } from 'react'

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
        <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    )
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M13.5 8.5a5.5 5.5 0 01-6-6A5.5 5.5 0 108 14a5.5 5.5 0 005.5-5.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
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

function QMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <path d="M 68 50 A 24 24 0 1 1 54.1 28.3" stroke="#f0ece6" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 62 62 L 72 71" stroke="#f0ece6" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="67" cy="33" r="6" fill="#c9a461">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

function clerkAppearance(theme: 'dark' | 'light') {
  const dark = theme === 'dark'
  const card = dark ? 'rgba(15,15,20,0.85)' : 'rgba(255,255,255,0.88)'
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const textPrimary = dark ? '#f0ece6' : '#1a1a1a'
  const textSecondary = dark ? 'rgba(240,236,230,0.7)' : 'rgba(26,26,26,0.65)'
  const textTertiary = dark ? 'rgba(240,236,230,0.45)' : 'rgba(26,26,26,0.4)'
  const input = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
  return {
    elements: {
      rootBox: { width: '100%', maxWidth: '420px' },
      card: { background: card, border: `1px solid ${border}`, boxShadow: dark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.08)', borderRadius: '16px', backdropFilter: 'blur(20px)' },
      headerTitle: { color: textPrimary },
      headerSubtitle: { color: textTertiary },
      formFieldLabel: { color: textSecondary },
      formFieldInput: { background: input, border: `1px solid ${border}`, color: textPrimary, borderRadius: '10px' },
      formButtonPrimary: { background: '#c9a461', color: '#0a0a0f', fontWeight: '600', borderRadius: '10px' },
      footerActionLink: { color: '#c9a461' },
      footerActionText: { color: textTertiary },
      footer: { background: card, borderTop: `1px solid ${border}` },
      footerAction: { background: card },
      footerPages: { background: card },
      footerPagesLink: { color: textTertiary },
      identityPreviewText: { color: textSecondary },
      dividerLine: { background: border },
      dividerText: { color: textTertiary },
      socialButtonsBlockButton: { background: input, border: `1px solid ${border}`, color: textPrimary, borderRadius: '10px' },
    },
  }
}

export default function SignUpPage() {
  const { theme, toggle: toggleTheme } = useTheme()

  return (
    <div className="page-container" style={{ overflowY: 'auto' }}>
      <AuroraBackground />

      <a href="/" style={{
        position: 'fixed', top: '24px', left: '24px', zIndex: 100,
        display: 'flex', alignItems: 'center', gap: '8px',
        color: 'var(--text-tertiary)', fontSize: '13px', fontFamily: 'var(--font-mono)',
        transition: 'color 0.2s',
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back
      </a>

      <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 100 }}>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          <ThemeIcon theme={theme} />
        </button>
      </div>

      <div className="auth-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '24px', padding: '80px 16px 40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <QMark size={52} />
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            Create your Quarq agent
          </p>
        </div>

        <SignUp appearance={clerkAppearance(theme)} fallbackRedirectUrl="/setup" />
      </div>
    </div>
  )
}
