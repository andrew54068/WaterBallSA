import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { useLessonAccess } from '../useLessonAccess'
import { AuthProvider } from '@/lib/auth-context'
import { User, Lesson } from '@/types'

// Mock the API modules
jest.mock('@/lib/api/lessons')
jest.mock('@/lib/api/auth')

// Mock data
const mockUser: User = {
  id: 1,
  googleId: 'google-123',
  email: 'test@example.com',
  name: 'Test User',
  profilePicture: 'https://example.com/avatar.jpg',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
}

const mockFreeLesson: Lesson = {
  id: 1,
  chapterId: 1,
  title: 'Free Lesson',
  lessonType: 'VIDEO',
  contentUrl: 'https://youtube.com/watch?v=test',
  contentMetadata: {},
  orderIndex: 1,
  isFree: true,
  createdAt: '2025-01-01T00:00:00Z',
}

const mockPaidLesson: Lesson = {
  id: 2,
  chapterId: 1,
  title: 'Paid Lesson',
  lessonType: 'VIDEO',
  contentUrl: 'https://youtube.com/watch?v=test2',
  contentMetadata: {},
  orderIndex: 2,
  isFree: false,
  createdAt: '2025-01-01T00:00:00Z',
}

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Test wrapper with AuthProvider
const createWrapper = (user: User | null = null, accessToken: string | null = null) => {
  // Setup localStorage if user is provided
  if (user && accessToken) {
    localStorageMock.setItem('accessToken', accessToken)
  } else {
    localStorageMock.clear()
  }

  return ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  )
}

describe('useLessonAccess Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
  })

  describe('Scenario 1: Anonymous User Accessing Free Preview Lesson', () => {
    it('should grant access to free preview lesson for anonymous user', async () => {
      const { lessonsApi } = await import('@/lib/api/lessons')
      const mockedLessonsApi = lessonsApi as jest.Mocked<typeof lessonsApi>
      mockedLessonsApi.getById = jest.fn().mockResolvedValue(mockFreeLesson)

      const wrapper = createWrapper(null, null)
      const { result } = renderHook(() => useLessonAccess(1, 1), { wrapper })

      // Initially loading
      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should grant access
      expect(result.current.canAccess).toBe(true)
      expect(result.current.reason).toBe('free_preview')
      expect(result.current.freeToPreview).toBe(true)
      expect(result.current.showLockedView).toBe(false)
    })
  })

  describe('Scenario 2: Anonymous User Accessing Paid Lesson', () => {
    it('should deny access to paid lesson for anonymous user', async () => {
      const { lessonsApi } = await import('@/lib/api/lessons')
      const mockedLessonsApi = lessonsApi as jest.Mocked<typeof lessonsApi>
      mockedLessonsApi.getById = jest.fn().mockResolvedValue(mockPaidLesson)

      const wrapper = createWrapper(null, null)
      const { result } = renderHook(() => useLessonAccess(2, 1), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should deny access
      expect(result.current.canAccess).toBe(false)
      expect(result.current.reason).toBe('requires_login')
      expect(result.current.freeToPreview).toBe(false)
      expect(result.current.showLockedView).toBe(true)
    })

    it('should include curriculum info for purchase CTA', async () => {
      const { lessonsApi } = await import('@/lib/api/lessons')
      const mockedLessonsApi = lessonsApi as jest.Mocked<typeof lessonsApi>
      mockedLessonsApi.getById = jest.fn().mockResolvedValue(mockPaidLesson)

      const wrapper = createWrapper(null, null)
      const { result } = renderHook(() => useLessonAccess(2, 1), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.curriculumId).toBe(1)
    })
  })

  describe('Scenario 3: Authenticated User Without Purchase Accessing Free Preview Lesson', () => {
    it('should grant access to free preview lesson for authenticated user without purchase', async () => {
      const { lessonsApi } = await import('@/lib/api/lessons')
      const { authApi } = await import('@/lib/api/auth')
      const mockedLessonsApi = lessonsApi as jest.Mocked<typeof lessonsApi>
      const mockedAuthApi = authApi as jest.Mocked<typeof authApi>

      mockedLessonsApi.getById = jest.fn().mockResolvedValue(mockFreeLesson)
      mockedAuthApi.getCurrentUser = jest.fn().mockResolvedValue(mockUser)

      const wrapper = createWrapper(mockUser, 'valid-token')
      const { result } = renderHook(() => useLessonAccess(1, 1), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.canAccess).toBe(true)
      expect(result.current.reason).toBe('free_preview')
      expect(result.current.showLockedView).toBe(false)
    })
  })

  describe('Scenario 4: Authenticated User Without Purchase Accessing Paid Lesson', () => {
    it('should deny access to paid lesson for authenticated user without purchase', async () => {
      const { lessonsApi } = await import('@/lib/api/lessons')
      const { authApi } = await import('@/lib/api/auth')
      const mockedLessonsApi = lessonsApi as jest.Mocked<typeof lessonsApi>
      const mockedAuthApi = authApi as jest.Mocked<typeof authApi>

      mockedLessonsApi.getById = jest.fn().mockResolvedValue(mockPaidLesson)
      mockedAuthApi.getCurrentUser = jest.fn().mockResolvedValue(mockUser)

      const wrapper = createWrapper(mockUser, 'valid-token')
      const { result } = renderHook(() => useLessonAccess(2, 1), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.canAccess).toBe(false)
      expect(result.current.reason).toBe('requires_purchase')
      expect(result.current.showLockedView).toBe(true)
    })
  })

  describe('Scenario 5: Authenticated User With Purchase Accessing Any Lesson', () => {
    it('should grant access to paid lesson for user with purchase', async () => {
      const { lessonsApi } = await import('@/lib/api/lessons')
      const { authApi } = await import('@/lib/api/auth')
      const mockedLessonsApi = lessonsApi as jest.Mocked<typeof lessonsApi>
      const mockedAuthApi = authApi as jest.Mocked<typeof authApi>

      mockedLessonsApi.getById = jest.fn().mockResolvedValue(mockPaidLesson)
      mockedAuthApi.getCurrentUser = jest.fn().mockResolvedValue(mockUser)

      // Mock purchase check - will need to implement this
      // For now, we'll simulate by having a flag in the user or lesson response
      const wrapper = createWrapper(mockUser, 'valid-token')
      const { result } = renderHook(
        () => useLessonAccess(2, 1, true), // Pass userHasPurchased flag
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.canAccess).toBe(true)
      expect(result.current.reason).toBe('owned')
      expect(result.current.showLockedView).toBe(false)
    })

    it('should grant access to free lesson for user with purchase', async () => {
      const { lessonsApi } = await import('@/lib/api/lessons')
      const { authApi } = await import('@/lib/api/auth')
      const mockedLessonsApi = lessonsApi as jest.Mocked<typeof lessonsApi>
      const mockedAuthApi = authApi as jest.Mocked<typeof authApi>

      mockedLessonsApi.getById = jest.fn().mockResolvedValue(mockFreeLesson)
      mockedAuthApi.getCurrentUser = jest.fn().mockResolvedValue(mockUser)

      const wrapper = createWrapper(mockUser, 'valid-token')
      const { result } = renderHook(
        () => useLessonAccess(1, 1, true), // Pass userHasPurchased flag
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.canAccess).toBe(true)
      expect(result.current.reason).toBe('owned')
      expect(result.current.showLockedView).toBe(false)
    })
  })

  describe('Scenario 9: Error Handling - Fail Secure', () => {
    it('should default to locked state on network error', async () => {
      const { lessonsApi } = await import('@/lib/api/lessons')
      const mockedLessonsApi = lessonsApi as jest.Mocked<typeof lessonsApi>
      mockedLessonsApi.getById = jest.fn().mockRejectedValue(new Error('Network error'))

      const wrapper = createWrapper(null, null)
      const { result } = renderHook(() => useLessonAccess(1, 1), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should default to locked (fail secure)
      expect(result.current.canAccess).toBe(false)
      expect(result.current.showLockedView).toBe(true)
      expect(result.current.error).toBeTruthy()
    })

    it('should provide retry capability after error', async () => {
      const { lessonsApi } = await import('@/lib/api/lessons')
      const mockedLessonsApi = lessonsApi as jest.Mocked<typeof lessonsApi>
      mockedLessonsApi.getById = jest
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockFreeLesson)

      const wrapper = createWrapper(null, null)
      const { result } = renderHook(() => useLessonAccess(1, 1), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeTruthy()
      expect(result.current.canAccess).toBe(false)

      // Retry
      result.current.retry()

      // Wait for retry to complete and access to be granted
      await waitFor(
        () => {
          expect(result.current.canAccess).toBe(true)
        },
        { timeout: 3000 }
      )

      expect(result.current.error).toBeNull()
    })
  })

  describe('Edge Cases', () => {
    it('should handle invalid lesson ID', async () => {
      const { lessonsApi } = await import('@/lib/api/lessons')
      const mockedLessonsApi = lessonsApi as jest.Mocked<typeof lessonsApi>
      mockedLessonsApi.getById = jest.fn().mockRejectedValue({ response: { status: 404 } })

      const wrapper = createWrapper(null, null)
      const { result } = renderHook(() => useLessonAccess(999, 1), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.canAccess).toBe(false)
      expect(result.current.error).toBeTruthy()
    })

    it('should handle missing curriculum ID', async () => {
      const { lessonsApi } = await import('@/lib/api/lessons')
      const mockedLessonsApi = lessonsApi as jest.Mocked<typeof lessonsApi>
      mockedLessonsApi.getById = jest.fn().mockResolvedValue(mockFreeLesson)

      const wrapper = createWrapper(null, null)
      const { result } = renderHook(() => useLessonAccess(1, 0), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should still work but flag invalid curriculum
      expect(result.current.curriculumId).toBe(0)
    })

    it('should re-check access when lessonId changes', async () => {
      const { lessonsApi } = await import('@/lib/api/lessons')
      const mockedLessonsApi = lessonsApi as jest.Mocked<typeof lessonsApi>
      mockedLessonsApi.getById = jest
        .fn()
        .mockResolvedValueOnce(mockFreeLesson)
        .mockResolvedValueOnce(mockPaidLesson)

      const wrapper = createWrapper(null, null)
      const { result, rerender } = renderHook(
        ({ lessonId, curriculumId }) => useLessonAccess(lessonId, curriculumId),
        {
          wrapper,
          initialProps: { lessonId: 1, curriculumId: 1 },
        }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.canAccess).toBe(true)

      // Change to paid lesson
      rerender({ lessonId: 2, curriculumId: 1 })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.canAccess).toBe(false)
    })
  })
})
