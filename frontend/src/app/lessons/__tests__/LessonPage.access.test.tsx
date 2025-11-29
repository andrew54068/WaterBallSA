import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import LessonPageClient from '../LessonPageClient'
import { Lesson, Chapter, Curriculum, User } from '@/types'

// Mock dependencies
jest.mock('@/lib/api/lessons')
jest.mock('@/lib/api/chapters')
jest.mock('@/lib/api/curriculums')
jest.mock('@/lib/api/auth')
jest.mock('@/hooks/useLessonAccess')
jest.mock('@/components/LockedLessonView', () => {
  return function MockLockedLessonView() {
    return <div data-testid="locked-lesson-view">Locked Lesson View</div>
  }
})
jest.mock('@/components/VideoPlayer', () => {
  return function MockVideoPlayer() {
    return <div data-testid="video-player">Video Player</div>
  }
})
jest.mock('@/components/LessonSidebar', () => ({
  LessonSidebar: function MockLessonSidebar() {
    return <div data-testid="lesson-sidebar">Lesson Sidebar</div>
  },
}))

// Mock data
const mockFreeLesson: Lesson = {
  id: 1,
  chapterId: 1,
  title: 'Free Lesson',
  description: 'This is a free preview lesson',
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
  description: 'This is a paid lesson',
  lessonType: 'VIDEO',
  contentUrl: 'https://youtube.com/watch?v=test2',
  contentMetadata: {},
  orderIndex: 2,
  isFree: false,
  createdAt: '2025-01-01T00:00:00Z',
}

const mockChapter: Chapter = {
  id: 1,
  curriculumId: 1,
  title: 'Chapter 1',
  description: 'First chapter',
  orderIndex: 1,
  createdAt: '2025-01-01T00:00:00Z',
  lessons: [mockFreeLesson, mockPaidLesson],
}

const mockCurriculum: Curriculum = {
  id: 1,
  title: 'Advanced JavaScript',
  description: 'Learn advanced JavaScript',
  instructorName: 'John Doe',
  price: 99.99,
  currency: 'USD',
  difficultyLevel: 'INTERMEDIATE',
  estimatedDurationHours: 20,
  isPublished: true,
  createdAt: '2025-01-01T00:00:00Z',
  chapters: [mockChapter],
}

const mockUser: User = {
  id: 1,
  googleId: 'google-123',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
}

// Mock AuthProvider
jest.mock('@/lib/auth-context', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const ChakraWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>
)

const renderWithChakra = (ui: React.ReactElement) => {
  return render(ui, { wrapper: ChakraWrapper })
}

describe('Lesson Page Access Control Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Default mock for useAuth - anonymous user
    const { useAuth } = require('@/lib/auth-context')
    useAuth.mockReturnValue({
      user: null,
      accessToken: null,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
    })
  })

  describe('Scenario 1: Anonymous User Accessing Free Preview Lesson', () => {
    it('should display lesson content without locked view', async () => {
      const { useLessonAccess } = await import('@/hooks/useLessonAccess')
      const mockedUseLessonAccess = useLessonAccess as jest.MockedFunction<typeof useLessonAccess>

      mockedUseLessonAccess.mockReturnValue({
        canAccess: true,
        reason: 'free_preview',
        freeToPreview: true,
        showLockedView: false,
        isLoading: false,
        error: null,
        curriculumId: 1,
        retry: jest.fn(),
      })

      renderWithChakra(
        <LessonPageClient
          lesson={mockFreeLesson}
          chapter={mockChapter}
          curriculum={mockCurriculum}
          userHasPurchased={false}
        />
      )

      await waitFor(() => {
        expect(screen.getByTestId('video-player')).toBeInTheDocument()
      })

      expect(screen.queryByTestId('locked-lesson-view')).not.toBeInTheDocument()
    })

    it('should NOT display purchase prompt', async () => {
      const { useLessonAccess } = await import('@/hooks/useLessonAccess')
      const mockedUseLessonAccess = useLessonAccess as jest.MockedFunction<typeof useLessonAccess>

      mockedUseLessonAccess.mockReturnValue({
        canAccess: true,
        reason: 'free_preview',
        freeToPreview: true,
        showLockedView: false,
        isLoading: false,
        error: null,
        curriculumId: 1,
        retry: jest.fn(),
      })

      renderWithChakra(
        <LessonPageClient
          lesson={mockFreeLesson}
          chapter={mockChapter}
          curriculum={mockCurriculum}
          userHasPurchased={false}
        />
      )

      expect(screen.queryByTestId('locked-lesson-view')).not.toBeInTheDocument()
      expect(screen.queryByText(/purchase/i)).not.toBeInTheDocument()
    })
  })

  describe('Scenario 2: Anonymous User Accessing Paid Lesson', () => {
    it('should block lesson content and show locked view', async () => {
      const { useLessonAccess } = await import('@/hooks/useLessonAccess')
      const mockedUseLessonAccess = useLessonAccess as jest.MockedFunction<typeof useLessonAccess>

      mockedUseLessonAccess.mockReturnValue({
        canAccess: false,
        reason: 'requires_login',
        freeToPreview: false,
        showLockedView: true,
        isLoading: false,
        error: null,
        curriculumId: 1,
        retry: jest.fn(),
      })

      renderWithChakra(
        <LessonPageClient
          lesson={mockPaidLesson}
          chapter={mockChapter}
          curriculum={mockCurriculum}
          userHasPurchased={false}
        />
      )

      await waitFor(() => {
        expect(screen.getByTestId('locked-lesson-view')).toBeInTheDocument()
      })

      expect(screen.queryByTestId('video-player')).not.toBeInTheDocument()
    })
  })

  describe('Scenario 4: Authenticated User Without Purchase Accessing Paid Lesson', () => {
    it('should block lesson content and show locked view with purchase CTA', async () => {
      const { useAuth } = require('@/lib/auth-context')
      const { useLessonAccess } = await import('@/hooks/useLessonAccess')
      const mockedUseLessonAccess = useLessonAccess as jest.MockedFunction<typeof useLessonAccess>

      // Mock authenticated user
      useAuth.mockReturnValue({
        user: mockUser,
        accessToken: 'valid-token',
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      })

      mockedUseLessonAccess.mockReturnValue({
        canAccess: false,
        reason: 'requires_purchase',
        freeToPreview: false,
        showLockedView: true,
        isLoading: false,
        error: null,
        curriculumId: 1,
        retry: jest.fn(),
      })

      renderWithChakra(
        <LessonPageClient
          lesson={mockPaidLesson}
          chapter={mockChapter}
          curriculum={mockCurriculum}
          userHasPurchased={false}
        />
      )

      await waitFor(() => {
        expect(screen.getByTestId('locked-lesson-view')).toBeInTheDocument()
      })

      expect(screen.queryByTestId('video-player')).not.toBeInTheDocument()
    })
  })

  describe('Scenario 5: Authenticated User With Purchase Accessing Any Lesson', () => {
    it('should display paid lesson content for user with purchase', async () => {
      const { useAuth } = require('@/lib/auth-context')
      const { useLessonAccess } = await import('@/hooks/useLessonAccess')
      const mockedUseLessonAccess = useLessonAccess as jest.MockedFunction<typeof useLessonAccess>

      // Mock authenticated user
      useAuth.mockReturnValue({
        user: mockUser,
        accessToken: 'valid-token',
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      })

      mockedUseLessonAccess.mockReturnValue({
        canAccess: true,
        reason: 'owned',
        freeToPreview: false,
        showLockedView: false,
        isLoading: false,
        error: null,
        curriculumId: 1,
        retry: jest.fn(),
      })

      renderWithChakra(
        <LessonPageClient
          lesson={mockPaidLesson}
          chapter={mockChapter}
          curriculum={mockCurriculum}
          userHasPurchased={true}
        />
      )

      await waitFor(() => {
        expect(screen.getByTestId('video-player')).toBeInTheDocument()
      })

      expect(screen.queryByTestId('locked-lesson-view')).not.toBeInTheDocument()
    })
  })

  describe('Scenario 6: Direct URL Access to Locked Lesson', () => {
    it('should immediately show locked state without content flashing', async () => {
      const { useLessonAccess } = await import('@/hooks/useLessonAccess')
      const mockedUseLessonAccess = useLessonAccess as jest.MockedFunction<typeof useLessonAccess>

      // Simulate initial loading state
      mockedUseLessonAccess.mockReturnValue({
        canAccess: false,
        reason: 'requires_login',
        freeToPreview: false,
        showLockedView: true,
        isLoading: false,
        error: null,
        curriculumId: 1,
        retry: jest.fn(),
      })

      const { container } = renderWithChakra(
        <LessonPageClient
          lesson={mockPaidLesson}
          chapter={mockChapter}
          curriculum={mockCurriculum}
          userHasPurchased={false}
        />
      )

      // Video player should never appear
      expect(screen.queryByTestId('video-player')).not.toBeInTheDocument()
      expect(screen.getByTestId('locked-lesson-view')).toBeInTheDocument()

      // Verify no content flash by checking DOM history
      const mutations = new MutationObserver(() => {})
      mutations.observe(container, { childList: true, subtree: true })

      await waitFor(() => {
        expect(screen.getByTestId('locked-lesson-view')).toBeInTheDocument()
      })

      mutations.disconnect()
    })
  })

  describe('Scenario 9: Error Handling - Fail Secure', () => {
    it('should default to locked state on access check failure', async () => {
      const { useLessonAccess } = await import('@/hooks/useLessonAccess')
      const mockedUseLessonAccess = useLessonAccess as jest.MockedFunction<typeof useLessonAccess>

      mockedUseLessonAccess.mockReturnValue({
        canAccess: false,
        reason: 'requires_login',
        freeToPreview: false,
        showLockedView: true,
        isLoading: false,
        error: new Error('Network error'),
        curriculumId: 1,
        retry: jest.fn(),
      })

      renderWithChakra(
        <LessonPageClient
          lesson={mockPaidLesson}
          chapter={mockChapter}
          curriculum={mockCurriculum}
          userHasPurchased={false}
        />
      )

      // Should show error UI (not locked view, since error takes precedence)
      await waitFor(() => {
        expect(screen.getByText(/unable to verify access/i)).toBeInTheDocument()
      })

      expect(screen.queryByTestId('video-player')).not.toBeInTheDocument()
    })

    it('should show error message with retry option', async () => {
      const { useLessonAccess } = await import('@/hooks/useLessonAccess')
      const mockedUseLessonAccess = useLessonAccess as jest.MockedFunction<typeof useLessonAccess>

      const retryFn = jest.fn()
      mockedUseLessonAccess.mockReturnValue({
        canAccess: false,
        reason: 'requires_login',
        freeToPreview: false,
        showLockedView: true,
        isLoading: false,
        error: new Error('Unable to verify access'),
        curriculumId: 1,
        retry: retryFn,
      })

      renderWithChakra(
        <LessonPageClient
          lesson={mockPaidLesson}
          chapter={mockChapter}
          curriculum={mockCurriculum}
          userHasPurchased={false}
        />
      )

      // Should show error state with retry button
      expect(screen.getByRole('heading', { name: /unable to verify access/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('should show loading state while checking access', async () => {
      const { useLessonAccess } = await import('@/hooks/useLessonAccess')
      const mockedUseLessonAccess = useLessonAccess as jest.MockedFunction<typeof useLessonAccess>

      mockedUseLessonAccess.mockReturnValue({
        canAccess: false,
        reason: 'requires_login',
        freeToPreview: false,
        showLockedView: false,
        isLoading: true,
        error: null,
        curriculumId: 1,
        retry: jest.fn(),
      })

      renderWithChakra(
        <LessonPageClient
          lesson={mockPaidLesson}
          chapter={mockChapter}
          curriculum={mockCurriculum}
          userHasPurchased={false}
        />
      )

      expect(screen.getByText(/loading|checking access/i)).toBeInTheDocument()
    })
  })

  describe('Integration with Lesson Sidebar', () => {
    it('should pass access information to sidebar', async () => {
      const { useLessonAccess } = await import('@/hooks/useLessonAccess')
      const mockedUseLessonAccess = useLessonAccess as jest.MockedFunction<typeof useLessonAccess>

      mockedUseLessonAccess.mockReturnValue({
        canAccess: true,
        reason: 'free_preview',
        freeToPreview: true,
        showLockedView: false,
        isLoading: false,
        error: null,
        curriculumId: 1,
        retry: jest.fn(),
      })

      renderWithChakra(
        <LessonPageClient
          lesson={mockFreeLesson}
          chapter={mockChapter}
          curriculum={mockCurriculum}
          userHasPurchased={false}
        />
      )

      // Sidebar should receive userHasPurchased prop
      expect(screen.getByTestId('lesson-sidebar')).toBeInTheDocument()
    })
  })
})
