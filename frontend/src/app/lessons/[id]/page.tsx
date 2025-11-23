import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { lessonsApi } from '@/lib/api/lessons'
import { chaptersApi } from '@/lib/api/chapters'
import { curriculumsApi } from '@/lib/api/curriculums'
import VideoPlayer from '@/components/VideoPlayer'
import ArticleRenderer from '@/components/ArticleRenderer'
import SurveyForm from '@/components/SurveyForm'
import LessonNavigation from '@/components/LessonNavigation'
import LessonBreadcrumb from '@/components/LessonBreadcrumb'

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

    // Fetch chapter data (includes all lessons for navigation)
    const chapter = await chaptersApi.getById(lesson.chapterId)

    // Fetch curriculum data (for breadcrumb)
    const curriculum = await curriculumsApi.getById(chapter.curriculumId)

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <LessonBreadcrumb
            curriculumId={curriculum.id}
            curriculumTitle={curriculum.title}
            chapterTitle={chapter.title}
            lessonTitle={lesson.title}
          />

          {/* Lesson Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {lesson.title}
            </h1>
            {lesson.description && (
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
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

          {/* Lesson Navigation */}
          <LessonNavigation
            currentLessonId={lessonId}
            lessons={chapter.lessons}
          />

          {/* Back to Curriculum Link */}
          <div className="mt-8 text-center">
            <a
              href={`/curriculums/${curriculum.id}`}
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to {curriculum.title}
            </a>
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
