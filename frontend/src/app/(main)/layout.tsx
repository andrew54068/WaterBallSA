import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { PromotionalBanner } from '@/components/PromotionalBanner'
import { Box, Flex } from '@chakra-ui/react'

export const dynamic = 'force-dynamic'

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
      <Flex ml="256px" minH="100vh" flexDirection="column">
        {/* Promotional Banner - Only displays when user has coupons */}
        <Box mt="64px">
          {/* TODO Phase 2: Get hasCoupons from user context/API */}
          <PromotionalBanner hasCoupons={false} />
        </Box>

        {/* Page Content */}
        <Box as="main" flex={1}>
          {children}
        </Box>
      </Flex>
    </>
  )
}
