'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Box,
  VStack,
  Button,
  Flex,
  Text,
  Icon,
} from '@chakra-ui/react'
import { ChevronDownIcon, LockClosedIcon } from '@heroicons/react/24/solid'
import { useAuth } from '@/lib/auth-context'
import { useChapterProgress } from '@/hooks/useChapterProgress'
import LessonProgressIndicator from './LessonProgressIndicator'
import { Lesson } from '@/types'

// interface Lesson {
//   id: number
//   title: string
//   lessonType: string
//   isFree?: boolean
//   isCompleted?: boolean
//   orderIndex?: number
// }

interface Chapter {
  id: number
  title: string
  orderIndex: number
  lessons: Lesson[]
}

interface LessonSidebarProps {
  chapters: Chapter[]
  currentLessonId: number
  curriculumId: number
  userHasPurchased?: boolean
}

export function LessonSidebar({
  chapters,
  currentLessonId,
  curriculumId,
  userHasPurchased = false,
}: LessonSidebarProps) {
  const { user } = useAuth()
  const isAuthenticated = !!user

  // Find which chapter contains the current lesson
  const currentChapterId = chapters.find((ch) =>
    ch.lessons.some((l) => l.id === currentLessonId)
  )?.id

  // Initialize expanded chapters (current chapter is expanded by default)
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(
    new Set(currentChapterId ? [currentChapterId] : [])
  )

  // Fetch progress for the current chapter (where the user is)
  // In a production app, you'd want to fetch for all chapters or use a more sophisticated caching strategy
  const { progressMap } = useChapterProgress({
    chapterId: currentChapterId || 0,
    isAuthenticated,
  })

  const toggleChapter = (chapterId: number) => {
    setExpandedChapters((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId)
      } else {
        newSet.add(chapterId)
      }
      return newSet
    })
  }

  const isLessonLocked = (lesson: Lesson) => {
    // Free lessons are never locked
    if (lesson.isFreePreview) return false
    
    // If user has purchased, nothing is locked
    if (userHasPurchased) return false
    return true
  }

  return (
    <Box h="full" bg="dark.800" overflowY="auto">
      <VStack gap={2} p={4} align="stretch">
        {chapters
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((chapter, index) => {
            const isExpanded = expandedChapters.has(chapter.id)

            return (
              <Box key={chapter.id} bg="dark.700" borderRadius="lg" overflow="hidden">
                {/* Chapter Header */}
                <Button
                  onClick={() => toggleChapter(chapter.id)}
                  w="full"
                  justifyContent="space-between"
                  p={4}
                  h="auto"
                  bg="transparent"
                  _hover={{ bg: 'dark.600' }}
                  borderRadius={0}
                  transition="all 0.2s"
                >
                  <Flex align="center" gap={3}>
                    <Text color="accent.yellow" fontWeight="bold">
                      副本{index === 0 ? '零' : index}
                    </Text>
                    <Text color="white" fontWeight="medium" fontSize="sm">
                      {chapter.title}
                    </Text>
                  </Flex>
                  <Icon
                    as={ChevronDownIcon}
                    w={5}
                    h={5}
                    color="gray.400"
                    transform={isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'}
                    transition="transform 0.2s"
                  />
                </Button>

                {/* Lessons List */}
                {isExpanded && (
                  <Box borderTop="1px" borderColor="dark.600">
                    {chapter.lessons.map((lesson) => {
                      const isCurrentLesson = lesson.id === currentLessonId
                      const isLocked = isLessonLocked(lesson)
                      console.log('lesson is free preview', lesson.isFreePreview)
                      console.log('lesson is locked', isLocked)

                      return (
                        <Flex
                          key={lesson.id}
                          as={Link}
                          href={`/course/${curriculumId}/chapters/${chapter.orderIndex}/lessons/${lesson.orderIndex}`}
                          align="center"
                          gap={3}
                          p={4}
                          transition="all 0.2s"
                          bg={isCurrentLesson ? 'accent.yellow' : 'transparent'}
                          color={isCurrentLesson ? 'dark.900' : 'white'}
                          _hover={!isCurrentLesson ? { bg: 'dark.600' } : {}}
                          style={{ textDecoration: 'none' }}
                        >
                          {/* Status Icon */}
                          <Box flexShrink={0}>
                            {isLocked ? (
                              <Icon as={LockClosedIcon} w={5} h={5} color="gray.400" />
                            ) : (
                              <LessonProgressIndicator
                                lessonId={lesson.id}
                                progress={progressMap.get(lesson.id)}
                                size="sm"
                              />
                            )}
                          </Box>

                          {/* Lesson Title */}
                          <Text
                            flex={1}
                            fontSize="sm"
                            fontWeight="medium"
                            lineClamp={2}
                          >
                            {lesson.title}
                          </Text>
                        </Flex>
                      )
                    })}
                  </Box>
                )}
              </Box>
            )
          })}
      </VStack>
    </Box>
  )
}
