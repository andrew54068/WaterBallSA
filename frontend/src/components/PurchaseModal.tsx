'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DialogRoot,
  DialogBackdrop,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  Button,
  Text,
  Box,
  Flex,
  Heading,
} from '@chakra-ui/react'
import { createToaster } from '@chakra-ui/react/toast'
import { purchasesApi } from '@/lib/api/purchases'
import { returnUrlUtils } from '@/lib/utils/returnUrl'

const toaster = createToaster({
  placement: 'top',
  duration: 5000,
})

interface PurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  curriculumId: number
  curriculumTitle: string
  curriculumPrice: number
  onPurchaseSuccess?: () => void
}

export default function PurchaseModal({
  isOpen,
  onClose,
  curriculumId,
  curriculumTitle,
  curriculumPrice,
  onPurchaseSuccess,
}: PurchaseModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const formatPrice = (price: number): string => {
    if (price === 0) {
      return 'Free'
    }
    return `NT$${price.toLocaleString()}`
  }

  const handlePurchase = async () => {
    try {
      setIsProcessing(true)

      // Call purchase API (simplified Phase 2 - instant completion)
      const response = await purchasesApi.create({
        curriculumId,
      })

      // Dispatch custom event for cache invalidation (useOwnership listens to this)
      window.dispatchEvent(
        new CustomEvent('curriculum-purchased', {
          detail: { curriculumId },
        })
      )

      // Clear ownership cache
      sessionStorage.removeItem('ownership_cache')

      // Show success message
      toaster.create({
        title: 'Purchase Successful!',
        description: `You now have access to all lessons in "${curriculumTitle}"`,
        type: 'success',
        duration: 5000,
      })

      // Call success callback to refresh access control
      if (onPurchaseSuccess) {
        onPurchaseSuccess()
      }

      // Close modal
      onClose()

      // Handle post-purchase redirect
      const returnUrl = returnUrlUtils.get()
      if (returnUrl && returnUrlUtils.isSafeURL(returnUrl)) {
        console.log('[PurchaseModal] Redirecting to:', returnUrl)
        returnUrlUtils.clear()
        router.push(returnUrl)
      } else {
        // If no return URL, stay on current page (already have access now)
        returnUrlUtils.clear()
      }
    } catch (error: any) {
      console.error('Purchase failed:', error)

      // Handle specific error types
      let errorMessage = 'Failed to complete purchase. Please try again.'

      if (error?.response?.status === 409) {
        errorMessage = 'You already own this curriculum!'
      } else if (error?.response?.status === 401) {
        errorMessage = 'Please sign in to purchase this curriculum.'
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      }

      toaster.create({
        title: 'Purchase Failed',
        description: errorMessage,
        type: 'error',
        duration: 5000,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <DialogRoot open={isOpen} onOpenChange={({ open }) => !open && onClose()} size="xl" placement="center">
      <DialogBackdrop backdropFilter="blur(8px)" bg="blackAlpha.700" />
      <DialogContent
        bg="gray.800"
        borderColor="gray.700"
        borderWidth="1px"
        borderRadius="xl"
        shadow="2xl"
        maxW="600px"
      >
        <DialogHeader
          color="white"
          fontSize="2xl"
          fontWeight="bold"
          pt={8}
          px={8}
          pb={4}
        >
          Purchase Curriculum
        </DialogHeader>
        <DialogCloseTrigger color="gray.400" top={6} right={6} />

        <DialogBody px={8} py={6}>
          <Box mb={8}>
            <Text color="gray.400" mb={6} fontSize="md">
              You are about to purchase:
            </Text>

            <Box
              bg="gray.700"
              p={6}
              borderRadius="lg"
              borderWidth="1px"
              borderColor="gray.600"
              shadow="md"
              mb={6}
            >
              <Heading as="h3" fontSize="xl" color="white" mb={4}>
                {curriculumTitle}
              </Heading>
              <Flex justify="space-between" align="center">
                <Text color="gray.400" fontSize="md">
                  Price:
                </Text>
                <Text color="blue.400" fontSize="3xl" fontWeight="bold">
                  {formatPrice(curriculumPrice)}
                </Text>
              </Flex>
            </Box>
          </Box>

          <Box
            bg="blue.900"
            borderColor="blue.700"
            borderWidth="1px"
            p={6}
            borderRadius="lg"
            mb={6}
            shadow="md"
          >
            <Text color="blue.200" fontSize="md" fontWeight="bold" mb={4}>
              What you&apos;ll get:
            </Text>
            <Box color="blue.300" fontSize="md" lineHeight="1.8">
              <Flex align="flex-start" mb={2}>
                <Text mr={2}>•</Text>
                <Text>Unlimited access to all lessons</Text>
              </Flex>
              <Flex align="flex-start" mb={2}>
                <Text mr={2}>•</Text>
                <Text>Lifetime access to course materials</Text>
              </Flex>
              <Flex align="flex-start">
                <Text mr={2}>•</Text>
                <Text>Future updates and new content</Text>
              </Flex>
            </Box>
          </Box>

          <Text color="gray.500" fontSize="xs" textAlign="center" fontStyle="italic">
            Phase 2: Simplified mock payment (instant completion)
          </Text>
        </DialogBody>

        <DialogFooter
          px={8}
          py={6}
          gap={3}
          borderTopWidth="1px"
          borderTopColor="gray.700"
        >
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isProcessing}
            size="lg"
            px={8}
            _hover={{ bg: 'gray.700' }}
          >
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handlePurchase}
            loading={isProcessing}
            size="lg"
            px={10}
            fontWeight="bold"
          >
            {isProcessing ? 'Processing...' : 'Complete Purchase'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}
