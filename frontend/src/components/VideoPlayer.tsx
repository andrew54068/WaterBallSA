'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Box, Flex, Text, Button, Icon } from '@chakra-ui/react'
import { useVideoProgress } from '@/hooks/useVideoProgress'

interface VideoPlayerProps {
  videoUrl: string
  title: string
  lessonId?: number
  duration?: number
  isAuthenticated?: boolean
}

/**
 * Extracts YouTube video ID from various URL formats
 */
function getYouTubeVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url)

    // Handle youtube.com/watch?v=VIDEO_ID format
    if (urlObj.hostname.includes('youtube.com')) {
      const videoId = urlObj.searchParams.get('v')
      if (videoId) {
        return videoId
      }
    }

    // Handle youtu.be/VIDEO_ID format
    if (urlObj.hostname.includes('youtu.be')) {
      const videoId = urlObj.pathname.slice(1).split('?')[0]
      if (videoId) {
        return videoId
      }
    }

    return null
  } catch (error) {
    console.error('Invalid YouTube URL:', url, error)
    return null
  }
}

export default function VideoPlayer({
  videoUrl,
  title,
  lessonId,
  duration,
  isAuthenticated = false,
}: VideoPlayerProps) {
  const [isPlayerReady, setIsPlayerReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const playerRef = useRef<YT.Player | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const playerInitializedRef = useRef(false)

  // Video ID extraction
  const videoId = useMemo(() => {
    const id = getYouTubeVideoId(videoUrl)
    if (!id) {
      setError('Invalid YouTube URL format')
    }
    return id
  }, [videoUrl])

  // Progress tracking hook (only if lessonId is provided)
  const { progress, isLoading: isProgressLoading, initializePlayer, cleanup } = useVideoProgress({
    lessonId: lessonId || 0,
    isAuthenticated: isAuthenticated && !!lessonId
  })

  // Store latest hook functions in refs to avoid recreating player
  const initializePlayerRef = useRef(initializePlayer)
  const cleanupRef = useRef(cleanup)

  // Keep refs up to date
  useEffect(() => {
    initializePlayerRef.current = initializePlayer
    cleanupRef.current = cleanup
  }, [initializePlayer, cleanup])

  /**
   * Initialize YouTube Player
   */
  useEffect(() => {
    if (!videoId || !containerRef.current || playerInitializedRef.current) {
      return
    }

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) {
        // YT API not ready yet, retry after a delay
        setTimeout(initPlayer, 100)
        return
      }

      try {
        playerRef.current = new window.YT.Player(containerRef.current!, {
          height: '100%',
          width: '100%',
          videoId: videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            rel: 0,
            modestbranding: 1,
            enablejsapi: 1,
          },
          events: {
            onReady: (event) => {
              console.log('[VideoPlayer] YouTube player ready')
              setIsPlayerReady(true)
              setError(null)

              // Initialize progress tracking (only if authenticated and lessonId provided)
              if (isAuthenticated && lessonId) {
                console.log('[VideoPlayer] Initializing progress tracking for lesson', lessonId)
                initializePlayerRef.current(event.target)
              } else {
                console.log('[VideoPlayer] Skipping progress tracking:', {
                  isAuthenticated,
                  lessonId,
                })
              }
            },
            onError: (event) => {
              console.error('YouTube Player Error:', event.data)
              setError('Video unavailable. Please try again later.')
            },
          },
        })

        playerInitializedRef.current = true
      } catch (err) {
        console.error('Failed to initialize YouTube Player:', err)
        setError('Failed to load video player')
      }
    }

    initPlayer()

    return () => {
      cleanupRef.current()
      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }
      playerInitializedRef.current = false
    }
  }, [videoId, lessonId, isAuthenticated])

  const handleRetry = () => {
    setError(null)
    playerInitializedRef.current = false
    window.location.reload()
  }

  if (error || !videoId) {
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
        {!isPlayerReady && (
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
                {isProgressLoading && isAuthenticated && ' (Restoring progress...)'}
              </Text>
            </Flex>
          </Flex>
        )}

        {/* YouTube Player Container */}
        <Box
          ref={containerRef}
          position="absolute"
          top={0}
          left={0}
          w="full"
          h="full"
        />
      </Box>

      {/* Video metadata */}
      <Flex mt={2} justify="space-between" align="center">
        {duration && (
          <Text fontSize="sm" color="gray.400">
            Duration: {duration} minutes
          </Text>
        )}
        {isAuthenticated && progress && (
          <Text fontSize="sm" color="gray.400">
            {progress.isCompleted ? (
              <Text as="span" color="green.400">
                ✓ Completed
              </Text>
            ) : (
              `Progress: ${progress.completionPercentage}%`
            )}
          </Text>
        )}
      </Flex>
    </Box>
  )
}
