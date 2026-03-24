import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'Quarq: Every AI today is a session. Quarq is a presence.',
  description: 'An always-on personal AI assistant that learns who you are, not from notes, but from its weights. Your behavioral fingerprint, baked into the model itself.',
  openGraph: {
    title: 'Quarq: Every AI today is a session. Quarq is a presence.',
    description: 'An always-on personal AI assistant that learns who you are.',
    type: 'website',
    url: 'https://quarq.io',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quarq',
    description: 'Every AI today is a session. Quarq is a presence.',
    creator: '@0xvk__',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/quarq-mark-32.png?v=2', sizes: '32x32', type: 'image/png' },
      { url: '/quarq-mark.png?v=2', type: 'image/png' },
    ],
    apple: [
      { url: '/quarq-mark-512.png?v=2', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/quarq-mark-32.png?v=2',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  )
}
