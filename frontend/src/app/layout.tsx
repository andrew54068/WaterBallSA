import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Header } from '@/components/Header'

export const metadata: Metadata = {
  title: 'WaterBallSA - Online Learning Platform',
  description: 'An online course platform built with specification-driven development',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Sign-In SDK */}
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body className="antialiased">
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  )
}
