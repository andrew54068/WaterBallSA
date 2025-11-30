/**
 * Focused unit test for video progress accumulation behavior
 *
 * Tests the specific requirement:
 * "Record progress every 10 seconds of actual video playback time"
 */

import { renderHook, waitFor, act } from '@testing-library/react'
import { useVideoProgress } from '../useVideoProgress'
import { getProgress, saveProgress } from '@/lib/api/video-progress'
import type { VideoProgressDto } from '@/types/video-progress'

// Mock YouTube API global
;(global as any).YT = {
  PlayerState: {
    UNSTARTED: -1,
    ENDED: 0,
    PLAYING: 1,
    PAUSED: 2,
    BUFFERING: 3,
    CUED: 5,
  },
}

// Mock dependencies
jest.mock('@/lib/api/video-progress')

const mockGetProgress = getProgress as jest.MockedFunction<typeof getProgress>
const mockSaveProgress = saveProgress as jest.MockedFunction<typeof saveProgress>

// Use fake timers
jest.useFakeTimers()

describe('useVideoProgress - Accumulated Playback Time', () => {
  let mockPlayer: any
  let stateChangeHandler: ((event: any) => void) | null

  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
    stateChangeHandler = null

    mockPlayer = {
      getCurrentTime: jest.fn(),
      getDuration: jest.fn().mockReturnValue(120.0),
      addEventListener: jest.fn((eventName: string, handler: any) => {
        if (eventName === 'onStateChange') {
          stateChangeHandler = handler
        }
      }),
      seekTo: jest.fn(),
    }
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
  })

  it('should accumulate playback time and save every 10 seconds of actual playback', async () => {
    console.log('\n=== TEST: Accumulate 10 seconds of playback ===\n')

    mockGetProgress.mockResolvedValue(null)

    // Simulate progressive playback - currentTime increases over time
    let currentTime = 0
    mockPlayer.getCurrentTime.mockImplementation(() => {
      console.log(`[MOCK] getCurrentTime() => ${currentTime}`)
      return currentTime
    })

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

    // Render hook
    const { result } = renderHook(() =>
      useVideoProgress({
        lessonId: 1,
        isAuthenticated: true,
      })
    )

    // Wait for initial progress fetch
    await waitFor(() => {
      expect(mockGetProgress).toHaveBeenCalled()
    })

    // Initialize player
    console.log('\n[TEST] Initializing player...')
    act(() => {
      result.current.initializePlayer(mockPlayer)
    })

    // Simulate video starting to play (PLAYING state = 1)
    console.log('[TEST] Simulating PLAYING state...')
    act(() => {
      stateChangeHandler?.({ data: 1 }) // YT.PlayerState.PLAYING = 1
    })

    // Clear any saves from initialization
    await act(async () => {
      await Promise.resolve()
    })
    mockSaveProgress.mockClear()

    console.log('\n[TEST] Starting playback simulation...\n')

    // Simulate playback progression every 2 seconds:
    // 0s  → 2s:  accumulated=2,  should NOT save
    // 2s  → 4s:  accumulated=4,  should NOT save
    // 4s  → 6s:  accumulated=6,  should NOT save
    // 6s  → 8s:  accumulated=8,  should NOT save
    // 8s  → 10s: accumulated=10, should SAVE ✅

    for (let time = 2; time <= 10; time += 2) {
      console.log(`[TEST] Advancing to ${time}s...`)
      currentTime = time

      await act(async () => {
        jest.advanceTimersByTime(2000) // Advance by CHECK_INTERVAL_MS (2 seconds)
        await Promise.resolve() // Let promises settle
      })

      if (time < 10) {
        console.log(`  → Should NOT save yet (accumulated=${time}s < 10s)`)
        expect(mockSaveProgress).not.toHaveBeenCalled()
      }
    }

    // After 10 seconds of playback, should save
    console.log('\n[TEST] Waiting for save after 10s accumulated...')
    await waitFor(
      () => {
        // Should have at least one save with currentTime=10s
        // Note: May have an additional save on cleanup, so check >=1
        expect(mockSaveProgress).toHaveBeenCalled()
        expect(mockSaveProgress).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            currentTimeSeconds: 10.0,
          })
        )
      },
      { timeout: 3000 }
    )

    console.log('\n✅ TEST PASSED: Save triggered after 10s of playback\n')
  })

  it('should reset accumulator when user seeks (jumps) in video', async () => {
    console.log('\n=== TEST: Reset accumulator on seek ===\n')

    mockGetProgress.mockResolvedValue(null)

    let currentTime = 0
    mockPlayer.getCurrentTime.mockImplementation(() => currentTime)

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

    const { result } = renderHook(() =>
      useVideoProgress({
        lessonId: 1,
        isAuthenticated: true,
      })
    )

    await waitFor(() => {
      expect(mockGetProgress).toHaveBeenCalled()
    })

    act(() => {
      result.current.initializePlayer(mockPlayer)
    })

    act(() => {
      stateChangeHandler?.({ data: 1 }) // PLAYING
    })

    await act(async () => {
      await Promise.resolve()
    })
    mockSaveProgress.mockClear()

    console.log('[TEST] Playing for 4 seconds (2s + 2s)...')

    // Play for 4 seconds
    currentTime = 2
    await act(async () => {
      jest.advanceTimersByTime(2000)
      await Promise.resolve()
    })

    currentTime = 4
    await act(async () => {
      jest.advanceTimersByTime(2000)
      await Promise.resolve()
    })

    console.log('[TEST] User seeks to 50s (big jump)...')

    // User seeks to 50s (delta = 46s >> 3s, should reset accumulator)
    currentTime = 50
    await act(async () => {
      jest.advanceTimersByTime(2000)
      await Promise.resolve()
    })

    // Should NOT save because accumulator was reset
    expect(mockSaveProgress).not.toHaveBeenCalled()

    console.log('[TEST] Playing from 50s to 60s (10 seconds of playback)...')

    // Continue playing for 10 seconds from seek point
    for (let time = 52; time <= 60; time += 2) {
      currentTime = time
      await act(async () => {
        jest.advanceTimersByTime(2000)
        await Promise.resolve()
      })
    }

    // Now should save after 10s of playback from seek point
    await waitFor(
      () => {
        // Should have at least one save with currentTime=60s
        expect(mockSaveProgress).toHaveBeenCalled()
        expect(mockSaveProgress).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            currentTimeSeconds: 60.0,
          })
        )
      },
      { timeout: 3000 }
    )

    console.log('\n✅ TEST PASSED: Accumulator reset on seek, then saved after 10s\n')
  })
})
