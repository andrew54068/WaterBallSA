import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { PromotionalBanner } from '@/components/PromotionalBanner'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Sidebar - Fixed on the left */}
      <Sidebar />

      {/* Main Content Area - Offset by sidebar width */}
      <div className="ml-64 min-h-screen flex flex-col">
        {/* Header - Fixed at top */}
        <Header />

        {/* Promotional Banner */}
        <div className="mt-16">
          <PromotionalBanner />
        </div>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </>
  )
}
