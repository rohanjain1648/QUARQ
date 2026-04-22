'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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

export default function AuthPage() {
  const router = useRouter()
  const { theme, toggle: toggleTheme } = useTheme()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      if (mode === 'signup') {
        const { error: signupError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: name } },
        })
        if (signupError) throw signupError

        // Update display_name in profiles
        if (name) {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            await supabase.from('profiles').update({ display_name: name }).eq('id', user.id)
          }
        }

        router.push('/setup')
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
        if (loginError) throw loginError

        // Check if profile has agent_name set (already went through setup)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('agent_name')
            .eq('id', user.id)
            .single()

          router.push(profile?.agent_name ? '/chat' : '/setup')
        } else {
          router.push('/setup')
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <AuroraBackground />

      <a href="/" style={{
        position: 'fixed', top: '24px', left: '24px', zIndex: 100,
        display: 'flex', alignItems: 'center', gap: '8px',
        color: 'var(--text-tertiary)', fontSize: '13px', fontFamily: 'var(--font-mono)',
        transition: 'color 0.2s',
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back
      </a>

      <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 100 }}>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          <ThemeIcon theme={theme} />
        </button>
      </div>

      <div className="auth-container">
        <div className="auth-card animate-in">
          <div className="auth-logo">
            <QMark size={52} />
          </div>

          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h1 className="heading-lg" style={{ marginBottom: '6px' }}>
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="body-sm">
              {mode === 'login'
                ? 'Sign in to continue to your Quarq agent'
                : 'Start building your cognitive AI agent'}
            </p>
          </div>

          <div className="auth-tabs">
            <button className={`auth-tab ${mode === 'login' ? 'auth-tab-active' : ''}`} onClick={() => { setMode('login'); setError('') }} type="button" id="auth-tab-login">Log In</button>
            <button className={`auth-tab ${mode === 'signup' ? 'auth-tab-active' : ''}`} onClick={() => { setMode('signup'); setError('') }} type="button" id="auth-tab-signup">Sign Up</button>
          </div>

          {error && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              color: '#f87171',
              marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

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
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-tertiary)' }}>
            {mode === 'login'
              ? <>Don&apos;t have an account? <button type="button" onClick={() => { setMode('signup'); setError('') }} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>Sign up</button></>
              : <>Already have an account? <button type="button" onClick={() => { setMode('login'); setError('') }} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>Log in</button></>
            }
          </p>
        </div>
      </div>
    </div>
  )
}
