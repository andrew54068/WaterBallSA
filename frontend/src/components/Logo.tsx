'use client'

import Link from 'next/link'
import { Box, Flex, Text } from '@chakra-ui/react'

export function Logo() {
  return (
    <Link href="/" style={{ textDecoration: 'none' }}>
      <Flex align="center" gap={3} _hover={{ opacity: 0.8 }} transition="opacity 0.2s" cursor="pointer">
        <Box
          w="32px"
          h="32px"
          bgGradient="linear(to-br, accent.yellow, accent.yellow-dark)"
          borderRadius="lg"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text color="dark.900" fontWeight="bold" fontSize="lg">
            水
          </Text>
        </Box>
        <Flex direction="column">
          <Text color="white" fontWeight="bold" fontSize="sm" lineHeight="tight">
            水球軟體學院
          </Text>
          <Text fontSize="xs" color="accent.yellow" fontWeight="medium">
            WATERBALLSA.TW
          </Text>
        </Flex>
      </Flex>
    </Link>
  )
}
