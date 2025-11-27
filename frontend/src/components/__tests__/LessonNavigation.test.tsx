import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import LessonNavigation from '../LessonNavigation'
import { Lesson } from '@/types'

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) {
    return <a href={href}>{children}</a>
  }
})

describe('LessonNavigation', () => {
  const createMockLesson = (id: number, title: string): Lesson => ({
    id,
    chapterId: 1,
    title,
    lessonType: 'VIDEO',
    contentMetadata: {},
    orderIndex: id,
    createdAt: '2024-01-01T00:00:00Z',
  })

  const mockLessons: Lesson[] = [
    createMockLesson(1, 'Introduction to React'),
    createMockLesson(2, 'React Components'),
    createMockLesson(3, 'React State Management'),
    createMockLesson(4, 'React Hooks'),
    createMockLesson(5, 'Advanced React Patterns'),
  ]

  describe('Progress Indicator', () => {
    it('should display correct progress for first lesson', () => {
      render(
        <LessonNavigation currentLessonId={1} lessons={mockLessons} curriculumId={1} />
      )

      expect(screen.getByText('Lesson Progress')).toBeInTheDocument()
      expect(screen.getByText('1 of 5')).toBeInTheDocument()
    })

    it('should display correct progress for middle lesson', () => {
      render(
        <LessonNavigation currentLessonId={3} lessons={mockLessons} curriculumId={1} />
      )

      expect(screen.getByText('3 of 5')).toBeInTheDocument()
    })

    it('should display correct progress for last lesson', () => {
      render(
        <LessonNavigation currentLessonId={5} lessons={mockLessons} curriculumId={1} />
      )

      expect(screen.getByText('5 of 5')).toBeInTheDocument()
    })

    it('should render progress bar with correct width for first lesson', () => {
      const { container } = render(
        <LessonNavigation currentLessonId={1} lessons={mockLessons} curriculumId={1} />
      )

      const progressBar = container.querySelector('.bg-blue-600')
      expect(progressBar).toHaveStyle({ width: '20%' }) // 1/5 = 20%
    })

    it('should render progress bar with correct width for middle lesson', () => {
      const { container } = render(
        <LessonNavigation currentLessonId={3} lessons={mockLessons} curriculumId={1} />
      )

      const progressBar = container.querySelector('.bg-blue-600')
      expect(progressBar).toHaveStyle({ width: '60%' }) // 3/5 = 60%
    })

    it('should render progress bar with 100% width for last lesson', () => {
      const { container } = render(
        <LessonNavigation currentLessonId={5} lessons={mockLessons} curriculumId={1} />
      )

      const progressBar = container.querySelector('.bg-blue-600')
      expect(progressBar).toHaveStyle({ width: '100%' })
    })
  })

  describe('Previous Lesson Button', () => {
    it('should display previous lesson link when not on first lesson', () => {
      render(
        <LessonNavigation currentLessonId={3} lessons={mockLessons} curriculumId={1} />
      )

      expect(screen.getByText('Previous Lesson')).toBeInTheDocument()
      expect(screen.getByText('React Components')).toBeInTheDocument()
    })

    it('should link to correct previous lesson', () => {
      const { container } = render(
        <LessonNavigation currentLessonId={3} lessons={mockLessons} curriculumId={1} />
      )

      const prevLink = container.querySelector('a[href="/lessons/2"]')
      expect(prevLink).toBeInTheDocument()
    })

    it('should display disabled state when on first lesson', () => {
      render(
        <LessonNavigation currentLessonId={1} lessons={mockLessons} curriculumId={1} />
      )

      expect(screen.getByText('No previous lesson')).toBeInTheDocument()
      expect(screen.queryByText('Introduction to React')).not.toBeInTheDocument()
    })

    it('should not have link when on first lesson', () => {
      const { container } = render(
        <LessonNavigation currentLessonId={1} lessons={mockLessons} curriculumId={1} />
      )

      // Should not have any link to previous lesson
      const prevLinks = container.querySelectorAll('a[href^="/lessons/"]')
      // Only next lesson link should exist
      expect(prevLinks.length).toBe(1)
    })

    it('should have opacity-50 when disabled', () => {
      const { container } = render(
        <LessonNavigation currentLessonId={1} lessons={mockLessons} curriculumId={1} />
      )

      const disabledPrev = screen.getByText('No previous lesson').closest('div')
      expect(disabledPrev?.parentElement).toHaveClass('opacity-50')
    })

    it('should have cursor-not-allowed when disabled', () => {
      const { container } = render(
        <LessonNavigation currentLessonId={1} lessons={mockLessons} curriculumId={1} />
      )

      // cursor-not-allowed is on the inner div containing the disabled state
      const disabledContainer = container.querySelector('.cursor-not-allowed')
      expect(disabledContainer).toBeInTheDocument()
      expect(disabledContainer).toHaveClass('opacity-50')
    })
  })

  describe('Next Lesson Button', () => {
    it('should display next lesson link when not on last lesson', () => {
      render(
        <LessonNavigation currentLessonId={2} lessons={mockLessons} curriculumId={1} />
      )

      expect(screen.getByText('Next Lesson')).toBeInTheDocument()
      expect(screen.getByText('React State Management')).toBeInTheDocument()
    })

    it('should link to correct next lesson', () => {
      const { container } = render(
        <LessonNavigation currentLessonId={2} lessons={mockLessons} curriculumId={1} />
      )

      const nextLink = container.querySelector('a[href="/lessons/3"]')
      expect(nextLink).toBeInTheDocument()
    })

    it('should display disabled state when on last lesson', () => {
      render(
        <LessonNavigation currentLessonId={5} lessons={mockLessons} curriculumId={1} />
      )

      expect(screen.getByText('No next lesson')).toBeInTheDocument()
      expect(screen.queryByText('Advanced React Patterns')).not.toBeInTheDocument()
    })

    it('should not have link when on last lesson', () => {
      const { container } = render(
        <LessonNavigation currentLessonId={5} lessons={mockLessons} curriculumId={1} />
      )

      // Should not have any link to next lesson
      const nextLinks = container.querySelectorAll('a[href^="/lessons/"]')
      // Only previous lesson link should exist
      expect(nextLinks.length).toBe(1)
    })

    it('should have blue styling for next lesson', () => {
      const { container } = render(
        <LessonNavigation currentLessonId={2} lessons={mockLessons} curriculumId={1} />
      )

      // Find the div containing the next lesson that has blue background
      const nextButton = container.querySelector('.bg-blue-50')
      expect(nextButton).toBeInTheDocument()
      expect(nextButton).toHaveClass('bg-blue-50', 'hover:bg-blue-100')
    })
  })

  describe('Both Buttons Simultaneously', () => {
    it('should display both prev and next when in middle', () => {
      render(
        <LessonNavigation currentLessonId={3} lessons={mockLessons} curriculumId={1} />
      )

      expect(screen.getByText('React Components')).toBeInTheDocument() // Prev
      expect(screen.getByText('React Hooks')).toBeInTheDocument() // Next
    })

    it('should have two links when in middle', () => {
      const { container } = render(
        <LessonNavigation currentLessonId={3} lessons={mockLessons} curriculumId={1} />
      )

      const links = container.querySelectorAll('a[href^="/lessons/"]')
      expect(links.length).toBe(2)
      expect(links[0]).toHaveAttribute('href', '/lessons/2')
      expect(links[1]).toHaveAttribute('href', '/lessons/4')
    })
  })

  describe('Edge Cases', () => {
    it('should handle single lesson (no prev/next)', () => {
      const singleLesson = [createMockLesson(1, 'Only Lesson')]
      render(
        <LessonNavigation currentLessonId={1} lessons={singleLesson} curriculumId={1} />
      )

      expect(screen.getByText('1 of 1')).toBeInTheDocument()
      expect(screen.getByText('No previous lesson')).toBeInTheDocument()
      expect(screen.getByText('No next lesson')).toBeInTheDocument()
    })

    it('should handle two lessons - first lesson', () => {
      const twoLessons = [
        createMockLesson(1, 'First'),
        createMockLesson(2, 'Second'),
      ]
      render(<LessonNavigation currentLessonId={1} lessons={twoLessons} curriculumId={1} />)

      expect(screen.getByText('1 of 2')).toBeInTheDocument()
      expect(screen.getByText('No previous lesson')).toBeInTheDocument()
      expect(screen.getByText('Second')).toBeInTheDocument()
    })

    it('should handle two lessons - last lesson', () => {
      const twoLessons = [
        createMockLesson(1, 'First'),
        createMockLesson(2, 'Second'),
      ]
      render(<LessonNavigation currentLessonId={2} lessons={twoLessons} curriculumId={1} />)

      expect(screen.getByText('2 of 2')).toBeInTheDocument()
      expect(screen.getByText('First')).toBeInTheDocument()
      expect(screen.getByText('No next lesson')).toBeInTheDocument()
    })

    it('should handle very long lesson titles with truncation', () => {
      const longTitleLessons = [
        createMockLesson(1, 'A'.repeat(100)),
        createMockLesson(2, 'Current'),
        createMockLesson(3, 'B'.repeat(100)),
      ]
      render(
        <LessonNavigation currentLessonId={2} lessons={longTitleLessons} curriculumId={1} />
      )

      const prevTitle = screen.getByText('A'.repeat(100))
      expect(prevTitle).toHaveClass('truncate')

      const nextTitle = screen.getByText('B'.repeat(100))
      expect(nextTitle).toHaveClass('truncate')
    })

    it('should handle lesson IDs that are not sequential', () => {
      const nonSequentialLessons = [
        createMockLesson(10, 'Lesson 10'),
        createMockLesson(25, 'Lesson 25'),
        createMockLesson(100, 'Lesson 100'),
      ]
      render(
        <LessonNavigation currentLessonId={25} lessons={nonSequentialLessons} curriculumId={1} />
      )

      expect(screen.getByText('2 of 3')).toBeInTheDocument()
      expect(screen.getByText('Lesson 10')).toBeInTheDocument()
      expect(screen.getByText('Lesson 100')).toBeInTheDocument()
    })

    it('should calculate progress correctly with large lesson count', () => {
      const manyLessons = Array.from({ length: 100 }, (_, i) =>
        createMockLesson(i + 1, `Lesson ${i + 1}`)
      )
      render(
        <LessonNavigation currentLessonId={50} lessons={manyLessons} curriculumId={1} />
      )

      expect(screen.getByText('50 of 100')).toBeInTheDocument()

      const { container } = render(
        <LessonNavigation currentLessonId={50} lessons={manyLessons} curriculumId={1} />
      )
      const progressBar = container.querySelector('.bg-blue-600')
      expect(progressBar).toHaveStyle({ width: '50%' })
    })
  })

  describe('Visual Elements', () => {
    it('should render left arrow icon for previous button', () => {
      const { container } = render(
        <LessonNavigation currentLessonId={2} lessons={mockLessons} curriculumId={1} />
      )

      // Check for left arrow SVG path
      const leftArrowPath = container.querySelector('path[d="M15 19l-7-7 7-7"]')
      expect(leftArrowPath).toBeInTheDocument()
    })

    it('should render right arrow icon for next button', () => {
      const { container } = render(
        <LessonNavigation currentLessonId={2} lessons={mockLessons} curriculumId={1} />
      )

      // Check for right arrow SVG path
      const rightArrowPath = container.querySelector('path[d="M9 5l7 7-7 7"]')
      expect(rightArrowPath).toBeInTheDocument()
    })

    it('should have responsive layout classes', () => {
      const { container } = render(
        <LessonNavigation currentLessonId={2} lessons={mockLessons} curriculumId={1} />
      )

      const navContainer = container.querySelector('.flex.flex-col.sm\\:flex-row')
      expect(navContainer).toBeInTheDocument()
    })

    it('should have transition classes on progress bar', () => {
      const { container } = render(
        <LessonNavigation currentLessonId={2} lessons={mockLessons} curriculumId={1} />
      )

      const progressBar = container.querySelector('.bg-blue-600')
      expect(progressBar).toHaveClass('transition-all', 'duration-300')
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(
        <LessonNavigation currentLessonId={2} lessons={mockLessons} curriculumId={1} />
      )

      const progressHeading = screen.getByText('Lesson Progress')
      expect(progressHeading).toBeInTheDocument()
    })

    it('should have descriptive text for navigation buttons', () => {
      render(
        <LessonNavigation currentLessonId={2} lessons={mockLessons} curriculumId={1} />
      )

      expect(screen.getByText('Previous Lesson')).toBeInTheDocument()
      expect(screen.getByText('Next Lesson')).toBeInTheDocument()
    })

    it('should use semantic link elements', () => {
      const { container } = render(
        <LessonNavigation currentLessonId={2} lessons={mockLessons} curriculumId={1} />
      )

      const links = container.querySelectorAll('a')
      expect(links.length).toBeGreaterThan(0)
      links.forEach((link) => {
        expect(link).toHaveAttribute('href')
      })
    })
  })

  describe('Current Lesson Not Found', () => {
    it('should handle current lesson ID not in list', () => {
      render(
        <LessonNavigation currentLessonId={999} lessons={mockLessons} curriculumId={1} />
      )

      // findIndex returns -1 when not found
      // currentIndex = -1
      // progress = "0 of 5" (because -1 + 1 = 0)
      expect(screen.getByText('0 of 5')).toBeInTheDocument()
    })

    it('should show no prev but first lesson as next when lesson not found', () => {
      render(
        <LessonNavigation currentLessonId={999} lessons={mockLessons} curriculumId={1} />
      )

      // When currentIndex = -1 (not found):
      // prevLesson: -1 > 0 → false → null
      // nextLesson: -1 < 4 → true → lessons[0]
      expect(screen.getByText('No previous lesson')).toBeInTheDocument()
      expect(screen.getByText('Introduction to React')).toBeInTheDocument() // First lesson
    })
  })
})
