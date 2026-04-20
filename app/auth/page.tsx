'use client'

import { useState, FormEvent, useEffect } from 'react'
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
   AURORA BACKGROUND (shared)
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
   Q-MARK SVG
   ═══════════════════════════════════════════════════════ */
function QMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <path d="M 68 50 A 24 24 0 1 1 54.1 28.3" stroke="#f0ece6" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M 62 62 L 72 71" stroke="#f0ece6" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="67" cy="33" r="6" fill="#c9a461">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════
   AUTH PAGE
   ═══════════════════════════════════════════════════════ */
export default function AuthPage() {
  const router = useRouter()
  const { theme, toggle: toggleTheme } = useTheme()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Mock auth — store user data in localStorage
    setTimeout(() => {
      const userData = {
        name: mode === 'signup' ? name : 'User',
        email,
        loggedIn: true,
        createdAt: new Date().toISOString(),
      }
      localStorage.setItem('quarq_user', JSON.stringify(userData))
      setLoading(false)
      router.push('/setup')
    }, 1200)
  }

  return (
    <div className="page-container">
      <AuroraBackground />

      {/* Back to home */}
      <a href="/" style={{
        position: 'fixed',
        top: '24px',
        left: '24px',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: 'var(--text-tertiary)',
        fontSize: '13px',
        fontFamily: 'var(--font-mono)',
        transition: 'color 0.2s',
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back
      </a>

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

      <div className="auth-container">
        <div className="auth-card animate-in">
          {/* Logo */}
          <div className="auth-logo">
            <QMark size={52} />
          </div>

          {/* Heading */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h1 className="heading-lg" style={{ marginBottom: '6px' }}>
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="body-sm">
              {mode === 'login' 
                ? 'Sign in to continue to your Quarq agent' 
                : 'Start building your cognitive AI agent'
              }
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === 'login' ? 'auth-tab-active' : ''}`}
              onClick={() => setMode('login')}
              type="button"
              id="auth-tab-login"
            >
              Log In
            </button>
            <button
              className={`auth-tab ${mode === 'signup' ? 'auth-tab-active' : ''}`}
              onClick={() => setMode('signup')}
              type="button"
              id="auth-tab-signup"
            >
              Sign Up
            </button>
          </div>

          {/* Social Auth */}
          <div className="auth-social">
            <button className="auth-social-btn" type="button" id="auth-google">
              <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
              Google
            </button>
            <button className="auth-social-btn" type="button" id="auth-github">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
              GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="auth-divider">
            <div className="auth-divider-line" />
            <span className="auth-divider-text">or continue with email</span>
            <div className="auth-divider-line" />
          </div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="auth-field animate-in" style={{ animationDelay: '0.05s' }}>
                <label className="auth-label" htmlFor="auth-name">Full Name</label>
                <input
                  id="auth-name"
                  type="text"
                  className="glass-input"
                  placeholder="John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-email">Email</label>
              <input
                id="auth-email"
                type="email"
                className="glass-input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                type="password"
                className="glass-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            {mode === 'signup' && (
              <div className="auth-field animate-in" style={{ animationDelay: '0.1s' }}>
                <label className="auth-label" htmlFor="auth-confirm-password">Confirm Password</label>
                <input
                  id="auth-confirm-password"
                  type="password"
                  className="glass-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
            )}

            {mode === 'login' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ accentColor: 'var(--accent)' }} />
                  Remember me
                </label>
                <button type="button" style={{ fontSize: '13px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '8px', position: 'relative' }}
              id="auth-submit"
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" style={{ animation: 'rotate-slow 1s linear infinite' }}>
                    <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="30 15" />
                  </svg>
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Bottom text */}
          <p style={{ 
            textAlign: 'center', 
            marginTop: '24px', 
            fontSize: '13px', 
            color: 'var(--text-tertiary)' 
          }}>
            {mode === 'login' 
              ? <>Don&apos;t have an account? <button type="button" onClick={() => setMode('signup')} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>Sign up</button></>
              : <>Already have an account? <button type="button" onClick={() => setMode('login')} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>Log in</button></>
            }
          </p>
        </div>
      </div>
    </div>
  )
}
