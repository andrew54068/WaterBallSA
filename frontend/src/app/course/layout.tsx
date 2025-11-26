import { Providers } from '@/components/Providers'
import { LessonViewerHeader } from '@/components/LessonViewerHeader'

export default function CourseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header without sidebar offset */}
      <LessonViewerHeader />

      {/* Content without sidebar - full width */}
      <div className="pt-16">
        {children}
      </div>
    </div>
  )
}
