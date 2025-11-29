'use client'

import { Box, Flex, Text, Button } from "@chakra-ui/react"
import { GoogleLoginButton } from "./GoogleLoginButton"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="dark.900"
      zIndex={9999}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Flex
        direction="column"
        align="center"
        bg="dark.800"
        borderWidth="1px"
        borderColor="dark.600"
        borderRadius="2xl"
        p={12}
        maxW="500px"
        w="90%"
        gap={6}
      >
        {/* Logo */}
        <Flex align="center" gap={3}>
          <Box fontSize="3xl">💧</Box>
          <Box textAlign="left">
            <Text fontSize="lg" fontWeight="bold" color="white" lineHeight="tight">
              水球軟體學院
            </Text>
            <Text fontSize="sm" color="accent.yellow" fontWeight="medium" lineHeight="tight">
              WATERBALLSA.TW
            </Text>
          </Box>
        </Flex>

        {/* Title */}
        <Text
          fontSize="xl"
          fontWeight="bold"
          color="white"
          textAlign="center"
        >
          請選擇登入方式
        </Text>

        {/* Login Buttons */}
        <Flex direction="column" gap={4} w="full">
          {/* Facebook Login Button (Phase 2) */}
          <Button
            w="full"
            h="48px"
            bg="blue.600"
            color="white"
            fontSize="md"
            fontWeight="semibold"
            borderRadius="lg"
            _hover={{ bg: "blue.700" }}
            disabled
            opacity={0.5}
          >
            <Flex align="center" gap={2}>
              <Box as="span" fontSize="xl">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </Box>
              <span>使用 Facebook 登入</span>
            </Flex>
          </Button>

          {/* Google Login Button */}
          <Box w="full">
            <GoogleLoginButton width={400} />
          </Box>
        </Flex>
      </Flex>
    </Box>
  )
}
