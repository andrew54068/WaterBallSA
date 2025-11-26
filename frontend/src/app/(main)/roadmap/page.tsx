'use client'

import { useState } from 'react'
import { PromotionalBanner } from '@/components/PromotionalBanner'
import { ClockIcon, StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { LockClosedIcon } from '@heroicons/react/24/solid'

interface Challenge {
  id: number
  number: number
  title: string
  isLocked: boolean
  stars: 1 | 2 | 3
}

// Mock data following spec
const mainPathChallenges: Challenge[] = [
  {
    id: 1,
    number: 1,
    title: "行雲流水的設計底層思路",
    isLocked: true,
    stars: 1,
  },
  {
    id: 2,
    number: 2,
    title: "Christopher Alexander：設計模式",
    isLocked: true,
    stars: 1,
  },
  {
    id: 3,
    number: 3,
    title: "掌握「樣板方法」最基礎的控制反轉",
    isLocked: true,
    stars: 2,
  },
  {
    id: 4,
    number: 4,
    title: "規劃行為實踐流派：Big 2",
    isLocked: true,
    stars: 2,
  },
  {
    id: 5,
    number: 5,
    title: "多重設計範型決策戰演練：RPG",
    isLocked: true,
    stars: 3,
  },
]

const sidePathChallenges: Challenge[] = [
  // Similar structure - placeholder for future
]

export default function RoadmapPage() {
  const [activeTab, setActiveTab] = useState<'main' | 'side'>('main')

  const currentChallenges = activeTab === 'main' ? mainPathChallenges : sidePathChallenges

  return (
    <main className="min-h-screen bg-dark-900">
      {/* Promotional Banner */}
      <PromotionalBanner />

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-accent-yellow mb-2">
            軟體設計模式精通之旅
          </h1>
          <p className="text-gray-400">挑戰地圖</p>
        </div>

        {/* Progress Stats */}
        <div className="flex justify-between items-center mb-8 bg-dark-800 rounded-2xl p-6 border border-dark-600">
          <div className="flex items-center space-x-3">
            <ClockIcon className="w-6 h-6 text-gray-400" />
            <span className="text-white font-medium">0 days left</span>
          </div>
          <div className="flex items-center space-x-3">
            <StarIcon className="w-6 h-6 text-gray-400" />
            <span className="text-white font-medium">0/20 cleared</span>
          </div>
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-white font-medium">0 XP</span>
          </div>
        </div>

        {/* Path Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('main')}
            className={`flex-1 px-6 py-3 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'main'
                ? 'bg-accent-yellow text-dark-900'
                : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
            }`}
          >
            主線
          </button>
          <button
            onClick={() => setActiveTab('side')}
            className={`flex-1 px-6 py-3 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'side'
                ? 'bg-accent-yellow text-dark-900'
                : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
            }`}
          >
            支線
          </button>
        </div>

        {/* Section Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-4">
            <div className="flex-1 h-px bg-dark-600" />
            <h2 className="text-lg font-medium text-gray-400">自段道館</h2>
            <div className="flex-1 h-px bg-dark-600" />
          </div>
        </div>

        {/* Challenge List */}
        <div className="space-y-4">
          {currentChallenges.length === 0 ? (
            <div className="bg-dark-800 rounded-2xl p-8 text-center border border-dark-600">
              <p className="text-gray-400">目前沒有挑戰</p>
            </div>
          ) : (
            currentChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className="bg-dark-800 rounded-2xl p-6 border border-dark-600 hover:border-dark-500 transition-all flex items-center gap-6"
              >
                {/* Challenge Number Badge */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center border-2 border-dark-600">
                    <span className="text-white font-bold text-xl">
                      {challenge.number}
                    </span>
                  </div>
                  {challenge.isLocked && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-dark-900 rounded-full flex items-center justify-center">
                      <LockClosedIcon className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Challenge Title */}
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white">
                    {challenge.title}
                  </h3>
                </div>

                {/* Star Rating */}
                <div className="flex-shrink-0 flex items-center space-x-1">
                  {Array.from({ length: challenge.stars }).map((_, i) => (
                    <StarIconSolid key={i} className="w-5 h-5 text-accent-yellow" />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
