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
    // Navigate to order confirmation page
    router.push(`/curriculums/${curriculumId}/orders`)
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
        立即購買
      </Button>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  )
}
