import { Box, Container, Grid, Heading, Text, Flex } from '@chakra-ui/react'
import { FeaturedCourseCard } from '@/components/FeaturedCourseCard'
import { ErrorState } from '@/components/ErrorState'
import { EmptyState } from '@/components/EmptyState'
import { lessonsApi } from '@/lib/api/lessons'
import { curriculumsApi } from '@/lib/api/curriculums'
import type { Curriculum } from '@/types'

// Phase 2: Order type (to be implemented)
interface Order {
  id: number
  // Add more fields when implementing Phase 2
}

// Mock order data (empty for now - Phase 2 feature)
const orders: Order[] = []

export default async function CoursesPage() {
  // Fetch curriculums from backend API
  let curriculumsData: Curriculum[] = []
  let error: string | null = null

  try {
    const response = await curriculumsApi.getAll({ page: 0, size: 100 })
    curriculumsData = response.content
  } catch (err) {
    error = err instanceof Error ? err.message : '無法載入課程資料，請稍後再試'
    console.error('Error loading curriculums:', err)
  }

  // Map curriculums to course format and fetch free preview lessons
  const courses = await Promise.all(
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
      {/* Courses Grid */}
      <Box as="section" py={12} px={8}>
        <Container maxW="7xl">
          {error ? (
            <ErrorState message={error} />
          ) : courses.length === 0 ? (
            <EmptyState message="目前沒有課程" />
          ) : (
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={8}>
              {courses.map((course) => (
                <FeaturedCourseCard key={course.id} {...course} />
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* Order History Section */}
      <Box as="section" py={12} px={8}>
        <Container maxW="7xl">
          <Box bg="dark.800" rounded="2xl" p={8} borderWidth="1px" borderColor="dark.600">
            {/* Header */}
            <Flex align="center" mb={6}>
              <Text fontSize="2xl" mr={3}>📋</Text>
              <Heading as="h2" fontSize="2xl" fontWeight="bold" color="white">訂單紀錄</Heading>
            </Flex>

            {/* Empty State */}
            {orders.length === 0 ? (
              <Box py={12} textAlign="center">
                <Text color="gray.400" fontSize="lg">目前沒有訂單紀錄</Text>
              </Box>
            ) : (
              <Flex direction="column" gap={4}>
                {/* Future: Order list will be displayed here */}
                {orders.map((order) => (
                  <Box key={order.id} bg="dark.700" p={4} rounded="lg">
                    {/* Order details */}
                  </Box>
                ))}
              </Flex>
            )}
          </Box>
        </Container>
      </Box>
    </Box>
  )
}
