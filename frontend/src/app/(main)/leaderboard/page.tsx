'use client'

import { useState } from 'react'
import { Box, Container, Flex, Heading, Text, Button, Image } from '@chakra-ui/react'
import { PromotionalBanner } from '@/components/PromotionalBanner'

interface LeaderboardUser {
  rank: number
  userId: string
  name: string
  avatar: string
  title: string
  level: number
  exp: number
}

// Mock data following spec
const learningRankings: LeaderboardUser[] = [
  {
    rank: 1,
    userId: "user-1",
    name: "Elliot",
    avatar: "https://ui-avatars.com/api/?name=Elliot&background=random",
    title: "初級工程師",
    level: 19,
    exp: 31040,
  },
  {
    rank: 2,
    userId: "user-2",
    name: "精靈Ken Lin",
    avatar: "https://ui-avatars.com/api/?name=Ken+Lin&background=random",
    title: "初級工程師",
    level: 18,
    exp: 29130,
  },
  {
    rank: 3,
    userId: "user-3",
    name: "Clark Chen",
    avatar: "https://ui-avatars.com/api/?name=Clark+Chen&background=random",
    title: "初級工程師",
    level: 17,
    exp: 27260,
  },
  {
    rank: 4,
    userId: "user-4",
    name: "Adam Huang",
    avatar: "https://ui-avatars.com/api/?name=Adam+Huang&background=random",
    title: "初級工程師",
    level: 16,
    exp: 25440,
  },
  {
    rank: 5,
    userId: "user-5",
    name: "酥炸香菇天婦羅",
    avatar: "https://ui-avatars.com/api/?name=Mushroom&background=random",
    title: "初級工程師",
    level: 16,
    exp: 25374,
  },
]

const weeklyGrowthRankings: LeaderboardUser[] = [
  // Similar structure, different data - placeholder for future
  ...learningRankings
]

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<'learning' | 'weekly'>('learning')

  const currentRankings = activeTab === 'learning' ? learningRankings : weeklyGrowthRankings

  return (
    <Box as="main" minH="100vh" bg="dark.900">
      {/* Promotional Banner - Only displays when user has coupons */}

      {/* Main Content */}
      <Container maxW="5xl" px={8} py={12}>
        {/* Tabs */}
        <Flex gap={4} mb={8}>
          <Button
            px={6}
            py={3}
            rounded="lg"
            fontWeight="bold"
            fontSize="sm"
            onClick={() => setActiveTab('learning')}
            bg={activeTab === 'learning' ? 'accent.yellow' : 'dark.800'}
            color={activeTab === 'learning' ? 'dark.900' : 'gray.300'}
            _hover={{ bg: activeTab === 'learning' ? 'accent.yellow' : 'dark.700' }}
            transition="all 0.2s"
          >
            學習排行榜
          </Button>
          <Button
            px={6}
            py={3}
            rounded="lg"
            fontWeight="bold"
            fontSize="sm"
            onClick={() => setActiveTab('weekly')}
            bg={activeTab === 'weekly' ? 'accent.yellow' : 'dark.800'}
            color={activeTab === 'weekly' ? 'dark.900' : 'gray.300'}
            _hover={{ bg: activeTab === 'weekly' ? 'accent.yellow' : 'dark.700' }}
            transition="all 0.2s"
          >
            本週成長榜
          </Button>
        </Flex>

        {/* Leaderboard List */}
        <Flex direction="column" gap={4}>
          {currentRankings.map((user) => (
            <Flex
              key={user.userId}
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
              {/* Rank Number */}
              <Box flexShrink={0} w="20" textAlign="center">
                <Text fontSize="5xl" fontWeight="black" color="white" opacity="0.8">
                  {user.rank}
                </Text>
              </Box>

              {/* Avatar */}
              <Box flexShrink={0}>
                <Image
                  src={user.avatar}
                  alt={user.name}
                  w="14"
                  h="14"
                  rounded="full"
                  borderWidth="2px"
                  borderColor="dark.600"
                />
              </Box>

              {/* User Info */}
              <Box flex={1}>
                <Heading as="h3" fontSize="lg" fontWeight="bold" color="white" mb={1}>
                  {user.name}
                </Heading>
                <Text fontSize="sm" color="gray.400">
                  {user.title}
                </Text>
              </Box>

              {/* Level Badge */}
              <Box flexShrink={0}>
                <Box bg="white" px={4} py={2} rounded="full">
                  <Text color="dark.900" fontWeight="bold" fontSize="sm">
                    Lv.{user.level}
                  </Text>
                </Box>
              </Box>

              {/* EXP Points */}
              <Box flexShrink={0} w="24" textAlign="right">
                <Text fontSize="2xl" fontWeight="bold" color="white">
                  {user.exp.toLocaleString()}
                </Text>
              </Box>
            </Flex>
          ))}
        </Flex>
      </Container>
    </Box>
  )
}
