import { curriculumsApi } from '@/lib/api/curriculums'
import { PromotionalBanner } from '@/components/PromotionalBanner'
import { CurriculumCard } from '@/components/CurriculumCard'

export default async function AllCurriculumsPage() {
  let curriculums = []
  let error = null

  try {
    const response = await curriculumsApi.getAll({ size: 20 })
    curriculums = response.content
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load curriculums'
    console.error('Error loading curriculums:', err)
  }

  return (
    <main className="min-h-screen bg-dark-900">
      {/* Promotional Banner */}
      <PromotionalBanner />

      {/* Page Header */}
      <section className="py-12 px-8">
        <div className="max-w-7xl mx-auto mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">所有單元</h1>
          <p className="text-gray-400">瀏覽所有可用的課程</p>
        </div>

        <div className="max-w-7xl mx-auto">
          {error ? (
            <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-6 py-4 rounded-lg">
              <p className="font-bold">Error loading courses</p>
              <p>{error}</p>
            </div>
          ) : curriculums.length === 0 ? (
            <p className="text-gray-500">目前沒有可用的課程。</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {curriculums.map((curriculum) => (
                <CurriculumCard key={curriculum.id} curriculum={curriculum} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
