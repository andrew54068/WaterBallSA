'use client'

import { useAuth } from '@/lib/auth-context'
import { GoogleLoginButton } from './GoogleLoginButton'
import { Bars3Icon } from '@heroicons/react/24/solid'
import { useState } from 'react'

export function Header() {
  const { user, isLoading, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
    <header className="fixed top-0 left-0 right-0 h-16 bg-dark-800 border-b border-dark-600 z-50">
      <div className="flex items-center justify-between h-full px-6 ml-64">
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-gray-400 hover:text-white transition"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>

        {/* Page Title / Breadcrumb */}
        <div className="flex items-center space-x-4">
          <select className="bg-dark-700 text-white px-4 py-2 rounded-lg text-sm font-medium border border-dark-600 focus:outline-none focus:ring-2 focus:ring-accent-yellow transition">
            <option>軟體設計模式精通之旅</option>
          </select>
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
