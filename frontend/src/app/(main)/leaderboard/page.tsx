'use client'

import { useState } from 'react'
import { PromotionalBanner } from '@/components/PromotionalBanner'

interface LeaderboardUser {
  rank: number
  userId: string
  name: string
  avatar: string
  title: string
  level: number
  exp: number
}

// Mock data following spec
const learningRankings: LeaderboardUser[] = [
  {
    rank: 1,
    userId: "user-1",
    name: "Elliot",
    avatar: "https://ui-avatars.com/api/?name=Elliot&background=random",
    title: "初級工程師",
    level: 19,
    exp: 31040,
  },
  {
    rank: 2,
    userId: "user-2",
    name: "精靈Ken Lin",
    avatar: "https://ui-avatars.com/api/?name=Ken+Lin&background=random",
    title: "初級工程師",
    level: 18,
    exp: 29130,
  },
  {
    rank: 3,
    userId: "user-3",
    name: "Clark Chen",
    avatar: "https://ui-avatars.com/api/?name=Clark+Chen&background=random",
    title: "初級工程師",
    level: 17,
    exp: 27260,
  },
  {
    rank: 4,
    userId: "user-4",
    name: "Adam Huang",
    avatar: "https://ui-avatars.com/api/?name=Adam+Huang&background=random",
    title: "初級工程師",
    level: 16,
    exp: 25440,
  },
  {
    rank: 5,
    userId: "user-5",
    name: "酥炸香菇天婦羅",
    avatar: "https://ui-avatars.com/api/?name=Mushroom&background=random",
    title: "初級工程師",
    level: 16,
    exp: 25374,
  },
]

const weeklyGrowthRankings: LeaderboardUser[] = [
  // Similar structure, different data - placeholder for future
  ...learningRankings
]

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<'learning' | 'weekly'>('learning')

  const currentRankings = activeTab === 'learning' ? learningRankings : weeklyGrowthRankings

  return (
    <main className="min-h-screen bg-dark-900">
      {/* Promotional Banner */}
      <PromotionalBanner />

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('learning')}
            className={`px-6 py-3 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'learning'
                ? 'bg-accent-yellow text-dark-900'
                : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
            }`}
          >
            學習排行榜
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-6 py-3 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'weekly'
                ? 'bg-accent-yellow text-dark-900'
                : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
            }`}
          >
            本週成長榜
          </button>
        </div>

        {/* Leaderboard List */}
        <div className="space-y-4">
          {currentRankings.map((user) => (
            <div
              key={user.userId}
              className="bg-dark-800 rounded-2xl p-6 border border-dark-600 hover:border-dark-500 transition-all flex items-center gap-6"
            >
              {/* Rank Number */}
              <div className="flex-shrink-0 w-20 text-center">
                <span className="text-5xl font-black text-white/80">
                  {user.rank}
                </span>
              </div>

              {/* Avatar */}
              <div className="flex-shrink-0">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-14 h-14 rounded-full border-2 border-dark-600"
                />
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">
                  {user.name}
                </h3>
                <p className="text-sm text-gray-400">
                  {user.title}
                </p>
              </div>

              {/* Level Badge */}
              <div className="flex-shrink-0">
                <div className="bg-white px-4 py-2 rounded-full">
                  <span className="text-dark-900 font-bold text-sm">
                    Lv.{user.level}
                  </span>
                </div>
              </div>

              {/* EXP Points */}
              <div className="flex-shrink-0 w-24 text-right">
                <span className="text-2xl font-bold text-white">
                  {user.exp.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
