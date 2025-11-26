'use client'

import { useAuth } from '@/lib/auth-context'
import { GoogleLoginButton } from './GoogleLoginButton'

export function LessonViewerHeader() {
  const { user, isLoading, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-dark-800 border-b border-dark-600 z-50">
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo / Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-accent-yellow to-accent-yellow-dark rounded-lg flex items-center justify-center">
            <span className="text-dark-900 font-bold text-lg">水</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-sm leading-tight">水球軟體學院</span>
            <span className="text-xs text-accent-yellow font-medium">WATERBALLSA.TW</span>
          </div>
        </div>

        {/* Auth Section */}
        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="h-10 w-20 bg-dark-700 animate-pulse rounded-lg" />
          ) : user ? (
            <div className="flex items-center space-x-3">
              {user.profilePicture && (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="w-9 h-9 rounded-full ring-2 ring-dark-600"
                />
              )}
              <span className="hidden md:block text-sm font-medium text-white">
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white border border-dark-600 rounded-lg hover:bg-dark-700 transition"
              >
                登出
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <GoogleLoginButton />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
