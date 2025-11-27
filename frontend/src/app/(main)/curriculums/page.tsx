import { Box, Container, Grid, Heading, Text } from '@chakra-ui/react'
import { curriculumsApi } from '@/lib/api/curriculums'
import { CurriculumCard } from '@/components/CurriculumCard'
import { Curriculum } from '@/types'

export default async function AllCurriculumsPage() {
  let curriculums: Curriculum[] = []
  let error: string | null = null

  try {
    const response = await curriculumsApi.getAll({ size: 20 })
    curriculums = response.content
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load curriculums'
    console.error('Error loading curriculums:', err)
  }

  return (
    <Box as="main" minH="100vh" bg="dark.900">

      {/* Page Header */}
      <Box as="section" py={12} px={8}>
        <Container maxW="7xl" mb={8}>
          <Heading as="h1" fontSize="4xl" fontWeight="bold" color="white" mb={2}>所有單元</Heading>
          <Text color="gray.400">瀏覽所有可用的課程</Text>
        </Container>

        <Container maxW="7xl">
          {error ? (
            <Box bg="red.900" opacity="0.2" borderWidth="1px" borderColor="red.500" color="red.400" px={6} py={4} rounded="lg">
              <Text fontWeight="bold">Error loading courses</Text>
              <Text>{error}</Text>
            </Box>
          ) : curriculums.length === 0 ? (
            <Text color="gray.500">目前沒有可用的課程。</Text>
          ) : (
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={8}>
              {curriculums.map((curriculum) => (
                <CurriculumCard key={curriculum.id} curriculum={curriculum} />
              ))}
            </Grid>
          )}
        </Container>
      </Box>
    </Box>
  )
}
