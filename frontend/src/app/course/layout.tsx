import { Providers } from '@/components/Providers'
import { LessonViewerHeader } from '@/components/LessonViewerHeader'
import { Box } from '@chakra-ui/react'

export default function CourseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Box minH="100vh" bg="dark.900">
      {/* Header without sidebar offset */}
      <LessonViewerHeader />

      {/* Content without sidebar - full width */}
      <Box pt="64px">
        {children}
      </Box>
    </Box>
  )
}
