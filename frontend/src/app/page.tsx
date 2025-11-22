import { curriculumsApi } from '@/lib/api/curriculums'
import { CurriculumCard } from '@/components/CurriculumCard'

export default async function Home() {
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
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to WaterBallSA
          </h1>
          <p className="text-xl md:text-2xl">
            Learn programming, data science, and more with our expert-led courses
          </p>
        </div>
      </div>

      {/* Curriculums Section */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">Available Courses</h2>

        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error loading courses</p>
            <p>{error}</p>
          </div>
        ) : curriculums.length === 0 ? (
          <p className="text-gray-600">No courses available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {curriculums.map((curriculum) => (
              <CurriculumCard key={curriculum.id} curriculum={curriculum} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
