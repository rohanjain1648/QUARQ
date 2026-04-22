'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
  }, [name, size])

  useEffect(() => { drawAvatar() }, [drawAvatar])

  return <canvas ref={canvasRef} style={{ width: size, height: size, borderRadius: 'var(--radius-sm)' }} />
}

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

function renderMarkdown(text: string): React.ReactNode[] {
  return text.split('\n').map((line, i) => {
    const boldParts = line.split(/\*\*(.*?)\*\*/g)
    let processed: React.ReactNode = line
    if (boldParts.length > 1) {
      processed = boldParts.map((part, j) =>
        j % 2 === 1 ? <strong key={j} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{part}</strong> : part
      )
    }

    if (line.startsWith('• ') || line.startsWith('- ')) {
      return (
        <div key={i} style={{ display: 'flex', gap: '8px', paddingLeft: '4px', margin: '4px 0' }}>
          <span style={{ color: 'var(--accent)', flexShrink: 0 }}>•</span>
          <span>{typeof processed === 'string' ? processed.replace(/^[•\-]\s/, '') : processed}</span>
        </div>
      )
    }
    if (line.startsWith('## ')) return <div key={i} style={{ fontWeight: 600, fontSize: '15px', margin: '12px 0 4px', color: 'var(--text-primary)' }}>{line.replace('## ', '')}</div>
    if (line.trim() === '') return <div key={i} style={{ height: '8px' }} />
    return <div key={i} style={{ margin: '2px 0' }}>{processed}</div>
  })
}

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
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #2AABEE 0%, #229ED9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 30px rgba(42,171,238,0.3)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
          </div>
          <h3 className="heading-lg" style={{ marginBottom: '8px' }}>Connect to Telegram</h3>
          <p className="body-md">Chat with {agentName} directly in Telegram. Your memory and personality carry over.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
          {[{ step: 1, text: 'Open Telegram on your phone or desktop' }, { step: 2, text: 'Search for @QuarqAgentBot or click the link below' }, { step: 3, text: 'Press "Start" to activate your agent' }].map(({ step, text }) => (
            <div key={step} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--accent)', flexShrink: 0 }}>{step}</div>
              <p className="body-md" style={{ paddingTop: '3px' }}>{text}</p>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px', padding: '12px 16px', background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', alignItems: 'center', marginBottom: '20px' }}>
          <span className="mono-sm" style={{ flex: 1, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{botLink}</span>
          <button className="btn-secondary btn-sm" onClick={copyLink} style={{ flexShrink: 0 }} id="copy-telegram-link">{copied ? '✓ Copied' : 'Copy'}</button>
        </div>
        <a href={botLink} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }} id="open-telegram-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
          Open in Telegram
        </a>
      </div>
    </div>
  )
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  typing?: boolean
}

export default function ChatPage() {
  const router = useRouter()
  const { theme, toggle: toggleTheme } = useTheme()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showTelegram, setShowTelegram] = useState(false)
  const [agentName, setAgentName] = useState('Quarq Agent')
  const [agentPersonality, setAgentPersonality] = useState('friendly')
  const [channelId, setChannelId] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<{ id: string; title: string; time: string; active: boolean }[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Bootstrap: load profile, get/create web channel, load conversation history
  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      // Load profile
      const profileRes = await fetch('/api/profile')
      if (profileRes.ok) {
        const { profile } = await profileRes.json()
        if (profile.agent_name) setAgentName(profile.agent_name)
        if (profile.agent_personality) setAgentPersonality(profile.agent_personality)
        // Keep localStorage in sync for quick reads
        localStorage.setItem('quarq_agent', JSON.stringify({ name: profile.agent_name, personality: profile.agent_personality }))
      }

      // Get or create the 'web' channel
      const channelsRes = await fetch('/api/channels')
      let webChannel: { id: string; channel_type: string } | null = null
      if (channelsRes.ok) {
        const { channels } = await channelsRes.json()
        webChannel = channels?.find((c: { id: string; channel_type: string }) => c.channel_type === 'web') ?? null
      }

      if (!webChannel) {
        const createRes = await fetch('/api/channels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channel_type: 'web' }),
        })
        if (createRes.ok) {
          const { channel } = await createRes.json()
          webChannel = channel
        }
      }

      if (!webChannel) return
      setChannelId(webChannel.id)

      // Get or create active conversation for the web channel
      const convRes = await fetch(`/api/conversations?channel_id=${webChannel.id}`)
      let activeConvId: string | null = null
      if (convRes.ok) {
        const { conversations } = await convRes.json()
        if (conversations?.length > 0) {
          activeConvId = conversations[0].id
        }
      }

      if (!activeConvId) {
        const createConvRes = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channel_id: webChannel.id }),
        })
        if (createConvRes.ok) {
          const { conversation } = await createConvRes.json()
          activeConvId = conversation.id
        }
      }

      if (!activeConvId) return
      setConversationId(activeConvId)

      // Load existing messages for this conversation
      const msgsRes = await fetch(`/api/messages?conversation_id=${activeConvId}`)
      if (msgsRes.ok) {
        const { messages: dbMessages } = await msgsRes.json()
        if (dbMessages?.length > 0) {
          setMessages(dbMessages.map((m: { id: string; role: string; content: string; created_at: string }) => ({
            id: m.id,
            role: m.role as 'user' | 'assistant',
            content: m.content,
            timestamp: new Date(m.created_at),
          })))

          // Build sidebar history
          setChatHistory([{ id: activeConvId, title: 'Current conversation', time: 'Now', active: true }])
          return
        }
      }

      // No messages yet — show welcome
      const name = localStorage.getItem('quarq_agent') ? JSON.parse(localStorage.getItem('quarq_agent')!).name : 'your Quarq agent'
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Hey! I'm ${name}. My cognitive memory is online — I'll learn and remember everything as we chat. How can I help you today?`,
        timestamp: new Date(),
      }])
      setChatHistory([{ id: activeConvId, title: 'Current conversation', time: 'Now', active: true }])
    }

    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isTyping || !channelId) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel_id: channelId,
          content: text,
          conversation_id: conversationId,
        }),
      })

      if (!res.ok) throw new Error('Failed to send message')

      const { message, conversation_id: returnedConvId } = await res.json()

      // Update conversation_id if it was just created
      if (returnedConvId && !conversationId) setConversationId(returnedConvId)

      const aiMsg: ChatMessage = {
        id: message.id,
        role: 'assistant',
        content: message.content,
        timestamp: new Date(message.created_at),
        typing: true,
      }
      setMessages(prev => [...prev, aiMsg])
    } catch {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'I encountered an error. Please try again.',
        timestamp: new Date(),
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const startNewConversation = async () => {
    if (!channelId) return
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel_id: channelId }),
    })
    if (res.ok) {
      const { conversation } = await res.json()
      setConversationId(conversation.id)
      setMessages([{
        id: `welcome-new-${Date.now()}`,
        role: 'assistant',
        content: 'Starting a new conversation. What would you like to discuss?',
        timestamp: new Date(),
      }])
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/auth')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const personalityEmoji: Record<string, string> = {
    professional: '🎯', creative: '💡', friendly: '🤝', technical: '🧪', mentor: '🎓', custom: '🎭',
  }

  return (
    <div className="chat-layout">
      {/* ═══ SIDEBAR ═══ */}
      <aside className={`chat-sidebar ${!sidebarOpen ? 'chat-sidebar-collapsed' : ''}`}>
        <div className="chat-sidebar-header">
          <div className="agent-card">
            <div className="agent-avatar"><AgentAvatar name={agentName} size={44} /></div>
            <div className="agent-info">
              <div className="agent-name">{agentName}</div>
              <div className="agent-status"><div className="agent-status-dot" /><span>Online</span></div>
            </div>
          </div>
        </div>

        <div className="chat-sidebar-content">
          <button className="btn-secondary" style={{ width: '100%', marginBottom: '16px', justifyContent: 'center', gap: '8px' }} id="new-chat-btn" onClick={startNewConversation}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            New Chat
          </button>

          <p className="mono-label" style={{ padding: '8px 14px', marginBottom: '4px' }}>Recent</p>
          {chatHistory.map(chat => (
            <div key={chat.id} className={`chat-history-item ${chat.active ? 'chat-history-item-active' : ''}`}>
              <div className="chat-history-title">{chat.title}</div>
              <div className="chat-history-time">{chat.time}</div>
            </div>
          ))}
        </div>

        <div className="chat-sidebar-footer">
          <button className="glass-card" onClick={() => setShowTelegram(true)} style={{ width: '100%', padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left', border: '1px solid rgba(42,171,238,0.2)', background: 'rgba(42,171,238,0.05)' }} id="telegram-setup-btn">
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #2AABEE 0%, #229ED9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>Setup on Telegram</div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Chat anywhere, same memory</div>
            </div>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', padding: '0 4px' }}>
            <span className="body-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {personalityEmoji[agentPersonality] || '🤝'} {agentPersonality.charAt(0).toUpperCase() + agentPersonality.slice(1)}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme" style={{ width: '32px', height: '32px' }}>
                <ThemeIcon theme={theme} />
              </button>
              <button className="btn-icon" style={{ width: '32px', height: '32px' }} onClick={handleLogout} title="Log out" id="logout-btn">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ═══ MAIN CHAT ═══ */}
      <main className="chat-main">
        <header className="chat-header">
          <button className="btn-icon" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ width: '36px', height: '36px' }} id="toggle-sidebar-btn">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
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

        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.role === 'user' ? 'chat-message-user' : 'chat-message-ai'}`}>
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
                  {msg.role === 'assistant' && msg.typing ? (
                    <TypewriterText text={msg.content} onComplete={() => {
                      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, typing: false } : m))
                    }} />
                  ) : msg.role === 'assistant' ? (
                    <div>{renderMarkdown(msg.content)}</div>
                  ) : (
                    msg.content
                  )}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-ghost)', marginTop: '4px', padding: '0 4px', fontFamily: 'var(--font-mono)', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            </div>
          ))}

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
                  <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <div className="chat-input-wrapper">
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
            <button className="chat-send-btn" onClick={sendMessage} disabled={!input.trim() || isTyping || !channelId} id="chat-send-btn">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M16 2L8 10M16 2l-5 14-3-6-6-3 14-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '11px', color: 'var(--text-ghost)', fontFamily: 'var(--font-mono)', letterSpacing: '0.02em' }}>
            Powered by Quarq Cognitive Memory Engine
          </p>
        </div>
      </main>

      {showTelegram && <TelegramModal agentName={agentName} onClose={() => setShowTelegram(false)} />}
    </div>
  )
}
