/**
 * Unit tests for useVideoProgress hook
 *
 * Tests cover:
 * - Progress fetching on mount
 * - Position restoration from saved progress
 * - Auto-save interval (every 10 seconds)
 * - Retry logic with exponential backoff
 * - Completion detection at 95% threshold
 * - Error handling and recovery
 * - Cleanup on unmount
 */

import { renderHook, waitFor, act } from '@testing-library/react'
import { useVideoProgress } from '../useVideoProgress'
import { getProgress, saveProgress } from '@/lib/api/video-progress'
import { useAuth } from '@/lib/auth-context'
import type { VideoProgressDto } from '@/types/video-progress'

// Mock dependencies
jest.mock('@/lib/auth-context')
jest.mock('@/lib/api/video-progress')

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockGetProgress = getProgress as jest.MockedFunction<typeof getProgress>
const mockSaveProgress = saveProgress as jest.MockedFunction<typeof saveProgress>

// Mock timers
jest.useFakeTimers()

describe('useVideoProgress', () => {
  const mockPlayer = {
    getCurrentTime: jest.fn(),
    getDuration: jest.fn(),
  } as any

  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
  })

  describe('Initial State', () => {
    it('should not fetch progress when not authenticated', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      } as any)

      renderHook(() => useVideoProgress({
        lessonId: 1,
        player: mockPlayer,
        isAuthenticated: false,
      }))

      await act(async () => {
        jest.runAllTimers()
      })

      expect(mockGetProgress).not.toHaveBeenCalled()
    })

    it('should fetch progress when authenticated', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, email: 'test@example.com' },
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      } as any)

      const mockProgress: VideoProgressDto = {
        id: 1,
        userId: 1,
        lessonId: 1,
        currentTimeSeconds: 60.0,
        durationSeconds: 120.0,
        completionPercentage: 50,
        isCompleted: false,
        completedAt: null,
        createdAt: '2025-11-29T00:00:00Z',
        updatedAt: '2025-11-29T00:00:00Z',
      }

      mockGetProgress.mockResolvedValue(mockProgress)

      const { result } = renderHook(() => useVideoProgress({
        lessonId: 1,
        player: mockPlayer,
        isAuthenticated: true,
      }))

      await waitFor(() => {
        expect(mockGetProgress).toHaveBeenCalledWith(1)
        expect(result.current.progress).toEqual(mockProgress)
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should handle no existing progress gracefully', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, email: 'test@example.com' },
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      } as any)

      mockGetProgress.mockResolvedValue(null)

      const { result } = renderHook(() => useVideoProgress({
        lessonId: 1,
        player: mockPlayer,
        isAuthenticated: true,
      }))

      await waitFor(() => {
        expect(result.current.progress).toBeNull()
        expect(result.current.isLoading).toBe(false)
      })
    })
  })

  describe('Position Restoration', () => {
    it('should restore playback position from saved progress', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, email: 'test@example.com' },
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      } as any)

      const mockProgress: VideoProgressDto = {
        id: 1,
        userId: 1,
        lessonId: 1,
        currentTimeSeconds: 75.5,
        durationSeconds: 120.0,
        completionPercentage: 62,
        isCompleted: false,
        completedAt: null,
        createdAt: '2025-11-29T00:00:00Z',
        updatedAt: '2025-11-29T00:00:00Z',
      }

      mockGetProgress.mockResolvedValue(mockProgress)

      const mockSeekTo = jest.fn()
      const playerWithSeek = {
        ...mockPlayer,
        seekTo: mockSeekTo,
      }

      renderHook(() => useVideoProgress({
        lessonId: 1,
        player: playerWithSeek,
        isAuthenticated: true,
      }))

      await waitFor(() => {
        expect(mockSeekTo).toHaveBeenCalledWith(75.5, true)
      })
    })

    it('should not restore position if video is completed', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, email: 'test@example.com' },
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      } as any)

      const mockProgress: VideoProgressDto = {
        id: 1,
        userId: 1,
        lessonId: 1,
        currentTimeSeconds: 120.0,
        durationSeconds: 120.0,
        completionPercentage: 100,
        isCompleted: true,
        completedAt: '2025-11-29T00:00:00Z',
        createdAt: '2025-11-29T00:00:00Z',
        updatedAt: '2025-11-29T00:00:00Z',
      }

      mockGetProgress.mockResolvedValue(mockProgress)

      const mockSeekTo = jest.fn()
      const playerWithSeek = {
        ...mockPlayer,
        seekTo: mockSeekTo,
      }

      renderHook(() => useVideoProgress({
        lessonId: 1,
        player: playerWithSeek,
        isAuthenticated: true,
      }))

      await waitFor(() => {
        expect(mockSeekTo).not.toHaveBeenCalled()
      })
    })
  })

  describe('Auto-Save Interval', () => {
    it('should save progress every 10 seconds', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, email: 'test@example.com' },
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      } as any)

      mockGetProgress.mockResolvedValue(null)
      mockPlayer.getCurrentTime.mockReturnValue(30.0)
      mockPlayer.getDuration.mockReturnValue(120.0)

      const mockSavedProgress: VideoProgressDto = {
        id: 1,
        userId: 1,
        lessonId: 1,
        currentTimeSeconds: 30.0,
        durationSeconds: 120.0,
        completionPercentage: 25,
        isCompleted: false,
        completedAt: null,
        createdAt: '2025-11-29T00:00:00Z',
        updatedAt: '2025-11-29T00:00:00Z',
      }

      mockSaveProgress.mockResolvedValue(mockSavedProgress)

      renderHook(() => useVideoProgress({
        lessonId: 1,
        player: mockPlayer,
        isAuthenticated: true,
      }))

      // Wait for initial fetch
      await waitFor(() => {
        expect(mockGetProgress).toHaveBeenCalled()
      })

      // Advance timer by 10 seconds
      await act(async () => {
        jest.advanceTimersByTime(10000)
      })

      await waitFor(() => {
        expect(mockSaveProgress).toHaveBeenCalledWith(1, {
          currentTimeSeconds: 30.0,
          durationSeconds: 120.0,
          completionPercentage: 25,
          isCompleted: false,
        })
      })

      // Advance another 10 seconds
      mockPlayer.getCurrentTime.mockReturnValue(40.0)

      await act(async () => {
        jest.advanceTimersByTime(10000)
      })

      await waitFor(() => {
        expect(mockSaveProgress).toHaveBeenCalledWith(1, expect.objectContaining({
          currentTimeSeconds: 40.0,
        }))
      })
    })

    it('should stop auto-save when completed', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, email: 'test@example.com' },
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      } as any)

      mockGetProgress.mockResolvedValue(null)
      mockPlayer.getCurrentTime.mockReturnValue(114.0)
      mockPlayer.getDuration.mockReturnValue(120.0)

      const mockCompletedProgress: VideoProgressDto = {
        id: 1,
        userId: 1,
        lessonId: 1,
        currentTimeSeconds: 114.0,
        durationSeconds: 120.0,
        completionPercentage: 95,
        isCompleted: true,
        completedAt: '2025-11-29T00:00:00Z',
        createdAt: '2025-11-29T00:00:00Z',
        updatedAt: '2025-11-29T00:00:00Z',
      }

      mockSaveProgress.mockResolvedValue(mockCompletedProgress)

      const onComplete = jest.fn()

      renderHook(() => useVideoProgress({
        lessonId: 1,
        player: mockPlayer,
        isAuthenticated: true,
        onComplete,
      }))

      await waitFor(() => {
        expect(mockGetProgress).toHaveBeenCalled()
      })

      // First save should trigger completion
      await act(async () => {
        jest.advanceTimersByTime(10000)
      })

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled()
      })

      const firstCallCount = mockSaveProgress.mock.calls.length

      // Advance more time - should not save again
      await act(async () => {
        jest.advanceTimersByTime(20000)
      })

      expect(mockSaveProgress.mock.calls.length).toBe(firstCallCount)
    })
  })

  describe('Completion Detection', () => {
    it('should detect completion at 95% for long videos (≥30s)', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, email: 'test@example.com' },
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      } as any)

      mockGetProgress.mockResolvedValue(null)
      mockPlayer.getCurrentTime.mockReturnValue(114.0) // 95% of 120s
      mockPlayer.getDuration.mockReturnValue(120.0)

      const mockCompletedProgress: VideoProgressDto = {
        id: 1,
        userId: 1,
        lessonId: 1,
        currentTimeSeconds: 114.0,
        durationSeconds: 120.0,
        completionPercentage: 95,
        isCompleted: true,
        completedAt: '2025-11-29T00:00:00Z',
        createdAt: '2025-11-29T00:00:00Z',
        updatedAt: '2025-11-29T00:00:00Z',
      }

      mockSaveProgress.mockResolvedValue(mockCompletedProgress)

      const onComplete = jest.fn()

      renderHook(() => useVideoProgress({
        lessonId: 1,
        player: mockPlayer,
        isAuthenticated: true,
        onComplete,
      }))

      await waitFor(() => {
        expect(mockGetProgress).toHaveBeenCalled()
      })

      await act(async () => {
        jest.advanceTimersByTime(10000)
      })

      await waitFor(() => {
        expect(mockSaveProgress).toHaveBeenCalledWith(1, expect.objectContaining({
          completionPercentage: 95,
          isCompleted: true,
        }))
        expect(onComplete).toHaveBeenCalled()
      })
    })

    it('should require 100% completion for short videos (<30s)', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, email: 'test@example.com' },
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      } as any)

      mockGetProgress.mockResolvedValue(null)
      mockPlayer.getCurrentTime.mockReturnValue(24.0) // 96% of 25s
      mockPlayer.getDuration.mockReturnValue(25.0)

      const mockProgress: VideoProgressDto = {
        id: 1,
        userId: 1,
        lessonId: 1,
        currentTimeSeconds: 24.0,
        durationSeconds: 25.0,
        completionPercentage: 96,
        isCompleted: false,
        completedAt: null,
        createdAt: '2025-11-29T00:00:00Z',
        updatedAt: '2025-11-29T00:00:00Z',
      }

      mockSaveProgress.mockResolvedValue(mockProgress)

      const onComplete = jest.fn()

      renderHook(() => useVideoProgress({
        lessonId: 1,
        player: mockPlayer,
        isAuthenticated: true,
        onComplete,
      }))

      await waitFor(() => {
        expect(mockGetProgress).toHaveBeenCalled()
      })

      await act(async () => {
        jest.advanceTimersByTime(10000)
      })

      await waitFor(() => {
        expect(mockSaveProgress).toHaveBeenCalledWith(1, expect.objectContaining({
          completionPercentage: 96,
          isCompleted: false,
        }))
        expect(onComplete).not.toHaveBeenCalled()
      })
    })
  })

  describe('Retry Logic', () => {
    it('should retry with exponential backoff on failure', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, email: 'test@example.com' },
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      } as any)

      mockGetProgress.mockResolvedValue(null)
      mockPlayer.getCurrentTime.mockReturnValue(30.0)
      mockPlayer.getDuration.mockReturnValue(120.0)

      // Fail first 2 attempts, succeed on 3rd
      mockSaveProgress
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          id: 1,
          userId: 1,
          lessonId: 1,
          currentTimeSeconds: 30.0,
          durationSeconds: 120.0,
          completionPercentage: 25,
          isCompleted: false,
          completedAt: null,
          createdAt: '2025-11-29T00:00:00Z',
          updatedAt: '2025-11-29T00:00:00Z',
        })

      renderHook(() => useVideoProgress({
        lessonId: 1,
        player: mockPlayer,
        isAuthenticated: true,
      }))

      await waitFor(() => {
        expect(mockGetProgress).toHaveBeenCalled()
      })

      // Trigger save (will fail)
      await act(async () => {
        jest.advanceTimersByTime(10000)
      })

      // Wait for retry delay (1 second)
      await act(async () => {
        jest.advanceTimersByTime(1000)
      })

      // Should have retried once
      expect(mockSaveProgress).toHaveBeenCalledTimes(2)

      // Wait for second retry delay (2 seconds)
      await act(async () => {
        jest.advanceTimersByTime(2000)
      })

      // Should have retried twice and succeeded
      await waitFor(() => {
        expect(mockSaveProgress).toHaveBeenCalledTimes(3)
      })
    })

    it('should give up after 3 failed attempts', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, email: 'test@example.com' },
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      } as any)

      mockGetProgress.mockResolvedValue(null)
      mockPlayer.getCurrentTime.mockReturnValue(30.0)
      mockPlayer.getDuration.mockReturnValue(120.0)

      // Fail all attempts
      mockSaveProgress.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useVideoProgress({
        lessonId: 1,
        player: mockPlayer,
        isAuthenticated: true,
      }))

      await waitFor(() => {
        expect(mockGetProgress).toHaveBeenCalled()
      })

      // Trigger save
      await act(async () => {
        jest.advanceTimersByTime(10000)
      })

      // Wait for all retries (1s + 2s + 4s = 7s total)
      await act(async () => {
        jest.advanceTimersByTime(7000)
      })

      // Should have tried 3 times total (initial + 2 retries)
      await waitFor(() => {
        expect(mockSaveProgress).toHaveBeenCalledTimes(3)
        expect(result.current.error).toBeTruthy()
      })
    })
  })

  describe('Callback Handlers', () => {
    it('should call onProgressUpdate when progress is saved', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, email: 'test@example.com' },
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      } as any)

      mockGetProgress.mockResolvedValue(null)
      mockPlayer.getCurrentTime.mockReturnValue(30.0)
      mockPlayer.getDuration.mockReturnValue(120.0)

      const mockSavedProgress: VideoProgressDto = {
        id: 1,
        userId: 1,
        lessonId: 1,
        currentTimeSeconds: 30.0,
        durationSeconds: 120.0,
        completionPercentage: 25,
        isCompleted: false,
        completedAt: null,
        createdAt: '2025-11-29T00:00:00Z',
        updatedAt: '2025-11-29T00:00:00Z',
      }

      mockSaveProgress.mockResolvedValue(mockSavedProgress)

      const onProgressUpdate = jest.fn()

      renderHook(() => useVideoProgress({
        lessonId: 1,
        player: mockPlayer,
        isAuthenticated: true,
        onProgressUpdate,
      }))

      await waitFor(() => {
        expect(mockGetProgress).toHaveBeenCalled()
      })

      await act(async () => {
        jest.advanceTimersByTime(10000)
      })

      await waitFor(() => {
        expect(onProgressUpdate).toHaveBeenCalledWith(mockSavedProgress)
      })
    })
  })

  describe('Cleanup', () => {
    it('should clear interval on unmount', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, email: 'test@example.com' },
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      } as any)

      mockGetProgress.mockResolvedValue(null)
      mockPlayer.getCurrentTime.mockReturnValue(30.0)
      mockPlayer.getDuration.mockReturnValue(120.0)

      mockSaveProgress.mockResolvedValue({
        id: 1,
        userId: 1,
        lessonId: 1,
        currentTimeSeconds: 30.0,
        durationSeconds: 120.0,
        completionPercentage: 25,
        isCompleted: false,
        completedAt: null,
        createdAt: '2025-11-29T00:00:00Z',
        updatedAt: '2025-11-29T00:00:00Z',
      })

      const { unmount } = renderHook(() => useVideoProgress({
        lessonId: 1,
        player: mockPlayer,
        isAuthenticated: true,
      }))

      await waitFor(() => {
        expect(mockGetProgress).toHaveBeenCalled()
      })

      // One save should happen
      await act(async () => {
        jest.advanceTimersByTime(10000)
      })

      const saveCountBeforeUnmount = mockSaveProgress.mock.calls.length

      // Unmount
      unmount()

      // Advance time - should not save after unmount
      await act(async () => {
        jest.advanceTimersByTime(20000)
      })

      expect(mockSaveProgress.mock.calls.length).toBe(saveCountBeforeUnmount)
    })
  })
})
