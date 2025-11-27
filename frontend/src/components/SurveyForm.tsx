'use client'

import React from 'react'
import {
  Box,
  Flex,
  Text,
  Heading,
  SimpleGrid,
  Icon,
  VStack,
  Badge,
} from '@chakra-ui/react'

interface SurveyMetadata {
  questionCount?: number
  passingScore?: number
  difficulty?: string
  timeLimit?: number
}

interface SurveyFormProps {
  surveyPath: string
  title: string
  description?: string
  metadata?: SurveyMetadata
  duration?: number
}

export default function SurveyForm({
  surveyPath,
  title,
  description,
  metadata,
  duration,
}: SurveyFormProps) {
  return (
    <Box bg="white" _dark={{ bg: 'dark.800' }} borderRadius="lg" shadow="md" overflow="hidden">
      {/* Header */}
      <Box
        bgGradient="linear(to-r, purple.500, purple.600)"
        p={8}
        color="white"
      >
        <VStack gap={4}>
          <Icon viewBox="0 0 24 24" boxSize={16}>
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </Icon>
          <Heading as="h3" size="lg" textAlign="center">
            Knowledge Check
          </Heading>
          <Text color="purple.100" textAlign="center" fontSize="sm">
            Test your understanding
          </Text>
        </VStack>
      </Box>

      {/* Content */}
      <Box p={8}>
        {/* Description */}
        {description && (
          <Text color="gray.700" _dark={{ color: 'gray.300' }} mb={6} lineHeight="relaxed">
            {description}
          </Text>
        )}

        {/* Metadata Grid */}
        {metadata && Object.keys(metadata).length > 0 && (
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mb={8}>
            {metadata.questionCount && (
              <Box
                bg="purple.50"
                borderRadius="lg"
                p={4}
                border="1px"
                borderColor="purple.200"
                _dark={{ bg: 'rgba(128, 90, 213, 0.2)', borderColor: 'purple.700' }}
              >
                <Flex align="center">
                  <Icon viewBox="0 0 24 24" boxSize={5} color="purple.600" _dark={{ color: 'purple.400' }} mr={3}>
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </Icon>
                  <Box>
                    <Text fontSize="xs" color="purple.600" _dark={{ color: 'purple.400' }} fontWeight="medium">
                      Questions
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="gray.900" _dark={{ color: 'white' }}>
                      {metadata.questionCount}
                    </Text>
                  </Box>
                </Flex>
              </Box>
            )}

            {metadata.passingScore !== undefined && (
              <Box
                bg="green.50"
                borderRadius="lg"
                p={4}
                border="1px"
                borderColor="green.200"
                _dark={{ bg: 'rgba(72, 187, 120, 0.2)', borderColor: 'green.700' }}
              >
                <Flex align="center">
                  <Icon viewBox="0 0 24 24" boxSize={5} color="green.600" _dark={{ color: 'green.400' }} mr={3}>
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </Icon>
                  <Box>
                    <Text fontSize="xs" color="green.600" _dark={{ color: 'green.400' }} fontWeight="medium">
                      Passing Score
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="gray.900" _dark={{ color: 'white' }}>
                      {metadata.passingScore}%
                    </Text>
                  </Box>
                </Flex>
              </Box>
            )}

            {metadata.difficulty && (
              <Box
                bg="orange.50"
                borderRadius="lg"
                p={4}
                border="1px"
                borderColor="orange.200"
                _dark={{ bg: 'rgba(237, 137, 54, 0.2)', borderColor: 'orange.700' }}
              >
                <Flex align="center">
                  <Icon viewBox="0 0 24 24" boxSize={5} color="orange.600" _dark={{ color: 'orange.400' }} mr={3}>
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </Icon>
                  <Box>
                    <Text fontSize="xs" color="orange.600" _dark={{ color: 'orange.400' }} fontWeight="medium">
                      Difficulty
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="gray.900" _dark={{ color: 'white' }} textTransform="capitalize">
                      {metadata.difficulty}
                    </Text>
                  </Box>
                </Flex>
              </Box>
            )}

            {duration && (
              <Box
                bg="blue.50"
                borderRadius="lg"
                p={4}
                border="1px"
                borderColor="blue.200"
                _dark={{ bg: 'rgba(66, 153, 225, 0.2)', borderColor: 'blue.700' }}
              >
                <Flex align="center">
                  <Icon viewBox="0 0 24 24" boxSize={5} color="blue.600" _dark={{ color: 'blue.400' }} mr={3}>
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
                    <Text fontSize="xs" color="blue.600" _dark={{ color: 'blue.400' }} fontWeight="medium">
                      Estimated Time
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="gray.900" _dark={{ color: 'white' }}>
                      {duration} min
                    </Text>
                  </Box>
                </Flex>
              </Box>
            )}
          </SimpleGrid>
        )}

        {/* Coming Soon Message */}
        <Box
          bg="gray.50"
          borderRadius="lg"
          p={8}
          border="2px"
          borderStyle="dashed"
          borderColor="gray.300"
          _dark={{ bg: 'dark.700', borderColor: 'gray.600' }}
        >
          <VStack gap={4}>
            <Icon viewBox="0 0 24 24" boxSize={12} color="gray.400" _dark={{ color: 'gray.500' }}>
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </Icon>
            <Heading as="h4" size="md" color="gray.900" _dark={{ color: 'white' }}>
              Survey/Quiz Functionality Coming Soon
            </Heading>
            <Text color="gray.600" _dark={{ color: 'gray.400' }}>
              Interactive quizzes and surveys will be available in Phase 3
            </Text>
            <Badge
              bg="purple.100"
              color="purple.800"
              _dark={{ bg: 'rgba(128, 90, 213, 0.3)', color: 'purple.300' }}
              px={4}
              py={2}
              borderRadius="full"
              fontSize="sm"
              fontWeight="medium"
            >
              Phase 3 Feature
            </Badge>
          </VStack>
        </Box>

        {/* Survey Path Info (for debugging/development) */}
        {process.env.NODE_ENV === 'development' && (
          <Box
            mt={6}
            p={4}
            bg="gray.100"
            borderRadius="md"
            fontSize="xs"
            fontFamily="mono"
            color="gray.600"
            _dark={{ bg: 'dark.700', color: 'gray.400' }}
          >
            <Text as="strong">Survey Path:</Text> {surveyPath}
          </Box>
        )}
      </Box>
    </Box>
  )
}
