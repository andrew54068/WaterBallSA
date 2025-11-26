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
      <Header />
      <Sidebar />

      {/* Main Content Area - Offset by sidebar width */}
      <div className="ml-64 min-h-screen flex flex-col">
        {/* Header - Fixed at top */}

        {/* Promotional Banner - Only displays when user has coupons */}
        <div className="mt-16">
          {/* TODO Phase 2: Get hasCoupons from user context/API */}
          <PromotionalBanner hasCoupons={false} />
        </div>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </>
  )
}
