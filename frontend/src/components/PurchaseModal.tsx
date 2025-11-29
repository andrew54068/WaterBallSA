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
    <DialogRoot open={isOpen} onOpenChange={({ open }) => !open && onClose()} size="lg" placement="center">
      <DialogBackdrop backdropFilter="blur(4px)" />
      <DialogContent bg="gray.800" borderColor="gray.700" borderWidth="1px">
        <DialogHeader color="white">Purchase Curriculum</DialogHeader>
        <DialogCloseTrigger color="gray.400" />

        <DialogBody>
          <Box mb={6}>
            <Text color="gray.400" mb={4}>
              You are about to purchase:
            </Text>

            <Box
              bg="gray.700"
              p={4}
              borderRadius="md"
              borderWidth="1px"
              borderColor="gray.600"
            >
              <Heading as="h3" fontSize="lg" color="white" mb={2}>
                {curriculumTitle}
              </Heading>
              <Flex justify="space-between" align="center">
                <Text color="gray.400" fontSize="sm">
                  Price:
                </Text>
                <Text color="blue.400" fontSize="2xl" fontWeight="bold">
                  {formatPrice(curriculumPrice)}
                </Text>
              </Flex>
            </Box>
          </Box>

          <Box
            bg="blue.900"
            borderColor="blue.700"
            borderWidth="1px"
            p={4}
            borderRadius="md"
            mb={4}
          >
            <Text color="blue.200" fontSize="sm">
              <strong>What you'll get:</strong>
            </Text>
            <Text color="blue.300" fontSize="sm" mt={2}>
              • Unlimited access to all lessons
              <br />
              • Lifetime access to course materials
              <br />• Future updates and new content
            </Text>
          </Box>

          <Text color="gray.500" fontSize="xs" textAlign="center">
            Phase 2: Simplified mock payment (instant completion)
          </Text>
        </DialogBody>

        <DialogFooter>
          <Button variant="ghost" mr={3} onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handlePurchase}
            loading={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Complete Purchase'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}
