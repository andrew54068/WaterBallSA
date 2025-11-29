import axios, { AxiosError, AxiosInstance } from 'axios'
import type { ApiError } from '@/types'

// Use internal Docker service name for server-side requests (SSR)
// Use public URL for client-side requests (browser)
const getApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    // Server-side (inside Docker container)
    return process.env.API_URL || 'http://backend:8080/api'
  }
  // Client-side (browser)
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
}

class ApiClient {
  private client: AxiosInstance

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

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response) {
          const apiError = error.response.data
          console.error('API Error:', apiError)

          // Handle specific error cases
          if (error.response.status === 401) {
            // TODO: Redirect to login or refresh token
            console.error('Unauthorized - redirecting to login')
          }

          return Promise.reject(apiError)
        }

        return Promise.reject(error)
      }
    )
  }

  getClient(): AxiosInstance {
    return this.client
  }
}

export const apiClient = new ApiClient().getClient()
