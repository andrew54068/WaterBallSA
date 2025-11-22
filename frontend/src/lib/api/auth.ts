import { apiClient } from '../api-client'
import { User } from '@/types'

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

export interface RefreshTokenResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
}

export const authApi = {
  /**
   * Exchange Google ID token for backend JWT tokens
   */
  async loginWithGoogle(idToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/google', {
      googleIdToken: idToken,
    })
    return response.data
  },

  /**
   * Refresh the access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
    })
    return response.data
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(accessToken: string): Promise<User> {
    const response = await apiClient.get<User>('/auth/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return response.data
  },

  /**
   * Logout (client-side token cleanup)
   */
  async logout(): Promise<void> {
    // In a stateless JWT system, logout is primarily client-side
    // Clear tokens from storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  },
}
