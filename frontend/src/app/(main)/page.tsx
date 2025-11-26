import { FeaturedCourseCard } from '@/components/FeaturedCourseCard'
import { lessonsApi } from '@/lib/api/lessons'
import { curriculumsApi } from '@/lib/api/curriculums'
import Link from 'next/link'

// Mock data for featured courses (following spec)
const featuredCoursesData = [
  {
    id: 1,
    title: "軟體設計模式精通之旅",
    provider: "水球潘",
    description: "用一趟旅程的時間，成為硬核的 Coding 實戰高手",
    image: "/images/design-patterns-hero.jpg",
    hasCoupon: true,
    couponValue: 3000,
    isPurchased: false,
    hasFreeTrial: true,
    isPaidOnly: false,
  },
  {
    id: 2,
    title: "AI x BDD：規格驅動全自動開發術",
    provider: "水球潘",
    description: "AI Top 1% 工程師必修課，掌握規格驅動的全自動化開發",
    image: "/images/ai-bdd-hero.jpg",
    hasCoupon: false,
    isPurchased: false,
    hasFreeTrial: true,
    isPaidOnly: false,
  },
]

export default async function Home() {
  // Fetch first free lesson for each course
  const featuredCourses = await Promise.all(
    featuredCoursesData.map(async (course) => {
      let firstFreeLessonIndex: number | undefined
      let firstFreeChapterIndex: number | undefined

      try {
        const freePreviewLessons = await lessonsApi.getFreePreview(course.id)
        if (freePreviewLessons.length > 0) {
          firstFreeLessonIndex = freePreviewLessons[0].orderIndex
          // Get chapter info to find its order_index
          const curriculum = await curriculumsApi.getById(course.id)
          const chapter = curriculum.chapters.find(ch => ch.id === freePreviewLessons[0].chapterId)
          firstFreeChapterIndex = chapter?.orderIndex
        }
      } catch (error) {
        console.error(`Failed to fetch free preview for course ${course.id}:`, error)
      }

      return {
        ...course,
        firstFreeLessonIndex,
        firstFreeChapterIndex,
      }
    })
  )
  return (
    <main className="min-h-screen bg-dark-900">
      {/* Hero Welcome Section */}
      <section className="relative py-16 px-8 overflow-hidden">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark-800 via-dark-900 to-dark-900 opacity-80" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-yellow/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-yellow/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            歡迎來到<span className="text-accent-yellow">水球軟體學院</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-4xl leading-relaxed">
            水球軟體學院提供最先進的軟體設計思路教材，並透過線上 Code Review 來帶你掌握紮實軟體架構能力。
            只要每週投資 5 小時，就能打造不平等的優勢，成為硬核的 Coding 實戰高手。
          </p>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-12 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredCourses.map((course) => (
              <FeaturedCourseCard key={course.id} {...course} />
            ))}
          </div>
        </div>
      </section>

      {/* Info Sections */}
      <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Software Design Pattern Course Section */}
            <div className="bg-dark-800 rounded-2xl p-8 border border-dark-600 hover:border-dark-500 transition-all">
              <div className="flex items-start mb-6">
                <div className="w-14 h-14 bg-dark-700 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                  <span className="text-3xl">📚</span>
                </div>
                <h3 className="text-2xl font-bold text-white leading-tight">
                  軟體設計模式之旅課程
                </h3>
              </div>
              <p className="text-gray-300 mb-8 leading-relaxed">
                「用一趟旅程的時間，成為硬核的 Coding 高手」一套高效率的 OOAD 思路。
              </p>
              <Link
                href="/courses"
                className="inline-flex items-center px-6 py-3 bg-accent-yellow text-dark-900 rounded-lg font-bold hover:bg-accent-yellow-dark transition-all"
              >
                查看課程 →
              </Link>
            </div>

            {/* WaterBall Blog Section */}
            <div className="bg-dark-800 rounded-2xl p-8 border border-dark-600 hover:border-dark-500 transition-all">
              <div className="flex items-start mb-6">
                <div className="w-14 h-14 bg-dark-700 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                  <span className="text-3xl">📖</span>
                </div>
                <h3 className="text-2xl font-bold text-white leading-tight">
                  水球潘的部落格
                </h3>
              </div>
              <p className="text-gray-300 mb-8 leading-relaxed">
                觀看水球潘的軟體工程師職涯、軟體設計模式及架構學習，以及領域驅動設計等公開文章。
              </p>
              <Link
                href="/sop"
                className="inline-flex items-center px-6 py-3 bg-accent-yellow text-dark-900 rounded-lg font-bold hover:bg-accent-yellow-dark transition-all"
              >
                閱讀文章 →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
