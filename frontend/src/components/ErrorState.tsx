import { Box, Button, Flex, Text } from '@chakra-ui/react'

export interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Box
      bg="red.900"
      opacity="0.2"
      borderWidth="1px"
      borderColor="red.500"
      rounded="lg"
      p={6}
    >
      <Flex direction="column" align="center" gap={4}>
        <Text color="red.400" fontSize="lg" fontWeight="medium" textAlign="center">
          {message}
        </Text>
        {onRetry && (
          <Button
            onClick={onRetry}
            px={6}
            py={3}
            bg="accent.yellow"
            color="dark.900"
            rounded="lg"
            fontWeight="bold"
            _hover={{ bg: 'accent.yellow-dark' }}
            transition="all 0.2s"
          >
            重試
          </Button>
        )}
      </Flex>
    </Box>
  )
}
