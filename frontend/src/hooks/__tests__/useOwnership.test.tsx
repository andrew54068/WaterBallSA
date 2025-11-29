/**
 * Unit tests for useOwnership hook
 *
 * Tests cover:
 * - Loading states
 * - Authenticated vs unauthenticated users
 * - Cache hit/miss scenarios
 * - Error handling and retry mechanism
 * - Event-driven cache invalidation
 * - Fail-secure defaults
 */

import { renderHook, waitFor } from '@testing-library/react'
import { useOwnership } from '../useOwnership'
import { purchasesApi } from '@/lib/api/purchases'
import { useAuth } from '@/lib/auth-context'

// Mock dependencies
jest.mock('@/lib/auth-context')
jest.mock('@/lib/api/purchases')

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockPurchasesApi = purchasesApi as jest.Mocked<typeof purchasesApi>

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store: { [key: string]: string } = {}

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
})

describe('useOwnership', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSessionStorage.clear()
  })

  describe('Authentication States', () => {
    it('should not fetch when user is not authenticated', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      } as any)

      const { result } = renderHook(() => useOwnership(1, true))

      await waitFor(() => {
        expect(result.current.owns).toBe(false)
        expect(result.current.isLoading).toBe(false)
        expect(mockPurchasesApi.checkOwnership).not.toHaveBeenCalled()
      })
    })

    it('should fetch ownership when user is authenticated', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, email: 'test@example.com' },
        isAuthenticated: true,
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      } as any)

      mockPurchasesApi.checkOwnership.mockResolvedValue({
        owns: true,
        purchaseId: 123,
        purchaseDate: '2025-11-29T00:00:00Z',
      })

      const { result } = renderHook(() => useOwnership(1, true))

      await waitFor(() => {
        expect(result.current.owns).toBe(true)
        expect(result.current.purchaseId).toBe(123)
        expect(result.current.isLoading).toBe(false)
        expect(mockPurchasesApi.checkOwnership).toHaveBeenCalledWith(1)
      })
    })
  })

  describe('Caching Mechanism', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, email: 'test@example.com' },
        isAuthenticated: true,
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      } as any)
    })

    it('should use cached data if available and not expired', async () => {
      const cacheData = {
        '1': {
          owns: true,
          purchaseId: 123,
          timestamp: Date.now(),
        },
      }

      mockSessionStorage.setItem('ownership_cache', JSON.stringify(cacheData))

      const { result } = renderHook(() => useOwnership(1, true))

      await waitFor(() => {
        expect(result.current.owns).toBe(true)
        expect(result.current.purchaseId).toBe(123)
        expect(result.current.isLoading).toBe(false)
        // Should not call API if cache is valid
        expect(mockPurchasesApi.checkOwnership).not.toHaveBeenCalled()
      })
    })

    it('should fetch fresh data if cache is expired', async () => {
      const cacheData = {
        '1': {
          owns: true,
          purchaseId: 123,
          timestamp: Date.now() - 6 * 60 * 1000, // 6 minutes ago (expired)
        },
      }

      mockSessionStorage.setItem('ownership_cache', JSON.stringify(cacheData))

      mockPurchasesApi.checkOwnership.mockResolvedValue({
        owns: false,
      })

      const { result } = renderHook(() => useOwnership(1, true))

      await waitFor(() => {
        expect(result.current.owns).toBe(false)
        expect(mockPurchasesApi.checkOwnership).toHaveBeenCalledWith(1)
      })
    })

    it('should cache successful API responses', async () => {
      mockPurchasesApi.checkOwnership.mockResolvedValue({
        owns: true,
        purchaseId: 456,
        purchaseDate: '2025-11-29T00:00:00Z',
      })

      const { result } = renderHook(() => useOwnership(1, true))

      await waitFor(() => {
        expect(result.current.owns).toBe(true)

        const cachedData = JSON.parse(mockSessionStorage.getItem('ownership_cache') || '{}')
        expect(cachedData['1']).toBeDefined()
        expect(cachedData['1'].owns).toBe(true)
        expect(cachedData['1'].purchaseId).toBe(456)
      })
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, email: 'test@example.com' },
        isAuthenticated: true,
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      } as any)
    })

    it('should fail secure on API error (default to owns=false)', async () => {
      mockPurchasesApi.checkOwnership.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useOwnership(1, true))

      await waitFor(() => {
        expect(result.current.owns).toBe(false)
        expect(result.current.error).toBeTruthy()
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should provide retry mechanism', async () => {
      mockPurchasesApi.checkOwnership
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ owns: true, purchaseId: 789 })

      const { result } = renderHook(() => useOwnership(1, true))

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
      })

      // Retry
      result.current.retry()

      await waitFor(() => {
        expect(result.current.owns).toBe(true)
        expect(result.current.purchaseId).toBe(789)
        expect(result.current.error).toBeNull()
      })
    })
  })

  describe('Event-Driven Cache Invalidation', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, email: 'test@example.com' },
        isAuthenticated: true,
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      } as any)
    })

    it('should invalidate cache and refetch on curriculum-purchased event', async () => {
      // Set up initial cache
      const cacheData = {
        '1': {
          owns: false,
          timestamp: Date.now(),
        },
      }
      mockSessionStorage.setItem('ownership_cache', JSON.stringify(cacheData))

      mockPurchasesApi.checkOwnership.mockResolvedValue({
        owns: true,
        purchaseId: 999,
      })

      const { result } = renderHook(() => useOwnership(1, true))

      await waitFor(() => {
        expect(result.current.owns).toBe(false)
      })

      // Dispatch purchase event
      window.dispatchEvent(
        new CustomEvent('curriculum-purchased', {
          detail: { curriculumId: 1 },
        })
      )

      await waitFor(() => {
        expect(result.current.owns).toBe(true)
        expect(result.current.purchaseId).toBe(999)
      })
    })

    it('should not refetch if event is for different curriculum', async () => {
      mockPurchasesApi.checkOwnership.mockResolvedValue({
        owns: false,
      })

      const { result } = renderHook(() => useOwnership(1, true))

      await waitFor(() => {
        expect(result.current.owns).toBe(false)
      })

      const callCount = mockPurchasesApi.checkOwnership.mock.calls.length

      // Dispatch purchase event for different curriculum
      window.dispatchEvent(
        new CustomEvent('curriculum-purchased', {
          detail: { curriculumId: 2 },
        })
      )

      await new Promise((resolve) => setTimeout(resolve, 100))

      // Should not have called API again
      expect(mockPurchasesApi.checkOwnership.mock.calls.length).toBe(callCount)
    })
  })

  describe('Logout Behavior', () => {
    it('should clear cache and reset state on logout', async () => {
      // Start authenticated
      mockUseAuth.mockReturnValue({
        user: { id: 1, email: 'test@example.com' },
        isAuthenticated: true,
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      } as any)

      mockPurchasesApi.checkOwnership.mockResolvedValue({
        owns: true,
        purchaseId: 123,
      })

      const { result, rerender } = renderHook(() => useOwnership(1, true))

      await waitFor(() => {
        expect(result.current.owns).toBe(true)
      })

      // Simulate logout
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      } as any)

      rerender()

      await waitFor(() => {
        expect(result.current.owns).toBe(false)
        expect(result.current.purchaseId).toBeUndefined()
        expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('ownership_cache')
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined curriculumId gracefully', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, email: 'test@example.com' },
        isAuthenticated: true,
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      } as any)

      const { result } = renderHook(() => useOwnership(undefined, true))

      await waitFor(() => {
        expect(result.current.owns).toBe(false)
        expect(result.current.isLoading).toBe(false)
        expect(mockPurchasesApi.checkOwnership).not.toHaveBeenCalled()
      })
    })

    it('should respect enabled=false parameter', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, email: 'test@example.com' },
        isAuthenticated: true,
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      } as any)

      const { result } = renderHook(() => useOwnership(1, false))

      await waitFor(() => {
        expect(result.current.owns).toBe(false)
        expect(result.current.isLoading).toBe(false)
        expect(mockPurchasesApi.checkOwnership).not.toHaveBeenCalled()
      })
    })

    it('should handle malformed cache data gracefully', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, email: 'test@example.com' },
        isAuthenticated: true,
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      } as any)

      // Set malformed cache
      mockSessionStorage.setItem('ownership_cache', 'invalid-json')

      mockPurchasesApi.checkOwnership.mockResolvedValue({
        owns: true,
      })

      const { result } = renderHook(() => useOwnership(1, true))

      await waitFor(() => {
        expect(result.current.owns).toBe(true)
        // Should have fetched from API despite bad cache
        expect(mockPurchasesApi.checkOwnership).toHaveBeenCalled()
      })
    })
  })
})
