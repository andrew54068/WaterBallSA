'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@chakra-ui/react'
import { useAuth } from '@/lib/auth-context'
import { useOwnership } from '@/hooks/useOwnership'
import { useResumeLesson } from '@/hooks/useResumeLesson'
import { LoginModal } from './LoginModal'

interface JoinCourseButtonProps {
  curriculumId: number
  fullWidth?: boolean
}

export function JoinCourseButton({
  curriculumId,
  fullWidth = false,
}: JoinCourseButtonProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { owns, isLoading: ownershipLoading } = useOwnership(curriculumId)
  const { nextChapterIndex, nextLessonIndex, isLoading: resumeLoading } = useResumeLesson(curriculumId)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  const isLoading = ownershipLoading || (owns && resumeLoading)

  const handleJoinCourse = () => {
    if (!user) {
      setIsLoginModalOpen(true)
      return
    }

    if (owns) {
      if (nextChapterIndex !== undefined && nextLessonIndex !== undefined) {
        router.push(`/course/${curriculumId}/chapters/${nextChapterIndex}/lessons/${nextLessonIndex}`)
      } else {
        // Fallback if no lesson is available
        console.warn('No lessons available to start learning')
        // Could redirect to curriculum page as fallback
        router.push(`/curriculums/${curriculumId}`)
      }
      return
    }

    // Navigate to order confirmation page
    router.push(`/curriculums/${curriculumId}/orders`)
  }

  const getButtonText = () => {
    if (isLoading) return 'Loading...'
    if (owns) return '開始學習'
    return '立即購買'
  }

  return (
    <>
      <Button
        w={fullWidth ? 'full' : 'auto'}
        px={8}
        py={3}
        bg={owns ? "green.500" : "accent.yellow"}
        color={owns ? "white" : "dark.900"}
        rounded="lg"
        fontWeight="bold"
        _hover={{ bg: owns ? "green.600" : "accent.yellow-dark" }}
        transition="all 0.2s"
        onClick={handleJoinCourse}
        loading={isLoading}
        disabled={owns && (nextChapterIndex === undefined || nextLessonIndex === undefined)}
      >
        {getButtonText()}
      </Button>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  )
}
