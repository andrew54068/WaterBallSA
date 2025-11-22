'use client'

import { useAuth } from '@/lib/auth-context'
import { useState, useEffect, useRef } from 'react'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          prompt: () => void
          renderButton: (element: HTMLElement, config: any) => void
        }
      }
    }
  }
}

export function GoogleLoginButton() {
  const { login } = useAuth()
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
          callback: async (response: any) => {
            console.log('[GoogleLoginButton] Received Google response')
            setIsLoading(true)
            setError(null)
            try {
              // response.credential contains the Google ID token
              await login(response.credential)
              console.log('[GoogleLoginButton] Login successful')
            } catch (err) {
              console.error('[GoogleLoginButton] Login failed:', err)
              setError(err instanceof Error ? err.message : 'Login failed')
            } finally {
              setIsLoading(false)
            }
          },
        })

        // Render the Google Sign-In button
        console.log('[GoogleLoginButton] Rendering button...')
        window.google.accounts.id.renderButton(
          buttonRef.current,
          {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
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
  }, [login])

  return (
    <div>
      <div ref={buttonRef} className={isLoading ? 'opacity-50 pointer-events-none' : ''} />
      {error && (
        <p className="text-red-600 text-sm mt-2">{error}</p>
      )}
    </div>
  )
}
