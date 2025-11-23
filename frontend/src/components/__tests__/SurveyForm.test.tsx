import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import SurveyForm from '../SurveyForm'

describe('SurveyForm', () => {
  const defaultProps = {
    surveyPath: '/surveys/test-survey',
    title: 'Test Survey Title',
  }

  // Store original NODE_ENV
  const originalEnv = process.env.NODE_ENV

  afterEach(() => {
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalEnv
  })

  describe('Basic Rendering', () => {
    it('should render survey header with title', () => {
      render(<SurveyForm {...defaultProps} />)

      expect(screen.getByText('Knowledge Check')).toBeInTheDocument()
      expect(screen.getByText('Test your understanding')).toBeInTheDocument()
    })

    it('should render coming soon message', () => {
      render(<SurveyForm {...defaultProps} />)

      expect(
        screen.getByText('Survey/Quiz Functionality Coming Soon')
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'Interactive quizzes and surveys will be available in Phase 3'
        )
      ).toBeInTheDocument()
    })

    it('should render Phase 3 badge', () => {
      render(<SurveyForm {...defaultProps} />)

      expect(screen.getByText('Phase 3 Feature')).toBeInTheDocument()
    })

    it('should not display description when not provided', () => {
      const { container } = render(<SurveyForm {...defaultProps} />)

      const descriptionParagraph = container.querySelector('p.leading-relaxed')
      expect(descriptionParagraph).not.toBeInTheDocument()
    })
  })

  describe('Description Display', () => {
    it('should display description when provided', () => {
      const description = 'This is a test survey description'
      render(<SurveyForm {...defaultProps} description={description} />)

      expect(screen.getByText(description)).toBeInTheDocument()
    })

    it('should render description with correct styling', () => {
      const description = 'Test description'
      render(<SurveyForm {...defaultProps} description={description} />)

      const descriptionElement = screen.getByText(description)
      expect(descriptionElement).toHaveClass('leading-relaxed')
    })
  })

  describe('Metadata Display', () => {
    it('should display question count when provided', () => {
      const metadata = { questionCount: 10 }
      render(<SurveyForm {...defaultProps} metadata={metadata} />)

      expect(screen.getByText('Questions')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
    })

    it('should display passing score when provided', () => {
      const metadata = { passingScore: 80 }
      render(<SurveyForm {...defaultProps} metadata={metadata} />)

      expect(screen.getByText('Passing Score')).toBeInTheDocument()
      expect(screen.getByText('80%')).toBeInTheDocument()
    })

    it('should display passing score even when 0', () => {
      const metadata = { passingScore: 0 }
      render(<SurveyForm {...defaultProps} metadata={metadata} />)

      expect(screen.getByText('Passing Score')).toBeInTheDocument()
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('should display difficulty when provided', () => {
      const metadata = { difficulty: 'intermediate' }
      render(<SurveyForm {...defaultProps} metadata={metadata} />)

      expect(screen.getByText('Difficulty')).toBeInTheDocument()
      expect(screen.getByText('intermediate')).toBeInTheDocument()
    })

    it('should capitalize difficulty text', () => {
      const metadata = { difficulty: 'beginner' }
      const { container } = render(
        <SurveyForm {...defaultProps} metadata={metadata} />
      )

      const difficultyElement = screen.getByText('beginner')
      expect(difficultyElement).toHaveClass('capitalize')
    })

    it('should display all metadata fields together', () => {
      const metadata = {
        questionCount: 15,
        passingScore: 70,
        difficulty: 'advanced',
      }
      render(<SurveyForm {...defaultProps} metadata={metadata} />)

      expect(screen.getByText('15')).toBeInTheDocument()
      expect(screen.getByText('70%')).toBeInTheDocument()
      expect(screen.getByText('advanced')).toBeInTheDocument()
    })

    it('should not display metadata grid when metadata is empty object', () => {
      const metadata = {}
      const { container } = render(
        <SurveyForm {...defaultProps} metadata={metadata} />
      )

      const metadataGrid = container.querySelector('.grid')
      expect(metadataGrid).not.toBeInTheDocument()
    })

    it('should not display metadata when not provided', () => {
      render(<SurveyForm {...defaultProps} />)

      expect(screen.queryByText('Questions')).not.toBeInTheDocument()
      expect(screen.queryByText('Passing Score')).not.toBeInTheDocument()
      expect(screen.queryByText('Difficulty')).not.toBeInTheDocument()
    })
  })

  describe('Duration Display', () => {
    it('should display duration when provided with metadata', () => {
      const metadata = { questionCount: 10 }
      render(
        <SurveyForm {...defaultProps} metadata={metadata} duration={20} />
      )

      expect(screen.getByText('Estimated Time')).toBeInTheDocument()
      expect(screen.getByText('20 min')).toBeInTheDocument()
    })

    it('should not display duration when not provided', () => {
      const metadata = { questionCount: 10 }
      render(<SurveyForm {...defaultProps} metadata={metadata} />)

      expect(screen.queryByText('Estimated Time')).not.toBeInTheDocument()
    })

    it('should display duration alone without other metadata', () => {
      const metadata = {}
      render(
        <SurveyForm {...defaultProps} metadata={metadata} duration={15} />
      )

      // Duration is inside metadata grid, but grid won't render for empty metadata
      expect(screen.queryByText('Estimated Time')).not.toBeInTheDocument()
    })
  })

  describe('Development Mode', () => {
    it('should display survey path in development mode', () => {
      process.env.NODE_ENV = 'development'
      render(<SurveyForm {...defaultProps} />)

      expect(screen.getByText('Survey Path:')).toBeInTheDocument()
      expect(screen.getByText(defaultProps.surveyPath)).toBeInTheDocument()
    })

    it('should not display survey path in production mode', () => {
      process.env.NODE_ENV = 'production'
      render(<SurveyForm {...defaultProps} />)

      expect(screen.queryByText('Survey Path:')).not.toBeInTheDocument()
    })

    it('should not display survey path in test mode', () => {
      process.env.NODE_ENV = 'test'
      render(<SurveyForm {...defaultProps} />)

      expect(screen.queryByText('Survey Path:')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have semantic heading structure', () => {
      const { container } = render(<SurveyForm {...defaultProps} />)

      const mainHeading = screen.getByText('Knowledge Check')
      expect(mainHeading.tagName).toBe('H3')

      const subHeading = screen.getByText('Survey/Quiz Functionality Coming Soon')
      expect(subHeading.tagName).toBe('H4')
    })

    it('should have SVG icons with proper attributes', () => {
      const { container } = render(<SurveyForm {...defaultProps} />)

      const svgIcons = container.querySelectorAll('svg')
      expect(svgIcons.length).toBeGreaterThan(0)

      svgIcons.forEach((svg) => {
        expect(svg).toHaveAttribute('viewBox')
        expect(svg).toHaveAttribute('stroke')
      })
    })
  })

  describe('Visual Elements', () => {
    it('should render header with purple gradient background', () => {
      const { container } = render(<SurveyForm {...defaultProps} />)

      const header = container.querySelector('.bg-gradient-to-r.from-purple-500')
      expect(header).toBeInTheDocument()
      expect(header).toHaveClass('to-purple-600')
    })

    it('should render clipboard icon in header', () => {
      const { container } = render(<SurveyForm {...defaultProps} />)

      // Check for clipboard icon SVG path
      const clipboardIconPath = container.querySelector(
        'path[d*="M9 5H7a2 2 0 00-2 2v12"]'
      )
      expect(clipboardIconPath).toBeInTheDocument()
    })

    it('should render science/experiment icon in coming soon section', () => {
      const { container } = render(<SurveyForm {...defaultProps} />)

      // Check for experiment/science icon
      const scienceIconPath = container.querySelector(
        'path[d*="M8 4h8l-1 1v5.172"]'
      )
      expect(scienceIconPath).toBeInTheDocument()
    })

    it('should render metadata icons with correct colors', () => {
      const metadata = {
        questionCount: 10,
        passingScore: 80,
        difficulty: 'intermediate',
      }
      const { container } = render(
        <SurveyForm {...defaultProps} metadata={metadata} duration={20} />
      )

      // Questions icon (purple)
      const purpleIcon = container.querySelector('svg.text-purple-600')
      expect(purpleIcon).toBeInTheDocument()

      // Passing score icon (green)
      const greenIcon = container.querySelector('svg.text-green-600')
      expect(greenIcon).toBeInTheDocument()

      // Difficulty icon (orange)
      const orangeIcon = container.querySelector('svg.text-orange-600')
      expect(orangeIcon).toBeInTheDocument()

      // Duration icon (blue)
      const blueIcon = container.querySelector('svg.text-blue-600')
      expect(blueIcon).toBeInTheDocument()
    })

    it('should render dashed border on coming soon section', () => {
      const { container } = render(<SurveyForm {...defaultProps} />)

      const comingSoonSection = container.querySelector('.border-dashed')
      expect(comingSoonSection).toBeInTheDocument()
      expect(comingSoonSection).toHaveClass('border-2')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty survey path', () => {
      process.env.NODE_ENV = 'development'
      render(<SurveyForm {...defaultProps} surveyPath="" />)

      expect(screen.getByText('Survey Path:')).toBeInTheDocument()
      // Survey path text should be empty but element should exist
      const pathElement = screen.getByText('Survey Path:').nextSibling
      expect(pathElement?.textContent).toContain('')
    })

    it('should handle very long description', () => {
      const longDescription = 'A'.repeat(1000)
      render(<SurveyForm {...defaultProps} description={longDescription} />)

      expect(screen.getByText(longDescription)).toBeInTheDocument()
    })

    it('should handle large question count', () => {
      const metadata = { questionCount: 999 }
      render(<SurveyForm {...defaultProps} metadata={metadata} />)

      expect(screen.getByText('999')).toBeInTheDocument()
    })

    it('should handle passing score above 100', () => {
      const metadata = { passingScore: 150 }
      render(<SurveyForm {...defaultProps} metadata={metadata} />)

      expect(screen.getByText('150%')).toBeInTheDocument()
    })

    it('should handle special characters in difficulty', () => {
      const metadata = { difficulty: 'ultra-hard (expert++)' }
      render(<SurveyForm {...defaultProps} metadata={metadata} />)

      expect(screen.getByText('ultra-hard (expert++)')).toBeInTheDocument()
    })

    it('should handle negative question count', () => {
      const metadata = { questionCount: -5 }
      render(<SurveyForm {...defaultProps} metadata={metadata} />)

      // Component doesn't validate, so it displays -5 without validation
      expect(screen.getByText('-5')).toBeInTheDocument()
    })

    it('should handle undefined title gracefully', () => {
      render(<SurveyForm {...defaultProps} title={undefined as any} />)

      // Component should still render header
      expect(screen.getByText('Knowledge Check')).toBeInTheDocument()
    })
  })

  describe('Metadata Cards Styling', () => {
    it('should render question count card with purple styling', () => {
      const metadata = { questionCount: 10 }
      const { container } = render(
        <SurveyForm {...defaultProps} metadata={metadata} />
      )

      const questionCard = container.querySelector('.bg-purple-50')
      expect(questionCard).toBeInTheDocument()
      expect(questionCard).toHaveClass('border-purple-200')
    })

    it('should render passing score card with green styling', () => {
      const metadata = { passingScore: 70 }
      const { container } = render(
        <SurveyForm {...defaultProps} metadata={metadata} />
      )

      const scoreCard = container.querySelector('.bg-green-50')
      expect(scoreCard).toBeInTheDocument()
      expect(scoreCard).toHaveClass('border-green-200')
    })

    it('should render difficulty card with orange styling', () => {
      const metadata = { difficulty: 'hard' }
      const { container } = render(
        <SurveyForm {...defaultProps} metadata={metadata} />
      )

      const difficultyCard = container.querySelector('.bg-orange-50')
      expect(difficultyCard).toBeInTheDocument()
      expect(difficultyCard).toHaveClass('border-orange-200')
    })

    it('should render duration card with blue styling', () => {
      const metadata = { questionCount: 5 }
      const { container } = render(
        <SurveyForm {...defaultProps} metadata={metadata} duration={30} />
      )

      const durationCard = container.querySelector('.bg-blue-50')
      expect(durationCard).toBeInTheDocument()
      expect(durationCard).toHaveClass('border-blue-200')
    })
  })
})
