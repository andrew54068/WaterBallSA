import { Box, Grid, keyframes } from '@chakra-ui/react'

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`

export function LoadingState() {
  return (
    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={8}>
      {[1, 2].map((i) => (
        <Box
          key={i}
          bg="dark.800"
          rounded="2xl"
          p={6}
          borderWidth="1px"
          borderColor="dark.600"
          animation={`${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`}
        >
          <Box h={6} bg="dark.700" rounded="md" mb={4} />
          <Box h={4} bg="dark.700" rounded="md" mb={2} />
          <Box h={4} bg="dark.700" rounded="md" w="75%" />
        </Box>
      ))}
    </Grid>
  )
}
