/**
 * Unit tests for LessonProgressIndicator component
 *
 * Tests cover:
 * - Completed state (green checkmark)
 * - In-progress state (blue progress circle with percentage)
 * - Not-started state (gray empty circle)
 * - Size variations (sm, md, lg)
 * - Accessibility (tooltips with completion info)
 */

import { render, screen } from '@testing-library/react'
import LessonProgressIndicator from '../LessonProgressIndicator'
import type { VideoProgressDto } from '@/types/video-progress'

describe('LessonProgressIndicator', () => {
  const mockLessonId = 1

  describe('Completed State', () => {
    it('should render green checkmark when lesson is completed', () => {
      const completedProgress: VideoProgressDto = {
        id: 1,
        userId: 1,
        lessonId: mockLessonId,
        currentTimeSeconds: 120.0,
        durationSeconds: 120.0,
        completionPercentage: 100,
        isCompleted: true,
        completedAt: '2025-11-29T00:00:00Z',
        createdAt: '2025-11-29T00:00:00Z',
        updatedAt: '2025-11-29T00:00:00Z',
      }

      const { container } = render(
        <LessonProgressIndicator
          lessonId={mockLessonId}
          progress={completedProgress}
        />
      )

      // Should have green color class
      const svgElement = container.querySelector('svg')
      expect(svgElement).toBeInTheDocument()

      // Check for checkmark path
      const checkmarkPath = container.querySelector('path[d*="M9 12l2 2 4-4"]')
      expect(checkmarkPath).toBeInTheDocument()
    })

    it('should show completion date in tooltip', () => {
      const completedProgress: VideoProgressDto = {
        id: 1,
        userId: 1,
        lessonId: mockLessonId,
        currentTimeSeconds: 120.0,
        durationSeconds: 120.0,
        completionPercentage: 100,
        isCompleted: true,
        completedAt: '2025-11-29T00:00:00Z',
        createdAt: '2025-11-29T00:00:00Z',
        updatedAt: '2025-11-29T00:00:00Z',
      }

      const { container } = render(
        <LessonProgressIndicator
          lessonId={mockLessonId}
          progress={completedProgress}
        />
      )

      const tooltipElement = container.querySelector('[title]')
      expect(tooltipElement).toHaveAttribute('title', expect.stringContaining('Completed on'))
    })

    it('should not show percentage text for completed lessons in sm size', () => {
      const completedProgress: VideoProgressDto = {
        id: 1,
        userId: 1,
        lessonId: mockLessonId,
        currentTimeSeconds: 120.0,
        durationSeconds: 120.0,
        completionPercentage: 100,
        isCompleted: true,
        completedAt: '2025-11-29T00:00:00Z',
        createdAt: '2025-11-29T00:00:00Z',
        updatedAt: '2025-11-29T00:00:00Z',
      }

      const { container } = render(
        <LessonProgressIndicator
          lessonId={mockLessonId}
          progress={completedProgress}
          size="sm"
        />
      )

      // Should not have text content
      expect(container.textContent).not.toContain('✓')
    })

    it('should show checkmark for md and lg sizes', () => {
      const completedProgress: VideoProgressDto = {
        id: 1,
        userId: 1,
        lessonId: mockLessonId,
        currentTimeSeconds: 120.0,
        durationSeconds: 120.0,
        completionPercentage: 100,
        isCompleted: true,
        completedAt: '2025-11-29T00:00:00Z',
        createdAt: '2025-11-29T00:00:00Z',
        updatedAt: '2025-11-29T00:00:00Z',
      }

      const { container: mdContainer } = render(
        <LessonProgressIndicator
          lessonId={mockLessonId}
          progress={completedProgress}
          size="md"
        />
      )

      expect(mdContainer.textContent).toContain('✓')

      const { container: lgContainer } = render(
        <LessonProgressIndicator
          lessonId={mockLessonId}
          progress={completedProgress}
          size="lg"
        />
      )

      expect(lgContainer.textContent).toContain('✓')
    })
  })

  describe('In-Progress State', () => {
    it('should render blue progress circle for in-progress lessons', () => {
      const inProgressLesson: VideoProgressDto = {
        id: 1,
        userId: 1,
        lessonId: mockLessonId,
        currentTimeSeconds: 60.0,
        durationSeconds: 120.0,
        completionPercentage: 50,
        isCompleted: false,
        completedAt: null,
        createdAt: '2025-11-29T00:00:00Z',
        updatedAt: '2025-11-29T00:00:00Z',
      }

      const { container } = render(
        <LessonProgressIndicator
          lessonId={mockLessonId}
          progress={inProgressLesson}
        />
      )

      // Should have progress circle with blue border
      const progressCircle = container.querySelector('[style*="border"]')
      expect(progressCircle).toBeInTheDocument()
    })

    it('should show completion percentage in tooltip', () => {
      const inProgressLesson: VideoProgressDto = {
        id: 1,
        userId: 1,
        lessonId: mockLessonId,
        currentTimeSeconds: 60.0,
        durationSeconds: 120.0,
        completionPercentage: 50,
        isCompleted: false,
        completedAt: null,
        createdAt: '2025-11-29T00:00:00Z',
        updatedAt: '2025-11-29T00:00:00Z',
      }

      const { container } = render(
        <LessonProgressIndicator
          lessonId={mockLessonId}
          progress={inProgressLesson}
        />
      )

      const tooltipElement = container.querySelector('[title="50% complete"]')
      expect(tooltipElement).toBeInTheDocument()
    })

    it('should display percentage text for md and lg sizes', () => {
      const inProgressLesson: VideoProgressDto = {
        id: 1,
        userId: 1,
        lessonId: mockLessonId,
        currentTimeSeconds: 45.0,
        durationSeconds: 120.0,
        completionPercentage: 37,
        isCompleted: false,
        completedAt: null,
        createdAt: '2025-11-29T00:00:00Z',
        updatedAt: '2025-11-29T00:00:00Z',
      }

      const { container } = render(
        <LessonProgressIndicator
          lessonId={mockLessonId}
          progress={inProgressLesson}
          size="md"
        />
      )

      expect(container.textContent).toContain('37%')
    })

    it('should not display percentage text for sm size', () => {
      const inProgressLesson: VideoProgressDto = {
        id: 1,
        userId: 1,
        lessonId: mockLessonId,
        currentTimeSeconds: 45.0,
        durationSeconds: 120.0,
        completionPercentage: 37,
        isCompleted: false,
        completedAt: null,
        createdAt: '2025-11-29T00:00:00Z',
        updatedAt: '2025-11-29T00:00:00Z',
      }

      const { container } = render(
        <LessonProgressIndicator
          lessonId={mockLessonId}
          progress={inProgressLesson}
          size="sm"
        />
      )

      expect(container.textContent).not.toContain('37%')
    })

    it('should show progress at 1%', () => {
      const minProgress: VideoProgressDto = {
        id: 1,
        userId: 1,
        lessonId: mockLessonId,
        currentTimeSeconds: 1.2,
        durationSeconds: 120.0,
        completionPercentage: 1,
        isCompleted: false,
        completedAt: null,
        createdAt: '2025-11-29T00:00:00Z',
        updatedAt: '2025-11-29T00:00:00Z',
      }

      const { container } = render(
        <LessonProgressIndicator
          lessonId={mockLessonId}
          progress={minProgress}
          size="md"
        />
      )

      expect(container.textContent).toContain('1%')
    })

    it('should show progress at 94% (just below completion)', () => {
      const nearComplete: VideoProgressDto = {
        id: 1,
        userId: 1,
        lessonId: mockLessonId,
        currentTimeSeconds: 112.8,
        durationSeconds: 120.0,
        completionPercentage: 94,
        isCompleted: false,
        completedAt: null,
        createdAt: '2025-11-29T00:00:00Z',
        updatedAt: '2025-11-29T00:00:00Z',
      }

      const { container } = render(
        <LessonProgressIndicator
          lessonId={mockLessonId}
          progress={nearComplete}
          size="md"
        />
      )

      expect(container.textContent).toContain('94%')
    })

    it('should not show in-progress state for 95%+ (should be completed)', () => {
      const completedThreshold: VideoProgressDto = {
        id: 1,
        userId: 1,
        lessonId: mockLessonId,
        currentTimeSeconds: 114.0,
        durationSeconds: 120.0,
        completionPercentage: 95,
        isCompleted: false, // Shouldn't happen in practice, but testing component logic
        completedAt: null,
        createdAt: '2025-11-29T00:00:00Z',
        updatedAt: '2025-11-29T00:00:00Z',
      }

      const { container } = render(
        <LessonProgressIndicator
          lessonId={mockLessonId}
          progress={completedThreshold}
        />
      )

      // Should render as not-started (gray circle) since isCompleted=false and percentage >= 95
      const tooltipElement = container.querySelector('[title="Not started"]')
      expect(tooltipElement).toBeInTheDocument()
    })
  })

  describe('Not-Started State', () => {
    it('should render gray empty circle when no progress', () => {
      const { container } = render(
        <LessonProgressIndicator
          lessonId={mockLessonId}
          progress={null}
        />
      )

      const tooltipElement = container.querySelector('[title="Not started"]')
      expect(tooltipElement).toBeInTheDocument()

      // Should have gray border
      const emptyCircle = container.querySelector('[style*="border"]')
      expect(emptyCircle).toBeInTheDocument()
    })

    it('should render gray empty circle when progress is undefined', () => {
      const { container } = render(
        <LessonProgressIndicator
          lessonId={mockLessonId}
          progress={undefined}
        />
      )

      const tooltipElement = container.querySelector('[title="Not started"]')
      expect(tooltipElement).toBeInTheDocument()
    })

    it('should render gray empty circle when progress is 0%', () => {
      const zeroProgress: VideoProgressDto = {
        id: 1,
        userId: 1,
        lessonId: mockLessonId,
        currentTimeSeconds: 0.0,
        durationSeconds: 120.0,
        completionPercentage: 0,
        isCompleted: false,
        completedAt: null,
        createdAt: '2025-11-29T00:00:00Z',
        updatedAt: '2025-11-29T00:00:00Z',
      }

      const { container } = render(
        <LessonProgressIndicator
          lessonId={mockLessonId}
          progress={zeroProgress}
        />
      )

      const tooltipElement = container.querySelector('[title="Not started"]')
      expect(tooltipElement).toBeInTheDocument()
    })

    it('should show dash symbol for md and lg sizes', () => {
      const { container: mdContainer } = render(
        <LessonProgressIndicator
          lessonId={mockLessonId}
          progress={null}
          size="md"
        />
      )

      expect(mdContainer.textContent).toContain('—')

      const { container: lgContainer } = render(
        <LessonProgressIndicator
          lessonId={mockLessonId}
          progress={null}
          size="lg"
        />
      )

      expect(lgContainer.textContent).toContain('—')
    })

    it('should not show dash symbol for sm size', () => {
      const { container } = render(
        <LessonProgressIndicator
          lessonId={mockLessonId}
          progress={null}
          size="sm"
        />
      )

      expect(container.textContent).not.toContain('—')
    })
  })

  describe('Size Variations', () => {
    it('should apply correct size for sm', () => {
      const { container } = render(
        <LessonProgressIndicator
          lessonId={mockLessonId}
          progress={null}
          size="sm"
        />
      )

      const circle = container.querySelector('[style*="16px"]')
      expect(circle).toBeInTheDocument()
    })

    it('should apply correct size for md (default)', () => {
      const { container } = render(
        <LessonProgressIndicator
          lessonId={mockLessonId}
          progress={null}
          size="md"
        />
      )

      const circle = container.querySelector('[style*="20px"]')
      expect(circle).toBeInTheDocument()
    })

    it('should apply correct size for lg', () => {
      const { container } = render(
        <LessonProgressIndicator
          lessonId={mockLessonId}
          progress={null}
          size="lg"
        />
      )

      const circle = container.querySelector('[style*="24px"]')
      expect(circle).toBeInTheDocument()
    })

    it('should default to md size when not specified', () => {
      const { container } = render(
        <LessonProgressIndicator
          lessonId={mockLessonId}
          progress={null}
        />
      )

      const circle = container.querySelector('[style*="20px"]')
      expect(circle).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle progress with null completedAt even when isCompleted=true', () => {
      const inconsistentProgress: VideoProgressDto = {
        id: 1,
        userId: 1,
        lessonId: mockLessonId,
        currentTimeSeconds: 120.0,
        durationSeconds: 120.0,
        completionPercentage: 100,
        isCompleted: true,
        completedAt: null, // Inconsistent state
        createdAt: '2025-11-29T00:00:00Z',
        updatedAt: '2025-11-29T00:00:00Z',
      }

      const { container } = render(
        <LessonProgressIndicator
          lessonId={mockLessonId}
          progress={inconsistentProgress}
        />
      )

      // Should still render as completed
      const checkmarkPath = container.querySelector('path[d*="M9 12l2 2 4-4"]')
      expect(checkmarkPath).toBeInTheDocument()
    })

    it('should handle very high completion percentages', () => {
      const overComplete: VideoProgressDto = {
        id: 1,
        userId: 1,
        lessonId: mockLessonId,
        currentTimeSeconds: 120.0,
        durationSeconds: 120.0,
        completionPercentage: 100,
        isCompleted: false,
        completedAt: null,
        createdAt: '2025-11-29T00:00:00Z',
        updatedAt: '2025-11-29T00:00:00Z',
      }

      const { container } = render(
        <LessonProgressIndicator
          lessonId={mockLessonId}
          progress={overComplete}
        />
      )

      // Should render as not-started since isCompleted=false and percentage >= 95
      const tooltipElement = container.querySelector('[title="Not started"]')
      expect(tooltipElement).toBeInTheDocument()
    })

    it('should handle different lessonIds correctly', () => {
      const { rerender } = render(
        <LessonProgressIndicator
          lessonId={1}
          progress={null}
        />
      )

      // Should not crash when lessonId changes
      rerender(
        <LessonProgressIndicator
          lessonId={999}
          progress={null}
        />
      )

      expect(screen.queryByTitle('Not started')).toBeInTheDocument()
    })
  })
})
