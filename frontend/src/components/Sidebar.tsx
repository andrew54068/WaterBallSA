'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  AcademicCapIcon,
  TrophyIcon,
  RectangleStackIcon,
  MapIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navigation: NavItem[] = [
  { name: '首頁', href: '/', icon: HomeIcon },
  { name: '課程', href: '/courses', icon: AcademicCapIcon },
  { name: '排行榜', href: '/leaderboard', icon: TrophyIcon },
  { name: '所有單元', href: '/curriculums', icon: RectangleStackIcon },
  { name: '挑戰地圖', href: '/roadmap', icon: MapIcon },
  { name: 'SOP 寶典', href: '/sop', icon: BookOpenIcon },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-dark-800 border-r border-dark-600 flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-dark-600">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-accent-yellow to-accent-yellow-dark rounded-lg flex items-center justify-center">
            <span className="text-dark-900 font-bold text-lg">水</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-sm leading-tight">水球軟體學院</span>
            <span className="text-xs text-accent-yellow font-medium">WATERBALLSA.TW</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center px-4 py-3 rounded-lg
                    text-sm font-medium transition-all duration-200
                    group relative overflow-hidden
                    ${isActive
                      ? 'bg-accent-yellow text-dark-900 shadow-lg'
                      : 'text-gray-300 hover:bg-dark-700 hover:text-white'
                    }
                  `}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-accent-yellow to-accent-yellow-dark opacity-100" />
                  )}

                  <Icon className={`
                    w-5 h-5 mr-3 relative z-10
                    ${isActive ? 'text-dark-900' : 'text-gray-400 group-hover:text-white'}
                  `} />
                  <span className="relative z-10">{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-dark-600">
        <div className="text-xs text-gray-500 text-center">
          © 2024 WaterBallSA
        </div>
      </div>
    </aside>
  )
}
