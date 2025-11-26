import Link from 'next/link'
import type { Curriculum } from '@/types'

interface CurriculumCardProps {
  curriculum: Curriculum
}

export function CurriculumCard({ curriculum }: CurriculumCardProps) {
  const difficultyColors = {
    BEGINNER: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    INTERMEDIATE: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    ADVANCED: 'bg-red-500/20 text-red-400 border-red-500/30',
  }

  const difficultyLabels = {
    BEGINNER: '水球潘',
    INTERMEDIATE: '中級',
    ADVANCED: '高級',
  }

  const isFree = curriculum.price === 0

  // Use illustrative placeholder images if no thumbnail
  const getPlaceholderImage = (id: number) => {
    // Generate different colored placeholders for variety
    const colors = ['4F46E5', '06B6D4', '8B5CF6', 'F59E0B', 'EF4444']
    const color = colors[id % colors.length]
    return `https://placehold.co/600x400/${color}/ffffff?text=${encodeURIComponent(curriculum.title.substring(0, 10))}&font=noto-sans`
  }

  const thumbnailUrl = curriculum.thumbnailUrl || getPlaceholderImage(curriculum.id)

  return (
    <Link href={`/curriculums/${curriculum.id}`}>
      <div className="group relative bg-dark-800 rounded-2xl overflow-hidden border-2 border-dark-600 hover:border-accent-yellow/50 transition-all duration-300 card-hover-lift cursor-pointer">
        {/* Thumbnail with overlay */}
        <div className="relative h-56 bg-gradient-to-br from-dark-700 to-dark-800 overflow-hidden">
          <img
            src={thumbnailUrl}
            alt={curriculum.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent" />

          {/* Free badge */}
          {isFree && (
            <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
              FREE
            </div>
          )}

          {/* Title overlay on image */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-accent-yellow transition-colors">
              {curriculum.title}
            </h3>
          </div>
        </div>

        <div className="p-6">
          {/* Instructor */}
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-accent-yellow to-accent-yellow-dark rounded-full flex items-center justify-center mr-2">
              <span className="text-dark-900 font-bold text-sm">水</span>
            </div>
            <p className="text-sm text-gray-400">{curriculum.instructorName || '水球潘'}</p>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-300 mb-4 line-clamp-3 leading-relaxed">
            {curriculum.description}
          </p>

          {/* Metadata */}
          <div className="flex items-center justify-between mb-4">
            <span
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold ${
                curriculum.difficultyLevel === 'BEGINNER'
                  ? 'bg-teal-500 text-white'
                  : curriculum.difficultyLevel === 'INTERMEDIATE'
                  ? 'bg-orange-500 text-white'
                  : 'bg-red-500 text-white'
              }`}
            >
              {difficultyLabels[curriculum.difficultyLevel] || curriculum.difficultyLevel}
            </span>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {curriculum.estimatedDurationHours}h
              </span>
            </div>
          </div>

          {/* Price and CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-dark-600">
            <div>
              {isFree ? (
                <span className="text-2xl font-bold text-green-400">免費</span>
              ) : (
                <div>
                  <span className="text-xs text-gray-500 line-through block">看完課程送 3,000 元</span>
                  <span className="text-2xl font-bold text-white">
                    {curriculum.currency} ${curriculum.price.toFixed(0)}
                  </span>
                </div>
              )}
            </div>
            <button className="px-5 py-2.5 bg-accent-yellow text-dark-900 rounded-lg font-bold text-sm hover:bg-accent-yellow-dark transition-all group-hover:shadow-lg">
              立即購買
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
