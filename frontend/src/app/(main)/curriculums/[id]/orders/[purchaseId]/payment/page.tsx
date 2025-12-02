'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { purchasesApi, PurchaseResponse } from '@/lib/api/purchases'
import {
  Box,
  Flex,
  Text,
  Link,
  Button,
  VStack,
  HStack,
  Spinner,
  Alert,
  Separator,
  For,
  Collapsible,
} from '@chakra-ui/react'

type PaymentMethod = 'atm' | 'credit_once' | 'credit_installment'

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const curriculumId = parseInt(params.id as string)
  const purchaseId = parseInt(params.purchaseId as string)

  const [purchase, setPurchase] = useState<PurchaseResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('atm')
  const [paying, setPaying] = useState(false)
  const [invoiceOpen, setInvoiceOpen] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/?redirect=/curriculums/${curriculumId}/orders/${purchaseId}/payment`)
    }
  }, [authLoading, user, router, curriculumId, purchaseId])

  // Fetch purchase details
  useEffect(() => {
    const fetchPurchase = async () => {
      if (!user) return

      try {
        setLoading(true)
        setError(null)
        const data = await purchasesApi.getById(purchaseId)

        // Check if purchase is already completed
        if (data.status === 'COMPLETED') {
          router.push(`/curriculums/${curriculumId}?purchased=true`)
          return
        }

        setPurchase(data)
      } catch (err: unknown) {
        console.error('Failed to fetch purchase:', err)
        const error = err as { response?: { data?: { message?: string } } }
        setError(error.response?.data?.message || '無法載入訂單資訊，請稍後再試')
      } finally {
        setLoading(false)
      }
    }

    fetchPurchase()
  }, [purchaseId, user, router, curriculumId])

  // Handle payment
  const handleProceedPayment = async () => {
    if (!purchase) return

    try {
      setPaying(true)
      setError(null)

      // Phase 2: Mock payment - always succeeds regardless of method
      await purchasesApi.completePurchase(purchaseId)

      console.log('Payment completed with method:', selectedMethod)

      // Redirect to curriculum page with success message
      router.push(`/curriculums/${curriculumId}?purchased=true`)
    } catch (err: unknown) {
      console.error('Failed to complete payment:', err)
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || '無法完成付款，請稍後再試')
      setPaying(false)
    }
  }

  // Calculate payment deadline (3 days from creation)
  const getPaymentDeadline = () => {
    if (!purchase?.createdAt) return ''
    const deadline = new Date(purchase.createdAt)
    deadline.setDate(deadline.getDate() + 3)
    return deadline.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  if (authLoading || loading) {
    return (
      <Flex align="center" justify="center" minH="100vh" bg="dark.900">
        <VStack gap={4}>
          <Spinner size="xl" color="accent.yellow" />
          <Text color="gray.400">載入付款資訊...</Text>
        </VStack>
      </Flex>
    )
  }

  if (error && !purchase) {
    return (
      <Flex align="center" justify="center" minH="100vh" bg="dark.900" p={6}>
        <Box maxW="md" w="full">
          <Alert.Root status="error" mb={6}>
            <Alert.Indicator />
            <Alert.Title>錯誤</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Root>
          <Button
            w="full"
            onClick={() => router.push('/')}
            bg="accent.yellow"
            color="dark.900"
            _hover={{ bg: 'accent.yellow-dark' }}
          >
            返回首頁
          </Button>
        </Box>
      </Flex>
    )
  }

  if (!purchase) return null

  const paymentMethods = [
    { id: 'atm' as PaymentMethod, label: 'ATM 匯款', icon: '🏧' },
    { id: 'credit_once' as PaymentMethod, label: '信用卡（一次付清）', icon: '💳' },
    { id: 'credit_installment' as PaymentMethod, label: '銀角零卡分期', icon: '📱' },
  ]

  return (
    <Box minH="100vh" bg="dark.900" py={20}>
      <Box maxW="4xl" mx="auto" px={6}>
        {/* Progress Stepper */}
        <Flex justify="space-between" align="center" mb={12} position="relative">
          {/* Background Line */}
          <Box
            position="absolute"
            top="50%"
            left="10%"
            right="10%"
            h="2px"
            bg="dark.600"
            transform="translateY(-50%)"
            zIndex={0}
          />

          <For each={[
            { num: 1, label: '建立訂單', active: true, completed: true },
            { num: 2, label: '完成支付', active: true, completed: false },
            { num: 3, label: '約定開學', active: false, completed: false },
          ]}>
            {(step) => (
              <VStack key={step.num} gap={2} flex={1} position="relative" zIndex={1}>
                <Flex
                  align="center"
                  justify="center"
                  w="48px"
                  h="48px"
                  borderRadius="full"
                  bg={step.active ? 'blue.500' : step.completed ? 'blue.500' : 'dark.600'}
                  color="white"
                  fontWeight="bold"
                  fontSize="xl"
                >
                  {step.num}
                </Flex>
                <Text
                  fontSize="sm"
                  color={step.active ? 'white' : 'gray.500'}
                  fontWeight={step.active ? 'semibold' : 'normal'}
                >
                  {step.label}
                </Text>
              </VStack>
            )}
          </For>
        </Flex>

        {/* Order Details */}
        <Box bg="dark.800" borderRadius="2xl" p={8} borderWidth="2px" borderColor="dark.600" mb={6}>
          <Flex justify="space-between" align="start" mb={4}>
            <Box>
              <Text fontSize="sm" color="gray.400" mb={1}>訂單編號：</Text>
              <Text fontSize="lg" fontWeight="semibold" color="white">
                {purchase.purchaseId.toString().padStart(16, '2025120100')}
              </Text>
            </Box>
            <Box textAlign="right">
              <Text fontSize="sm" color="gray.400" mb={1}>付款截止時間：</Text>
              <Text fontSize="lg" fontWeight="semibold" color="accent.yellow">
                {getPaymentDeadline()}
              </Text>
            </Box>
          </Flex>
        </Box>

        {/* Payment Instructions */}
        <Box bg="dark.800" borderRadius="2xl" p={8} borderWidth="2px" borderColor="dark.600" mb={6}>
          <Text fontSize="xl" fontWeight="bold" color="white" mb={4}>
            付款說明
          </Text>
          <Text color="gray.300" lineHeight="relaxed">
            恭喜你，訂單已建立完成，請你於三日內付款。
          </Text>
        </Box>

        {/* Payment Method Selection */}
        <Box bg="dark.800" borderRadius="2xl" p={8} borderWidth="2px" borderColor="dark.600" mb={6}>
          <Text fontSize="xl" fontWeight="bold" color="white" mb={4}>
            付款方式
          </Text>
          <Text fontSize="sm" color="gray.400" mb={4}>
            選取付款方式
          </Text>

          {/* Error Alert */}
          {error && (
            <Alert.Root status="error" mb={4}>
              <Alert.Indicator />
              <Alert.Title>錯誤</Alert.Title>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Root>
          )}

          <VStack align="stretch" gap={3}>
            <For each={paymentMethods}>
              {(method) => (
                <Box
                  key={method.id}
                  p={4}
                  borderRadius="lg"
                  borderWidth="2px"
                  borderColor={selectedMethod === method.id ? 'blue.500' : 'dark.600'}
                  bg={selectedMethod === method.id ? 'dark.700' : 'dark.900'}
                  cursor="pointer"
                  onClick={() => setSelectedMethod(method.id)}
                  transition="all 0.2s"
                  _hover={{ borderColor: 'blue.400' }}
                >
                  <HStack gap={3}>
                    <Text fontSize="2xl">{method.icon}</Text>
                    <Text color="white" fontWeight="medium">
                      {method.label}
                    </Text>
                  </HStack>
                </Box>
              )}
            </For>
          </VStack>
        </Box>

        {/* Invoice Information */}
        <Box bg="dark.800" borderRadius="2xl" borderWidth="2px" borderColor="dark.600" mb={6}>
          <Collapsible.Root open={invoiceOpen} onOpenChange={(e) => setInvoiceOpen(e.open)}>
            <Collapsible.Trigger asChild>
              <Button
                w="full"
                variant="ghost"
                justifyContent="space-between"
                p={6}
                color="white"
                _hover={{ bg: 'dark.700' }}
              >
                <Text fontSize="lg" fontWeight="semibold">
                  發票資訊（選填）
                </Text>
                <Text fontSize="xl" transform={invoiceOpen ? 'rotate(180deg)' : 'rotate(0deg)'} transition="transform 0.2s">
                  ▼
                </Text>
              </Button>
            </Collapsible.Trigger>
            <Collapsible.Content>
              <Box p={6} pt={0}>
                <Text color="gray.400" fontSize="sm">
                  發票資訊為選填項目，如不填寫將開立電子發票至您的註冊信箱。
                </Text>
              </Box>
            </Collapsible.Content>
          </Collapsible.Root>
        </Box>

        {/* Action Button */}
        <Button
          w="full"
          size="lg"
          onClick={handleProceedPayment}
          loading={paying}
          bg="blue.500"
          color="white"
          fontWeight="bold"
          fontSize="lg"
          py={7}
          _hover={{ bg: 'blue.600' }}
          mb={4}
        >
          進行支付
        </Button>

        {/* Footer Info */}
        <Box textAlign="center">
          <Text fontSize="xs" color="gray.500" mb={2}>
            付款後的平日一天內（假日則一至兩個天內）會立即幫您封帳，若對帳無誤則會於約定之開學日期為您啟動此帳號的正式使用資格，也會透過電子郵件來引導您享受此旅程。
          </Text>
          <Text fontSize="xs" color="gray.500" mb={2}>
            若您有其他購買相關的問題，歡迎信至{' '}
            <Text as="span" color="blue.400">
              sales@waterballsa.tw
            </Text>{' '}
            詢問。
          </Text>
          <Flex justify="center" align="center" gap={2}>
            <Text fontSize="xs" color="blue.400">▶</Text>
            <Link
              href="#"
              fontSize="xs"
              color="blue.400"
              textDecoration="underline"
              _hover={{ color: 'blue.300' }}
            >
              網際網路課程購買暨服務契約
            </Link>
          </Flex>
        </Box>
      </Box>
    </Box>
  )
}
