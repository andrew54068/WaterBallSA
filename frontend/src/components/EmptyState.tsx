import { Box, Text } from '@chakra-ui/react'

export interface EmptyStateProps {
  message: string
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <Box
      bg="dark.800"
      rounded="2xl"
      p={12}
      borderWidth="1px"
      borderColor="dark.600"
      textAlign="center"
    >
      <Text color="gray.400" fontSize="lg">
        {message}
      </Text>
    </Box>
  )
}
