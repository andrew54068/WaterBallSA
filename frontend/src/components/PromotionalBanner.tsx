'use client'

import Link from 'next/link'
import { XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

export function PromotionalBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="relative bg-gradient-to-r from-accent-yellow via-accent-yellow to-accent-yellow-dark border-b-4 border-accent-yellow-dark overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.15) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />
      </div>

      <div className="relative flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center space-x-4 flex-1">
          <div className="hidden md:flex items-center justify-center w-12 h-12 bg-dark-900 rounded-full animate-pulse">
            <span className="text-2xl">🎉</span>
          </div>

          <div className="flex-1">
            <p className="text-dark-900 font-bold text-base md:text-lg leading-tight">
              🎯 <span className="underline decoration-2 decoration-dark-900">軟體設計模式精通之旅</span>體驗課程的全部影片看完就可以<span className="underline decoration-wavy decoration-dark-900">獲得 3000 元課程折價券</span> ↓
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 ml-4">
          <Link
            href="/curriculums"
            className="
              hidden sm:flex items-center px-6 py-2.5
              bg-dark-900 text-accent-yellow
              rounded-lg font-bold text-sm
              hover:bg-dark-800 transition-all duration-200
              shadow-lg hover:shadow-xl
              group
            "
          >
            <span>前往</span>
            <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>

          <button
            onClick={() => setIsVisible(false)}
            className="
              p-2 rounded-full
              bg-dark-900/20 hover:bg-dark-900/40
              text-dark-900 hover:text-dark-800
              transition-all duration-200
            "
            aria-label="Close banner"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
