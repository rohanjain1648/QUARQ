import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Quarq - Every AI today is a session. Quarq is a presence.',
  description: 'An always-on personal AI runtime that learns who you are.',
  openGraph: {
    title: 'Quarq',
    description: 'An always-on personal AI runtime that learns who you are.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
