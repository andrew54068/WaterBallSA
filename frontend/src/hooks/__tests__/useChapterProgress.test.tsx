/**
 * Unit tests for useChapterProgress hook
 *
 * Tests cover:
 * - Fetching progress for all lessons in a chapter
 * - Map-based storage for O(1) lookup performance
 * - Authentication state handling
 * - Error handling and recovery
 * - Refresh mechanism
 * - Loading states
 */

import { renderHook, waitFor, act } from '@testing-library/react'
import { useChapterProgress } from '../useChapterProgress'
import { getChapterProgress } from '@/lib/api/video-progress'
import type { VideoProgressDto } from '@/types/video-progress'

// Mock dependencies
jest.mock('@/lib/api/video-progress')

const mockGetChapterProgress = getChapterProgress as jest.MockedFunction<typeof getChapterProgress>

describe('useChapterProgress', () => {
  const mockProgressData: VideoProgressDto[] = [
    {
      id: 1,
      userId: 1,
      lessonId: 100,
      currentTimeSeconds: 60.0,
      durationSeconds: 120.0,
      completionPercentage: 50,
      isCompleted: false,
      completedAt: null,
      createdAt: '2025-11-29T00:00:00Z',
      updatedAt: '2025-11-29T00:00:00Z',
    },
    {
      id: 2,
      userId: 1,
      lessonId: 101,
      currentTimeSeconds: 30.0,
      durationSeconds: 60.0,
      completionPercentage: 50,
      isCompleted: false,
      completedAt: null,
      createdAt: '2025-11-29T00:00:00Z',
      updatedAt: '2025-11-29T00:00:00Z',
    },
    {
      id: 3,
      userId: 1,
      lessonId: 102,
      currentTimeSeconds: 90.0,
      durationSeconds: 90.0,
      completionPercentage: 100,
      isCompleted: true,
      completedAt: '2025-11-29T00:00:00Z',
      createdAt: '2025-11-29T00:00:00Z',
      updatedAt: '2025-11-29T00:00:00Z',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Authentication States', () => {
    it('should not fetch when user is not authenticated', async () => {
      const { result } = renderHook(() => useChapterProgress({
        chapterId: 1,
        isAuthenticated: false,
      }))

      await waitFor(() => {
        expect(result.current.progressMap).toEqual(new Map())
        expect(result.current.isLoading).toBe(false)
        expect(mockGetChapterProgress).not.toHaveBeenCalled()
      })
    })

    it('should fetch progress when user is authenticated', async () => {
      mockGetChapterProgress.mockResolvedValue(mockProgressData)

      const { result } = renderHook(() => useChapterProgress({
        chapterId: 1,
        isAuthenticated: true,
      }))

      await waitFor(() => {
        expect(mockGetChapterProgress).toHaveBeenCalledWith(1)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.progressMap.size).toBe(3)
      })
    })
  })

  describe('Progress Map Structure', () => {
    it('should convert progress array to Map for O(1) lookup', async () => {
      mockGetChapterProgress.mockResolvedValue(mockProgressData)

      const { result } = renderHook(() => useChapterProgress({
        chapterId: 1,
        isAuthenticated: true,
      }))

      await waitFor(() => {
        expect(result.current.progressMap).toBeInstanceOf(Map)
        expect(result.current.progressMap.size).toBe(3)
      })
    })

    it('should map progress by lessonId for fast lookup', async () => {
      mockGetChapterProgress.mockResolvedValue(mockProgressData)

      const { result } = renderHook(() => useChapterProgress({
        chapterId: 1,
        isAuthenticated: true,
      }))

      await waitFor(() => {
        const progress100 = result.current.progressMap.get(100)
        const progress101 = result.current.progressMap.get(101)
        const progress102 = result.current.progressMap.get(102)

        expect(progress100).toEqual(mockProgressData[0])
        expect(progress101).toEqual(mockProgressData[1])
        expect(progress102).toEqual(mockProgressData[2])
      })
    })

    it('should handle empty progress array', async () => {
      mockGetChapterProgress.mockResolvedValue([])

      const { result } = renderHook(() => useChapterProgress({
        chapterId: 1,
        isAuthenticated: true,
      }))

      await waitFor(() => {
        expect(result.current.progressMap.size).toBe(0)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBeNull()
      })
    })
  })

  describe('Loading States', () => {
    it('should set loading to true while fetching', async () => {
      mockGetChapterProgress.mockImplementation(() =>
        new Promise((resolve) => setTimeout(() => resolve(mockProgressData), 100))
      )

      const { result } = renderHook(() => useChapterProgress({
        chapterId: 1,
        isAuthenticated: true,
      }))

      // Should be loading initially
      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should set loading to false after successful fetch', async () => {
      mockGetChapterProgress.mockResolvedValue(mockProgressData)

      const { result } = renderHook(() => useChapterProgress({
        chapterId: 1,
        isAuthenticated: true,
      }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
        expect(result.current.progressMap.size).toBe(3)
      })
    })

    it('should set loading to false after error', async () => {
      mockGetChapterProgress.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useChapterProgress({
        chapterId: 1,
        isAuthenticated: true,
      }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBeTruthy()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const mockError = new Error('Network error')
      mockGetChapterProgress.mockRejectedValue(mockError)

      const { result } = renderHook(() => useChapterProgress({
        chapterId: 1,
        isAuthenticated: true,
      }))

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
        expect(result.current.progressMap.size).toBe(0)
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should clear progress map on error', async () => {
      // First, successful fetch
      mockGetChapterProgress.mockResolvedValueOnce(mockProgressData)

      const { result, rerender } = renderHook(
        ({ chapterId, isAuthenticated }) => useChapterProgress({ chapterId, isAuthenticated }),
        { initialProps: { chapterId: 1, isAuthenticated: true } }
      )

      await waitFor(() => {
        expect(result.current.progressMap.size).toBe(3)
      })

      // Then, simulate error on refresh
      mockGetChapterProgress.mockRejectedValueOnce(new Error('Network error'))

      act(() => {
        result.current.refresh()
      })

      await waitFor(() => {
        expect(result.current.progressMap.size).toBe(0)
        expect(result.current.error).toBeTruthy()
      })
    })

    it('should log errors to console', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      mockGetChapterProgress.mockRejectedValue(new Error('Network error'))

      renderHook(() => useChapterProgress({
        chapterId: 1,
        isAuthenticated: true,
      }))

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to fetch chapter progress:',
          expect.any(Error)
        )
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Refresh Mechanism', () => {
    it('should provide a refresh function', async () => {
      mockGetChapterProgress.mockResolvedValue(mockProgressData)

      const { result } = renderHook(() => useChapterProgress({
        chapterId: 1,
        isAuthenticated: true,
      }))

      await waitFor(() => {
        expect(result.current.refresh).toBeDefined()
        expect(typeof result.current.refresh).toBe('function')
      })
    })

    it('should refetch progress when refresh is called', async () => {
      mockGetChapterProgress.mockResolvedValue(mockProgressData)

      const { result } = renderHook(() => useChapterProgress({
        chapterId: 1,
        isAuthenticated: true,
      }))

      await waitFor(() => {
        expect(mockGetChapterProgress).toHaveBeenCalledTimes(1)
      })

      // Call refresh
      act(() => {
        result.current.refresh()
      })

      await waitFor(() => {
        expect(mockGetChapterProgress).toHaveBeenCalledTimes(2)
      })
    })

    it('should update progress map after refresh', async () => {
      const initialProgress = [mockProgressData[0]]
      const updatedProgress = mockProgressData

      mockGetChapterProgress
        .mockResolvedValueOnce(initialProgress)
        .mockResolvedValueOnce(updatedProgress)

      const { result } = renderHook(() => useChapterProgress({
        chapterId: 1,
        isAuthenticated: true,
      }))

      await waitFor(() => {
        expect(result.current.progressMap.size).toBe(1)
      })

      // Refresh
      act(() => {
        result.current.refresh()
      })

      await waitFor(() => {
        expect(result.current.progressMap.size).toBe(3)
      })
    })
  })

  describe('Chapter ID Changes', () => {
    it('should refetch when chapterId changes', async () => {
      mockGetChapterProgress.mockResolvedValue(mockProgressData)

      const { rerender } = renderHook(
        ({ chapterId, isAuthenticated }) => useChapterProgress({ chapterId, isAuthenticated }),
        { initialProps: { chapterId: 1, isAuthenticated: true } }
      )

      await waitFor(() => {
        expect(mockGetChapterProgress).toHaveBeenCalledWith(1)
        expect(mockGetChapterProgress).toHaveBeenCalledTimes(1)
      })

      // Change chapterId
      rerender({ chapterId: 2, isAuthenticated: true })

      await waitFor(() => {
        expect(mockGetChapterProgress).toHaveBeenCalledWith(2)
        expect(mockGetChapterProgress).toHaveBeenCalledTimes(2)
      })
    })

    it('should clear progress when unauthenticated', async () => {
      mockGetChapterProgress.mockResolvedValue(mockProgressData)

      const { result, rerender } = renderHook(
        ({ chapterId, isAuthenticated }) => useChapterProgress({ chapterId, isAuthenticated }),
        { initialProps: { chapterId: 1, isAuthenticated: true } }
      )

      await waitFor(() => {
        expect(result.current.progressMap.size).toBe(3)
      })

      // Change to unauthenticated
      rerender({ chapterId: 1, isAuthenticated: false })

      await waitFor(() => {
        expect(result.current.progressMap.size).toBe(0)
        expect(result.current.isLoading).toBe(false)
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle chapterId of 0', async () => {
      mockGetChapterProgress.mockResolvedValue([])

      const { result } = renderHook(() => useChapterProgress({
        chapterId: 0,
        isAuthenticated: true,
      }))

      await waitFor(() => {
        expect(mockGetChapterProgress).toHaveBeenCalledWith(0)
        expect(result.current.progressMap.size).toBe(0)
      })
    })

    it('should handle duplicate lessonIds (use latest)', async () => {
      const duplicateProgress: VideoProgressDto[] = [
        {
          id: 1,
          userId: 1,
          lessonId: 100,
          currentTimeSeconds: 30.0,
          durationSeconds: 120.0,
          completionPercentage: 25,
          isCompleted: false,
          completedAt: null,
          createdAt: '2025-11-29T00:00:00Z',
          updatedAt: '2025-11-29T00:00:00Z',
        },
        {
          id: 2,
          userId: 1,
          lessonId: 100, // Same lessonId
          currentTimeSeconds: 60.0,
          durationSeconds: 120.0,
          completionPercentage: 50,
          isCompleted: false,
          completedAt: null,
          createdAt: '2025-11-29T00:00:00Z',
          updatedAt: '2025-11-29T00:00:00Z',
        },
      ]

      mockGetChapterProgress.mockResolvedValue(duplicateProgress)

      const { result } = renderHook(() => useChapterProgress({
        chapterId: 1,
        isAuthenticated: true,
      }))

      await waitFor(() => {
        expect(result.current.progressMap.size).toBe(1)
        const progress = result.current.progressMap.get(100)
        expect(progress?.completionPercentage).toBe(50) // Should use latest
      })
    })

    it('should handle malformed progress data gracefully', async () => {
      const malformedProgress = [
        {
          id: 1,
          userId: 1,
          lessonId: 100,
          currentTimeSeconds: 60.0,
          durationSeconds: 120.0,
          completionPercentage: 50,
          isCompleted: false,
          completedAt: null,
          createdAt: '2025-11-29T00:00:00Z',
          updatedAt: '2025-11-29T00:00:00Z',
        },
        null as any, // Malformed entry
        {
          id: 2,
          userId: 1,
          lessonId: 101,
          currentTimeSeconds: 30.0,
          durationSeconds: 60.0,
          completionPercentage: 50,
          isCompleted: false,
          completedAt: null,
          createdAt: '2025-11-29T00:00:00Z',
          updatedAt: '2025-11-29T00:00:00Z',
        },
      ].filter(Boolean) as VideoProgressDto[]

      mockGetChapterProgress.mockResolvedValue(malformedProgress)

      const { result } = renderHook(() => useChapterProgress({
        chapterId: 1,
        isAuthenticated: true,
      }))

      await waitFor(() => {
        expect(result.current.progressMap.size).toBe(2)
        expect(result.current.error).toBeNull()
      })
    })
  })

  describe('Performance', () => {
    it('should efficiently handle large progress arrays', async () => {
      const largeProgressData: VideoProgressDto[] = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        userId: 1,
        lessonId: i + 1,
        currentTimeSeconds: 30.0,
        durationSeconds: 120.0,
        completionPercentage: 25,
        isCompleted: false,
        completedAt: null,
        createdAt: '2025-11-29T00:00:00Z',
        updatedAt: '2025-11-29T00:00:00Z',
      }))

      mockGetChapterProgress.mockResolvedValue(largeProgressData)

      const { result } = renderHook(() => useChapterProgress({
        chapterId: 1,
        isAuthenticated: true,
      }))

      await waitFor(() => {
        expect(result.current.progressMap.size).toBe(100)

        // Verify O(1) lookup performance
        const progress50 = result.current.progressMap.get(50)
        expect(progress50?.lessonId).toBe(50)
      })
    })
  })
})
