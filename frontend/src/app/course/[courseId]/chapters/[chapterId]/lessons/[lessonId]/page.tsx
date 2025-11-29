import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Box, Flex, Heading, Text } from '@chakra-ui/react'
import { curriculumsApi } from '@/lib/api/curriculums'
import LessonPageClient from '@/app/lessons/LessonPageClient'

interface PageProps {
  params: {
    courseId: string
    chapterId: string
    lessonId: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const courseId = parseInt(params.courseId)
    const curriculum = await curriculumsApi.getById(courseId)
    const chapterIndex = parseInt(params.chapterId)
    const lessonIndex = parseInt(params.lessonId)

    const chapter = curriculum.chapters[chapterIndex]
    const lesson = chapter?.lessons[lessonIndex]

    if (!lesson) {
      return {
        title: 'Lesson Not Found | WaterBallSA',
      }
    }

    return {
      title: `${lesson.title} | ${curriculum.title} | WaterBallSA`,
      description: lesson.description || `Learn ${lesson.title}`,
    }
  } catch (error) {
    return {
      title: 'Lesson Not Found | WaterBallSA',
    }
  }
}

export default async function CourseLessonPage({ params }: PageProps) {
  try {
    const courseId = parseInt(params.courseId)
    const chapterIndex = parseInt(params.chapterId)
    const lessonIndex = parseInt(params.lessonId)

    // Validate parameters
    if (isNaN(courseId) || courseId < 1) {
      notFound()
    }
    if (isNaN(chapterIndex) || chapterIndex < 0) {
      notFound()
    }
    if (isNaN(lessonIndex) || lessonIndex < 0) {
      notFound()
    }

    // Fetch curriculum with all chapters and lessons
    const curriculum = await curriculumsApi.getById(courseId)

    // Find the chapter by index (orderIndex)
    const chapter = curriculum.chapters.find(c => c.orderIndex === chapterIndex)
    if (!chapter) {
      console.error(`Chapter not found: courseId=${courseId}, chapterIndex=${chapterIndex}`)
      notFound()
    }

    // Find the lesson by index (orderIndex) within the chapter
    const lesson = chapter.lessons.find(l => l.orderIndex === lessonIndex)
    if (!lesson) {
      console.error(`Lesson not found: chapterIndex=${chapterIndex}, lessonIndex=${lessonIndex}`)
      notFound()
    }

    // Render using the shared LessonPageClient component
    return (
      <LessonPageClient
        lesson={lesson}
        chapter={chapter}
        curriculum={curriculum}
      />
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
          <a href="/">
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
          </a>
        </Box>
      </Flex>
    )
  }
}
