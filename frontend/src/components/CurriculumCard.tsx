import Link from 'next/link'
import type { Curriculum } from '@/types'

interface CurriculumCardProps {
  curriculum: Curriculum
}

export function CurriculumCard({ curriculum }: CurriculumCardProps) {
  const difficultyColors = {
    BEGINNER: 'bg-green-100 text-green-800',
    INTERMEDIATE: 'bg-yellow-100 text-yellow-800',
    ADVANCED: 'bg-red-100 text-red-800',
  }

  const isFree = curriculum.price === 0

  return (
    <Link href={`/curriculums/${curriculum.id}`}>
      <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        {/* Thumbnail */}
        {curriculum.thumbnailUrl && (
          <div className="relative h-48 bg-gray-200">
            <img
              src={curriculum.thumbnailUrl}
              alt={curriculum.title}
              className="w-full h-full object-cover"
            />
            {isFree && (
              <span className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                FREE
              </span>
            )}
          </div>
        )}

        <div className="p-4">
          {/* Title */}
          <h3 className="text-lg font-semibold mb-2 line-clamp-2">{curriculum.title}</h3>

          {/* Instructor */}
          <p className="text-sm text-gray-600 mb-2">By {curriculum.instructorName}</p>

          {/* Description */}
          <p className="text-sm text-gray-700 mb-4 line-clamp-2">{curriculum.description}</p>

          {/* Metadata */}
          <div className="flex items-center justify-between mb-3">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                difficultyColors[curriculum.difficultyLevel]
              }`}
            >
              {curriculum.difficultyLevel}
            </span>
            <span className="text-sm text-gray-600">
              {curriculum.estimatedDurationHours}h
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-3 border-t">
            <span className="text-lg font-bold">
              {isFree ? 'Free' : `${curriculum.currency} $${curriculum.price.toFixed(2)}`}
            </span>
            <span className="text-blue-600 hover:text-blue-800">View →</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
