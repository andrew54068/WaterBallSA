'use client'

import Link from 'next/link'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { Box, Flex, Text, Button, IconButton } from '@chakra-ui/react'

interface PromotionalBannerProps {
  hasCoupons?: boolean
  couponAmount?: number
  couponLink?: string
}

export function PromotionalBanner({
  hasCoupons = false,
  couponAmount = 3000,
  couponLink = '/journeys/software-design-pattern/chapters/8/missions/1',
}: PromotionalBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  // Only show banner if user has coupons
  if (!hasCoupons || !isVisible) return null

  return (
    <Box
      borderRadius="lg"
      borderWidth="1px"
      shadow="sm"
      m={4}
      p={4}
      bg="bg.surface"
      color="white"
      mb={0}
    >
      <Flex justify="space-between" align="center">
        <Box flex={1}>
          <Flex align="center" justify="space-between" gap={2}>
            <Link href={couponLink} style={{ textDecoration: 'none' }}>
              <Text
                fontSize={{ base: 'sm', md: 'base' }}
                textDecoration="underline"
                _hover={{ opacity: 0.8 }}
                transition="opacity 0.2s"
              >
                你有一張 {couponAmount.toLocaleString()} 折價券
              </Text>
            </Link>
            <Button
              size="sm"
              fontSize="sm"
              fontWeight="medium"
              bg="accent.yellow"
              color="dark.900"
              _hover={{ bg: 'accent.yellow-dark' }}
              px={3}
              borderRadius="md"
            >
              前往
            </Button>
          </Flex>
        </Box>
        <IconButton
          aria-label="Close banner"
          onClick={() => setIsVisible(false)}
          ml={4}
          size="sm"
          bg="transparent"
          _hover={{ bg: 'dark.700' }}
          transition="background 0.2s"
        >
          <XMarkIcon style={{ width: '20px', height: '20px' }} />
        </IconButton>
      </Flex>
    </Box>
  )
}
