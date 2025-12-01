'use client'

import { useAuth } from '@/lib/auth-context'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Text } from '@chakra-ui/react'
import { returnUrlUtils } from '@/lib/utils/returnUrl'

// Google Identity Services types
interface GoogleCredentialResponse {
  credential: string
  select_by?: string
  clientId?: string
}

interface GoogleButtonConfig {
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'large' | 'medium' | 'small'
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  shape?: 'rectangular' | 'pill' | 'circle' | 'square'
  width?: number
  logo_alignment?: 'left' | 'center'
}

interface GoogleInitConfig {
  client_id: string
  callback: (response: GoogleCredentialResponse) => void | Promise<void>
  auto_select?: boolean
  cancel_on_tap_outside?: boolean
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleInitConfig) => void
          prompt: () => void
          renderButton: (element: HTMLElement, config: GoogleButtonConfig) => void
        }
      }
    }
  }
}

interface GoogleLoginButtonProps {
  width?: number
}

export function GoogleLoginButton({ width = 200 }: GoogleLoginButtonProps) {
  const { login } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const buttonRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

    // Debug logging
    console.log('[GoogleLoginButton] Initializing...')
    console.log('[GoogleLoginButton] Client ID:', clientId ? 'Set' : 'NOT SET')

    // Wait for Google SDK to load
    const initializeGoogleSignIn = () => {
      if (!window.google) {
        console.log('[GoogleLoginButton] Google SDK not loaded yet')
        return
      }

      if (!buttonRef.current) {
        console.log('[GoogleLoginButton] Button ref not ready')
        return
      }

      if (initialized.current) {
        console.log('[GoogleLoginButton] Already initialized')
        return
      }

      if (!clientId) {
        console.error('[GoogleLoginButton] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set!')
        setError('Google Client ID not configured')
        return
      }

      try {
        console.log('[GoogleLoginButton] Initializing Google Sign-In...')
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: GoogleCredentialResponse) => {
            console.log('[GoogleLoginButton] Received Google response')
            setIsLoading(true)
            setError(null)
            try {
              // response.credential contains the Google ID token
              await login(response.credential)
              console.log('[GoogleLoginButton] Login successful')

              // Handle post-login redirect
              const returnUrl = returnUrlUtils.get()

              if (returnUrl && returnUrlUtils.isSafeURL(returnUrl)) {
                console.log('[GoogleLoginButton] Redirecting to:', returnUrl)
                returnUrlUtils.clear()
                router.push(returnUrl)
              } else {
                console.log('[GoogleLoginButton] No valid return URL, staying on current page')
                // Don't redirect if no return URL - user likely logged in from current page
                returnUrlUtils.clear()
              }
            } catch (err) {
              console.error('[GoogleLoginButton] Login failed:', err)
              setError(err instanceof Error ? err.message : 'Login failed')
            } finally {
              setIsLoading(false)
            }
          },
        })

        // Render the Google Sign-In button with custom theme
        console.log('[GoogleLoginButton] Rendering button...')
        window.google.accounts.id.renderButton(
          buttonRef.current,
          {
            theme: 'filled_black',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            width,
          }
        )

        initialized.current = true
        console.log('[GoogleLoginButton] Initialization complete')
      } catch (err) {
        console.error('[GoogleLoginButton] Failed to initialize:', err)
        setError('Failed to load Google Sign-In')
      }
    }

    // Check if SDK is already loaded
    if (window.google) {
      initializeGoogleSignIn()
    } else {
      console.log('[GoogleLoginButton] Waiting for Google SDK to load...')
      // Wait for SDK to load
      const checkGoogleLoaded = setInterval(() => {
        if (window.google) {
          console.log('[GoogleLoginButton] Google SDK loaded!')
          clearInterval(checkGoogleLoaded)
          initializeGoogleSignIn()
        }
      }, 100)

      // Cleanup
      return () => {
        console.log('[GoogleLoginButton] Cleaning up interval')
        clearInterval(checkGoogleLoaded)
      }
    }
  }, [login, width, router])

  return (
    <Box position="relative">
      {/* Wrapper with yellow accent styling */}
      <Box
        borderRadius="lg"
        overflow="hidden"
        borderWidth="2px"
        borderColor="accent.yellow"
        borderStyle="solid"
        opacity={isLoading ? 0.5 : 1}
        pointerEvents={isLoading ? 'none' : 'auto'}
        _hover={{ borderColor: 'accent.yellow' }}
        transition="all 0.2s"
      >
        <div ref={buttonRef} />
      </Box>
      {error && (
        <Text color="red.400" fontSize="sm" mt={2}>{error}</Text>
      )}
    </Box>
  )
}
