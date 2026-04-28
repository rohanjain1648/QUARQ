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

export default function TermsPage() {
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
            <h1 className="display-lg gradient-text" style={{ marginBottom: '16px' }}>Terms of Service</h1>
            <p className="body-md" style={{ color: 'var(--text-secondary)', marginBottom: '48px' }}>Last Updated: April 28, 2026</p>
            
            <div className="glass-card" style={{ padding: '40px', borderRadius: 'var(--radius-lg)', lineHeight: '1.7' }}>
              <section style={{ marginBottom: '32px' }}>
                <h2 className="heading-md" style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>1. Acceptance of Terms</h2>
                <p className="body-md" style={{ color: 'var(--text-secondary)' }}>
                  By accessing or using Quarq, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. Quarq is a product of Quarq Labs.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 className="heading-md" style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>2. Description of Service</h2>
                <p className="body-md" style={{ color: 'var(--text-secondary)' }}>
                  Quarq provides a cognitive AI agent platform that utilizes three-tier memory architecture (Semantic, Episodic, and Procedural) to learn and evolve based on user interactions. Our services are currently in Private Beta.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 className="heading-md" style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>3. User Accounts</h2>
                <p className="body-md" style={{ color: 'var(--text-secondary)' }}>
                  You must provide accurate and complete information when creating an account. You are responsible for maintaining the security of your account and for all activities that occur under your account. We use Clerk for authentication services.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 className="heading-md" style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>4. AI Learning & Memory</h2>
                <p className="body-md" style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Quarq is designed to learn from your conversations to provide a more personalized experience. By using the service, you understand and agree that:
                </p>
                <ul style={{ color: 'var(--text-secondary)', paddingLeft: '20px', listStyleType: 'disc' }}>
                  <li style={{ marginBottom: '8px' }}>Your interactions are processed by AI models to update your agent's memory layers.</li>
                  <li style={{ marginBottom: '8px' }}>The AI may generate outputs that are unexpected or factually incorrect.</li>
                  <li style={{ marginBottom: '8px' }}>You retain ownership of your input data, but grant Quarq Labs a license to process this data to provide and improve the service.</li>
                </ul>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 className="heading-md" style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>5. Prohibited Conduct</h2>
                <p className="body-md" style={{ color: 'var(--text-secondary)' }}>
                  You agree not to use Quarq for any illegal purposes, to generate harmful content, or to attempt to circumvent any security measures or limitations of the AI models.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 className="heading-md" style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>6. Termination</h2>
                <p className="body-md" style={{ color: 'var(--text-secondary)' }}>
                  We reserve the right to terminate or suspend your access to Quarq at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users or us.
                </p>
              </section>

              <section>
                <h2 className="heading-md" style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>7. Limitation of Liability</h2>
                <p className="body-md" style={{ color: 'var(--text-secondary)' }}>
                  Quarq is provided "as is" without any warranties. Quarq Labs shall not be liable for any indirect, incidental, or consequential damages arising out of your use of the service.
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
