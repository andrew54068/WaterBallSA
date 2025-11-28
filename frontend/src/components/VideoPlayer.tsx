'use client'

import React, { useState, useMemo } from 'react'
import { Box, Flex, Text, Button, Icon } from '@chakra-ui/react'

interface VideoPlayerProps {
  videoUrl: string
  title: string
  duration?: number
}

/**
 * Converts various YouTube URL formats to embed URL
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/watch?v=VIDEO_ID&other=params
 * - https://youtu.be/VIDEO_ID?si=TRACKING_ID
 */
function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)

    // Handle youtube.com/watch?v=VIDEO_ID format
    if (urlObj.hostname.includes('youtube.com')) {
      const videoId = urlObj.searchParams.get('v')
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`
      }
    }

    // Handle youtu.be/VIDEO_ID format
    if (urlObj.hostname.includes('youtu.be')) {
      const videoId = urlObj.pathname.slice(1).split('?')[0]
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`
      }
    }

    return null
  } catch (error) {
    console.error('Invalid YouTube URL:', url, error)
    return null
  }
}

export default function VideoPlayer({ videoUrl, title, duration }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Convert YouTube URL to embed format
  const embedUrl = useMemo(() => {
    const url = getYouTubeEmbedUrl(videoUrl)
    if (!url) {
      setError('Invalid YouTube URL format')
    }
    return url
  }, [videoUrl])

  const handleIframeLoad = () => {
    setIsLoading(false)
    setError(null)
  }

  const handleIframeError = () => {
    setError('Video unavailable. Please try again later.')
    setIsLoading(false)
  }

  const handleRetry = () => {
    setError(null)
    setIsLoading(true)
    // Force re-render by reloading the page
    window.location.reload()
  }

  if (error || !embedUrl) {
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
            {error || 'Invalid video URL'}
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
        {isLoading && (
          <Flex
            position="absolute"
            inset={0}
            align="center"
            justify="center"
            bg="dark.800"
            zIndex={1}
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

        {/* YouTube iframe embed */}
        <Box
          as="iframe"
          position="absolute"
          top={0}
          left={0}
          w="full"
          h="full"
          src={embedUrl}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
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
