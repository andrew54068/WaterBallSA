'use client'

import { useState } from 'react'
import { Box, Container, Flex, Heading, Text, Button } from '@chakra-ui/react'
import { ClockIcon, StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { LockClosedIcon } from '@heroicons/react/24/solid'

interface Challenge {
  id: number
  number: number
  title: string
  isLocked: boolean
  stars: 1 | 2 | 3
}

// Mock data following spec
const mainPathChallenges: Challenge[] = [
  {
    id: 1,
    number: 1,
    title: "行雲流水的設計底層思路",
    isLocked: true,
    stars: 1,
  },
  {
    id: 2,
    number: 2,
    title: "Christopher Alexander：設計模式",
    isLocked: true,
    stars: 1,
  },
  {
    id: 3,
    number: 3,
    title: "掌握「樣板方法」最基礎的控制反轉",
    isLocked: true,
    stars: 2,
  },
  {
    id: 4,
    number: 4,
    title: "規劃行為實踐流派：Big 2",
    isLocked: true,
    stars: 2,
  },
  {
    id: 5,
    number: 5,
    title: "多重設計範型決策戰演練：RPG",
    isLocked: true,
    stars: 3,
  },
]

const sidePathChallenges: Challenge[] = [
  // Similar structure - placeholder for future
]

export default function RoadmapPage() {
  const [activeTab, setActiveTab] = useState<'main' | 'side'>('main')

  const currentChallenges = activeTab === 'main' ? mainPathChallenges : sidePathChallenges

  return (
    <Box as="main" minH="100vh" bg="dark.900">
      {/* Main Content */}
      <Container maxW="5xl" px={8} py={12}>
        {/* Title */}
        <Box mb={8} textAlign="center">
          <Heading as="h1" fontSize="4xl" fontWeight="bold" color="accent.yellow" mb={2}>
            軟體設計模式精通之旅
          </Heading>
          <Text color="gray.400">挑戰地圖</Text>
        </Box>

        {/* Progress Stats */}
        <Flex justify="space-between" align="center" mb={8} bg="dark.800" rounded="2xl" p={6} borderWidth="1px" borderColor="dark.600">
          <Flex align="center" gap={3}>
            <ClockIcon className="w-6 h-6 text-gray-400" />
            <Text color="white" fontWeight="medium">0 days left</Text>
          </Flex>
          <Flex align="center" gap={3}>
            <StarIcon className="w-6 h-6 text-gray-400" />
            <Text color="white" fontWeight="medium">0/20 cleared</Text>
          </Flex>
          <Flex align="center" gap={3}>
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <Text color="white" fontWeight="medium">0 XP</Text>
          </Flex>
        </Flex>

        {/* Path Tabs */}
        <Flex gap={4} mb={8}>
          <Button
            flex={1}
            px={6}
            py={3}
            rounded="lg"
            fontWeight="bold"
            fontSize="sm"
            onClick={() => setActiveTab('main')}
            bg={activeTab === 'main' ? 'accent.yellow' : 'dark.800'}
            color={activeTab === 'main' ? 'dark.900' : 'gray.300'}
            _hover={{ bg: activeTab === 'main' ? 'accent.yellow' : 'dark.700' }}
            transition="all 0.2s"
          >
            主線
          </Button>
          <Button
            flex={1}
            px={6}
            py={3}
            rounded="lg"
            fontWeight="bold"
            fontSize="sm"
            onClick={() => setActiveTab('side')}
            bg={activeTab === 'side' ? 'accent.yellow' : 'dark.800'}
            color={activeTab === 'side' ? 'dark.900' : 'gray.300'}
            _hover={{ bg: activeTab === 'side' ? 'accent.yellow' : 'dark.700' }}
            transition="all 0.2s"
          >
            支線
          </Button>
        </Flex>

        {/* Section Header */}
        <Box mb={8} textAlign="center">
          <Flex align="center" justify="center" gap={4}>
            <Box flex={1} h="1px" bg="dark.600" />
            <Heading as="h2" fontSize="lg" fontWeight="medium" color="gray.400">自段道館</Heading>
            <Box flex={1} h="1px" bg="dark.600" />
          </Flex>
        </Box>

        {/* Challenge List */}
        <Flex direction="column" gap={4}>
          {currentChallenges.length === 0 ? (
            <Box bg="dark.800" rounded="2xl" p={8} textAlign="center" borderWidth="1px" borderColor="dark.600">
              <Text color="gray.400">目前沒有挑戰</Text>
            </Box>
          ) : (
            currentChallenges.map((challenge) => (
              <Flex
                key={challenge.id}
                bg="dark.800"
                rounded="2xl"
                p={6}
                borderWidth="1px"
                borderColor="dark.600"
                _hover={{ borderColor: 'dark.500' }}
                transition="all 0.2s"
                align="center"
                gap={6}
              >
                {/* Challenge Number Badge */}
                <Box position="relative" flexShrink={0}>
                  <Flex w="16" h="16" bg="dark.700" rounded="full" align="center" justify="center" borderWidth="2px" borderColor="dark.600">
                    <Text color="white" fontWeight="bold" fontSize="xl">
                      {challenge.number}
                    </Text>
                  </Flex>
                  {challenge.isLocked && (
                    <Flex position="absolute" top="-1" right="-1" w="6" h="6" bg="dark.900" rounded="full" align="center" justify="center">
                      <LockClosedIcon className="w-4 h-4 text-gray-400" />
                    </Flex>
                  )}
                </Box>

                {/* Challenge Title */}
                <Box flex={1}>
                  <Heading as="h3" fontSize="lg" fontWeight="medium" color="white">
                    {challenge.title}
                  </Heading>
                </Box>

                {/* Star Rating */}
                <Flex flexShrink={0} align="center" gap={1}>
                  {Array.from({ length: challenge.stars }).map((_, i) => (
                    <StarIconSolid key={i} className="w-5 h-5 text-accent-yellow" />
                  ))}
                </Flex>
              </Flex>
            ))
          )}
        </Flex>
      </Container>
    </Box>
  )
}
