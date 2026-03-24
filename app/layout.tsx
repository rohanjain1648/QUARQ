import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  metadataBase: new URL('https://quarq.io'),
  title: {
    default: 'Quarq — Every AI today is a session. Quarq is a presence.',
    template: '%s | Quarq',
  },
  description: 'Quarq is a personal AI that grows with you. Not just memory — your behavioral fingerprint, baked into the model itself. Always on. Always learning.',
  keywords: ['personal AI', 'AI assistant', 'continual learning', 'behavioral AI', 'always-on AI', 'Quarq'],
  authors: [{ name: 'Quarq' }],
  creator: 'Quarq',
  openGraph: {
    title: 'Quarq — Every AI today is a session. Quarq is a presence.',
    description: 'Quarq is a personal AI that grows with you. Your behavioral fingerprint, baked into the model itself.',
    type: 'website',
    url: 'https://quarq.io',
    siteName: 'Quarq',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Quarq — AI that knows you' }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quarq — Every AI today is a session. Quarq is a presence.',
    description: 'Quarq is a personal AI that grows with you. Your behavioral fingerprint, baked into the model itself.',
    creator: '@QuarqLabs',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
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
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  )
}
