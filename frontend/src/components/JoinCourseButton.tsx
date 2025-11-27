'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@chakra-ui/react'
import { useAuth } from '@/lib/auth-context'
import { LoginModal } from './LoginModal'

interface JoinCourseButtonProps {
  curriculumId: number
  fullWidth?: boolean
}

export function JoinCourseButton({ curriculumId, fullWidth = false }: JoinCourseButtonProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  const handleJoinCourse = () => {
    if (!user) {
      setIsLoginModalOpen(true)
      return
    }
    // Phase 2: Navigate to purchase/enrollment page
    // For now, just navigate to the first lesson
    router.push(`/curriculums/${curriculumId}`)
  }

  return (
    <>
      <Button
        w={fullWidth ? 'full' : 'auto'}
        px={8}
        py={3}
        bg="accent.yellow"
        color="dark.900"
        rounded="lg"
        fontWeight="bold"
        _hover={{ bg: 'accent.yellow-dark' }}
        transition="all 0.2s"
        onClick={handleJoinCourse}
      >
        立即加入課程
      </Button>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  )
}
