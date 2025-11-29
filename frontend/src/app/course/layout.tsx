import { LessonHeader } from '@/components/LessonHeader'

export default function CourseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <LessonHeader />
      {children}
    </>
  )
}
