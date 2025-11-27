'use client'

import { useAuth } from '@/lib/auth-context'
import { useCurriculum } from '@/lib/curriculum-context'
import { GoogleLoginButton } from './GoogleLoginButton'
import { Logo } from './Logo'
import { Bars3Icon } from '@heroicons/react/24/solid'
import { useState } from 'react'
import { Box, Flex, Button, Image, Text, Select, createListCollection } from '@chakra-ui/react'

export function Header() {
  const { user, isLoading, logout } = useAuth()
  const { curriculums, selectedCurriculum, setSelectedCurriculum, isLoading: curriculumsLoading } = useCurriculum()
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

  // Create collection for Select component
  const curriculumCollection = createListCollection({
    items: curriculums.map(c => ({ value: c.id.toString(), label: c.title })),
  })

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
            {curriculumsLoading ? (
              <Box h="40px" w="300px" bg="dark.700" borderRadius="lg" className="animate-pulse" />
            ) : (
              <Select.Root
                collection={curriculumCollection}
                value={[selectedCurriculum?.id.toString() || '']}
                onValueChange={(details) => {
                  const curriculumId = details.value[0]
                  const curriculum = curriculums.find(c => c.id.toString() === curriculumId)
                  if (curriculum) {
                    setSelectedCurriculum(curriculum)
                  }
                }}
                size="sm"
              >
                <Select.Trigger
                  pl="10px"
                  pr="8px"
                  minW="300px"
                  bg="dark.700"
                  color="white"
                  borderRadius="lg"
                  fontSize="sm"
                  fontWeight="medium"
                  borderWidth="1px"
                  borderColor="dark.600"
                  _focus={{ ring: 2, ringColor: 'accent.yellow' }}
                >
                  <Select.ValueText placeholder="選擇課程" />
                </Select.Trigger>
                <Select.Positioner>
                  <Select.Content
                    p="5px"
                    bg="dark.700"
                    borderColor="dark.600"
                    borderWidth="1px"
                    borderRadius="lg"
                    maxH="300px"
                    minW="300px"
                    overflowY="auto"
                    shadow="xl"
                  >
                    {curriculums.map((curriculum) => (
                      <Select.Item
                        key={curriculum.id}
                        item={{ label: curriculum.title, value: curriculum.id.toString() }}
                        color="white"
                        _hover={{ bg: 'dark.600' }}
                        px="10px"
                        py="8px"
                        cursor="pointer"
                      >
                        {curriculum.title}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Select.Root>
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
