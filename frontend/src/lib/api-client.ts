import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import type { ApiError } from '@/types'

// Use internal Docker service name for server-side requests (SSR)
// Use relative URL for client-side requests (browser) to leverage Next.js rewrites
const getApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    // Server-side (inside Docker container)
    return process.env.API_URL || 'http://backend:8080/api'
  }
  // Client-side (browser) - use relative URL, Next.js rewrites will proxy to backend
  return '/api'
}

class ApiClient {
  private client: AxiosInstance
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (value?: unknown) => void
    reject: (reason?: unknown) => void
  }> = []

  constructor() {
    this.client = axios.create({
      baseURL: getApiBaseUrl(),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        // Add JWT token from localStorage (only in browser)
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('accessToken')
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        if (error.response) {
          const apiError = error.response.data
          console.error('API Error:', apiError)

          // Handle 401 Unauthorized - try to refresh token
          if (error.response.status === 401 && !originalRequest._retry && typeof window !== 'undefined') {
            if (this.isRefreshing) {
              // If already refreshing, queue this request
              return new Promise((resolve, reject) => {
                this.failedQueue.push({ resolve, reject })
              })
                .then(() => {
                  return this.client(originalRequest)
                })
                .catch((err) => {
                  return Promise.reject(err)
                })
            }

            originalRequest._retry = true
            this.isRefreshing = true

            const refreshToken = localStorage.getItem('refreshToken')

            if (!refreshToken) {
              // No refresh token, logout user
              this.handleLogout()
              return Promise.reject(apiError)
            }

            try {
              // Attempt to refresh the token
              const response = await axios.post(
                `${getApiBaseUrl()}/auth/refresh`,
                { refreshToken }
              )

              const { accessToken } = response.data

              // Store new access token
              localStorage.setItem('accessToken', accessToken)

              // Notify auth context of token refresh
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('auth:token-refreshed', {
                  detail: { accessToken }
                }))
              }

              // Update the Authorization header for the original request
              originalRequest.headers.Authorization = `Bearer ${accessToken}`

              // Process queued requests
              this.processQueue(null)

              // Retry the original request
              return this.client(originalRequest)
            } catch (refreshError) {
              // Refresh token is invalid, logout user
              this.processQueue(refreshError)
              this.handleLogout()
              return Promise.reject(refreshError)
            } finally {
              this.isRefreshing = false
            }
          }

          return Promise.reject(apiError)
        }

        return Promise.reject(error)
      }
    )
  }

  private processQueue(error: unknown) {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error)
      } else {
        promise.resolve()
      }
    })

    this.failedQueue = []
  }

  private handleLogout() {
    console.log('[ApiClient] Token refresh failed, logging out...')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')

    // Dispatch custom event to notify auth context
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:logout'))
    }
  }

  getClient(): AxiosInstance {
    return this.client
  }
}

export const apiClient = new ApiClient().getClient()
