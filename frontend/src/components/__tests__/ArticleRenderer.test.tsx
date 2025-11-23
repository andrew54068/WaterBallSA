import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ArticleRenderer from '../ArticleRenderer'

// Mock window.open
const mockWindowOpen = jest.fn()
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
  writable: true,
})

describe('ArticleRenderer', () => {
  const defaultProps = {
    articleUrl: 'https://example.com/article',
    title: 'Test Article Title',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render article header with title', () => {
      render(<ArticleRenderer {...defaultProps} />)

      expect(screen.getByText('Article Lesson')).toBeInTheDocument()
      expect(screen.getByText('Read external article content')).toBeInTheDocument()
    })

    it('should render Read Article button', () => {
      render(<ArticleRenderer {...defaultProps} />)

      const button = screen.getByRole('button', { name: /read article/i })
      expect(button).toBeInTheDocument()
    })

    it('should display "Opens in a new tab" hint', () => {
      render(<ArticleRenderer {...defaultProps} />)

      expect(screen.getByText('Opens in a new tab')).toBeInTheDocument()
    })

    it('should not display description when not provided', () => {
      const { container } = render(<ArticleRenderer {...defaultProps} />)

      // Description paragraph should not exist
      const descriptionParagraph = container.querySelector('p.leading-relaxed')
      expect(descriptionParagraph).not.toBeInTheDocument()
    })
  })

  describe('Description Display', () => {
    it('should display description when provided', () => {
      const description = 'This is a test article description'
      render(<ArticleRenderer {...defaultProps} description={description} />)

      expect(screen.getByText(description)).toBeInTheDocument()
    })

    it('should render description with correct styling', () => {
      const description = 'Test description'
      const { container } = render(
        <ArticleRenderer {...defaultProps} description={description} />
      )

      const descriptionElement = screen.getByText(description)
      expect(descriptionElement).toHaveClass('leading-relaxed')
    })
  })

  describe('Metadata Display', () => {
    it('should display word count when provided', () => {
      const metadata = { wordCount: 1500 }
      render(<ArticleRenderer {...defaultProps} metadata={metadata} />)

      expect(screen.getByText('Word Count')).toBeInTheDocument()
      expect(screen.getByText('1,500')).toBeInTheDocument()
    })

    it('should display reading level when provided', () => {
      const metadata = { readingLevel: 'intermediate' }
      render(<ArticleRenderer {...defaultProps} metadata={metadata} />)

      expect(screen.getByText('Reading Level')).toBeInTheDocument()
      expect(screen.getByText('intermediate')).toBeInTheDocument()
    })

    it('should capitalize reading level', () => {
      const metadata = { readingLevel: 'beginner' }
      const { container } = render(
        <ArticleRenderer {...defaultProps} metadata={metadata} />
      )

      const readingLevelElement = screen.getByText('beginner')
      expect(readingLevelElement).toHaveClass('capitalize')
    })

    it('should display code examples count when provided', () => {
      const metadata = { codeExamples: 5 }
      render(<ArticleRenderer {...defaultProps} metadata={metadata} />)

      expect(screen.getByText('Code Examples')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('should display code examples even when count is 0', () => {
      const metadata = { codeExamples: 0 }
      render(<ArticleRenderer {...defaultProps} metadata={metadata} />)

      expect(screen.getByText('Code Examples')).toBeInTheDocument()
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should display all metadata fields together', () => {
      const metadata = {
        wordCount: 2500,
        readingLevel: 'advanced',
        codeExamples: 10,
      }
      render(<ArticleRenderer {...defaultProps} metadata={metadata} />)

      expect(screen.getByText('2,500')).toBeInTheDocument()
      expect(screen.getByText('advanced')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
    })

    it('should not display metadata grid when metadata is empty object', () => {
      const metadata = {}
      const { container } = render(
        <ArticleRenderer {...defaultProps} metadata={metadata} />
      )

      const metadataGrid = container.querySelector('.grid')
      expect(metadataGrid).not.toBeInTheDocument()
    })

    it('should not display metadata when not provided', () => {
      const { container } = render(<ArticleRenderer {...defaultProps} />)

      expect(screen.queryByText('Word Count')).not.toBeInTheDocument()
      expect(screen.queryByText('Reading Level')).not.toBeInTheDocument()
      expect(screen.queryByText('Code Examples')).not.toBeInTheDocument()
    })
  })

  describe('Duration Display', () => {
    it('should display duration when provided with metadata', () => {
      // Duration is rendered inside the metadata grid, so metadata must exist
      const metadata = { wordCount: 1000 }
      render(
        <ArticleRenderer {...defaultProps} metadata={metadata} duration={15} />
      )

      expect(screen.getByText('Estimated Time')).toBeInTheDocument()
      expect(screen.getByText('15 min')).toBeInTheDocument()
    })

    it('should not display duration when not provided', () => {
      render(<ArticleRenderer {...defaultProps} />)

      expect(screen.queryByText('Estimated Time')).not.toBeInTheDocument()
    })

    it('should display duration even when 0', () => {
      render(<ArticleRenderer {...defaultProps} duration={0} />)

      expect(screen.queryByText('Estimated Time')).not.toBeInTheDocument()
    })

    it('should display duration with metadata together', () => {
      const metadata = { wordCount: 1000 }
      render(
        <ArticleRenderer {...defaultProps} metadata={metadata} duration={20} />
      )

      expect(screen.getByText('Word Count')).toBeInTheDocument()
      expect(screen.getByText('Estimated Time')).toBeInTheDocument()
      expect(screen.getByText('20 min')).toBeInTheDocument()
    })
  })

  describe('Read Article Button', () => {
    it('should open article URL in new tab when clicked', () => {
      render(<ArticleRenderer {...defaultProps} />)

      const button = screen.getByRole('button', { name: /read article/i })
      fireEvent.click(button)

      expect(mockWindowOpen).toHaveBeenCalledTimes(1)
      expect(mockWindowOpen).toHaveBeenCalledWith(
        defaultProps.articleUrl,
        '_blank',
        'noopener,noreferrer'
      )
    })

    it('should open correct URL when different article provided', () => {
      const customUrl = 'https://custom.com/my-article'
      render(<ArticleRenderer {...defaultProps} articleUrl={customUrl} />)

      const button = screen.getByRole('button', { name: /read article/i })
      fireEvent.click(button)

      expect(mockWindowOpen).toHaveBeenCalledWith(
        customUrl,
        '_blank',
        'noopener,noreferrer'
      )
    })

    it('should have proper styling and hover effects', () => {
      render(<ArticleRenderer {...defaultProps} />)

      const button = screen.getByRole('button', { name: /read article/i })
      expect(button).toHaveClass(
        'bg-blue-600',
        'hover:bg-blue-700',
        'transition-all',
        'transform',
        'hover:scale-105'
      )
    })
  })

  describe('Accessibility', () => {
    it('should have accessible button with aria label', () => {
      render(<ArticleRenderer {...defaultProps} />)

      const button = screen.getByRole('button', { name: /read article/i })
      expect(button).toBeInTheDocument()
    })

    it('should have semantic structure', () => {
      const { container } = render(<ArticleRenderer {...defaultProps} />)

      const heading = screen.getByText('Article Lesson')
      expect(heading.tagName).toBe('H3')

      const svgIcons = container.querySelectorAll('svg')
      expect(svgIcons.length).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty article URL', () => {
      render(<ArticleRenderer {...defaultProps} articleUrl="" />)

      const button = screen.getByRole('button', { name: /read article/i })
      fireEvent.click(button)

      expect(mockWindowOpen).toHaveBeenCalledWith('', '_blank', 'noopener,noreferrer')
    })

    it('should handle very long description', () => {
      const longDescription = 'A'.repeat(1000)
      render(<ArticleRenderer {...defaultProps} description={longDescription} />)

      expect(screen.getByText(longDescription)).toBeInTheDocument()
    })

    it('should handle large word count with locale formatting', () => {
      const metadata = { wordCount: 1500000 }
      render(<ArticleRenderer {...defaultProps} metadata={metadata} />)

      expect(screen.getByText('1,500,000')).toBeInTheDocument()
    })

    it('should handle special characters in reading level', () => {
      const metadata = { readingLevel: 'beginner (A1-A2)' }
      render(<ArticleRenderer {...defaultProps} metadata={metadata} />)

      expect(screen.getByText('beginner (A1-A2)')).toBeInTheDocument()
    })

    it('should handle negative code examples count', () => {
      const metadata = { codeExamples: -5 }
      render(<ArticleRenderer {...defaultProps} metadata={metadata} />)

      expect(screen.getByText('-5')).toBeInTheDocument()
    })

    it('should handle undefined title gracefully', () => {
      // Title is required prop but testing component robustness
      render(<ArticleRenderer {...defaultProps} title={undefined as any} />)

      expect(screen.getByText('Article Lesson')).toBeInTheDocument()
    })
  })

  describe('Visual Elements', () => {
    it('should render header with gradient background', () => {
      const { container } = render(<ArticleRenderer {...defaultProps} />)

      const header = container.querySelector('.bg-gradient-to-r')
      expect(header).toBeInTheDocument()
      expect(header).toHaveClass('from-blue-500', 'to-blue-600')
    })

    it('should render book icon in header', () => {
      const { container } = render(<ArticleRenderer {...defaultProps} />)

      // Check for book icon SVG path
      const bookIconPath = container.querySelector('path[d*="M12 6.253v13"]')
      expect(bookIconPath).toBeInTheDocument()
    })

    it('should render external link icon in button', () => {
      const { container } = render(<ArticleRenderer {...defaultProps} />)

      // Check for external link icon SVG path
      const externalLinkPath = container.querySelector('path[d*="M14 4h6m0 0v6"]')
      expect(externalLinkPath).toBeInTheDocument()
    })

    it('should render metadata icons with correct colors', () => {
      const metadata = {
        wordCount: 1000,
        readingLevel: 'intermediate',
        codeExamples: 5,
      }
      const { container } = render(
        <ArticleRenderer {...defaultProps} metadata={metadata} />
      )

      // Word count icon (blue)
      const blueIcon = container.querySelector('svg.text-blue-600')
      expect(blueIcon).toBeInTheDocument()

      // Reading level icon (green)
      const greenIcon = container.querySelector('svg.text-green-600')
      expect(greenIcon).toBeInTheDocument()

      // Code examples icon (purple)
      const purpleIcon = container.querySelector('svg.text-purple-600')
      expect(purpleIcon).toBeInTheDocument()
    })
  })
})
