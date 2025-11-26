import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { lessonsApi } from '@/lib/api/lessons'
import { chaptersApi } from '@/lib/api/chapters'
import { curriculumsApi } from '@/lib/api/curriculums'
import VideoPlayer from '@/components/VideoPlayer'
import ArticleRenderer from '@/components/ArticleRenderer'
import SurveyForm from '@/components/SurveyForm'
import { LessonSidebar } from '@/components/LessonSidebar'

interface PageProps {
  params: {
    courseId: string
    chapterId: string // This is the chapter order_index (0-based)
    lessonId: string  // This is the lesson order_index (0-based)
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const courseId = parseInt(params.courseId)
    const chapterIndex = parseInt(params.chapterId)
    const lessonIndex = parseInt(params.lessonId)

    const curriculum = await curriculumsApi.getById(courseId)
    const chapter = curriculum.chapters.find(ch => ch.orderIndex === chapterIndex)
    const lesson = chapter?.lessons.find(l => l.orderIndex === lessonIndex)

    if (!lesson) {
      return {
        title: 'Lesson Not Found | WaterBallSA',
      }
    }

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
    const courseId = parseInt(params.courseId)
    const chapterIndex = parseInt(params.chapterId)
    const lessonIndex = parseInt(params.lessonId)

    // Validate parameters
    if (isNaN(courseId) || courseId < 1 || isNaN(chapterIndex) || chapterIndex < 0 || isNaN(lessonIndex) || lessonIndex < 0) {
      notFound()
    }

    // Fetch curriculum data with ALL chapters and lessons
    const curriculum = await curriculumsApi.getById(courseId)

    // Find chapter by order_index
    const chapter = curriculum.chapters.find(ch => ch.orderIndex === chapterIndex)
    if (!chapter) {
      notFound()
    }

    // Find lesson by order_index within the chapter
    const lesson = chapter.lessons.find(l => l.orderIndex === lessonIndex)
    if (!lesson) {
      notFound()
    }

    // TODO: Replace with real authentication in Phase 2
    const userHasPurchased = false

    return (
      <div className="flex h-screen bg-dark-900">
        {/* Left Sidebar - 30% */}
        <div className="w-[30%] border-r border-dark-600">
          <LessonSidebar
            chapters={curriculum.chapters}
            currentLessonId={lesson.id}
            curriculumId={curriculum.id}
            userHasPurchased={userHasPurchased}
          />
        </div>

        {/* Right Content Area - 70% */}
        <div className="w-[70%] overflow-y-auto">
          <div className="p-8">
            {/* Lesson Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">
                {lesson.title}
              </h1>
              {lesson.description && (
                <p className="text-gray-400 leading-relaxed">
                  {lesson.description}
                </p>
              )}
            </div>

            {/* Lesson Content - Render based on type */}
            <div className="mb-8">
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
                  metadata={lesson.contentMetadata}
                  duration={lesson.durationMinutes}
                />
              )}

              {lesson.lessonType === 'SURVEY' && (
                <SurveyForm
                  surveyPath={lesson.contentUrl || ''}
                  title={lesson.title}
                  description={lesson.description}
                  metadata={lesson.contentMetadata}
                  duration={lesson.durationMinutes}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error: any) {
    console.error('Error loading lesson:', error)

    // Handle specific error types
    if (error.response?.status === 404) {
      notFound()
    }

    // Generic error page
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Failed to Load Lesson
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            There was an error loading this lesson. Please try again.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Go to Home
          </a>
        </div>
      </div>
    )
  }
}
