'use client'

import { useAuth } from '@/lib/auth-context'
import { GoogleLoginButton } from './GoogleLoginButton'
import { Logo } from './Logo'
import { Bars3Icon } from '@heroicons/react/24/solid'
import { useState } from 'react'
import { Box, Flex, Button, Image, Text } from '@chakra-ui/react'

export function Header() {
  const { user, isLoading, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Debug logging
  console.log('[Header] Render - isLoading:', isLoading, 'user:', user ? {
    name: user.name,
    hasProfilePicture: !!user.profilePicture,
    profilePictureUrl: user.profilePicture,
  } : null)

  const handleLogout = async () => {
    console.log('[Header] Logging out...')
    await logout()
    console.log('[Header] Logout complete')
  }

  return (
    <Box
      as="header"
      position="fixed"
      top={0}
      left={0}
      right={0}
      h="64px"
      bg="dark.800"
      borderBottom="1px solid"
      borderColor="dark.600"
      zIndex={50}
    >
      <Flex align="center" h="full">
        {/* Logo / Brand - Fixed width matching sidebar */}
        <Flex
          w="256px"
          align="center"
          px={6}
          borderRight="1px solid"
          borderColor="dark.600"
          h="full"
        >
          <Logo />
          {/* Mobile Menu Toggle */}
          <Button
            display={{ base: 'block', lg: 'none' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            variant="ghost"
            ml="auto"
            p={2}
            color="gray.400"
            _hover={{ color: 'white' }}
          >
            <Bars3Icon style={{ width: '24px', height: '24px' }} />
          </Button>
        </Flex>

        {/* Right side content */}
        <Flex flex={1} align="center" justify="space-between" px={6}>
          {/* Page Title / Breadcrumb */}
          <Flex align="center" gap={4}>
            <Box
              as="select"
              bg="dark.700"
              color="white"
              px={4}
              py={2}
              borderRadius="lg"
              fontSize="sm"
              fontWeight="medium"
              borderWidth="1px"
              borderColor="dark.600"
              _focus={{ ring: 2, ringColor: 'accent.yellow' }}
            >
              <option>軟體設計模式精通之旅</option>
              <option>AI x BDD：規格驅動全自動開發術</option>
            </Box>
          </Flex>

          {/* Auth Section */}
          <Flex align="center" gap={4}>
            {isLoading ? (
              <Box h="40px" w="80px" bg="dark.700" borderRadius="lg" className="animate-pulse" />
            ) : user ? (
              <Flex align="center" gap={3}>
                {user.profilePicture && (
                  <Image
                    src={user.profilePicture}
                    alt={user.name}
                    w="36px"
                    h="36px"
                    borderRadius="full"
                    ring={2}
                    ringColor="dark.600"
                  />
                )}
                <Text display={{ base: 'none', md: 'block' }} fontSize="sm" fontWeight="medium" color="white">
                  {user.name}
                </Text>
                <Button
                  onClick={handleLogout}
                  px={4}
                  py={2}
                  fontSize="sm"
                  fontWeight="medium"
                  color="gray.300"
                  borderWidth="1px"
                  borderColor="dark.600"
                  borderRadius="lg"
                  bg="transparent"
                  _hover={{ color: 'white', bg: 'dark.700' }}
                >
                  登出
                </Button>
              </Flex>
            ) : (
              <Flex align="center" gap={3}>
                <GoogleLoginButton />
              </Flex>
            )}
          </Flex>
        </Flex>
      </Flex>
    </Box>
  )
}
