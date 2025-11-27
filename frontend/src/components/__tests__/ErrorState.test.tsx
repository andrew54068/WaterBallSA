import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorState } from '../ErrorState'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'

// Wrapper for Chakra UI components
const ChakraWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>
)

describe('ErrorState', () => {
  it('renders error message correctly', () => {
    const message = 'Failed to load data'
    render(<ErrorState message={message} />, { wrapper: ChakraWrapper })

    expect(screen.getByText(message)).toBeInTheDocument()
  })

  it('renders retry button when onRetry is provided', () => {
    const message = 'Failed to load data'
    const mockRetry = jest.fn()

    render(<ErrorState message={message} onRetry={mockRetry} />, { wrapper: ChakraWrapper })

    const retryButton = screen.getByRole('button', { name: '重試' })
    expect(retryButton).toBeInTheDocument()
  })

  it('does not render retry button when onRetry is not provided', () => {
    const message = 'Failed to load data'

    render(<ErrorState message={message} />, { wrapper: ChakraWrapper })

    const retryButton = screen.queryByRole('button', { name: '重試' })
    expect(retryButton).not.toBeInTheDocument()
  })

  it('calls onRetry when retry button is clicked', () => {
    const message = 'Failed to load data'
    const mockRetry = jest.fn()

    render(<ErrorState message={message} onRetry={mockRetry} />, { wrapper: ChakraWrapper })

    const retryButton = screen.getByRole('button', { name: '重試' })
    fireEvent.click(retryButton)

    expect(mockRetry).toHaveBeenCalledTimes(1)
  })

  it('renders with correct styling classes', () => {
    const message = 'Failed to load data'

    const { container } = render(<ErrorState message={message} />, { wrapper: ChakraWrapper })

    // Check if the container has expected structure
    expect(container.querySelector('[class*="chakra-box"]')).toBeInTheDocument()
  })

  it('handles multiple retry clicks correctly', () => {
    const message = 'Failed to load data'
    const mockRetry = jest.fn()

    render(<ErrorState message={message} onRetry={mockRetry} />, { wrapper: ChakraWrapper })

    const retryButton = screen.getByRole('button', { name: '重試' })

    // Click 3 times
    fireEvent.click(retryButton)
    fireEvent.click(retryButton)
    fireEvent.click(retryButton)

    expect(mockRetry).toHaveBeenCalledTimes(3)
  })

  it('renders long error messages correctly', () => {
    const longMessage = 'This is a very long error message that contains a lot of information about what went wrong and how the user might be able to fix it'

    render(<ErrorState message={longMessage} />, { wrapper: ChakraWrapper })

    expect(screen.getByText(longMessage)).toBeInTheDocument()
  })
})
