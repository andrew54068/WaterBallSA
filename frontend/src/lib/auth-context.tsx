'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authApi } from './api/auth'
import { User } from '@/types'

interface AuthContextType {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  login: (googleIdToken: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      console.log('[AuthContext] Initializing auth...')
      const storedAccessToken = localStorage.getItem('accessToken')

      if (storedAccessToken) {
        console.log('[AuthContext] Found stored access token')
        try {
          // Verify token is still valid by fetching user profile
          const userProfile = await authApi.getCurrentUser(storedAccessToken)
          console.log('[AuthContext] Restored user session:', {
            name: userProfile.name,
            hasProfilePicture: !!userProfile.profilePicture,
          })
          setUser(userProfile)
          setAccessToken(storedAccessToken)
        } catch (error) {
          // Token is invalid or expired, clear it
          console.error('[AuthContext] Stored token is invalid:', error)
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        }
      } else {
        console.log('[AuthContext] No stored token found')
      }

      setIsLoading(false)
      console.log('[AuthContext] Initialization complete')
    }

    initAuth()
  }, [])

  const login = async (googleIdToken: string) => {
    try {
      setIsLoading(true)
      console.log('[AuthContext] Starting login flow...')

      // Exchange Google ID token for backend JWT
      console.log('[AuthContext] Exchanging Google token for backend JWT...')
      const authResponse = await authApi.loginWithGoogle(googleIdToken)
      console.log('[AuthContext] Received JWT tokens from backend')

      // Store tokens
      setAccessToken(authResponse.accessToken)
      localStorage.setItem('accessToken', authResponse.accessToken)
      localStorage.setItem('refreshToken', authResponse.refreshToken)
      console.log('[AuthContext] Tokens stored in localStorage')

      // Get user profile
      console.log('[AuthContext] Fetching user profile...')
      const userProfile = await authApi.getCurrentUser(authResponse.accessToken)
      console.log('[AuthContext] User profile received:', {
        name: userProfile.name,
        email: userProfile.email,
        hasProfilePicture: !!userProfile.profilePicture,
        profilePictureUrl: userProfile.profilePicture,
      })
      setUser(userProfile)
      console.log('[AuthContext] Login complete!')
    } catch (error) {
      console.error('[AuthContext] Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear state regardless of API call success
      setUser(null)
      setAccessToken(null)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
