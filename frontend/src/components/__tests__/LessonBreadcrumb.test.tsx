import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import LessonBreadcrumb from '../LessonBreadcrumb'

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
    className,
  }: {
    children: React.ReactNode
    href: string
    className?: string
  }) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    )
  }
})

describe('LessonBreadcrumb', () => {
  const defaultProps = {
    curriculumId: 1,
    curriculumTitle: 'React Fundamentals',
    chapterTitle: 'Getting Started',
    lessonTitle: 'Introduction to React',
  }

  describe('Basic Rendering', () => {
    it('should render all breadcrumb items', () => {
      render(<LessonBreadcrumb {...defaultProps} />)

      expect(screen.getByText('React Fundamentals')).toBeInTheDocument()
      expect(screen.getByText('Getting Started')).toBeInTheDocument()
      expect(screen.getByText('Introduction to React')).toBeInTheDocument()
    })

    it('should render breadcrumb as a nav element', () => {
      const { container } = render(<LessonBreadcrumb {...defaultProps} />)

      const nav = container.querySelector('nav')
      expect(nav).toBeInTheDocument()
    })

    it('should render two separator icons', () => {
      const { container } = render(<LessonBreadcrumb {...defaultProps} />)

      // Check for chevron right SVG paths
      const separators = container.querySelectorAll('path[d="M9 5l7 7-7 7"]')
      expect(separators.length).toBe(2)
    })
  })

  describe('Curriculum Link', () => {
    it('should render curriculum as a clickable link', () => {
      const { container } = render(<LessonBreadcrumb {...defaultProps} />)

      const curriculumLink = screen.getByText('React Fundamentals')
      expect(curriculumLink.tagName).toBe('A')
    })

    it('should link to correct curriculum page', () => {
      const { container } = render(<LessonBreadcrumb {...defaultProps} />)

      const curriculumLink = container.querySelector(
        'a[href="/curriculums/1"]'
      )
      expect(curriculumLink).toBeInTheDocument()
      expect(curriculumLink).toHaveTextContent('React Fundamentals')
    })

    it('should have blue text color', () => {
      render(<LessonBreadcrumb {...defaultProps} />)

      const curriculumLink = screen.getByText('React Fundamentals')
      expect(curriculumLink).toHaveClass('text-blue-600')
    })

    it('should have hover underline', () => {
      render(<LessonBreadcrumb {...defaultProps} />)

      const curriculumLink = screen.getByText('React Fundamentals')
      expect(curriculumLink).toHaveClass('hover:underline')
    })

    it('should have whitespace-nowrap to prevent wrapping', () => {
      render(<LessonBreadcrumb {...defaultProps} />)

      const curriculumLink = screen.getByText('React Fundamentals')
      expect(curriculumLink).toHaveClass('whitespace-nowrap')
    })

    it('should handle different curriculum IDs', () => {
      const { container } = render(
        <LessonBreadcrumb {...defaultProps} curriculumId={999} />
      )

      const curriculumLink = container.querySelector(
        'a[href="/curriculums/999"]'
      )
      expect(curriculumLink).toBeInTheDocument()
    })
  })

  describe('Chapter Display', () => {
    it('should render chapter as non-clickable text', () => {
      render(<LessonBreadcrumb {...defaultProps} />)

      const chapterText = screen.getByText('Getting Started')
      expect(chapterText.tagName).toBe('SPAN')
    })

    it('should not have a link for chapter', () => {
      const { container } = render(<LessonBreadcrumb {...defaultProps} />)

      // Only curriculum should have a link, not chapter
      const links = container.querySelectorAll('a')
      expect(links.length).toBe(1) // Only curriculum link
    })

    it('should have gray text color', () => {
      render(<LessonBreadcrumb {...defaultProps} />)

      const chapterText = screen.getByText('Getting Started')
      expect(chapterText).toHaveClass('text-gray-600')
    })

    it('should have truncate class', () => {
      render(<LessonBreadcrumb {...defaultProps} />)

      const chapterText = screen.getByText('Getting Started')
      expect(chapterText).toHaveClass('truncate')
    })

    it('should have max-width constraints', () => {
      render(<LessonBreadcrumb {...defaultProps} />)

      const chapterText = screen.getByText('Getting Started')
      expect(chapterText).toHaveClass('max-w-[200px]', 'md:max-w-none')
    })
  })

  describe('Lesson Display', () => {
    it('should render lesson as non-clickable text', () => {
      render(<LessonBreadcrumb {...defaultProps} />)

      const lessonText = screen.getByText('Introduction to React')
      expect(lessonText.tagName).toBe('SPAN')
    })

    it('should have bold font weight', () => {
      render(<LessonBreadcrumb {...defaultProps} />)

      const lessonText = screen.getByText('Introduction to React')
      expect(lessonText).toHaveClass('font-semibold')
    })

    it('should have dark text color (current item)', () => {
      render(<LessonBreadcrumb {...defaultProps} />)

      const lessonText = screen.getByText('Introduction to React')
      expect(lessonText).toHaveClass('text-gray-900')
    })

    it('should have truncate class', () => {
      render(<LessonBreadcrumb {...defaultProps} />)

      const lessonText = screen.getByText('Introduction to React')
      expect(lessonText).toHaveClass('truncate')
    })

    it('should have max-width constraints', () => {
      render(<LessonBreadcrumb {...defaultProps} />)

      const lessonText = screen.getByText('Introduction to React')
      expect(lessonText).toHaveClass('max-w-[200px]', 'md:max-w-none')
    })
  })

  describe('Separator Icons', () => {
    it('should have correct styling for separators', () => {
      const { container } = render(<LessonBreadcrumb {...defaultProps} />)

      const separatorSvgs = container.querySelectorAll('svg.text-gray-400')
      expect(separatorSvgs.length).toBe(2)
    })

    it('should have flex-shrink-0 to prevent shrinking', () => {
      const { container } = render(<LessonBreadcrumb {...defaultProps} />)

      const separatorSvgs = container.querySelectorAll('svg.flex-shrink-0')
      expect(separatorSvgs.length).toBe(2)
    })

    it('should have correct size', () => {
      const { container } = render(<LessonBreadcrumb {...defaultProps} />)

      const separatorSvgs = container.querySelectorAll('svg.w-4.h-4')
      expect(separatorSvgs.length).toBe(2)
    })
  })

  describe('Layout and Responsiveness', () => {
    it('should have flex layout', () => {
      const { container } = render(<LessonBreadcrumb {...defaultProps} />)

      const nav = container.querySelector('nav')
      expect(nav).toHaveClass('flex', 'items-center')
    })

    it('should have horizontal scrolling', () => {
      const { container } = render(<LessonBreadcrumb {...defaultProps} />)

      const nav = container.querySelector('nav')
      expect(nav).toHaveClass('overflow-x-auto')
    })

    it('should have spacing between items', () => {
      const { container } = render(<LessonBreadcrumb {...defaultProps} />)

      const nav = container.querySelector('nav')
      expect(nav).toHaveClass('space-x-2')
    })

    it('should have small text size', () => {
      const { container } = render(<LessonBreadcrumb {...defaultProps} />)

      const nav = container.querySelector('nav')
      expect(nav).toHaveClass('text-sm')
    })

    it('should have bottom margin', () => {
      const { container } = render(<LessonBreadcrumb {...defaultProps} />)

      const nav = container.querySelector('nav')
      expect(nav).toHaveClass('mb-6')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long curriculum title', () => {
      const longTitle = 'A'.repeat(100)
      render(<LessonBreadcrumb {...defaultProps} curriculumTitle={longTitle} />)

      expect(screen.getByText(longTitle)).toBeInTheDocument()
      expect(screen.getByText(longTitle)).toHaveClass('whitespace-nowrap')
    })

    it('should handle very long chapter title with truncation', () => {
      const longChapter = 'Chapter '.repeat(20).trim()
      render(<LessonBreadcrumb {...defaultProps} chapterTitle={longChapter} />)

      const chapterElement = screen.getByText(longChapter)
      expect(chapterElement).toBeInTheDocument()
      expect(chapterElement).toHaveClass('truncate')
    })

    it('should handle very long lesson title with truncation', () => {
      const longLesson = 'Lesson '.repeat(20).trim()
      render(<LessonBreadcrumb {...defaultProps} lessonTitle={longLesson} />)

      const lessonElement = screen.getByText(longLesson)
      expect(lessonElement).toBeInTheDocument()
      expect(lessonElement).toHaveClass('truncate')
    })

    it('should handle special characters in titles', () => {
      render(
        <LessonBreadcrumb
          {...defaultProps}
          curriculumTitle="React & Vue"
          chapterTitle="Setup <Environment>"
          lessonTitle='Introduction to "Components"'
        />
      )

      expect(screen.getByText('React & Vue')).toBeInTheDocument()
      expect(screen.getByText('Setup <Environment>')).toBeInTheDocument()
      expect(screen.getByText('Introduction to "Components"')).toBeInTheDocument()
    })

    it('should handle empty strings', () => {
      render(
        <LessonBreadcrumb
          {...defaultProps}
          curriculumTitle=""
          chapterTitle=""
          lessonTitle=""
        />
      )

      const { container } = render(
        <LessonBreadcrumb
          {...defaultProps}
          curriculumTitle=""
          chapterTitle=""
          lessonTitle=""
        />
      )

      const nav = container.querySelector('nav')
      expect(nav).toBeInTheDocument()
    })

    it('should handle curriculum ID of 0', () => {
      const { container } = render(
        <LessonBreadcrumb {...defaultProps} curriculumId={0} />
      )

      const curriculumLink = container.querySelector('a[href="/curriculums/0"]')
      expect(curriculumLink).toBeInTheDocument()
    })

    it('should handle negative curriculum ID', () => {
      const { container } = render(
        <LessonBreadcrumb {...defaultProps} curriculumId={-1} />
      )

      const curriculumLink = container.querySelector('a[href="/curriculums/-1"]')
      expect(curriculumLink).toBeInTheDocument()
    })

    it('should handle unicode characters in titles', () => {
      render(
        <LessonBreadcrumb
          {...defaultProps}
          curriculumTitle="React 基础"
          chapterTitle="入门指南"
          lessonTitle="介绍"
        />
      )

      expect(screen.getByText('React 基础')).toBeInTheDocument()
      expect(screen.getByText('入门指南')).toBeInTheDocument()
      expect(screen.getByText('介绍')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should use semantic nav element', () => {
      const { container } = render(<LessonBreadcrumb {...defaultProps} />)

      const nav = container.querySelector('nav')
      expect(nav).toBeInTheDocument()
    })

    it('should have accessible link', () => {
      render(<LessonBreadcrumb {...defaultProps} />)

      const curriculumLink = screen.getByRole('link')
      expect(curriculumLink).toHaveAttribute('href', '/curriculums/1')
    })

    it('should have transition classes for smooth interaction', () => {
      render(<LessonBreadcrumb {...defaultProps} />)

      const curriculumLink = screen.getByText('React Fundamentals')
      expect(curriculumLink).toHaveClass('transition-colors')
    })
  })

  describe('Visual Hierarchy', () => {
    it('should style curriculum as interactive element', () => {
      render(<LessonBreadcrumb {...defaultProps} />)

      const curriculumLink = screen.getByText('React Fundamentals')
      expect(curriculumLink).toHaveClass(
        'text-blue-600',
        'hover:text-blue-800',
        'hover:underline'
      )
    })

    it('should style chapter as secondary element', () => {
      render(<LessonBreadcrumb {...defaultProps} />)

      const chapterText = screen.getByText('Getting Started')
      expect(chapterText).toHaveClass('text-gray-600')
      expect(chapterText).not.toHaveClass('font-semibold')
    })

    it('should style lesson as primary/current element', () => {
      render(<LessonBreadcrumb {...defaultProps} />)

      const lessonText = screen.getByText('Introduction to React')
      expect(lessonText).toHaveClass('text-gray-900', 'font-semibold')
    })

    it('should maintain correct visual order', () => {
      const { container } = render(<LessonBreadcrumb {...defaultProps} />)

      const textContent = container.textContent || ''
      const curriculumIndex = textContent.indexOf('React Fundamentals')
      const chapterIndex = textContent.indexOf('Getting Started')
      const lessonIndex = textContent.indexOf('Introduction to React')

      expect(curriculumIndex).toBeLessThan(chapterIndex)
      expect(chapterIndex).toBeLessThan(lessonIndex)
    })
  })
})
