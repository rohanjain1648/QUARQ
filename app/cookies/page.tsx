'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

/* ═══════════════════════════════════════════════════════
   QUARQ LOGO SVG
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

export default function CookiesPage() {
  const { theme, toggle: toggleTheme } = useTheme()
  const router = useRouter()

  return (
    <div className="page-container">
      <nav className="nav" style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', width: 'auto', zIndex: 100 }}>
        <div className="nav-pill" style={{ padding: '8px 24px' }}>
          <a href="/" className="nav-logo">
            <QuarqLogo height={24} />
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '24px' }}>
             <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <ThemeIcon theme={theme} />
            </button>
            <a href="/auth" className="nav-cta">Get Started</a>
          </div>
        </div>
      </nav>

      <main className="section" style={{ paddingTop: '140px', minHeight: '100vh' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="animate-in">
            <h1 className="display-lg gradient-text" style={{ marginBottom: '16px' }}>Cookie Policy</h1>
            <p className="body-md" style={{ color: 'var(--text-secondary)', marginBottom: '48px' }}>Last Updated: April 28, 2026</p>
            
            <div className="glass-card" style={{ padding: '40px', borderRadius: 'var(--radius-lg)', lineHeight: '1.7' }}>
              <section style={{ marginBottom: '32px' }}>
                <h2 className="heading-md" style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>1. What are Cookies?</h2>
                <p className="body-md" style={{ color: 'var(--text-secondary)' }}>
                  Cookies are small text files that are stored on your device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the owners of the site.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 className="heading-md" style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>2. How We Use Cookies</h2>
                <p className="body-md" style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Quarq uses cookies for the following purposes:
                </p>
                <ul style={{ color: 'var(--text-secondary)', paddingLeft: '20px', listStyleType: 'disc' }}>
                  <li style={{ marginBottom: '8px' }}><strong>Authentication:</strong> We use Clerk's session cookies to keep you signed in and secure your account.</li>
                  <li style={{ marginBottom: '8px' }}><strong>Preferences:</strong> We use local storage (similar to cookies) to remember your theme choice (dark/light) and agent configuration.</li>
                  <li style={{ marginBottom: '8px' }}><strong>Performance:</strong> We may use cookies to analyze how users interact with our platform to improve performance.</li>
                </ul>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 className="heading-md" style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>3. Types of Cookies We Use</h2>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-secondary)', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                        <th style={{ textAlign: 'left', padding: '12px' }}>Category</th>
                        <th style={{ textAlign: 'left', padding: '12px' }}>Purpose</th>
                        <th style={{ textAlign: 'left', padding: '12px' }}>Provider</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                        <td style={{ padding: '12px' }}>Essential</td>
                        <td style={{ padding: '12px' }}>Authentication and security</td>
                        <td style={{ padding: '12px' }}>Clerk</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                        <td style={{ padding: '12px' }}>Functional</td>
                        <td style={{ padding: '12px' }}>Theme and UI preferences</td>
                        <td style={{ padding: '12px' }}>First-party (Local Storage)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 className="heading-md" style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>4. Managing Cookies</h2>
                <p className="body-md" style={{ color: 'var(--text-secondary)' }}>
                  Most web browsers allow you to control cookies through their settings. However, if you disable essential cookies, some features of Quarq (like staying signed in) will not function correctly.
                </p>
              </section>

              <section>
                <h2 className="heading-md" style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>5. Changes to this Policy</h2>
                <p className="body-md" style={{ color: 'var(--text-secondary)' }}>
                  We may update our Cookie Policy from time to time. Any changes will be posted on this page with an updated "Last Updated" date.
                </p>
              </section>
            </div>

            <div style={{ marginTop: '48px', textAlign: 'center' }}>
              <a href="/" className="btn-secondary">Back to Home</a>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer" style={{ borderTop: '1px solid var(--glass-border)' }}>
        <div className="footer-inner">
          <div className="footer-brand">
            <QuarqLogo height={20} />
            <span className="footer-tagline">AI that knows you.</span>
          </div>
          <div className="footer-links">
             <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>© 2026 Quarq Labs</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
