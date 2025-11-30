'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { purchasesApi, OrderPreviewResponse } from '@/lib/api/purchases'
import { couponApi, CouponValidationResponse } from '@/lib/api/coupons'
import {
  Box,
  Flex,
  Text,
  Button,
  Input,
  Image,
  Badge,
  VStack,
  HStack,
  Separator,
  Spinner,
  Alert,
} from '@chakra-ui/react'
import Link from 'next/link'

export default function OrderConfirmationPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const curriculumId = parseInt(params.id as string)

  const [orderPreview, setOrderPreview] = useState<OrderPreviewResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [couponValidation, setCouponValidation] = useState<CouponValidationResponse | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)

  // Purchase state
  const [purchasing, setPurchasing] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/?redirect=/curriculums/${curriculumId}/orders`)
    }
  }, [authLoading, user, router, curriculumId])

  // Fetch order preview
  useEffect(() => {
    const fetchOrderPreview = async () => {
      if (!user) return

      try {
        setLoading(true)
        setError(null)
        const preview = await purchasesApi.getOrderPreview(curriculumId)
        setOrderPreview(preview)
      } catch (err: unknown) {
        console.error('Failed to fetch order preview:', err)

        // Type guard to check if error has response property
        const error = err as { response?: { data?: { error?: string; message?: string } } }

        if (error.response?.data?.error === 'ALREADY_OWNED') {
          // User already owns this curriculum, redirect to curriculum page
          router.push(`/curriculums/${curriculumId}`)
        } else if (error.response?.data?.error === 'FREE_CURRICULUM') {
          // Free curriculum, redirect to curriculum page
          router.push(`/curriculums/${curriculumId}`)
        } else {
          setError(error.response?.data?.message || 'Failed to load order preview. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchOrderPreview()
  }, [curriculumId, user, router])

  // Handle coupon validation
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponValidation({ valid: false, errorMessage: 'Please enter a coupon code' })
      return
    }

    try {
      setCouponLoading(true)
      const validation = await couponApi.validateCoupon(couponCode.trim())
      setCouponValidation(validation)

      if (validation.valid) {
        setAppliedCoupon(couponCode.trim())
      }
    } catch (err: unknown) {
      console.error('Failed to validate coupon:', err)
      const error = err as { response?: { data?: { message?: string } } }
      setCouponValidation({
        valid: false,
        errorMessage: error.response?.data?.message || 'Failed to validate coupon. Please try again.'
      })
    } finally {
      setCouponLoading(false)
    }
  }

  // Handle remove coupon
  const handleRemoveCoupon = () => {
    setCouponCode('')
    setAppliedCoupon(null)
    setCouponValidation(null)
  }

  // Handle confirm purchase (creates PENDING purchase)
  const handleConfirmPurchase = async () => {
    if (!orderPreview) return

    try {
      setPurchasing(true)
      setError(null)

      const purchase = await purchasesApi.create({
        curriculumId,
        couponCode: appliedCoupon || undefined
      })

      console.log('Purchase created (PENDING):', purchase)
      console.log('Purchase ID:', purchase.purchaseId)
      console.log('Curriculum ID:', curriculumId)

      const paymentUrl = `/curriculums/${curriculumId}/orders/${purchase.purchaseId}/payment`
      console.log('Redirecting to:', paymentUrl)

      // Redirect to payment page
      router.push(paymentUrl)
    } catch (err: unknown) {
      console.error('Failed to create purchase:', err)
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Failed to create purchase. Please try again.')
      setPurchasing(false)
    }
  }

  // Calculate final price
  const calculateFinalPrice = () => {
    if (!orderPreview) return 0
    if (!couponValidation?.valid) return orderPreview.originalPrice

    const { discountType, discountValue } = couponValidation
    if (!discountType || !discountValue) return orderPreview.originalPrice

    if (discountType === 'PERCENTAGE') {
      const discount = (orderPreview.originalPrice * discountValue) / 100
      return orderPreview.originalPrice - discount
    } else {
      // FIXED_AMOUNT
      return Math.max(0, orderPreview.originalPrice - discountValue)
    }
  }

  const calculateDiscount = () => {
    if (!orderPreview) return 0
    return orderPreview.originalPrice - calculateFinalPrice()
  }

  if (authLoading || loading) {
    return (
      <Flex align="center" justify="center" minH="100vh" bg="dark.900">
        <VStack gap={4}>
          <Spinner size="xl" color="accent.yellow" />
          <Text color="gray.400">Loading order details...</Text>
        </VStack>
      </Flex>
    )
  }

  if (error && !orderPreview) {
    return (
      <Flex align="center" justify="center" minH="100vh" bg="dark.900" p={6}>
        <Box maxW="md" w="full">
          <Alert.Root status="error" mb={6}>
            <Alert.Indicator />
            <Alert.Title>Error</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Root>
          <Button
            w="full"
            onClick={() => router.push('/')}
            bg="accent.yellow"
            color="dark.900"
            _hover={{ bg: 'accent.yellow-dark' }}
          >
            Back to Home
          </Button>
        </Box>
      </Flex>
    )
  }

  if (!orderPreview) return null

  const finalPrice = calculateFinalPrice()
  const discount = calculateDiscount()
  const difficultyLabels = {
    BEGINNER: '初級',
    INTERMEDIATE: '中級',
    ADVANCED: '高級',
  }
  const difficultyColors = {
    BEGINNER: 'teal',
    INTERMEDIATE: 'orange',
    ADVANCED: 'red',
  }

  return (
    <Box minH="100vh" bg="dark.900" py={20}>
      <Box maxW="7xl" mx="auto" px={6}>
        {/* Breadcrumb */}
        <Flex align="center" gap={2} mb={8} fontSize="sm" color="gray.400">
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Text _hover={{ color: 'accent.yellow' }}>Home</Text>
          </Link>
          <Text>/</Text>
          <Link href={`/curriculums/${curriculumId}`} style={{ textDecoration: 'none' }}>
            <Text _hover={{ color: 'accent.yellow' }}>{orderPreview.curriculum.title}</Text>
          </Link>
          <Text>/</Text>
          <Text color="white">Order Confirmation</Text>
        </Flex>

        {/* Page Title */}
        <Text fontSize="3xl" fontWeight="bold" color="white" mb={8}>
          Order Confirmation
        </Text>

        {/* Error Alert */}
        {error && (
          <Alert.Root status="error" mb={6}>
            <Alert.Indicator />
            <Alert.Title>Error</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Root>
        )}

        <Flex gap={8} direction={{ base: 'column', lg: 'row' }}>
          {/* Left Column - Curriculum Details */}
          <Box flex={2}>
            <Box bg="dark.800" borderRadius="2xl" p={8} borderWidth="2px" borderColor="dark.600">
              {/* Curriculum Header */}
              <Flex gap={6} mb={6}>
                {orderPreview.curriculum.thumbnailUrl && (
                  <Image
                    src={orderPreview.curriculum.thumbnailUrl}
                    alt={orderPreview.curriculum.title}
                    w="200px"
                    h="150px"
                    objectFit="cover"
                    borderRadius="xl"
                  />
                )}
                <VStack align="start" flex={1} gap={2}>
                  <Text fontSize="2xl" fontWeight="bold" color="white">
                    {orderPreview.curriculum.title}
                  </Text>
                  {orderPreview.curriculum.instructorName && (
                    <Text fontSize="sm" color="gray.400">
                      Instructor: {orderPreview.curriculum.instructorName}
                    </Text>
                  )}
                  {orderPreview.curriculum.difficultyLevel && (
                    <Badge
                      colorScheme={difficultyColors[orderPreview.curriculum.difficultyLevel as keyof typeof difficultyColors]}
                      fontSize="xs"
                      px={3}
                      py={1}
                      borderRadius="lg"
                    >
                      {difficultyLabels[orderPreview.curriculum.difficultyLevel as keyof typeof difficultyLabels] || orderPreview.curriculum.difficultyLevel}
                    </Badge>
                  )}
                </VStack>
              </Flex>

              {/* Description */}
              {orderPreview.curriculum.description && (
                <Text color="gray.300" mb={6} lineHeight="relaxed">
                  {orderPreview.curriculum.description}
                </Text>
              )}

              <Separator mb={6} />

              {/* Course Stats */}
              <Flex gap={6} mb={6} fontSize="sm" color="gray.400">
                <Flex align="center" gap={2}>
                  <Text fontWeight="semibold" color="white">{orderPreview.totalChapters}</Text>
                  <Text>Chapters</Text>
                </Flex>
                <Flex align="center" gap={2}>
                  <Text fontWeight="semibold" color="white">{orderPreview.totalLessons}</Text>
                  <Text>Lessons</Text>
                </Flex>
                {orderPreview.curriculum.estimatedDurationHours && (
                  <Flex align="center" gap={2}>
                    <Text fontWeight="semibold" color="white">{orderPreview.curriculum.estimatedDurationHours}</Text>
                    <Text>Hours</Text>
                  </Flex>
                )}
              </Flex>

              <Separator mb={6} />

              {/* Chapters & Lessons */}
              <Text fontSize="lg" fontWeight="bold" color="white" mb={4}>
                Course Content
              </Text>
              <VStack align="stretch" gap={4}>
                {orderPreview.chapters.map((chapter) => (
                  <Box key={chapter.id} bg="dark.700" p={4} borderRadius="lg">
                    <Text fontWeight="semibold" color="white" mb={2}>
                      Chapter {chapter.orderIndex + 1}: {chapter.title}
                    </Text>
                    {chapter.description && (
                      <Text fontSize="sm" color="gray.400" mb={3}>
                        {chapter.description}
                      </Text>
                    )}
                    <VStack align="stretch" gap={2} pl={4}>
                      {chapter.lessons.map((lesson) => (
                        <Flex key={lesson.id} align="center" gap={2} fontSize="sm">
                          <Badge
                            colorScheme={lesson.lessonType === 'VIDEO' ? 'blue' : lesson.lessonType === 'ARTICLE' ? 'green' : 'purple'}
                            fontSize="xs"
                            px={2}
                            py={0.5}
                          >
                            {lesson.lessonType}
                          </Badge>
                          <Text color="gray.300" flex={1}>
                            {lesson.title}
                          </Text>
                          {lesson.durationMinutes && (
                            <Text color="gray.500" fontSize="xs">
                              {lesson.durationMinutes} min
                            </Text>
                          )}
                          {lesson.isFreePreview && (
                            <Badge colorScheme="green" fontSize="xs">
                              FREE
                            </Badge>
                          )}
                        </Flex>
                      ))}
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </Box>
          </Box>

          {/* Right Column - Pricing & Checkout */}
          <Box flex={1}>
            <Box bg="dark.800" borderRadius="2xl" p={6} borderWidth="2px" borderColor="dark.600" position="sticky" top="80px">
              <Text fontSize="xl" fontWeight="bold" color="white" mb={6}>
                Order Summary
              </Text>

              {/* Pricing Breakdown */}
              <VStack align="stretch" gap={3} mb={6}>
                <Flex justify="space-between">
                  <Text color="gray.400">Original Price</Text>
                  <Text color="white" fontWeight="semibold">
                    {orderPreview.curriculum.currency} ${orderPreview.originalPrice.toFixed(2)}
                  </Text>
                </Flex>
                {discount > 0 && (
                  <Flex justify="space-between" color="green.400">
                    <Text>
                      Discount
                      {couponValidation?.discountType === 'PERCENTAGE' && couponValidation.discountValue &&
                        ` (${couponValidation.discountValue}%)`
                      }
                    </Text>
                    <Text fontWeight="semibold">
                      - ${discount.toFixed(2)}
                    </Text>
                  </Flex>
                )}
                <Separator />
                <Flex justify="space-between" fontSize="lg">
                  <Text color="white" fontWeight="bold">Total</Text>
                  <Text color="accent.yellow" fontWeight="bold">
                    {orderPreview.curriculum.currency} ${finalPrice.toFixed(2)}
                  </Text>
                </Flex>
              </VStack>

              <Separator mb={6} />

              {/* Coupon Section */}
              <Box mb={6}>
                <Text fontSize="sm" fontWeight="semibold" color="white" mb={2}>
                  Have a coupon code?
                </Text>
                {appliedCoupon ? (
                  <Flex align="center" gap={2} bg="green.900" p={3} borderRadius="lg" borderWidth="1px" borderColor="green.700">
                    <Text color="green.300" fontSize="sm" flex={1}>
                      Coupon "{appliedCoupon}" applied
                    </Text>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleRemoveCoupon}
                      color="green.300"
                      _hover={{ color: 'green.200' }}
                    >
                      Remove
                    </Button>
                  </Flex>
                ) : (
                  <VStack align="stretch" gap={2}>
                    <Flex gap={2}>
                      <Input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        bg="dark.700"
                        borderColor="dark.600"
                        color="white"
                        _focus={{ borderColor: 'accent.yellow' }}
                        disabled={couponLoading}
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        isLoading={couponLoading}
                        bg="accent.yellow"
                        color="dark.900"
                        _hover={{ bg: 'accent.yellow-dark' }}
                        px={6}
                      >
                        Apply
                      </Button>
                    </Flex>
                    {couponValidation && !couponValidation.valid && (
                      <Text color="red.400" fontSize="sm">
                        {couponValidation.errorMessage || 'Invalid coupon code'}
                      </Text>
                    )}
                  </VStack>
                )}
              </Box>

              <Separator mb={6} />

              {/* Action Buttons */}
              <VStack align="stretch" gap={3}>
                <Button
                  w="full"
                  size="lg"
                  onClick={handleConfirmPurchase}
                  isLoading={purchasing}
                  bg="accent.yellow"
                  color="dark.900"
                  fontWeight="bold"
                  _hover={{ bg: 'accent.yellow-dark' }}
                >
                  Confirm Purchase - ${finalPrice.toFixed(2)}
                </Button>
                <Button
                  w="full"
                  variant="ghost"
                  onClick={() => router.push(`/curriculums/${curriculumId}`)}
                  color="gray.400"
                  _hover={{ color: 'white', bg: 'dark.700' }}
                >
                  Cancel
                </Button>
              </VStack>

              {/* Info Text */}
              <Text fontSize="xs" color="gray.500" mt={4} textAlign="center">
                By confirming, you agree to our Terms of Service and Privacy Policy
              </Text>
            </Box>
          </Box>
        </Flex>
      </Box>
    </Box>
  )
}
