'use client'

import { useEffect, useState } from 'react'
import { Box, Container, Flex, Heading, Text, Spinner, Badge } from '@chakra-ui/react'
import { purchasesApi, PurchaseResponse } from '@/lib/api/purchases'


export function OrderHistory() {
    const [orders, setOrders] = useState<PurchaseResponse[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await purchasesApi.getMyPurchases({ size: 100 })
                setOrders(response.content)
            } catch (err) {
                // If 401, it means user is not logged in, which is fine, just show empty or nothing
                // But for now, let's just log it and show empty
                console.error('Failed to fetch orders:', err)
                // setError('無法載入訂單紀錄')
            } finally {
                setIsLoading(false)
            }
        }

        // Check if user is logged in (has token) before fetching
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
        if (token) {
            fetchOrders()
        } else {
            setIsLoading(false)
        }
    }, [])

    if (isLoading) {
        return (
            <Box as="section" py={12} px={8}>
                <Container maxW="7xl">
                    <Box bg="dark.800" rounded="2xl" p={8} borderWidth="1px" borderColor="dark.600" textAlign="center">
                        <Spinner color="brand.500" />
                    </Box>
                </Container>
            </Box>
        )
    }

    // If no orders and no error, maybe user is not logged in or just hasn't bought anything.
    // The original design showed the section even if empty.
    // If user is not logged in, maybe we shouldn't show this section? 
    // For now, I will stick to the existing design which shows the section.

    return (
        <Box as="section" py={12} px={8}>
            <Container maxW="7xl">
                <Box bg="dark.800" rounded="2xl" p={8} borderWidth="1px" borderColor="dark.600">
                    {/* Header */}
                    <Flex align="center" mb={6}>
                        <Text fontSize="2xl" mr={3}>📋</Text>
                        <Heading as="h2" fontSize="2xl" fontWeight="bold" color="white">訂單紀錄</Heading>
                    </Flex>

                    {/* Empty State */}
                    {orders.length === 0 ? (
                        <Box py={12} textAlign="center">
                            <Text color="gray.400" fontSize="lg">目前沒有訂單紀錄</Text>
                        </Box>
                    ) : (
                        <Flex direction="column" gap={4}>
                            {orders.map((order) => (
                                <Box key={order.purchaseId} bg="dark.700" p={4} rounded="lg">
                                    <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                                        <Box>
                                            <Text color="white" fontWeight="bold" fontSize="lg" mb={1}>
                                                {order.curriculumTitle}
                                            </Text>
                                            <Text color="gray.400" fontSize="sm">
                                                {order.purchasedAt ? new Date(order.purchasedAt).toLocaleString('zh-TW', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                }) : '處理中'}
                                            </Text>
                                        </Box>
                                        <Flex align="center" gap={4}>
                                            <Badge
                                                colorScheme={
                                                    order.status === 'COMPLETED' ? 'green' :
                                                        order.status === 'PENDING' ? 'yellow' : 'red'
                                                }
                                            >
                                                {order.status === 'COMPLETED' ? '已完成' :
                                                    order.status === 'PENDING' ? '待付款' : '已取消'}
                                            </Badge>
                                            <Text color="brand.400" fontWeight="bold" fontSize="xl">
                                                NT$ {order.finalPrice}
                                            </Text>
                                        </Flex>
                                    </Flex>
                                </Box>
                            ))}
                        </Flex>
                    )}
                </Box>
            </Container>
        </Box>
    )
}
