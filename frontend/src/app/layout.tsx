import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { Providers } from '@/components/Providers'

export const metadata: Metadata = {
  title: '水球軟體學院 WaterBallSA - 線上程式學習平台',
  description: '專業的軟體工程線上學習平台，透過 Code Review 來帶你掌握紮實軟體架構能力',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <head>
        {/* Google Sign-In SDK */}
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        {/* YouTube IFrame Player API */}
        <Script
          src="https://www.youtube.com/iframe_api"
          strategy="beforeInteractive"
        />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
