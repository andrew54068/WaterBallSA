'use client'

import { AuthProvider } from '@/lib/auth-context'
import { ChakraProvider } from '@chakra-ui/react'
import { system } from '@/theme'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={system}>
      <AuthProvider>{children}</AuthProvider>
    </ChakraProvider>
  )
}
