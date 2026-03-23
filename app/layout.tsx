import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'Quarq — Every AI today is a session. Quarq is a presence.',
  description: 'An always-on personal AI runtime that learns who you are — not from notes, but from its weights. Your behavioral fingerprint, baked into the model itself.',
  openGraph: {
    title: 'Quarq — Every AI today is a session. Quarq is a presence.',
    description: 'An always-on personal AI runtime that learns who you are.',
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
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  )
}
