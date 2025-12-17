'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Flex, Heading, Text, Spinner, Badge } from '@chakra-ui/react'
import { Lesson, Chapter, Curriculum } from '@/types'
import { useLessonAccess } from '@/hooks/useLessonAccess'
import { useAuth } from '@/lib/auth-context'
import VideoPlayer from '@/components/VideoPlayer'
import ArticleRenderer from '@/components/ArticleRenderer'
import SurveyForm from '@/components/SurveyForm'
import LockedLessonView from '@/components/LockedLessonView'
import { LessonSidebar } from '@/components/LessonSidebar'
import LessonBreadcrumb from '@/components/LessonBreadcrumb'
import LessonNavigation from '@/components/LessonNavigation'

interface LessonPageClientProps {
  lesson: Lesson
  chapter: Chapter
  curriculum: Curriculum
}

/**
 * Client component for lesson page with access control
 * Uses useLessonAccess hook to determine if user can view lesson content
 * Ownership is checked via API within the hook
 */
export default function LessonPageClient({
  lesson,
  chapter,
  curriculum,
}: LessonPageClientProps) {
  const { user } = useAuth()
  const accessControl = useLessonAccess(lesson.id, curriculum.id)
  const router = useRouter()

  const parsedMetadata = useMemo(() => {
    let m = lesson.contentMetadata
    if (typeof m === 'string') {
      try {
        return JSON.parse(m)
      } catch (e) {
        console.error('Failed to parse metadata', e)
        return {}
      }
    }
    return m
  }, [lesson.contentMetadata])

  const handlePurchaseClick = () => {
    router.push(`/curriculums/${curriculum.id}/orders`)
  }

  // Flatten all lessons from chapters for navigation
  const allLessons = curriculum.chapters.flatMap((chapter) =>
    (chapter.lessons || []).map((l) => ({ ...l, chapterId: chapter.id }))
  )

  const renderLessonContent = () => {
    if (lesson.lessonType === 'VIDEO') {
      return (
        <VideoPlayer
          videoUrl={lesson.contentUrl || ''}
          title={lesson.title}
          lessonId={lesson.id}
          duration={lesson.durationMinutes}
          isAuthenticated={!!user}
        />
      )
    }

    if (lesson.lessonType === 'ARTICLE') {
      return (
        <ArticleRenderer
          articleUrl={lesson.contentUrl || ''}
          title={lesson.title}
          description={lesson.description}
          metadata={parsedMetadata as any}
          duration={lesson.durationMinutes}
        />
      )
    }

    if (lesson.lessonType === 'SURVEY') {
      return (
        <SurveyForm
          surveyPath={lesson.contentUrl || ''}
          title={lesson.title}
          description={lesson.description}
          metadata={parsedMetadata as any}
          duration={lesson.durationMinutes}
        />
      )
    }

    return null
  }

  return (
    <Flex minH="100vh" bg="dark.900" pt="64px">
      {/* Left Sidebar - 30% */}
      <Box w="30%" h="calc(100vh - 64px)" borderRight="1px" borderColor="dark.600">
        <LessonSidebar
          chapters={curriculum.chapters}
          currentLessonId={lesson.id}
          curriculumId={curriculum.id}
          userHasPurchased={accessControl.reason === 'owned'}
        />
      </Box>

      {/* Right Content Area - 70% */}
      <Box w="70%" h="calc(100vh - 64px)" overflowY="auto">
        <Box p={8}>
          {/* Lesson Header */}
          <Box mb={6}>
            <LessonBreadcrumb
              curriculumId={curriculum.id}
              curriculumTitle={curriculum.title}
              chapterTitle={chapter.title}
              lessonTitle={lesson.title}
            />

            <Flex align="center" gap={3} mb={2}>
              <Heading as="h1" fontSize="3xl" fontWeight="bold" color="white">
                {lesson.title}
              </Heading>
              {accessControl.freeToPreview && accessControl.reason === 'free_preview' && (
                <Badge
                  colorScheme="green"
                  fontSize="sm"
                  px={3}
                  py={1}
                  borderRadius="full"
                  aria-label="This is a free preview lesson"
                >
                  Free Preview
                </Badge>
              )}
            </Flex>
            {lesson.description && (
              <Text color="gray.400" lineHeight="relaxed">
                {lesson.description}
              </Text>
            )}
          </Box>

          {/* Access Control: Loading State */}
          {accessControl.isLoading && (
            <Flex justify="center" align="center" minH="300px">
              <Box textAlign="center">
                <Spinner size="xl" color="blue.500" mb={4} />
                <Text color="gray.400">Checking access...</Text>
              </Box>
            </Flex>
          )}

          {/* Access Control: Error State */}
          {!accessControl.isLoading && accessControl.error && (
            <Box
              bg="red.900"
              borderRadius="lg"
              p={6}
              textAlign="center"
              border="1px solid"
              borderColor="red.700"
            >
              <Heading as="h3" fontSize="lg" color="red.300" mb={2}>
                Unable to verify access
              </Heading>
              <Text color="red.200" mb={4}>
                {accessControl.error.message || 'Please check your connection and try again.'}
              </Text>
              <Box
                as="button"
                onClick={accessControl.retry}
                px={6}
                py={2}
                bg="red.700"
                _hover={{ bg: 'red.600' }}
                color="white"
                borderRadius="md"
                fontWeight="medium"
              >
                Retry
              </Box>
            </Box>
          )}

          {/* Access Control: Content or Locked View */}
          {!accessControl.isLoading && !accessControl.error && (
            <Box mb={8}>
              {accessControl.showLockedView ? (
                <LockedLessonView
                  curriculumId={curriculum.id}
                  curriculumTitle={curriculum.title}
                  curriculumPrice={curriculum.price}
                  isAuthenticated={!!user}
                  reason={accessControl.reason}
                  onPurchase={handlePurchaseClick}
                />
              ) : (
                renderLessonContent()
              )}
            </Box>
          )}

          {/* Navigation */}
          {!accessControl.isLoading && !accessControl.error && !accessControl.showLockedView && (
            <LessonNavigation
              currentLessonId={lesson.id}
              lessons={allLessons}
              curriculumId={curriculum.id}
            />
          )}
        </Box>
      </Box>
    </Flex>
  )
}
