import { curriculumsApi } from '@/lib/api/curriculums'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChapterAccordion } from '@/components/ChapterAccordion'
import { GlobeAltIcon, DevicePhoneMobileIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

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
      <main className="min-h-screen bg-dark-900 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-6 py-4 rounded-lg">
            <p className="font-bold">Error loading curriculum</p>
            <p>{error}</p>
          </div>
          <Link href="/" className="text-accent-yellow hover:underline mt-4 inline-block">
            ← Back to Home
          </Link>
        </div>
      </main>
    )
  }

  const totalVideos = curriculum!.chapters.reduce(
    (sum, ch) => sum + ch.lessons.filter((l) => l.lessonType === 'VIDEO').length,
    0
  )

  return (
    <main className="min-h-screen bg-dark-900">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2">
            {/* Hero Section */}
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                {curriculum!.title}
              </h1>

              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                {curriculum!.description}
              </p>

              {/* Stats */}
              <div className="flex items-center space-x-6 mb-8 text-gray-400">
                <div className="flex items-center space-x-2">
                  <span>📹</span>
                  <span>{totalVideos} 部影片</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>⏱️</span>
                  <span>大量實戰題</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-4">
                <button className="px-8 py-3 bg-accent-yellow text-dark-900 rounded-lg font-bold hover:bg-accent-yellow-dark transition-all">
                  立即加入課程
                </button>
                {curriculumId === 1 && (
                  <button className="px-8 py-3 bg-transparent border-2 border-accent-yellow text-accent-yellow rounded-lg font-bold hover:bg-accent-yellow/10 transition-all">
                    預約 1v1 諮詢
                  </button>
                )}
              </div>
            </div>

            {/* Chapter Accordion */}
            <div>
              <ChapterAccordion chapters={curriculum!.chapters} curriculumId={curriculumId} />
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-8">
              {/* Certificate Card */}
              <div className="bg-dark-800 rounded-2xl p-6 border border-dark-600">
                {/* Certificate Image */}
                <div className="mb-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-8 aspect-[4/3] flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="mb-3">
                      <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-3xl">🎓</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">CERTIFICATE</h3>
                    <h4 className="text-lg font-bold mb-3">OF ACHIEVEMENT</h4>
                    <p className="text-sm opacity-80 mb-2">This certifies that</p>
                    <p className="font-bold text-lg mb-2">John Doe</p>
                    <p className="text-xs opacity-70">has successfully completed</p>
                    <p className="text-sm font-semibold mt-2">{curriculum!.title.substring(0, 20)}...</p>
                  </div>
                </div>

                {/* Heading */}
                <h3 className="text-xl font-bold text-white mb-4">課程證書</h3>

                {/* CTA Button */}
                <button className="w-full px-6 py-3 bg-accent-yellow text-dark-900 rounded-lg font-bold hover:bg-accent-yellow-dark transition-all">
                  立即加入課程
                </button>
              </div>

              {/* Course Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-white">
                  <GlobeAltIcon className="w-5 h-5 text-gray-400" />
                  <span>中文課程</span>
                </div>
                <div className="flex items-center space-x-3 text-white">
                  <DevicePhoneMobileIcon className="w-5 h-5 text-gray-400" />
                  <span>支援行動裝置</span>
                </div>
                <div className="flex items-center space-x-3 text-white">
                  <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                  <span>專業的完課認證</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
