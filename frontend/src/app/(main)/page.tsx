import { FeaturedCourseCard } from '@/components/FeaturedCourseCard'
import { ErrorState } from '@/components/ErrorState'
import { EmptyState } from '@/components/EmptyState'
import { lessonsApi } from '@/lib/api/lessons'
import { curriculumsApi } from '@/lib/api/curriculums'
import Link from 'next/link'
import { Box, Container, Flex, Grid, Heading, Text } from '@chakra-ui/react'
import type { Curriculum } from '@/types'

export default async function Home() {
  // Fetch curriculums from backend API
  let curriculumsData: Curriculum[] = []
  let error: string | null = null

  try {
    const response = await curriculumsApi.getAll({ page: 0, size: 2 })
    curriculumsData = response.content
  } catch (err) {
    error = err instanceof Error ? err.message : '無法載入課程資料，請稍後再試'
    console.error('Error loading curriculums:', err)
  }

  // Map curriculums to featured course format and fetch free preview lessons
  const featuredCourses = await Promise.all(
    curriculumsData.map(async (curriculum) => {
      let firstFreeLessonIndex: number | undefined
      let firstFreeChapterIndex: number | undefined
      let hasFreeTrial = false

      try {
        const freePreviewLessons = await lessonsApi.getFreePreview(curriculum.id)
        if (freePreviewLessons.length > 0) {
          hasFreeTrial = true
          firstFreeLessonIndex = freePreviewLessons[0].orderIndex
          // Get chapter info to find its order_index
          const curriculumWithChapters = await curriculumsApi.getById(curriculum.id)
          const chapter = curriculumWithChapters.chapters.find(
            ch => ch.id === freePreviewLessons[0].chapterId
          )
          firstFreeChapterIndex = chapter?.orderIndex
        }
      } catch (error) {
        console.error(`Failed to fetch free preview for curriculum ${curriculum.id}:`, error)
      }

      return {
        id: curriculum.id,
        title: curriculum.title,
        provider: curriculum.instructorName,
        description: curriculum.description,
        image: curriculum.thumbnailUrl || '/images/placeholder.jpg',
        hasCoupon: false, // Phase 2 feature
        couponValue: undefined, // Phase 2 feature
        isPurchased: false, // Phase 2 feature
        hasFreeTrial,
        isPaidOnly: curriculum.price > 0,
        firstFreeLessonIndex,
        firstFreeChapterIndex,
      }
    })
  )
  return (
    <Box as="main" minH="100vh" bg="dark.900">
      {/* Hero Welcome Section */}
      <Box as="section" position="relative" py={16} px={8} overflow="hidden">
        {/* Background gradient effect */}
        <Box
          position="absolute"
          inset="0"
          bgGradient="linear(to-br, dark.800, dark.900, dark.900)"
          opacity="0.8"
        />
        <Box
          position="absolute"
          top="0"
          right="0"
          w="384px"
          h="384px"
          bg="accent.yellow"
          opacity="0.05"
          rounded="full"
          filter="blur(80px)"
        />
        <Box
          position="absolute"
          bottom="0"
          left="0"
          w="384px"
          h="384px"
          bg="accent.yellow"
          opacity="0.05"
          rounded="full"
          filter="blur(80px)"
        />

        <Container maxW="7xl" position="relative">
          <Heading
            as="h1"
            fontSize={{ base: '4xl', md: '5xl' }}
            fontWeight="black"
            color="white"
            mb={6}
            lineHeight="tight"
          >
            歡迎來到<Text as="span" color="accent.yellow">水球軟體學院</Text>
          </Heading>
          <Text
            fontSize={{ base: 'lg', md: 'xl' }}
            color="gray.300"
            maxW="4xl"
            lineHeight="relaxed"
          >
            水球軟體學院提供最先進的軟體設計思路教材，並透過線上 Code Review 來帶你掌握紮實軟體架構能力。
            只要每週投資 5 小時，就能打造不平等的優勢，成為硬核的 Coding 實戰高手。
          </Text>
        </Container>
      </Box>

      {/* Featured Courses Section */}
      <Box as="section" py={12} px={8}>
        <Container maxW="7xl">
          {error ? (
            <ErrorState message={error} />
          ) : featuredCourses.length === 0 ? (
            <EmptyState message="目前沒有課程" />
          ) : (
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={8}>
              {featuredCourses.map((course) => (
                <FeaturedCourseCard key={course.id} {...course} />
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* Info Sections */}
      <Box as="section" py={16} px={8}>
        <Container maxW="7xl">
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={8}>
            {/* Software Design Pattern Course Section */}
            <Box
              bg="dark.800"
              rounded="2xl"
              p={8}
              borderWidth="1px"
              borderColor="dark.600"
              _hover={{ borderColor: 'dark.500' }}
              transition="all 0.2s"
            >
              <Flex align="flex-start" mb={6}>
                <Flex
                  w="56px"
                  h="56px"
                  bg="dark.700"
                  rounded="xl"
                  align="center"
                  justify="center"
                  mr={4}
                  flexShrink={0}
                >
                  <Text fontSize="3xl">📚</Text>
                </Flex>
                <Heading as="h3" fontSize="2xl" fontWeight="bold" color="white" lineHeight="tight">
                  軟體設計模式之旅課程
                </Heading>
              </Flex>
              <Text color="gray.300" mb={8} lineHeight="relaxed">
                「用一趟旅程的時間，成為硬核的 Coding 高手」一套高效率的 OOAD 思路。
              </Text>
              <Link href="/courses" style={{ textDecoration: 'none' }}>
                <Box
                  display="inline-flex"
                  alignItems="center"
                  px={6}
                  py={3}
                  bg="accent.yellow"
                  color="dark.900"
                  rounded="lg"
                  fontWeight="bold"
                  _hover={{ bg: 'accent.yellow-dark' }}
                  transition="all 0.2s"
                  cursor="pointer"
                >
                  查看課程 →
                </Box>
              </Link>
            </Box>

            {/* WaterBall Blog Section */}
            <Box
              bg="dark.800"
              rounded="2xl"
              p={8}
              borderWidth="1px"
              borderColor="dark.600"
              _hover={{ borderColor: 'dark.500' }}
              transition="all 0.2s"
            >
              <Flex align="flex-start" mb={6}>
                <Flex
                  w="56px"
                  h="56px"
                  bg="dark.700"
                  rounded="xl"
                  align="center"
                  justify="center"
                  mr={4}
                  flexShrink={0}
                >
                  <Text fontSize="3xl">📖</Text>
                </Flex>
                <Heading as="h3" fontSize="2xl" fontWeight="bold" color="white" lineHeight="tight">
                  水球潘的部落格
                </Heading>
              </Flex>
              <Text color="gray.300" mb={8} lineHeight="relaxed">
                觀看水球潘的軟體工程師職涯、軟體設計模式及架構學習，以及領域驅動設計等公開文章。
              </Text>
              <Link href="/sop" style={{ textDecoration: 'none' }}>
                <Box
                  display="inline-flex"
                  alignItems="center"
                  px={6}
                  py={3}
                  bg="accent.yellow"
                  color="dark.900"
                  rounded="lg"
                  fontWeight="bold"
                  _hover={{ bg: 'accent.yellow-dark' }}
                  transition="all 0.2s"
                  cursor="pointer"
                >
                  閱讀文章 →
                </Box>
              </Link>
            </Box>
          </Grid>
        </Container>
      </Box>
    </Box>
  )
}
