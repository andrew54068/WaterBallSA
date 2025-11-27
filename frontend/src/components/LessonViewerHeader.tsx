'use client'

import { useAuth } from '@/lib/auth-context'
import { GoogleLoginButton } from './GoogleLoginButton'
import { Logo } from './Logo'
import {
  Box,
  Flex,
  Button,
  Image,
  Text,
  Skeleton,
  HStack,
} from '@chakra-ui/react'

export function LessonViewerHeader() {
  const { user, isLoading, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <Box
      as="header"
      position="fixed"
      top={0}
      left={0}
      right={0}
      h={16}
      bg="dark.800"
      borderBottom="1px"
      borderColor="dark.600"
      zIndex={50}
    >
      <Flex align="center" justify="space-between" h="full" px={6}>
        {/* Logo / Brand */}
        <Logo />

        {/* Auth Section */}
        <HStack gap={4}>
          {isLoading ? (
            <Skeleton h={10} w={20} borderRadius="lg" />
          ) : user ? (
            <HStack gap={3}>
              {user.profilePicture && (
                <Image
                  src={user.profilePicture}
                  alt={user.name}
                  boxSize="36px"
                  borderRadius="full"
                  ring="2px"
                  ringColor="dark.600"
                />
              )}
              <Text
                display={{ base: 'none', md: 'block' }}
                fontSize="sm"
                fontWeight="medium"
                color="white"
              >
                {user.name}
              </Text>
              <Button
                onClick={handleLogout}
                size="sm"
                px={4}
                py={2}
                fontSize="sm"
                fontWeight="medium"
                color="gray.300"
                _hover={{ color: 'white', bg: 'dark.700' }}
                border="1px"
                borderColor="dark.600"
                borderRadius="lg"
                bg="transparent"
                transition="all 0.2s"
              >
                登出
              </Button>
            </HStack>
          ) : (
            <HStack gap={3}>
              <GoogleLoginButton />
            </HStack>
          )}
        </HStack>
      </Flex>
    </Box>
  )
}
