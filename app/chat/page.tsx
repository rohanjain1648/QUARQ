'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

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
   PROCEDURAL AVATAR (same as setup)
   ═══════════════════════════════════════════════════════ */
function AgentAvatar({ name, size = 44 }: { name: string; size?: number }) {
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
    const bg = `hsl(${hue}, 35%, 12%)`
    ctx.fillStyle = bg
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
  }, [name, size])

  useEffect(() => {
    drawAvatar()
  }, [drawAvatar])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size, borderRadius: 'var(--radius-sm)' }}
    />
  )
}

/* ═══════════════════════════════════════════════════════
   MOCK AI RESPONSES
   ═══════════════════════════════════════════════════════ */
const AI_RESPONSES: Record<string, string> = {
  default: "I'm here and ready to help. I've loaded all three memory layers — semantic, episodic, and procedural — so I'll remember our conversations and learn your preferences over time. What would you like to work on?",
  hello: "Hey there! Great to connect. I'm your Quarq agent — I learn and adapt to how you work. My cognitive memory is active, so everything we discuss gets wired into my understanding of you. What's on your mind?",
  help: "Here's what I can help with:\n\n• **Daily tasks** — scheduling, reminders, planning\n• **Code review** — analyzing and improving your code\n• **Writing** — drafting, editing, brainstorming\n• **Research** — deep dives into any topic\n• **Email** — composing and managing correspondence\n\nI learn your preferences as we go. The more we interact, the better I get at anticipating what you need.",
  memory: "My memory architecture has three layers:\n\n📘 **Semantic Memory** — I store facts about you: your name, preferences, tech stack, timezone, etc.\n\n📗 **Episodic Memory** — I remember our past conversations and experiences we've shared.\n\n📕 **Procedural Memory** — I learn your rules: formatting preferences, tone requirements, things to avoid.\n\nAll three work together so I can give you truly personalized responses.",
  capabilities: "I'm built on a four-loop cognitive engine:\n\n**Loop 1** — Memory Retrieval: I search all three memory types concurrently\n**Loop 2** — Cognitive Reasoning: I generate responses with full context awareness\n**Loop 3** — Learning: Every interaction teaches me something new (runs in background)\n**Loop 4** — Context Engineering: I periodically optimize my memories for better recall\n\nI also have extensible skills — email, calendar, and more can be plugged in.",
}

function getAIResponse(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) return AI_RESPONSES.hello
  if (lower.includes('help') || lower.includes('what can you')) return AI_RESPONSES.help
  if (lower.includes('memory') || lower.includes('remember')) return AI_RESPONSES.memory
  if (lower.includes('capabilit') || lower.includes('what are you') || lower.includes('how do you work')) return AI_RESPONSES.capabilities
  return AI_RESPONSES.default
}

/* ═══════════════════════════════════════════════════════
   MESSAGE TYPES
   ═══════════════════════════════════════════════════════ */
interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: Date
  typing?: boolean
}

/* ═══════════════════════════════════════════════════════
   TYPEWRITER COMPONENT
   ═══════════════════════════════════════════════════════ */
function TypewriterText({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const [displayed, setDisplayed] = useState('')
  const indexRef = useRef(0)

  useEffect(() => {
    indexRef.current = 0
    setDisplayed('')

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1))
        indexRef.current++
      } else {
        clearInterval(interval)
        onComplete?.()
      }
    }, 12)

    return () => clearInterval(interval)
  }, [text, onComplete])

  return <span>{displayed}<span style={{ opacity: displayed.length < text.length ? 1 : 0, transition: 'opacity 0.3s' }}>▊</span></span>
}

/* ═══════════════════════════════════════════════════════
   SIMPLE MARKDOWN RENDERER
   ═══════════════════════════════════════════════════════ */
function renderMarkdown(text: string): React.ReactNode[] {
  return text.split('\n').map((line, i) => {
    // Bold
    let processed: React.ReactNode = line
    const boldParts = line.split(/\*\*(.*?)\*\*/g)
    if (boldParts.length > 1) {
      processed = boldParts.map((part, j) =>
        j % 2 === 1 ? <strong key={j} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{part}</strong> : part
      )
    }

    // Bullet points
    if (line.startsWith('• ') || line.startsWith('- ')) {
      return (
        <div key={i} style={{ display: 'flex', gap: '8px', paddingLeft: '4px', margin: '4px 0' }}>
          <span style={{ color: 'var(--accent)', flexShrink: 0 }}>•</span>
          <span>{typeof processed === 'string' ? processed.replace(/^[•\-]\s/, '') : processed}</span>
        </div>
      )
    }

    // Headers
    if (line.startsWith('## ')) {
      return <div key={i} style={{ fontWeight: 600, fontSize: '15px', margin: '12px 0 4px', color: 'var(--text-primary)' }}>{line.replace('## ', '')}</div>
    }

    // Empty lines
    if (line.trim() === '') return <div key={i} style={{ height: '8px' }} />

    return <div key={i} style={{ margin: '2px 0' }}>{processed}</div>
  })
}

/* ═══════════════════════════════════════════════════════
   TELEGRAM MODAL
   ═══════════════════════════════════════════════════════ */
function TelegramModal({ agentName, onClose }: { agentName: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const botLink = 'https://t.me/QuarqAgentBot'

  const copyLink = () => {
    navigator.clipboard.writeText(botLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
        <button className="modal-close" onClick={onClose} id="telegram-modal-close">✕</button>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          {/* Telegram icon */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2AABEE 0%, #229ED9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 0 30px rgba(42,171,238,0.3)',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
            </svg>
          </div>
          <h3 className="heading-lg" style={{ marginBottom: '8px' }}>Connect to Telegram</h3>
          <p className="body-md">
            Chat with {agentName} directly in Telegram. Your memory and personality carry over.
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
          {[
            { step: 1, text: 'Open Telegram on your phone or desktop' },
            { step: 2, text: 'Search for @QuarqAgentBot or click the link below' },
            { step: 3, text: 'Press "Start" to activate your agent' },
          ].map(({ step, text }) => (
            <div key={step} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--accent-dim)',
                border: '1px solid var(--accent-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--accent)',
                flexShrink: 0,
              }}>
                {step}
              </div>
              <p className="body-md" style={{ paddingTop: '3px' }}>{text}</p>
            </div>
          ))}
        </div>

        {/* Bot link */}
        <div style={{
          display: 'flex',
          gap: '10px',
          padding: '12px 16px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-md)',
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <span className="mono-sm" style={{ flex: 1, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {botLink}
          </span>
          <button
            className="btn-secondary btn-sm"
            onClick={copyLink}
            style={{ flexShrink: 0 }}
            id="copy-telegram-link"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>

        {/* CTA */}
        <a
          href={botLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}
          id="open-telegram-btn"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
          </svg>
          Open in Telegram
        </a>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   CHAT PAGE
   ═══════════════════════════════════════════════════════ */
export default function ChatPage() {
  const { theme, toggle: toggleTheme } = useTheme()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showTelegram, setShowTelegram] = useState(false)
  const [agentName, setAgentName] = useState('Quarq Agent')
  const [agentPersonality, setAgentPersonality] = useState('friendly')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Load agent config
  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem('quarq_agent') || '{}')
      if (data.name) setAgentName(data.name)
      if (data.personality) setAgentPersonality(data.personality)
    } catch {
      // fallback
    }

    // Welcome message
    setTimeout(() => {
      setMessages([{
        id: 'welcome',
        role: 'ai',
        content: `Hey! I'm ${agentName || 'your Quarq agent'}. My cognitive memory is online — I'll learn and remember everything as we chat. How can I help you today?`,
        timestamp: new Date(),
      }])
    }, 500)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = () => {
    const text = input.trim()
    if (!text || isTyping) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Simulate AI response delay (1-2s)
    const delay = 1000 + Math.random() * 1000
    setTimeout(() => {
      const response = getAIResponse(text)
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: response,
        timestamp: new Date(),
        typing: true,
      }
      setMessages(prev => [...prev, aiMsg])
      setIsTyping(false)
    }, delay)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const personalityEmoji: Record<string, string> = {
    professional: '🎯',
    creative: '💡',
    friendly: '🤝',
    technical: '🧪',
    mentor: '🎓',
    custom: '🎭',
  }

  // Mock chat history
  const chatHistory = [
    { id: '1', title: 'Current conversation', time: 'Now', active: true },
  ]

  return (
    <div className="chat-layout">
      {/* ═══ SIDEBAR ═══ */}
      <aside className={`chat-sidebar ${!sidebarOpen ? 'chat-sidebar-collapsed' : ''}`}>
        {/* Sidebar Header — Agent Card */}
        <div className="chat-sidebar-header">
          <div className="agent-card">
            <div className="agent-avatar">
              <AgentAvatar name={agentName} size={44} />
            </div>
            <div className="agent-info">
              <div className="agent-name">{agentName}</div>
              <div className="agent-status">
                <div className="agent-status-dot" />
                <span>Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="chat-sidebar-content">
          {/* New Chat Button */}
          <button
            className="btn-secondary"
            style={{ width: '100%', marginBottom: '16px', justifyContent: 'center', gap: '8px' }}
            id="new-chat-btn"
            onClick={() => {
              setMessages([{
                id: 'welcome-new',
                role: 'ai',
                content: `Starting a new conversation. What would you like to discuss?`,
                timestamp: new Date(),
              }])
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            New Chat
          </button>

          {/* Chat History */}
          <p className="mono-label" style={{ padding: '8px 14px', marginBottom: '4px' }}>Recent</p>
          {chatHistory.map(chat => (
            <div
              key={chat.id}
              className={`chat-history-item ${chat.active ? 'chat-history-item-active' : ''}`}
            >
              <div className="chat-history-title">{chat.title}</div>
              <div className="chat-history-time">{chat.time}</div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="chat-sidebar-footer">
          {/* Telegram Setup Button */}
          <button
            className="glass-card"
            onClick={() => setShowTelegram(true)}
            style={{
              width: '100%',
              padding: '14px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textAlign: 'left',
              border: '1px solid rgba(42,171,238,0.2)',
              background: 'rgba(42,171,238,0.05)',
            }}
            id="telegram-setup-btn"
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2AABEE 0%, #229ED9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                Setup on Telegram
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                Chat anywhere, same memory
              </div>
            </div>
          </button>

          {/* Settings Link */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', padding: '0 4px' }}>
            <span className="body-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {personalityEmoji[agentPersonality] || '🤝'} {agentPersonality.charAt(0).toUpperCase() + agentPersonality.slice(1)}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="theme-toggle"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                style={{ width: '32px', height: '32px' }}
              >
                <ThemeIcon theme={theme} />
              </button>
              <button className="btn-icon" style={{ width: '32px', height: '32px' }} id="settings-btn">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 10a2 2 0 100-4 2 2 0 000 4z" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M13.4 6.5l-.7-1.2-.2-.3.9-.9-1.1-1.1-.9.9-.3-.2-1.2-.7V2H7.1v1.5l-1.2.7-.3.2-.9-.9L3.6 4.6l.9.9-.2.3-.7 1.2H2v2.8h1.5l.7 1.2.2.3-.9.9 1.1 1.1.9-.9.3.2 1.2.7V14h2.8v-1.5l1.2-.7.3-.2.9.9 1.1-1.1-.9-.9.3.2 1.2.7V14h2.8v-1.5l1.2-.7.3-.2.9.9 1.1-1.1-.9-.9.2-.3.7-1.2H14V6.5h-0.6z" stroke="currentColor" strokeWidth="1.2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ═══ MAIN CHAT ═══ */}
      <main className="chat-main">
        {/* Chat Header */}
        <header className="chat-header">
          <button
            className="btn-icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ width: '36px', height: '36px' }}
            id="toggle-sidebar-btn"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{agentName}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              Cognitive Memory Active · 3 Layers Online
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="tag-amber tag" style={{ fontSize: '9px' }}>
              <span style={{ display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%', background: 'var(--success)', marginRight: '5px', animation: 'pulse-dot 2s ease-in-out infinite' }} />
              Semantic
            </span>
            <span className="tag-amber tag" style={{ fontSize: '9px' }}>Episodic</span>
            <span className="tag-amber tag" style={{ fontSize: '9px' }}>Procedural</span>
          </div>
        </header>

        {/* Messages Area */}
        <div className="chat-messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-message ${msg.role === 'user' ? 'chat-message-user' : 'chat-message-ai'}`}
            >
              <div className={`chat-avatar ${msg.role === 'user' ? 'chat-avatar-user' : 'chat-avatar-ai'}`}>
                {msg.role === 'user' ? 'Y' : (
                  <svg width="18" height="18" viewBox="0 0 100 100" fill="none">
                    <path d="M 68 50 A 24 24 0 1 1 54.1 28.3" stroke="currentColor" strokeWidth="10" strokeLinecap="round"/>
                    <path d="M 62 62 L 72 71" stroke="currentColor" strokeWidth="10" strokeLinecap="round"/>
                    <circle cx="67" cy="33" r="7" fill="currentColor"/>
                  </svg>
                )}
              </div>
              <div>
                <div className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                  {msg.role === 'ai' && msg.typing ? (
                    <TypewriterText
                      text={msg.content}
                      onComplete={() => {
                        setMessages(prev => prev.map(m =>
                          m.id === msg.id ? { ...m, typing: false } : m
                        ))
                      }}
                    />
                  ) : msg.role === 'ai' ? (
                    <div>{renderMarkdown(msg.content)}</div>
                  ) : (
                    msg.content
                  )}
                </div>
                <div style={{
                  fontSize: '10px',
                  color: 'var(--text-ghost)',
                  marginTop: '4px',
                  padding: '0 4px',
                  fontFamily: 'var(--font-mono)',
                  textAlign: msg.role === 'user' ? 'right' : 'left',
                }}>
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="chat-message chat-message-ai">
              <div className="chat-avatar chat-avatar-ai">
                <svg width="18" height="18" viewBox="0 0 100 100" fill="none">
                  <path d="M 68 50 A 24 24 0 1 1 54.1 28.3" stroke="currentColor" strokeWidth="10" strokeLinecap="round"/>
                  <path d="M 62 62 L 72 71" stroke="currentColor" strokeWidth="10" strokeLinecap="round"/>
                  <circle cx="67" cy="33" r="7" fill="currentColor"/>
                </svg>
              </div>
              <div className="chat-bubble chat-bubble-ai" style={{ padding: '16px 20px' }}>
                <div className="typing-indicator">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="chat-input-area">
          <div className="chat-input-wrapper">
            <button className="btn-icon" style={{ width: '44px', height: '44px', flexShrink: 0 }} id="attach-btn">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M15.5 8.5l-6.4 6.4a3.5 3.5 0 11-5-5l6.4-6.4a2.33 2.33 0 013.3 3.3L7.5 13.1a1.17 1.17 0 01-1.7-1.7l5.7-5.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <textarea
              ref={inputRef}
              className="chat-input"
              placeholder={`Message ${agentName}...`}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              id="chat-message-input"
            />
            <button
              className="chat-send-btn"
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              id="chat-send-btn"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M16 2L8 10M16 2l-5 14-3-6-6-3 14-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <p style={{
            textAlign: 'center',
            marginTop: '10px',
            fontSize: '11px',
            color: 'var(--text-ghost)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.02em',
          }}>
            Powered by Quarq Cognitive Memory Engine
          </p>
        </div>
      </main>

      {/* ═══ TELEGRAM MODAL ═══ */}
      {showTelegram && (
        <TelegramModal agentName={agentName} onClose={() => setShowTelegram(false)} />
      )}
    </div>
  )
}
