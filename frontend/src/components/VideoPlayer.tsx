'use client'

import React, { useState, createElement } from 'react'
import ReactPlayer from 'react-player'
import { Box, Flex, Text, Button, Icon } from '@chakra-ui/react'

interface VideoPlayerProps {
  videoUrl: string
  title: string
  duration?: number
}

export default function VideoPlayer({ videoUrl, title, duration }: VideoPlayerProps) {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)

  const handleReady = () => {
    setIsReady(true)
    setError(null)
  }

  const handleError = () => {
    setError('Video unavailable. Please try again later.')
    setIsReady(false)
  }

  const handleRetry = () => {
    setError(null)
    setIsReady(false)
    // Force re-render by toggling a key
    window.location.reload()
  }

  if (error) {
    return (
      <Box
        position="relative"
        w="full"
        pt="56.25%"
        bg="dark.900"
        borderRadius="lg"
        overflow="hidden"
      >
        <Flex
          position="absolute"
          inset={0}
          direction="column"
          align="center"
          justify="center"
          p={8}
          textAlign="center"
        >
          <Icon viewBox="0 0 24 24" boxSize={16} color="red.500" mb={4}>
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </Icon>
          <Text color="white" fontSize="lg" fontWeight="semibold" mb={2}>
            {error}
          </Text>
          <Button
            mt={4}
            px={6}
            py={2}
            bg="blue.600"
            _hover={{ bg: 'blue.700' }}
            color="white"
            borderRadius="lg"
            onClick={handleRetry}
          >
            Retry
          </Button>
        </Flex>
      </Box>
    )
  }

  return (
    <Box position="relative" w="full">
      {/* Aspect ratio container (16:9) */}
      <Box
        position="relative"
        w="full"
        pt="56.25%"
        bg="dark.900"
        borderRadius="lg"
        overflow="hidden"
      >
        {/* Loading skeleton */}
        {!isReady && (
          <Flex
            position="absolute"
            inset={0}
            align="center"
            justify="center"
            bg="dark.800"
          >
            <Flex direction="column" align="center" animation="pulse 2s infinite">
              <Icon viewBox="0 0 20 20" boxSize={16} color="dark.600" mb={4}>
                <path
                  fill="currentColor"
                  d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.34-5.89a1.5 1.5 0 000-2.54L6.3 2.84z"
                />
              </Icon>
              <Text color="gray.400" fontSize="sm">
                Loading video...
              </Text>
            </Flex>
          </Flex>
        )}

        {/* React Player */}
        {createElement(ReactPlayer as any, {
          url: videoUrl,
          controls: true,
          width: '100%',
          height: '100%',
          playing: playing,
          onReady: handleReady,
          onError: handleError,
          onPlay: () => setPlaying(true),
          onPause: () => setPlaying(false),
          config: {
            youtube: {
              playerVars: {
                modestbranding: 1,
                rel: 0,
              },
            },
          },
          style: {
            position: 'absolute',
            top: 0,
            left: 0,
          },
        })}
      </Box>

      {/* Video metadata */}
      {duration && (
        <Text mt={2} fontSize="sm" color="gray.400">
          Duration: {duration} minutes
        </Text>
      )}
    </Box>
  )
}
