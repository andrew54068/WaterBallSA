'use client'

import { useAuth } from '@/lib/auth-context'
import { GoogleLoginButton } from './GoogleLoginButton'
import { Logo } from './Logo'
import { Box, Flex, Button, Image, Text } from '@chakra-ui/react'

interface LessonHeaderProps {
  curriculumTitle?: string
  chapterTitle?: string
  lessonTitle?: string
}

/**
 * Simplified header for lesson pages - no curriculum dropdown
 */
export function LessonHeader({ curriculumTitle, chapterTitle, lessonTitle }: LessonHeaderProps) {
  const { user, isLoading, logout } = useAuth()

  const handleLogout = async () => {
    console.log('[LessonHeader] Logging out...')
    await logout()
    console.log('[LessonHeader] Logout complete')
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
        {/* Logo / Brand */}
        <Flex
          w="256px"
          align="center"
          px={6}
          borderRight="1px solid"
          borderColor="dark.600"
          h="full"
        >
          <Logo />
        </Flex>

        {/* Right side content */}
        <Flex flex={1} align="center" justify="space-between" px={6}>
          {/* Breadcrumb / Title */}
          <Flex align="center" gap={2}>
            {curriculumTitle && (
              <>
                <Text fontSize="sm" fontWeight="medium" color="gray.400">
                  {curriculumTitle}
                </Text>
                {chapterTitle && (
                  <>
                    <Text fontSize="sm" color="gray.600">/</Text>
                    <Text fontSize="sm" fontWeight="medium" color="gray.400">
                      {chapterTitle}
                    </Text>
                  </>
                )}
              </>
            )}
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
