'use client'

import React from 'react'
import Link from 'next/link'
import { Lesson } from '@/types'
import { Box, Flex, Text, Icon, Progress } from '@chakra-ui/react'

interface LessonNavigationProps {
  currentLessonId: number
  lessons: Lesson[]
  curriculumId: number
}

export default function LessonNavigation({ currentLessonId, lessons, curriculumId }: LessonNavigationProps) {
  // Find current lesson index
  const currentIndex = lessons.findIndex(lesson => lesson.id === currentLessonId)

  // Determine previous and next lessons
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null

  // Calculate progress
  const progress = `${currentIndex + 1} of ${lessons.length}`
  const progressPercentage = ((currentIndex + 1) / lessons.length) * 100

  return (
    <Box bg="dark.800" borderRadius="lg" shadow="md" p={6} mt={8}>
      {/* Progress Indicator */}
      <Box textAlign="center" mb={6}>
        <Text fontSize="sm" color="gray.400" mb={2}>
          Lesson Progress
        </Text>
        <Text fontSize="2xl" fontWeight="bold" color="white">
          {progress}
        </Text>
        {/* Progress Bar */}
        <Progress.Root
          value={progressPercentage}
          size="sm"
          colorScheme="blue"
          borderRadius="full"
          mt={3}
          bg="dark.700"
        >
          <Progress.Track>
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>
      </Box>

      {/* Navigation Buttons */}
      <Flex direction={{ base: 'column', sm: 'row' }} gap={4} align="stretch" justify="space-between">
        {/* Previous Button */}
        {prevLesson ? (
          <Link
            href={`/course/${curriculumId}/chapters/${prevLesson.chapterId}/lessons/${prevLesson.orderIndex}`}
            style={{ flex: 1 }}
          >
            <Flex
              as="div"
              align="center"
              gap={3}
              p={4}
              bg="dark.700"
              _hover={{ bg: 'dark.600' }}
              borderRadius="lg"
              transition="background-color 0.2s"
              role="group"
              h="full"
            >
              <Icon
                viewBox="0 0 24 24"
                boxSize={6}
                color="gray.300"
                _groupHover={{ color: 'blue.400' }}
                transition="color 0.2s"
                flexShrink={0}
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </Icon>
              <Box textAlign="left" minW={0}>
                <Text fontSize="xs" color="gray.400" mb={1}>
                  Previous Lesson
                </Text>
                <Text fontSize="sm" fontWeight="semibold" color="white" lineClamp={1}>
                  {prevLesson.title}
                </Text>
              </Box>
            </Flex>
          </Link>
        ) : (
          <Box flex={1}>
            <Flex
              align="center"
              gap={3}
              p={4}
              bg="dark.900"
              borderRadius="lg"
              opacity={0.5}
              cursor="not-allowed"
            >
              <Icon viewBox="0 0 24 24" boxSize={6} color="gray.600" flexShrink={0}>
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </Icon>
              <Box textAlign="left">
                <Text fontSize="xs" color="gray.600" mb={1}>
                  Previous Lesson
                </Text>
                <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                  No previous lesson
                </Text>
              </Box>
            </Flex>
          </Box>
        )}

        {/* Next Button */}
        {nextLesson ? (
          <Link
            href={`/course/${curriculumId}/chapters/${nextLesson.chapterId}/lessons/${nextLesson.orderIndex}`}
            style={{ flex: 1 }}
          >
            <Flex
              as="div"
              align="center"
              gap={3}
              p={4}
              bg="blue.900/20"
              _hover={{ bg: 'blue.900/30' }}
              borderRadius="lg"
              transition="background 0.2s"
              role="group"
              h="full"
            >
              <Box textAlign="right" minW={0} flex={1}>
                <Text fontSize="xs" color="blue.400" mb={1}>
                  Next Lesson
                </Text>
                <Text fontSize="sm" fontWeight="semibold" color="white" lineClamp={1}>
                  {nextLesson.title}
                </Text>
              </Box>
              <Icon
                viewBox="0 0 24 24"
                boxSize={6}
                color="blue.400"
                _groupHover={{ color: 'blue.300' }}
                transition="color 0.2s"
                flexShrink={0}
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </Icon>
            </Flex>
          </Link>
        ) : (
          <Box flex={1}>
            <Flex
              align="center"
              gap={3}
              p={4}
              bg="dark.900"
              borderRadius="lg"
              opacity={0.5}
              cursor="not-allowed"
            >
              <Box textAlign="right" flex={1}>
                <Text fontSize="xs" color="gray.600" mb={1}>
                  Next Lesson
                </Text>
                <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                  No next lesson
                </Text>
              </Box>
              <Icon viewBox="0 0 24 24" boxSize={6} color="gray.600" flexShrink={0}>
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </Icon>
            </Flex>
          </Box>
        )}
      </Flex>
    </Box>
  )
}
