import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://quarq.io'),
  title: {
    default: 'Quarq — The AI That Knows You',
    template: '%s | Quarq',
  },
  description: 'Quarq is a cognitive AI agent that learns, remembers, and evolves with you. Three-tier memory architecture, behavioral fingerprinting, and a presence that never resets.',
  keywords: ['personal AI', 'AI agent', 'cognitive memory', 'continual learning', 'behavioral AI', 'always-on AI', 'Quarq', 'AI assistant'],
  authors: [{ name: 'Quarq Labs' }],
  creator: 'Quarq Labs',
  openGraph: {
    title: 'Quarq — The AI That Knows You',
    description: 'Cognitive AI agents with three-tier memory that learn, remember, and evolve with you.',
    type: 'website',
    url: 'https://quarq.io',
    siteName: 'Quarq',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Quarq — The AI That Knows You' }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quarq — The AI That Knows You',
    description: 'Cognitive AI agents with three-tier memory that learn, remember, and evolve with you.',
    creator: '@QuarqLabs',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' as const },
  },
  icons: {
    icon: [
      { url: '/quarq-mark-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/quarq-mark.png', type: 'image/png' },
    ],
    apple: [{ url: '/quarq-mark-512.png', sizes: '512x512', type: 'image/png' }],
    shortcut: '/quarq-mark-32.png',
  },
  alternates: {
    canonical: 'https://quarq.io',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var theme = localStorage.getItem('quarq_theme') || 'dark';
              document.documentElement.setAttribute('data-theme', theme);
            } catch(e) {}
          })();
        `}} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
