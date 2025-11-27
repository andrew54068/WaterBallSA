import Link from 'next/link'
import type { Curriculum } from '@/types'
import { Box, Flex, Text, Image, Badge, Button } from '@chakra-ui/react'

interface CurriculumCardProps {
  curriculum: Curriculum
}

export function CurriculumCard({ curriculum }: CurriculumCardProps) {
  const difficultyLabels = {
    BEGINNER: '水球潘',
    INTERMEDIATE: '中級',
    ADVANCED: '高級',
  }

  const difficultyColors = {
    BEGINNER: 'teal',
    INTERMEDIATE: 'orange',
    ADVANCED: 'red',
  }

  const isFree = curriculum.price === 0

  // Use illustrative placeholder images if no thumbnail
  const getPlaceholderImage = (id: number) => {
    const colors = ['4F46E5', '06B6D4', '8B5CF6', 'F59E0B', 'EF4444']
    const color = colors[id % colors.length]
    return `https://placehold.co/600x400/${color}/ffffff?text=${encodeURIComponent(curriculum.title.substring(0, 10))}&font=noto-sans`
  }

  const thumbnailUrl = curriculum.thumbnailUrl || getPlaceholderImage(curriculum.id)

  return (
    <Link href={`/curriculums/${curriculum.id}`} style={{ textDecoration: 'none' }}>
      <Box
        role="group"
        position="relative"
        bg="dark.800"
        borderRadius="2xl"
        overflow="hidden"
        borderWidth="2px"
        borderColor="dark.600"
        transition="all 0.3s"
        cursor="pointer"
        _hover={{
          borderColor: 'accent.yellow',
          transform: 'translateY(-4px)',
          shadow: 'xl',
        }}
      >
        {/* Thumbnail with overlay */}
        <Box position="relative" h="224px" bgGradient="linear(to-br, dark.700, dark.800)" overflow="hidden">
          <Image
            src={thumbnailUrl}
            alt={curriculum.title}
            w="full"
            h="full"
            objectFit="cover"
            transition="transform 0.5s"
            _groupHover={{ transform: 'scale(1.05)' }}
          />

          {/* Gradient overlay */}
          <Box
            position="absolute"
            inset={0}
            bgGradient="linear(to-t, dark.900, rgba(10, 14, 26, 0.4), transparent)"
          />

          {/* Free badge */}
          {isFree && (
            <Badge
              position="absolute"
              top={4}
              right={4}
              colorScheme="green"
              px={4}
              py={1.5}
              borderRadius="full"
              fontSize="sm"
              fontWeight="bold"
              shadow="lg"
            >
              FREE
            </Badge>
          )}

          {/* Title overlay on image */}
          <Box position="absolute" bottom={0} left={0} right={0} p={6}>
            <Text
              fontSize="xl"
              fontWeight="bold"
              color="white"
              mb={2}
              lineClamp={2}
              transition="colors 0.2s"
              _groupHover={{ color: 'accent.yellow' }}
            >
              {curriculum.title}
            </Text>
          </Box>
        </Box>

        <Box p={6}>
          {/* Instructor */}
          <Flex align="center" mb={3}>
            <Box
              w="32px"
              h="32px"
              bgGradient="linear(to-br, accent.yellow, accent.yellow-dark)"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mr={2}
            >
              <Text color="dark.900" fontWeight="bold" fontSize="sm">
                水
              </Text>
            </Box>
            <Text fontSize="sm" color="gray.400">
              {curriculum.instructorName || '水球潘'}
            </Text>
          </Flex>

          {/* Description */}
          <Text fontSize="sm" color="gray.300" mb={4} lineClamp={3} lineHeight="relaxed">
            {curriculum.description}
          </Text>

          {/* Metadata */}
          <Flex align="center" justify="space-between" mb={4}>
            <Badge
              colorScheme={difficultyColors[curriculum.difficultyLevel]}
              fontSize="xs"
              px={3}
              py={1.5}
              borderRadius="lg"
              fontWeight="semibold"
            >
              {difficultyLabels[curriculum.difficultyLevel] || curriculum.difficultyLevel}
            </Badge>
            <Flex align="center" gap={4} fontSize="sm" color="gray.400">
              <Flex align="center">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: '4px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {curriculum.estimatedDurationHours}h
              </Flex>
            </Flex>
          </Flex>

          {/* Price and CTA */}
          <Flex align="center" justify="space-between" pt={4} borderTop="1px solid" borderColor="dark.600">
            <Box>
              {isFree ? (
                <Text fontSize="2xl" fontWeight="bold" color="green.400">
                  免費
                </Text>
              ) : (
                <Box>
                  <Text fontSize="xs" color="gray.500" textDecoration="line-through" display="block">
                    看完課程送 3,000 元
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="white">
                    {curriculum.currency} ${curriculum.price.toFixed(0)}
                  </Text>
                </Box>
              )}
            </Box>
            <Button
              px={5}
              py={2.5}
              bg="accent.yellow"
              color="dark.900"
              borderRadius="lg"
              fontWeight="bold"
              fontSize="sm"
              _hover={{ bg: 'accent.yellow-dark' }}
              _groupHover={{ shadow: 'lg' }}
              transition="all 0.2s"
            >
              立即購買
            </Button>
          </Flex>
        </Box>
      </Box>
    </Link>
  )
}
