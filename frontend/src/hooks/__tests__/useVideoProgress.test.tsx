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
    addEventListener: jest.fn(),
    seekTo: jest.fn(),
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

  describe('Accumulated Playback Time Tracking', () => {
    it('should accumulate playback time and save every 10 seconds of actual playback', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, email: 'test@example.com' },
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      } as any)

      mockGetProgress.mockResolvedValue(null)

      // Simulate progressive playback
      let currentTime = 0
      mockPlayer.getCurrentTime.mockImplementation(() => currentTime)
      mockPlayer.getDuration.mockReturnValue(120.0)

      const mockSavedProgress: VideoProgressDto = {
        id: 1,
        userId: 1,
        lessonId: 1,
        currentTimeSeconds: 10.0,
        durationSeconds: 120.0,
        completionPercentage: 8,
        isCompleted: false,
        completedAt: null,
        createdAt: '2025-11-29T00:00:00Z',
        updatedAt: '2025-11-29T00:00:00Z',
      }

      mockSaveProgress.mockResolvedValue(mockSavedProgress)

      const { result } = renderHook(() => useVideoProgress({
        lessonId: 1,
        isAuthenticated: true,
      }))

      await waitFor(() => {
        expect(mockGetProgress).toHaveBeenCalled()
      })

      // Capture the state change handler
      let stateChangeHandler: ((event: any) => void) | null = null
      mockPlayer.addEventListener.mockImplementation((eventName: string, handler: any) => {
        if (eventName === 'onStateChange') {
          stateChangeHandler = handler
        }
      })

      // Initialize player
      act(() => {
        result.current.initializePlayer(mockPlayer)
      })

      // Simulate video starting to play (PLAYING state = 1)
      act(() => {
        stateChangeHandler?.({ data: 1 }) // YT.PlayerState.PLAYING = 1
      })

      // Clear initial calls
      mockSaveProgress.mockClear()

      // Simulate playback progression:
      // 0s: currentTime=0, accumulated=0
      // 2s: currentTime=2, delta=2, accumulated=2
      // 4s: currentTime=4, delta=2, accumulated=4
      // 6s: currentTime=6, delta=2, accumulated=6
      // 8s: currentTime=8, delta=2, accumulated=8
      // 10s: currentTime=10, delta=2, accumulated=10 ✅ SAVE!

      // Advance by 2 seconds (CHECK_INTERVAL_MS)
      currentTime = 2
      await act(async () => {
        jest.advanceTimersByTime(2000)
      })
      expect(mockSaveProgress).not.toHaveBeenCalled() // accumulated=2, not yet 10

      // Advance by 2 seconds
      currentTime = 4
      await act(async () => {
        jest.advanceTimersByTime(2000)
      })
      expect(mockSaveProgress).not.toHaveBeenCalled() // accumulated=4, not yet 10

      // Advance by 2 seconds
      currentTime = 6
      await act(async () => {
        jest.advanceTimersByTime(2000)
      })
      expect(mockSaveProgress).not.toHaveBeenCalled() // accumulated=6, not yet 10

      // Advance by 2 seconds
      currentTime = 8
      await act(async () => {
        jest.advanceTimersByTime(2000)
      })
      expect(mockSaveProgress).not.toHaveBeenCalled() // accumulated=8, not yet 10

      // Advance by 2 seconds - should trigger save at 10s accumulated
      currentTime = 10
      await act(async () => {
        jest.advanceTimersByTime(2000)
      })

      await waitFor(() => {
        expect(mockSaveProgress).toHaveBeenCalledTimes(1)
        expect(mockSaveProgress).toHaveBeenCalledWith(1, expect.objectContaining({
          currentTimeSeconds: 10.0,
        }))
      })
    })

    it('should reset accumulator when user seeks in video', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, email: 'test@example.com' },
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      } as any)

      mockGetProgress.mockResolvedValue(null)

      let currentTime = 0
      mockPlayer.getCurrentTime.mockImplementation(() => currentTime)
      mockPlayer.getDuration.mockReturnValue(120.0)

      mockSaveProgress.mockResolvedValue({
        id: 1,
        userId: 1,
        lessonId: 1,
        currentTimeSeconds: 50.0,
        durationSeconds: 120.0,
        completionPercentage: 41,
        isCompleted: false,
        completedAt: null,
        createdAt: '2025-11-29T00:00:00Z',
        updatedAt: '2025-11-29T00:00:00Z',
      })

      const { result } = renderHook(() => useVideoProgress({
        lessonId: 1,
        isAuthenticated: true,
      }))

      await waitFor(() => {
        expect(mockGetProgress).toHaveBeenCalled()
      })

      // Capture the state change handler
      let stateChangeHandler: ((event: any) => void) | null = null
      mockPlayer.addEventListener.mockImplementation((eventName: string, handler: any) => {
        if (eventName === 'onStateChange') {
          stateChangeHandler = handler
        }
      })

      act(() => {
        result.current.initializePlayer(mockPlayer)
      })

      // Simulate video starting to play
      act(() => {
        stateChangeHandler?.({ data: 1 }) // YT.PlayerState.PLAYING = 1
      })

      mockSaveProgress.mockClear()

      // Play for 4 seconds
      currentTime = 2
      await act(async () => {
        jest.advanceTimersByTime(2000)
      })

      currentTime = 4
      await act(async () => {
        jest.advanceTimersByTime(2000)
      })

      // User seeks to 50s (delta = 46s, which is > 3s max reasonable delta)
      currentTime = 50
      await act(async () => {
        jest.advanceTimersByTime(2000)
      })

      // Should NOT save because accumulator was reset due to seek
      expect(mockSaveProgress).not.toHaveBeenCalled()

      // Continue playing from 50s for another 10 seconds
      currentTime = 52
      await act(async () => {
        jest.advanceTimersByTime(2000)
      })

      currentTime = 54
      await act(async () => {
        jest.advanceTimersByTime(2000)
      })

      currentTime = 56
      await act(async () => {
        jest.advanceTimersByTime(2000)
      })

      currentTime = 58
      await act(async () => {
        jest.advanceTimersByTime(2000)
      })

      currentTime = 60
      await act(async () => {
        jest.advanceTimersByTime(2000)
      })

      // Now should save after 10s of playback from seek point (50s -> 60s)
      await waitFor(() => {
        expect(mockSaveProgress).toHaveBeenCalledTimes(1)
        expect(mockSaveProgress).toHaveBeenCalledWith(1, expect.objectContaining({
          currentTimeSeconds: 60.0,
        }))
      })
    })

    it('should not accumulate time when video is paused', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, email: 'test@example.com' },
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      } as any)

      mockGetProgress.mockResolvedValue(null)

      let currentTime = 0
      mockPlayer.getCurrentTime.mockImplementation(() => currentTime)
      mockPlayer.getDuration.mockReturnValue(120.0)

      mockSaveProgress.mockResolvedValue({
        id: 1,
        userId: 1,
        lessonId: 1,
        currentTimeSeconds: 4.0,
        durationSeconds: 120.0,
        completionPercentage: 3,
        isCompleted: false,
        completedAt: null,
        createdAt: '2025-11-29T00:00:00Z',
        updatedAt: '2025-11-29T00:00:00Z',
      })

      const { result } = renderHook(() => useVideoProgress({
        lessonId: 1,
        isAuthenticated: true,
      }))

      await waitFor(() => {
        expect(mockGetProgress).toHaveBeenCalled()
      })

      // Capture the state change handler
      let stateChangeHandler: ((event: any) => void) | null = null
      mockPlayer.addEventListener.mockImplementation((eventName: string, handler: any) => {
        if (eventName === 'onStateChange') {
          stateChangeHandler = handler
        }
      })

      act(() => {
        result.current.initializePlayer(mockPlayer)
      })

      // Simulate video starting to play
      act(() => {
        stateChangeHandler?.({ data: 1 }) // YT.PlayerState.PLAYING = 1
      })

      mockSaveProgress.mockClear()

      // Play for 4 seconds
      currentTime = 2
      await act(async () => {
        jest.advanceTimersByTime(2000)
      })

      currentTime = 4
      await act(async () => {
        jest.advanceTimersByTime(2000)
      })

      // Pause video (isPlaying = false)
      act(() => {
        stateChangeHandler?.({ data: 2 }) // YT.PlayerState.PAUSED = 2
      })

      // Advance time but don't advance currentTime (video is paused)
      await act(async () => {
        jest.advanceTimersByTime(10000)
      })

      // Should NOT save because video was paused (no playback time accumulated)
      // Note: One save might happen on pause event itself, so check that no additional saves occur
      const saveCountAfterPause = mockSaveProgress.mock.calls.length

      // Advance more time
      await act(async () => {
        jest.advanceTimersByTime(10000)
      })

      // Should not have any new saves
      expect(mockSaveProgress.mock.calls.length).toBe(saveCountAfterPause)
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
