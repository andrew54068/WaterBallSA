'use client'

import { useRouter } from 'next/navigation'
import { useRef, useEffect } from 'react'
import { Box, Flex, Heading, Text, Button } from '@chakra-ui/react'
import { AccessReason } from '@/hooks/useLessonAccess'
import { returnUrlUtils } from '@/lib/utils/returnUrl'

interface LockedLessonViewProps {
  curriculumId: number
  curriculumTitle: string
  curriculumPrice?: number
  isAuthenticated: boolean
  reason: AccessReason
  onSignIn?: () => void
  onPurchase?: (curriculumId: number) => void
}

/**
 * Component that displays when a user tries to access a locked lesson
 * Shows appropriate messaging and CTAs based on authentication status
 */
export default function LockedLessonView({
  curriculumId,
  curriculumTitle,
  curriculumPrice,
  isAuthenticated,
  reason,
  onSignIn,
  onPurchase,
}: LockedLessonViewProps) {
  const router = useRouter()
  const firstButtonRef = useRef<HTMLButtonElement>(null)

  // Auto-focus first button when component mounts
  useEffect(() => {
    firstButtonRef.current?.focus()
  }, [])

  const handleSignIn = () => {
    // Store return URL before triggering login
    returnUrlUtils.store(window.location.pathname)

    if (onSignIn) {
      onSignIn()
    } else {
      // Default behavior: scroll to top where login modal button is
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePurchase = () => {
    // Store return URL before navigating to purchase
    returnUrlUtils.store(window.location.pathname)

    if (onPurchase) {
      onPurchase(curriculumId)
    } else {
      // Default behavior: navigate to curriculum detail page
      router.push(`/curriculums/${curriculumId}`)
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      // Navigate back to curriculum page on Escape
      router.push(`/curriculums/${curriculumId}`)
    }
  }

  const formatPrice = (price?: number): string => {
    if (price === undefined || price === null) {
      return ''
    }
    if (price === 0) {
      return 'Free'
    }
    return `$${price.toFixed(2)}`
  }

  const getMessage = (): string => {
    if (isAuthenticated) {
      return `Purchase this curriculum to access all lessons`
    }
    return `Sign in or purchase to access this content`
  }

  return (
    <Box
      data-testid="blurred-content"
      position="relative"
      minH="500px"
      bg="gray.900"
      borderRadius="lg"
      overflow="hidden"
      role="dialog"
      aria-labelledby="locked-lesson-title"
      aria-describedby="locked-lesson-description"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Blurred background effect */}
      <Box
        position="absolute"
        inset="0"
        bg="linear-gradient(135deg, rgba(66, 153, 225, 0.1), rgba(159, 122, 234, 0.1))"
        backdropFilter="blur(10px)"
      />

      {/* Content */}
      <Flex
        position="relative"
        direction="column"
        align="center"
        justify="center"
        minH="500px"
        p={8}
        textAlign="center"
      >
        {/* Lock Icon */}
        <Box mb={6} data-testid="lock-icon" aria-hidden="true">
          <svg
            width="80px"
            height="80px"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'var(--chakra-colors-blue-400)', margin: '0 auto' }}
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </Box>

        {/* Heading */}
        <Heading
          id="locked-lesson-title"
          as="h2"
          fontSize="2xl"
          fontWeight="bold"
          color="white"
          mb={4}
        >
          This Lesson is Locked
        </Heading>

        {/* Curriculum Title */}
        {curriculumTitle && (
          <Text color="gray.300" fontSize="lg" mb={2}>
            This lesson is part of <strong>{curriculumTitle}</strong>
          </Text>
        )}

        {/* Message */}
        <Text
          id="locked-lesson-description"
          color="gray.400"
          fontSize="md"
          mb={6}
          maxW="500px"
        >
          {getMessage()}
        </Text>

        {/* Preview Info */}
        <Text color="gray.500" fontSize="sm" mb={8} maxW="500px">
          View free preview lessons to learn more about this curriculum
        </Text>

        {/* Action Buttons */}
        <Flex gap={4} wrap="wrap" justify="center">
          {!isAuthenticated && (
            <Button
              ref={firstButtonRef}
              size="lg"
              colorScheme="gray"
              variant="outline"
              onClick={handleSignIn}
              px={8}
              aria-label="Sign in to access this lesson"
            >
              Sign In
            </Button>
          )}

          <Button
            ref={isAuthenticated ? firstButtonRef : undefined}
            size="lg"
            colorScheme="blue"
            onClick={handlePurchase}
            px={8}
            aria-label={`Purchase ${curriculumTitle} to access all lessons`}
          >
            {curriculumPrice !== undefined && curriculumPrice > 0
              ? `Purchase for ${formatPrice(curriculumPrice)}`
              : 'Purchase Curriculum'}
          </Button>
        </Flex>
      </Flex>
    </Box>
  )
}
