'use client'

import Link from 'next/link'
import Image from 'next/image'

interface FeaturedCourseCardProps {
  id: number
  title: string
  provider: string
  description: string
  image: string
  hasCoupon?: boolean
  couponValue?: number
  isPurchased?: boolean
  hasFreeTrial?: boolean
  isPaidOnly?: boolean
  firstFreeLessonIndex?: number
  firstFreeChapterIndex?: number
}

export function FeaturedCourseCard({
  id,
  title,
  provider,
  description,
  image,
  hasCoupon = false,
  couponValue,
  isPurchased = false,
  hasFreeTrial = false,
  isPaidOnly = false,
  firstFreeLessonIndex,
  firstFreeChapterIndex,
}: FeaturedCourseCardProps) {
  return (
    <div className="relative bg-dark-800 rounded-2xl overflow-hidden border-2 border-accent-yellow/30 hover:border-accent-yellow transition-all duration-300 group">
      {/* Hero Image */}
      <div className="relative h-64 bg-gradient-to-br from-dark-700 to-dark-900 overflow-hidden">
        {image && (
          <div className="w-full h-full flex items-center justify-center p-8">
            <div className="relative w-full h-full">
              {/* Placeholder for course hero visual */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-4">🎯</div>
                  <h4 className="text-2xl font-bold text-white mb-2">{title.substring(0, 10)}...</h4>
                  <p className="text-sm text-gray-300">{provider}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
            isPurchased
              ? 'bg-green-500 text-white'
              : 'bg-accent-yellow text-dark-900'
          }`}>
            {isPurchased ? '已購買' : '尚未購券'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-2xl font-bold text-white mb-3 leading-tight">
          {title}
        </h3>

        {/* Provider Badge */}
        <div className="inline-flex items-center px-3 py-1.5 bg-accent-yellow/20 border border-accent-yellow/40 rounded-full mb-4">
          <span className="text-accent-yellow font-semibold text-sm">{provider}</span>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm mb-6 line-clamp-2">
          {description}
        </p>

        {/* Coupon Banner */}
        {hasCoupon && couponValue && (
          <div className="mb-4 p-3 bg-accent-yellow/10 border border-accent-yellow/30 rounded-lg">
            <p className="text-accent-yellow text-sm font-bold text-center">
              你有一張 {couponValue.toLocaleString()} 折價券
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {hasFreeTrial && firstFreeLessonIndex !== undefined && firstFreeChapterIndex !== undefined && (
            <Link
              href={`/course/${id}/chapters/${firstFreeChapterIndex}/lessons/${firstFreeLessonIndex}`}
              className="flex-1 px-6 py-3 bg-accent-yellow text-dark-900 rounded-lg font-bold text-center hover:bg-accent-yellow-dark transition-all"
            >
              試體驗課程
            </Link>
          )}
          {isPaidOnly && !hasFreeTrial && (
            <button
              disabled
              className="flex-1 px-6 py-3 bg-dark-600 text-gray-500 rounded-lg font-bold text-center cursor-not-allowed"
            >
              價限付費
            </button>
          )}
          <Link
            href={`/curriculums/${id}`}
            className={`${hasFreeTrial || isPaidOnly ? 'flex-1' : 'w-full'} px-6 py-3 bg-transparent border-2 border-white/30 text-white rounded-lg font-bold text-center hover:bg-white/10 hover:border-white/50 transition-all`}
          >
            立即購買
          </Link>
        </div>
      </div>
    </div>
  )
}
