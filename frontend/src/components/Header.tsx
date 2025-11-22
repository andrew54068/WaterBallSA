'use client'

import { useAuth } from '@/lib/auth-context'
import { GoogleLoginButton } from './GoogleLoginButton'
import Link from 'next/link'

export function Header() {
  const { user, isLoading, logout } = useAuth()

  // Debug logging
  console.log('[Header] Render - isLoading:', isLoading, 'user:', user ? {
    name: user.name,
    hasProfilePicture: !!user.profilePicture,
    profilePictureUrl: user.profilePicture,
  } : null)

  const handleLogout = async () => {
    console.log('[Header] Logging out...')
    await logout()
    console.log('[Header] Logout complete')
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">WaterBallSA</h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition">
              Courses
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 transition">
              About
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="h-9 w-20 bg-gray-200 animate-pulse rounded" />
            ) : user ? (
              <div className="flex items-center space-x-3">
                {user.profilePicture && (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <GoogleLoginButton />
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
