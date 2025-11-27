'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  AcademicCapIcon,
  TrophyIcon,
  RectangleStackIcon,
  MapIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline'
import { Box, Flex, Text, VStack, List } from '@chakra-ui/react'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navigation: NavItem[] = [
  { name: '首頁', href: '/', icon: HomeIcon },
  { name: '課程', href: '/courses', icon: AcademicCapIcon },
  { name: '排行榜', href: '/leaderboard', icon: TrophyIcon },
  { name: '所有單元', href: '/curriculums', icon: RectangleStackIcon },
  { name: '挑戰地圖', href: '/roadmap', icon: MapIcon },
  { name: 'SOP 寶典', href: '/sop', icon: BookOpenIcon },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <Box
      as="aside"
      position="fixed"
      left={0}
      top="64px"
      h="calc(100vh - 64px)"
      w="256px"
      bg="dark.800"
      borderRight="1px solid"
      borderColor="dark.600"
      display="flex"
      flexDirection="column"
      zIndex={40}
    >
      {/* Navigation */}
      <Box as="nav" flex={1} px={3} py={6}>
        <List.Root as="ul" gap={1} display="flex" flexDirection="column">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <List.Item key={item.name} listStyleType="none">
                <Link href={item.href} style={{ textDecoration: 'none' }}>
                  <Flex
                    align="center"
                    px={4}
                    py={3}
                    borderRadius="lg"
                    fontSize="sm"
                    fontWeight="medium"
                    transition="all 0.2s"
                    position="relative"
                    overflow="hidden"
                    bg={isActive ? 'accent.yellow' : 'transparent'}
                    color={isActive ? 'dark.900' : 'gray.300'}
                    shadow={isActive ? 'lg' : 'none'}
                    _hover={{
                      bg: isActive ? 'accent.yellow' : 'dark.700',
                      color: isActive ? 'dark.900' : 'white',
                    }}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <Box
                        position="absolute"
                        inset={0}
                        bgGradient="linear(to-r, accent.yellow, accent.yellow-dark)"
                        opacity={1}
                      />
                    )}

                    <Icon
                      style={{
                        width: '20px',
                        height: '20px',
                        marginRight: '12px',
                        position: 'relative',
                        zIndex: 10,
                      }}
                    />
                    <Text position="relative" zIndex={10}>
                      {item.name}
                    </Text>
                  </Flex>
                </Link>
              </List.Item>
            )
          })}
        </List.Root>
      </Box>

      {/* Footer */}
      <Box p={4} borderTop="1px solid" borderColor="dark.600">
        <Text fontSize="xs" color="gray.500" textAlign="center">
          © {new Date().getFullYear()} WaterBallSA
        </Text>
      </Box>
    </Box>
  )
}
