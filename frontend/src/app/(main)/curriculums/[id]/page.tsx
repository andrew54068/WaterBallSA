import { curriculumsApi } from '@/lib/api/curriculums'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChapterAccordion } from '@/components/ChapterAccordion'
import { JoinCourseButton } from '@/components/JoinCourseButton'
import { GlobeAltIcon, DevicePhoneMobileIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import { Box, Container, Grid, Heading, Text, Flex, Button } from '@chakra-ui/react'

interface PageProps {
  params: {
    id: string
  }
}

export default async function CurriculumDetailPage({ params }: PageProps) {
  const curriculumId = parseInt(params.id)

  if (isNaN(curriculumId)) {
    notFound()
  }

  let curriculum = null
  let error = null

  try {
    curriculum = await curriculumsApi.getById(curriculumId)
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load curriculum'
    console.error('Error loading curriculum:', err)
  }

  if (!curriculum && !error) {
    notFound()
  }

  if (error) {
    return (
      <Box as="main" minH="100vh" bg="dark.900" py={8}>
        <Container maxW="7xl" px={4}>
          <Box
            bg="red.900"
            opacity="0.2"
            borderWidth="1px"
            borderColor="red.500"
            color="red.400"
            px={6}
            py={4}
            rounded="lg"
          >
            <Text fontWeight="bold">Error loading curriculum</Text>
            <Text>{error}</Text>
          </Box>
          <Link href="/" style={{ marginTop: '1rem', display: 'inline-block' }}>
            <Text color="accent.yellow" _hover={{ textDecoration: 'underline' }}>
              ← Back to Home
            </Text>
          </Link>
        </Container>
      </Box>
    )
  }

  const totalVideos = curriculum!.chapters.reduce(
    (sum, ch) => sum + ch.lessons.filter((l) => l.lessonType === 'VIDEO').length,
    0
  )

  return (
    <Box as="main" minH="100vh" bg="dark.900">
      <Container maxW="7xl" px={8} py={12}>
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(3, 1fr)' }} gap={12}>
          {/* Main Content - Left Column */}
          <Box gridColumn={{ base: '1', lg: 'span 2' }}>
            {/* Hero Section */}
            <Box mb={12}>
              <Heading
                as="h1"
                fontSize={{ base: '4xl', md: '5xl' }}
                fontWeight="black"
                color="white"
                mb={6}
                lineHeight="shorter"
              >
                {curriculum!.title}
              </Heading>

              <Text fontSize="lg" color="gray.300" mb={6} lineHeight="relaxed">
                {curriculum!.description}
              </Text>

              {/* Stats */}
              <Flex align="center" gap={6} mb={8} color="gray.400">
                <Flex align="center" gap={2}>
                  <Text>📹</Text>
                  <Text>{totalVideos} 部影片</Text>
                </Flex>
                <Flex align="center" gap={2}>
                  <Text>⏱️</Text>
                  <Text>大量實戰題</Text>
                </Flex>
              </Flex>

              {/* CTA Buttons */}
              <Flex gap={4}>
                <JoinCourseButton curriculumId={curriculumId} />
                {curriculumId === 1 && (
                  <Button
                    px={8}
                    py={3}
                    bg="transparent"
                    borderWidth="2px"
                    borderColor="accent.yellow"
                    color="accent.yellow"
                    rounded="lg"
                    fontWeight="bold"
                    _hover={{ bg: 'accent.yellow', opacity: 0.1 }}
                    transition="all 0.2s"
                  >
                    預約 1v1 諮詢
                  </Button>
                )}
              </Flex>
            </Box>

            {/* Chapter Accordion */}
            <Box>
              <ChapterAccordion chapters={curriculum!.chapters} curriculumId={curriculumId} />
            </Box>
          </Box>

          {/* Sidebar - Right Column */}
          <Box gridColumn={{ base: '1', lg: 'span 1' }}>
            <Box position="sticky" top={8} display="flex" flexDirection="column" gap={8}>
              {/* Certificate Card */}
              <Box bg="dark.800" rounded="2xl" p={6} borderWidth="1px" borderColor="dark.600">
                {/* Certificate Image */}
                <Box
                  mb={6}
                  bgGradient="to-br"
                  gradientFrom="blue.400"
                  gradientTo="blue.600"
                  rounded="xl"
                  p={8}
                  aspectRatio="4/3"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Box textAlign="center" color="white">
                    <Box mb={3}>
                      <Flex
                        w="64px"
                        h="64px"
                        bg="white"
                        opacity="0.2"
                        rounded="full"
                        mx="auto"
                        mb={4}
                        align="center"
                        justify="center"
                      >
                        <Text fontSize="3xl">🎓</Text>
                      </Flex>
                    </Box>
                    <Heading as="h3" fontSize="xl" fontWeight="bold" mb={2}>CERTIFICATE</Heading>
                    <Heading as="h4" fontSize="lg" fontWeight="bold" mb={3}>OF ACHIEVEMENT</Heading>
                    <Text fontSize="sm" opacity="0.8" mb={2}>This certifies that</Text>
                    <Text fontWeight="bold" fontSize="lg" mb={2}>John Doe</Text>
                    <Text fontSize="xs" opacity="0.7">has successfully completed</Text>
                    <Text fontSize="sm" fontWeight="semibold" mt={2}>{curriculum!.title.substring(0, 20)}...</Text>
                  </Box>
                </Box>

                {/* Heading */}
                <Heading as="h3" fontSize="xl" fontWeight="bold" color="white" mb={4}>課程證書</Heading>

                {/* CTA Button */}
                <JoinCourseButton curriculumId={curriculumId} fullWidth />
              </Box>

              {/* Course Info */}
              <Flex direction="column" gap={4}>
                <Flex align="center" gap={3} color="white">
                  <GlobeAltIcon width={20} height={20} className="w-4 h-4 text-gray-400" />
                  <Text>中文課程</Text>
                </Flex>
                <Flex align="center" gap={3} color="white">
                  <DevicePhoneMobileIcon width={20} height={20} className="w-4 h-4 text-gray-400" />
                  <Text>支援行動裝置</Text>
                </Flex>
                <Flex align="center" gap={3} color="white">
                  <DocumentTextIcon width={20} height={20} className="w-4 h-4 text-gray-400" />
                  <Text>專業的完課認證</Text>
                </Flex>
              </Flex>
            </Box>
          </Box>
        </Grid>
      </Container>
    </Box>
  )
}
