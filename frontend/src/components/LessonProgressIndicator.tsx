'use client'

import { Box, Flex, Text } from '@chakra-ui/react'
import type { VideoProgressDto } from '@/types/video-progress'

interface LessonProgressIndicatorProps {
  lessonId: number
  progress?: VideoProgressDto | null
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Visual indicator showing lesson completion status
 * - Green checkmark for completed lessons
 * - Blue progress percentage for in-progress lessons
 * - Gray empty circle for not-started lessons
 */
export default function LessonProgressIndicator({
  lessonId,
  progress,
  size = 'md',
}: LessonProgressIndicatorProps) {
  const iconSize = size === 'sm' ? '16px' : size === 'md' ? '20px' : '24px'
  const fontSize = size === 'sm' ? 'xs' : size === 'md' ? 'sm' : 'md'

  // Completed - show green checkmark
  if (progress?.isCompleted) {
    return (
      <Flex align="center" gap={2} title={`Completed on ${new Date(progress.completedAt!).toLocaleDateString()}`}>
        <Box color="green.400" fontSize={iconSize}>
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </Box>
        {size !== 'sm' && (
          <Text fontSize={fontSize} color="green.400" fontWeight="medium">
            ✓
          </Text>
        )}
      </Flex>
    )
  }

  // In Progress - show blue progress percentage
  if (progress && progress.completionPercentage > 0 && progress.completionPercentage < 95) {
    return (
      <Flex align="center" gap={2} title={`${progress.completionPercentage}% complete`}>
        <Box
          width={iconSize}
          height={iconSize}
          borderRadius="full"
          border="2px solid"
          borderColor="blue.400"
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            height={`${progress.completionPercentage}%`}
            bg="blue.400"
          />
        </Box>
        {size !== 'sm' && (
          <Text fontSize={fontSize} color="blue.400" fontWeight="medium">
            {progress.completionPercentage}%
          </Text>
        )}
      </Flex>
    )
  }

  // Not started - show gray empty circle
  return (
    <Flex align="center" gap={2} title="Not started">
      <Box
        width={iconSize}
        height={iconSize}
        borderRadius="full"
        border="2px solid"
        borderColor="gray.600"
      />
      {size !== 'sm' && (
        <Text fontSize={fontSize} color="gray.500">
          —
        </Text>
      )}
    </Flex>
  )
}
