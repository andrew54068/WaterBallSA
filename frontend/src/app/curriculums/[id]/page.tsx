import { curriculumsApi } from '@/lib/api/curriculums'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
  params: {
    id: string
  }
}

export default async function CurriculumDetailPage({ params }: PageProps) {
  const curriculumId = parseInt(params.id)

  if (isNaN(curriculumId)) {
    notFound()
  }

  let curriculum = null
  let error = null

  try {
    curriculum = await curriculumsApi.getById(curriculumId)
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load curriculum'
    console.error('Error loading curriculum:', err)
  }

  if (!curriculum && !error) {
    notFound()
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error loading curriculum</p>
            <p>{error}</p>
          </div>
          <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
            ← Back to Home
          </Link>
        </div>
      </main>
    )
  }

  const difficultyColors = {
    BEGINNER: 'bg-green-100 text-green-800',
    INTERMEDIATE: 'bg-yellow-100 text-yellow-800',
    ADVANCED: 'bg-red-100 text-red-800',
  }

  const isFree = curriculum!.price === 0

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white py-8">
        <div className="container mx-auto px-4">
          <Link href="/" className="text-blue-100 hover:text-white mb-4 inline-block">
            ← Back to Courses
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{curriculum!.title}</h1>
          <p className="text-xl">By {curriculum!.instructorName}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Thumbnail */}
            {curriculum!.thumbnailUrl && (
              <img
                src={curriculum!.thumbnailUrl}
                alt={curriculum!.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}

            {/* Description */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">About This Course</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{curriculum!.description}</p>
            </div>

            {/* Chapters */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Course Content</h2>

              {curriculum!.chapters.length === 0 ? (
                <p className="text-gray-600">No chapters available yet.</p>
              ) : (
                <div className="space-y-4">
                  {curriculum!.chapters.map((chapter, index) => (
                    <div key={chapter.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">
                            Chapter {index + 1}: {chapter.title}
                          </h3>
                          {chapter.description && (
                            <p className="text-gray-600 text-sm mb-2">{chapter.description}</p>
                          )}
                          <p className="text-sm text-gray-500">
                            {chapter.lessons.length} lesson{chapter.lessons.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      {/* Lessons */}
                      {chapter.lessons.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {chapter.lessons.map((lesson) => (
                            <Link
                              key={lesson.id}
                              href={`/lessons/${lesson.id}`}
                              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded border"
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-blue-600">
                                  {lesson.lessonType === 'VIDEO' && '▶️'}
                                  {lesson.lessonType === 'ARTICLE' && '📄'}
                                  {lesson.lessonType === 'SURVEY' && '📝'}
                                </span>
                                <div>
                                  <p className="font-medium">{lesson.title}</p>
                                  {lesson.durationMinutes && (
                                    <p className="text-sm text-gray-500">
                                      {lesson.durationMinutes} min
                                    </p>
                                  )}
                                </div>
                              </div>
                              <span className="text-blue-600">→</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <div className="mb-6">
                <div className="text-3xl font-bold mb-2">
                  {isFree ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    <span>{curriculum!.currency} ${curriculum!.price.toFixed(2)}</span>
                  )}
                </div>
                {isFree && (
                  <p className="text-sm text-gray-600">Full access to all content</p>
                )}
              </div>

              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold mb-4">
                {isFree ? 'Start Learning' : 'Enroll Now'}
              </button>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">Difficulty:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      difficultyColors[curriculum!.difficultyLevel]
                    }`}
                  >
                    {curriculum!.difficultyLevel}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{curriculum!.estimatedDurationHours} hours</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">Chapters:</span>
                  <span className="font-medium">{curriculum!.chapters.length}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Total Lessons:</span>
                  <span className="font-medium">
                    {curriculum!.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
