import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Influencer Marketing Dashboard',
  description: 'Influencer marketing performance across Instagram and YouTube',
  icons: {
    icon: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface text-primary">{children}</body>
    </html>
  )
}
