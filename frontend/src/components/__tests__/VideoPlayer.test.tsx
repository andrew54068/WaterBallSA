import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import VideoPlayer from '../VideoPlayer'

// Mock window.location.reload
const mockReload = jest.fn()
Object.defineProperty(window, 'location', {
  value: { reload: mockReload },
  writable: true,
})

// Wrapper for Chakra UI components
const ChakraWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>
)

// Helper to render with ChakraProvider
const renderWithChakra = (ui: React.ReactElement) => {
  return render(ui, { wrapper: ChakraWrapper })
}

describe('VideoPlayer', () => {
  const defaultProps = {
    videoUrl: 'https://www.youtube.com/watch?v=eIrMbAQSU34',
    title: 'Test Video Title',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('URL Conversion', () => {
    it('should convert youtube.com/watch?v= format to embed URL', () => {
      renderWithChakra(<VideoPlayer {...defaultProps} />)

      const iframe = screen.getByTitle('Test Video Title')
      expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/eIrMbAQSU34')
    })

    it('should convert youtu.be format to embed URL', () => {
      renderWithChakra(<VideoPlayer {...defaultProps} videoUrl="https://youtu.be/CG4FUo3Oh7E" />)

      const iframe = screen.getByTitle('Test Video Title')
      expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/CG4FUo3Oh7E')
    })

    it('should handle youtu.be with query parameters', () => {
      renderWithChakra(<VideoPlayer {...defaultProps} videoUrl="https://youtu.be/CG4FUo3Oh7E?si=g_Uc_rYz79H8G6eH" />)

      const iframe = screen.getByTitle('Test Video Title')
      expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/CG4FUo3Oh7E')
    })

    it('should handle youtube.com with additional query parameters', () => {
      renderWithChakra(<VideoPlayer {...defaultProps} videoUrl="https://www.youtube.com/watch?v=eIrMbAQSU34&t=10s" />)

      const iframe = screen.getByTitle('Test Video Title')
      expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/eIrMbAQSU34')
    })

    it('should show error for invalid YouTube URL', () => {
      renderWithChakra(<VideoPlayer {...defaultProps} videoUrl="https://example.com/video" />)

      expect(screen.getByText('Invalid YouTube URL format')).toBeInTheDocument()
      expect(screen.queryByTitle('Test Video Title')).not.toBeInTheDocument()
    })

    it('should show error for malformed URLs', () => {
      renderWithChakra(<VideoPlayer {...defaultProps} videoUrl="not-a-valid-url" />)

      expect(screen.getByText('Invalid YouTube URL format')).toBeInTheDocument()
      expect(screen.queryByTitle('Test Video Title')).not.toBeInTheDocument()
    })
  })

  describe('Initial Render', () => {
    it('should render loading skeleton on initial load', () => {
      renderWithChakra(<VideoPlayer {...defaultProps} />)

      expect(screen.getByText('Loading video...')).toBeInTheDocument()
    })

    it('should render iframe with correct attributes', () => {
      renderWithChakra(<VideoPlayer {...defaultProps} />)

      const iframe = screen.getByTitle('Test Video Title')
      expect(iframe).toBeInTheDocument()
      expect(iframe).toHaveAttribute('frameborder', '0')
      expect(iframe).toHaveAttribute('allowfullscreen')
      expect(iframe).toHaveAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share')
    })

    it('should not display duration when not provided', () => {
      renderWithChakra(<VideoPlayer {...defaultProps} />)

      expect(screen.queryByText(/Duration:/)).not.toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should display retry button in error state', () => {
      renderWithChakra(<VideoPlayer {...defaultProps} videoUrl="invalid-url" />)

      const retryButton = screen.getByRole('button', { name: /retry/i })
      expect(retryButton).toBeInTheDocument()
    })

    it('should reload page when retry button is clicked', () => {
      renderWithChakra(<VideoPlayer {...defaultProps} videoUrl="invalid-url" />)

      const retryButton = screen.getByRole('button', { name: /retry/i })
      fireEvent.click(retryButton)

      expect(mockReload).toHaveBeenCalledTimes(1)
    })

    it('should hide video player in error state', () => {
      renderWithChakra(<VideoPlayer {...defaultProps} videoUrl="invalid-url" />)

      expect(screen.queryByTitle('Test Video Title')).not.toBeInTheDocument()
    })
  })

  describe('Duration Display', () => {
    it('should display duration when provided', () => {
      renderWithChakra(<VideoPlayer {...defaultProps} duration={15} />)

      expect(screen.getByText('Duration: 15 minutes')).toBeInTheDocument()
    })

    it('should handle zero duration', () => {
      renderWithChakra(<VideoPlayer {...defaultProps} duration={0} />)

      expect(screen.queryByText('Duration: 0 minutes')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA structure for error state', () => {
      renderWithChakra(<VideoPlayer {...defaultProps} videoUrl="invalid-url" />)

      const retryButton = screen.getByRole('button', { name: /retry/i })
      expect(retryButton).toBeInTheDocument()
    })

    it('should have accessible iframe title', () => {
      renderWithChakra(<VideoPlayer {...defaultProps} />)

      const iframe = screen.getByTitle('Test Video Title')
      expect(iframe).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty video URL', () => {
      renderWithChakra(<VideoPlayer {...defaultProps} videoUrl="" />)

      expect(screen.getByText('Invalid YouTube URL format')).toBeInTheDocument()
    })

    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(200)
      renderWithChakra(<VideoPlayer {...defaultProps} title={longTitle} />)

      const iframe = screen.getByTitle(longTitle)
      expect(iframe).toBeInTheDocument()
    })

    it('should handle negative duration (edge case)', () => {
      renderWithChakra(<VideoPlayer {...defaultProps} duration={-10} />)

      // Negative duration is displayed without validation
      expect(screen.getByText('Duration: -10 minutes')).toBeInTheDocument()
    })
  })
})
