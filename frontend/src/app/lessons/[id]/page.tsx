import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Box, Flex, Heading, Text } from '@chakra-ui/react'
import { lessonsApi } from '@/lib/api/lessons'
import { chaptersApi } from '@/lib/api/chapters'
import { curriculumsApi } from '@/lib/api/curriculums'
import VideoPlayer from '@/components/VideoPlayer'
import ArticleRenderer from '@/components/ArticleRenderer'
import SurveyForm from '@/components/SurveyForm'
import { LessonSidebar } from '@/components/LessonSidebar'

interface PageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const lessonId = parseInt(params.id)
    const lesson = await lessonsApi.getById(lessonId)

    return {
      title: `${lesson.title} | WaterBallSA`,
      description: lesson.description || `Learn ${lesson.title}`,
    }
  } catch (error) {
    return {
      title: 'Lesson Not Found | WaterBallSA',
    }
  }
}

export default async function LessonPage({ params }: PageProps) {
  try {
    const lessonId = parseInt(params.id)

    // Validate lesson ID
    if (isNaN(lessonId) || lessonId < 1) {
      notFound()
    }

    // Fetch lesson data
    const lesson = await lessonsApi.getById(lessonId)

    // Fetch current chapter data
    const chapter = await chaptersApi.getById(lesson.chapterId)

    // Fetch curriculum data with ALL chapters
    const curriculum = await curriculumsApi.getById(chapter.curriculumId)

    // TODO: Replace with real authentication in Phase 2
    const userHasPurchased = false

    return (
      <Flex h="100vh" bg="dark.900">
        {/* Left Sidebar - 30% */}
        <Box w="30%" borderRight="1px" borderColor="dark.600">
          <LessonSidebar
            chapters={curriculum.chapters}
            currentLessonId={lessonId}
            curriculumId={curriculum.id}
            userHasPurchased={userHasPurchased}
          />
        </Box>

        {/* Right Content Area - 70% */}
        <Box w="70%" overflowY="auto">
          <Box p={8}>
            {/* Lesson Header */}
            <Box mb={6}>
              <Heading as="h1" fontSize="3xl" fontWeight="bold" color="white" mb={2}>
                {lesson.title}
              </Heading>
              {lesson.description && (
                <Text color="gray.400" lineHeight="relaxed">
                  {lesson.description}
                </Text>
              )}
            </Box>

            {/* Lesson Content - Render based on type */}
            <Box mb={8}>
              {lesson.lessonType === 'VIDEO' && (
                <VideoPlayer
                  videoUrl={lesson.contentUrl || ''}
                  title={lesson.title}
                  duration={lesson.durationMinutes}
                />
              )}

              {lesson.lessonType === 'ARTICLE' && (
                <ArticleRenderer
                  articleUrl={lesson.contentUrl || ''}
                  title={lesson.title}
                  description={lesson.description}
                  metadata={lesson.contentMetadata as any}
                  duration={lesson.durationMinutes}
                />
              )}

              {lesson.lessonType === 'SURVEY' && (
                <SurveyForm
                  surveyPath={lesson.contentUrl || ''}
                  title={lesson.title}
                  description={lesson.description}
                  metadata={lesson.contentMetadata as any}
                  duration={lesson.durationMinutes}
                />
              )}
            </Box>
          </Box>
        </Box>
      </Flex>
    )
  } catch (error: unknown) {
    console.error('Error loading lesson:', error)

    // Handle specific error types
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } }
      if (axiosError.response?.status === 404) {
        notFound()
      }
    }

    // Generic error page
    return (
      <Flex minH="100vh" bg="dark.900" align="center" justify="center" px={4}>
        <Box textAlign="center">
          <svg
            width="64px"
            height="64px"
            style={{ color: 'var(--chakra-colors-red-500)', margin: '0 auto 1rem' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <Heading as="h1" fontSize="2xl" fontWeight="bold" color="white" mb={2}>
            Failed to Load Lesson
          </Heading>
          <Text color="gray.400" mb={6}>
            There was an error loading this lesson. Please try again.
          </Text>
          <Link href="/">
            <Box
              display="inline-block"
              px={6}
              py={3}
              bg="blue.600"
              _hover={{ bg: 'blue.700' }}
              color="white"
              rounded="lg"
              transition="colors 0.2s"
            >
              Go to Home
            </Box>
          </Link>
        </Box>
      </Flex>
    )
  }
}
