'use client'

import React from 'react'
import { Box, Flex, Text, Button, Icon, Grid, SimpleGrid } from '@chakra-ui/react'

interface ArticleMetadata {
  wordCount?: number
  readingLevel?: string
  codeExamples?: number
  estimatedReadTime?: number
}

interface ArticleRendererProps {
  articleUrl: string
  title: string
  description?: string
  metadata?: ArticleMetadata
  duration?: number
}

export default function ArticleRenderer({
  articleUrl,
  title,
  description,
  metadata,
  duration,
}: ArticleRendererProps) {
  const handleReadArticle = () => {
    window.open(articleUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <Box bg="dark.800" borderRadius="lg" shadow="md" overflow="hidden">
      {/* Header */}
      <Box
        bgGradient="linear(to-r, blue.500, blue.600)"
        p={8}
        color="white"
      >
        <Flex align="center" justify="center" mb={4}>
          <Icon viewBox="0 0 24 24" boxSize={16}>
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </Icon>
        </Flex>
        <Text fontSize="2xl" fontWeight="bold" textAlign="center" mb={2}>
          Article Lesson
        </Text>
        <Text color="blue.100" textAlign="center" fontSize="sm">
          Read external article content
        </Text>
      </Box>

      {/* Content */}
      <Box p={8}>
        {/* Description */}
        {description && (
          <Text color="gray.300" mb={6} lineHeight="relaxed">
            {description}
          </Text>
        )}

        {/* Metadata Grid */}
        {metadata && Object.keys(metadata).length > 0 && (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4} mb={8}>
            {metadata.wordCount && (
              <Box bg="dark.700" borderRadius="lg" p={4}>
                <Flex align="center">
                  <Icon viewBox="0 0 24 24" boxSize={5} color="blue.400" mr={2}>
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </Icon>
                  <Box>
                    <Text fontSize="xs" color="gray.400">
                      Word Count
                    </Text>
                    <Text fontSize="lg" fontWeight="semibold" color="white">
                      {metadata.wordCount.toLocaleString()}
                    </Text>
                  </Box>
                </Flex>
              </Box>
            )}

            {metadata.readingLevel && (
              <Box bg="dark.700" borderRadius="lg" p={4}>
                <Flex align="center">
                  <Icon viewBox="0 0 24 24" boxSize={5} color="green.400" mr={2}>
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </Icon>
                  <Box>
                    <Text fontSize="xs" color="gray.400">
                      Reading Level
                    </Text>
                    <Text fontSize="lg" fontWeight="semibold" color="white" textTransform="capitalize">
                      {metadata.readingLevel}
                    </Text>
                  </Box>
                </Flex>
              </Box>
            )}

            {metadata.codeExamples !== undefined && (
              <Box bg="dark.700" borderRadius="lg" p={4}>
                <Flex align="center">
                  <Icon viewBox="0 0 24 24" boxSize={5} color="purple.400" mr={2}>
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </Icon>
                  <Box>
                    <Text fontSize="xs" color="gray.400">
                      Code Examples
                    </Text>
                    <Text fontSize="lg" fontWeight="semibold" color="white">
                      {metadata.codeExamples}
                    </Text>
                  </Box>
                </Flex>
              </Box>
            )}

            {duration && (
              <Box bg="dark.700" borderRadius="lg" p={4}>
                <Flex align="center">
                  <Icon viewBox="0 0 24 24" boxSize={5} color="orange.400" mr={2}>
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </Icon>
                  <Box>
                    <Text fontSize="xs" color="gray.400">
                      Estimated Time
                    </Text>
                    <Text fontSize="lg" fontWeight="semibold" color="white">
                      {duration} min
                    </Text>
                  </Box>
                </Flex>
              </Box>
            )}
          </SimpleGrid>
        )}

        {/* Call to Action */}
        <Flex direction="column" align="center">
          <Button
            onClick={handleReadArticle}
            w={{ base: 'full', md: 'auto' }}
            px={8}
            py={4}
            h="auto"
            bg="blue.600"
            _hover={{ bg: 'blue.700', transform: 'scale(1.05)' }}
            color="white"
            fontWeight="semibold"
            borderRadius="lg"
            shadow="lg"
            transition="all 0.2s"
          >
            <Flex align="center" gap={2}>
              <Icon viewBox="0 0 24 24" boxSize={5}>
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </Icon>
              Read Article
            </Flex>
          </Button>
          <Text mt={3} fontSize="sm" color="gray.400">
            Opens in a new tab
          </Text>
        </Flex>
      </Box>
    </Box>
  )
}
