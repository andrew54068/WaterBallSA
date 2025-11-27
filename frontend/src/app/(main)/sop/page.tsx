import { Box, Container, Grid, Heading, Text, Flex } from '@chakra-ui/react'
import { BookOpenIcon } from '@heroicons/react/24/outline'

export default function SOPPage() {
  return (
    <Box as="main" minH="100vh" bg="dark.900">

      {/* Main Content */}
      <Container maxW="5xl" px={8} py={12}>
        {/* Header */}
        <Box textAlign="center" mb={12}>
          <Flex display="inline-flex" align="center" justify="center" w="20" h="20" bg="accent.yellow" opacity="0.1" rounded="2xl" mb={6}>
            <BookOpenIcon className="w-10 h-10 text-accent-yellow" />
          </Flex>
          <Heading as="h1" fontSize={{ base: '4xl', md: '5xl' }} fontWeight="bold" color="white" mb={4}>
            SOP 寶典
          </Heading>
          <Text fontSize="xl" color="gray.400">
            水球潘的標準作業程序與最佳實踐
          </Text>
        </Box>

        {/* Content Placeholder */}
        <Box bg="dark.800" rounded="2xl" p={12} borderWidth="1px" borderColor="dark.600" textAlign="center">
          <Box mb={6}>
            <Text fontSize="6xl">📚</Text>
          </Box>
          <Heading as="h2" fontSize="2xl" fontWeight="bold" color="white" mb={4}>
            內容即將推出
          </Heading>
          <Text color="gray.400" maxW="2xl" mx="auto" lineHeight="relaxed">
            SOP 寶典將包含軟體開發的標準作業流程、最佳實踐指南、以及團隊協作規範。
            敬請期待！
          </Text>
        </Box>

        {/* Future Sections Preview */}
        <Grid mt={12} templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
          <Box bg="dark.800" rounded="xl" p={6} borderWidth="1px" borderColor="dark.600">
            <Text fontSize="3xl" mb={3}>🔧</Text>
            <Heading as="h3" fontSize="lg" fontWeight="bold" color="white" mb={2}>開發流程</Heading>
            <Text fontSize="sm" color="gray.400">
              從需求分析到部署的完整開發流程 SOP
            </Text>
          </Box>

          <Box bg="dark.800" rounded="xl" p={6} borderWidth="1px" borderColor="dark.600">
            <Text fontSize="3xl" mb={3}>🎯</Text>
            <Heading as="h3" fontSize="lg" fontWeight="bold" color="white" mb={2}>最佳實踐</Heading>
            <Text fontSize="sm" color="gray.400">
              程式碼品質、測試策略、重構技巧
            </Text>
          </Box>

          <Box bg="dark.800" rounded="xl" p={6} borderWidth="1px" borderColor="dark.600">
            <Text fontSize="3xl" mb={3}>👥</Text>
            <Heading as="h3" fontSize="lg" fontWeight="bold" color="white" mb={2}>團隊協作</Heading>
            <Text fontSize="sm" color="gray.400">
              Code Review、Git 工作流、溝通技巧
            </Text>
          </Box>
        </Grid>
      </Container>
    </Box>
  )
}
