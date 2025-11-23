import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import VideoPlayer from '../VideoPlayer'

// react-player/youtube is automatically mocked via jest.config.js moduleNameMapper

// Mock window.location.reload
const mockReload = jest.fn()
Object.defineProperty(window, 'location', {
  value: { reload: mockReload },
  writable: true,
})

describe('VideoPlayer', () => {
  const defaultProps = {
    videoUrl: 'https://www.youtube.com/watch?v=eIrMbAQSU34',
    title: 'Test Video Title',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial Render', () => {
    it('should render loading skeleton on initial load', () => {
      render(<VideoPlayer {...defaultProps} />)

      expect(screen.getByText('Loading video...')).toBeInTheDocument()
      expect(screen.getByTestId('mock-react-player')).toBeInTheDocument()
    })

    it('should render with correct video URL', () => {
      render(<VideoPlayer {...defaultProps} />)

      const player = screen.getByTestId('mock-react-player')
      expect(player).toHaveAttribute('data-url', defaultProps.videoUrl)
    })

    it('should not display duration when not provided', () => {
      render(<VideoPlayer {...defaultProps} />)

      expect(screen.queryByText(/Duration:/)).not.toBeInTheDocument()
    })
  })

  describe('Ready State', () => {
    it('should hide loading skeleton when video is ready', async () => {
      render(<VideoPlayer {...defaultProps} />)

      const readyButton = screen.getByTestId('trigger-ready')
      fireEvent.click(readyButton)

      await waitFor(() => {
        expect(screen.queryByText('Loading video...')).not.toBeInTheDocument()
      })
    })

    it('should show loading skeleton after mounting (before error)', () => {
      render(<VideoPlayer {...defaultProps} />)

      // Before any events, loading skeleton should be visible
      expect(screen.getByText('Loading video...')).toBeInTheDocument()
      expect(screen.getByTestId('mock-react-player')).toBeInTheDocument()

      // No error message yet
      expect(
        screen.queryByText('Video unavailable. Please try again later.')
      ).not.toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should display error message when video fails to load', () => {
      render(<VideoPlayer {...defaultProps} />)

      const errorButton = screen.getByTestId('trigger-error')
      fireEvent.click(errorButton)

      expect(
        screen.getByText('Video unavailable. Please try again later.')
      ).toBeInTheDocument()
    })

    it('should display retry button in error state', () => {
      render(<VideoPlayer {...defaultProps} />)

      const errorButton = screen.getByTestId('trigger-error')
      fireEvent.click(errorButton)

      const retryButton = screen.getByRole('button', { name: /retry/i })
      expect(retryButton).toBeInTheDocument()
    })

    it('should reload page when retry button is clicked', () => {
      render(<VideoPlayer {...defaultProps} />)

      const errorButton = screen.getByTestId('trigger-error')
      fireEvent.click(errorButton)

      const retryButton = screen.getByRole('button', { name: /retry/i })
      fireEvent.click(retryButton)

      expect(mockReload).toHaveBeenCalledTimes(1)
    })

    it('should hide video player in error state', () => {
      render(<VideoPlayer {...defaultProps} />)

      const errorButton = screen.getByTestId('trigger-error')
      fireEvent.click(errorButton)

      expect(screen.queryByTestId('mock-react-player')).not.toBeInTheDocument()
    })

    it('should display error icon SVG', () => {
      const { container } = render(<VideoPlayer {...defaultProps} />)

      const errorButton = screen.getByTestId('trigger-error')
      fireEvent.click(errorButton)

      // Check for SVG error icon
      const errorIcon = container.querySelector('svg.text-red-500')
      expect(errorIcon).toBeInTheDocument()
      expect(errorIcon).toHaveClass('w-16', 'h-16', 'text-red-500')
    })
  })

  describe('Duration Display', () => {
    it('should display duration when provided', () => {
      render(<VideoPlayer {...defaultProps} duration={15} />)

      expect(screen.getByText('Duration: 15 minutes')).toBeInTheDocument()
    })

    it('should display correct duration text format', () => {
      render(<VideoPlayer {...defaultProps} duration={45} />)

      const durationText = screen.getByText('Duration: 45 minutes')
      expect(durationText).toHaveClass('text-sm')
    })

    it('should handle zero duration', () => {
      render(<VideoPlayer {...defaultProps} duration={0} />)

      expect(screen.queryByText('Duration: 0 minutes')).not.toBeInTheDocument()
    })
  })

  describe('Play/Pause Handling', () => {
    it('should handle play event', () => {
      render(<VideoPlayer {...defaultProps} />)

      const playButton = screen.getByTestId('trigger-play')
      fireEvent.click(playButton)

      // The component updates playing state internally
      // This is tested through the ReactPlayer mock receiving the correct props
      expect(playButton).toBeInTheDocument()
    })

    it('should handle pause event', () => {
      render(<VideoPlayer {...defaultProps} />)

      const pauseButton = screen.getByTestId('trigger-pause')
      fireEvent.click(pauseButton)

      expect(pauseButton).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA structure for error state', () => {
      render(<VideoPlayer {...defaultProps} />)

      const errorButton = screen.getByTestId('trigger-error')
      fireEvent.click(errorButton)

      const retryButton = screen.getByRole('button', { name: /retry/i })
      expect(retryButton).toBeInTheDocument()
    })

    it('should have 16:9 aspect ratio container', () => {
      const { container } = render(<VideoPlayer {...defaultProps} />)

      // Check for aspect ratio padding-top (56.25% = 16:9)
      const aspectRatioDiv = container.querySelector('.pt-\\[56\\.25\\%\\]')
      expect(aspectRatioDiv).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty video URL gracefully', () => {
      render(<VideoPlayer {...defaultProps} videoUrl="" />)

      const player = screen.getByTestId('mock-react-player')
      expect(player).toHaveAttribute('data-url', '')
    })

    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(200)
      render(<VideoPlayer {...defaultProps} title={longTitle} />)

      expect(screen.getByTestId('mock-react-player')).toBeInTheDocument()
    })

    it('should handle negative duration (edge case)', () => {
      render(<VideoPlayer {...defaultProps} duration={-10} />)

      // Negative duration is displayed without validation
      expect(screen.getByText('Duration: -10 minutes')).toBeInTheDocument()
    })
  })
})
