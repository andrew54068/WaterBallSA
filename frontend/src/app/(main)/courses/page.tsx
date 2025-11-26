import { FeaturedCourseCard } from '@/components/FeaturedCourseCard'
import { lessonsApi } from '@/lib/api/lessons'
import { curriculumsApi } from '@/lib/api/curriculums'

// Phase 2: Order type (to be implemented)
interface Order {
  id: number
  // Add more fields when implementing Phase 2
}

// Mock data for courses (following spec)
const coursesData = [
  {
    id: 1,
    title: "軟體設計模式精通之旅",
    provider: "水球潘",
    description: "用一趟旅程的時間，成為硬核的 Coding 實戰高手",
    image: "/images/design-patterns.jpg",
    isPurchased: false,
    hasFreeTrial: true,
    isPaidOnly: false,
    hasCoupon: true,
    couponValue: 3000,
  },
  {
    id: 2,
    title: "AI x BDD：規格驅動全自動開發術",
    provider: "水球潘",
    description: "AI Top 1% 工程師必修課，掌握規格驅動的全自動化開發",
    image: "/images/ai-bdd.jpg",
    isPurchased: false,
    hasFreeTrial: true,
    isPaidOnly: false,
    hasCoupon: false,
  },
]

// Mock order data (empty for now - Phase 2 feature)
const orders: Order[] = []

export default async function CoursesPage() {
  // Fetch first free lesson for each course
  const courses = await Promise.all(
    coursesData.map(async (course) => {
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
      {/* Courses Grid */}
      <section className="py-12 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {courses.map((course) => (
              <FeaturedCourseCard key={course.id} {...course} />
            ))}
          </div>
        </div>
      </section>

      {/* Order History Section */}
      <section className="py-12 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-dark-800 rounded-2xl p-8 border border-dark-600">
            {/* Header */}
            <div className="flex items-center mb-6">
              <span className="text-2xl mr-3">📋</span>
              <h2 className="text-2xl font-bold text-white">訂單紀錄</h2>
            </div>

            {/* Empty State */}
            {orders.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-gray-400 text-lg">目前沒有訂單紀錄</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Future: Order list will be displayed here */}
                {orders.map((order) => (
                  <div key={order.id} className="bg-dark-700 p-4 rounded-lg">
                    {/* Order details */}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
