import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import LockedLessonView from '../LockedLessonView'

// Mock useRouter
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Wrapper for Chakra UI components
const ChakraWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>
)

const renderWithChakra = (ui: React.ReactElement) => {
  return render(ui, { wrapper: ChakraWrapper })
}

describe('LockedLessonView Component', () => {
  const defaultProps = {
    curriculumId: 1,
    curriculumTitle: 'Advanced JavaScript',
    curriculumPrice: 99.99,
    isAuthenticated: false,
    reason: 'requires_login' as const,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Scenario 2: Anonymous User Accessing Paid Lesson', () => {
    it('should display lock icon', () => {
      renderWithChakra(<LockedLessonView {...defaultProps} />)

      // Check for lock icon (using SVG path or test ID)
      const lockIcon = screen.getByTestId('lock-icon')
      expect(lockIcon).toBeInTheDocument()
    })

    it('should display curriculum name in message', () => {
      renderWithChakra(<LockedLessonView {...defaultProps} />)

      expect(screen.getByText(/Advanced JavaScript/i)).toBeInTheDocument()
    })

    it('should display "Sign In" button', () => {
      renderWithChakra(<LockedLessonView {...defaultProps} />)

      const signInButton = screen.getByRole('button', { name: /sign in/i })
      expect(signInButton).toBeInTheDocument()
    })

    it('should display "Purchase Curriculum" button with price', () => {
      renderWithChakra(<LockedLessonView {...defaultProps} />)

      const purchaseButton = screen.getByRole('button', { name: /purchase.*\$99\.99/i })
      expect(purchaseButton).toBeInTheDocument()
    })

    it('should show message prompting to sign in or purchase', () => {
      renderWithChakra(<LockedLessonView {...defaultProps} />)

      expect(
        screen.getByText(/this lesson is part of/i)
      ).toBeInTheDocument()
    })
  })

  describe('Scenario 4: Authenticated User Without Purchase Accessing Paid Lesson', () => {
    const authenticatedProps = {
      ...defaultProps,
      isAuthenticated: true,
      reason: 'requires_purchase' as const,
    }

    it('should NOT display "Sign In" button', () => {
      renderWithChakra(<LockedLessonView {...authenticatedProps} />)

      const signInButton = screen.queryByRole('button', { name: /sign in/i })
      expect(signInButton).not.toBeInTheDocument()
    })

    it('should display "Purchase Curriculum" button', () => {
      renderWithChakra(<LockedLessonView {...authenticatedProps} />)

      const purchaseButton = screen.getByRole('button', { name: /purchase/i })
      expect(purchaseButton).toBeInTheDocument()
    })

    it('should show message prompting to purchase only', () => {
      renderWithChakra(<LockedLessonView {...authenticatedProps} />)

      expect(
        screen.getByText(/purchase this curriculum to access/i)
      ).toBeInTheDocument()
    })

    it('should display lock icon', () => {
      renderWithChakra(<LockedLessonView {...authenticatedProps} />)

      const lockIcon = screen.getByTestId('lock-icon')
      expect(lockIcon).toBeInTheDocument()
    })
  })

  describe('UI Elements and Layout', () => {
    it('should display blurred background effect', () => {
      const { container } = renderWithChakra(<LockedLessonView {...defaultProps} />)

      // Check for backdrop blur or visual indicator
      const blurredArea = container.querySelector('[data-testid="blurred-content"]')
      expect(blurredArea).toBeInTheDocument()
    })

    it('should center lock icon', () => {
      renderWithChakra(<LockedLessonView {...defaultProps} />)

      const lockIcon = screen.getByTestId('lock-icon')
      expect(lockIcon).toBeInTheDocument()
      // Icon should be large and centered - check parent container
      const iconContainer = lockIcon.parentElement
      expect(iconContainer).toHaveStyle({ textAlign: 'center' })
    })

    it('should show preview information message', () => {
      renderWithChakra(<LockedLessonView {...defaultProps} />)

      expect(
        screen.getByText(/view free preview lessons/i)
      ).toBeInTheDocument()
    })
  })

  describe('Button Click Handlers', () => {
    it('should trigger sign in action when "Sign In" button clicked', () => {
      const onSignIn = jest.fn()
      renderWithChakra(<LockedLessonView {...defaultProps} onSignIn={onSignIn} />)

      const signInButton = screen.getByRole('button', { name: /sign in/i })
      fireEvent.click(signInButton)

      expect(onSignIn).toHaveBeenCalledTimes(1)
    })

    it('should navigate to curriculum page when "Purchase" button clicked', () => {
      renderWithChakra(<LockedLessonView {...defaultProps} />)

      const purchaseButton = screen.getByRole('button', { name: /purchase/i })
      fireEvent.click(purchaseButton)

      expect(mockPush).toHaveBeenCalledWith('/curriculums/1')
    })

    it('should call custom onPurchase handler if provided', () => {
      const onPurchase = jest.fn()
      renderWithChakra(<LockedLessonView {...defaultProps} onPurchase={onPurchase} />)

      const purchaseButton = screen.getByRole('button', { name: /purchase/i })
      fireEvent.click(purchaseButton)

      expect(onPurchase).toHaveBeenCalledTimes(1)
      expect(onPurchase).toHaveBeenCalledWith(1)
    })
  })

  describe('Price Display', () => {
    it('should display price in USD format', () => {
      renderWithChakra(<LockedLessonView {...defaultProps} />)

      expect(screen.getByText(/\$99\.99/i)).toBeInTheDocument()
    })

    it('should handle zero price (free curriculum with locked lessons)', () => {
      renderWithChakra(<LockedLessonView {...defaultProps} curriculumPrice={0} />)

      // Should still show button but with different text or hide price
      const purchaseButton = screen.getByRole('button', { name: /purchase|enroll/i })
      expect(purchaseButton).toBeInTheDocument()
    })

    it('should handle missing price', () => {
      renderWithChakra(<LockedLessonView {...defaultProps} curriculumPrice={undefined} />)

      // Should show generic purchase button
      const purchaseButton = screen.getByRole('button', { name: /purchase/i })
      expect(purchaseButton).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels on buttons', () => {
      renderWithChakra(<LockedLessonView {...defaultProps} />)

      const signInButton = screen.getByRole('button', { name: /sign in/i })
      expect(signInButton).toBeInTheDocument()

      const purchaseButton = screen.getByRole('button', { name: /purchase/i })
      expect(purchaseButton).toBeInTheDocument()
    })

    it('should have descriptive heading', () => {
      renderWithChakra(<LockedLessonView {...defaultProps} />)

      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent(/locked|restricted/i)
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long curriculum title', () => {
      const longTitle = 'A'.repeat(200)
      renderWithChakra(<LockedLessonView {...defaultProps} curriculumTitle={longTitle} />)

      expect(screen.getByText(new RegExp(longTitle))).toBeInTheDocument()
    })

    it('should handle missing curriculum title', () => {
      renderWithChakra(<LockedLessonView {...defaultProps} curriculumTitle="" />)

      // Should still render but with generic message
      expect(screen.getByTestId('lock-icon')).toBeInTheDocument()
    })

    it('should handle different reason codes appropriately', () => {
      const { rerender } = renderWithChakra(
        <LockedLessonView {...defaultProps} reason="requires_login" />
      )

      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()

      rerender(
        <ChakraProvider value={defaultSystem}>
          <LockedLessonView {...defaultProps} isAuthenticated={true} reason="requires_purchase" />
        </ChakraProvider>
      )

      expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument()
    })
  })

  describe('Visual States', () => {
    it('should render consistently for anonymous users', () => {
      const { container } = renderWithChakra(<LockedLessonView {...defaultProps} />)

      expect(container).toMatchSnapshot()
    })

    it('should render consistently for authenticated users', () => {
      const { container } = renderWithChakra(
        <LockedLessonView {...defaultProps} isAuthenticated={true} reason="requires_purchase" />
      )

      expect(container).toMatchSnapshot()
    })
  })
})
