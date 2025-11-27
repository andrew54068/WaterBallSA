'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Box,
  VStack,
  Button,
  Flex,
  Text,
  Heading,
  Icon,
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

interface Lesson {
  id: number
  title: string
  lessonType: string
  durationMinutes?: number | null
  orderIndex?: number
}

interface Chapter {
  id: number
  title: string
  description?: string | null
  lessons: Lesson[]
  orderIndex?: number
}

interface ChapterAccordionProps {
  chapters: Chapter[]
  curriculumId: number
}

export function ChapterAccordion({ chapters, curriculumId }: ChapterAccordionProps) {
  const [openChapters, setOpenChapters] = useState<Set<number>>(new Set())

  const toggleChapter = (chapterId: number) => {
    setOpenChapters((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId)
      } else {
        newSet.add(chapterId)
      }
      return newSet
    })
  }

  return (
    <VStack gap={4} align="stretch">
      {chapters.map((chapter) => {
        const isOpen = openChapters.has(chapter.id)

        return (
          <Box
            key={chapter.id}
            bg="dark.800"
            borderRadius="xl"
            overflow="hidden"
            border="1px"
            borderColor="dark.600"
          >
            {/* Chapter Header */}
            <Button
              onClick={() => toggleChapter(chapter.id)}
              w="full"
              justifyContent="space-between"
              p={6}
              h="auto"
              bg="transparent"
              _hover={{ bg: 'dark.700' }}
              borderRadius={0}
              transition="all 0.2s"
            >
              <Heading as="h3" size="md" fontWeight="bold" color="white" textAlign="left">
                {chapter.title}
              </Heading>
              <Icon
                as={ChevronDownIcon}
                w={5}
                h={5}
                color="gray.400"
                transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
                transition="transform 0.2s"
              />
            </Button>

            {/* Chapter Content */}
            {isOpen && (
              <Box borderTop="1px" borderColor="dark.600" p={4}>
                <VStack gap={2} align="stretch">
                  {chapter.description && (
                    <Text color="gray.400" fontSize="sm" mb={4} px={2}>
                      {chapter.description}
                    </Text>
                  )}

                  {chapter.lessons.length === 0 ? (
                    <Text color="gray.500" fontSize="sm" px={2}>
                      尚無課程內容
                    </Text>
                  ) : (
                    chapter.lessons.map((lesson) => (
                      <Link
                        key={lesson.id}
                        href={`/course/${curriculumId}/chapters/${chapter.orderIndex}/lessons/${lesson.orderIndex}`}
                        passHref
                      >
                        <Flex
                          as="a"
                          align="center"
                          justify="space-between"
                          p={3}
                          _hover={{ bg: 'dark.700' }}
                          borderRadius="lg"
                          transition="all 0.2s"
                          role="group"
                        >
                          <Flex align="center" gap={3}>
                            <Text
                              color="gray.400"
                              _groupHover={{ color: 'accent.yellow' }}
                              transition="color 0.2s"
                            >
                              {lesson.lessonType === 'VIDEO' && '▶️'}
                              {lesson.lessonType === 'ARTICLE' && '📄'}
                              {lesson.lessonType === 'SURVEY' && '📝'}
                            </Text>
                            <Text
                              color="white"
                              _groupHover={{ color: 'accent.yellow' }}
                              transition="color 0.2s"
                            >
                              {lesson.title}
                            </Text>
                          </Flex>
                          {lesson.durationMinutes && (
                            <Text fontSize="sm" color="gray.500">
                              {lesson.durationMinutes} min
                            </Text>
                          )}
                        </Flex>
                      </Link>
                    ))
                  )}
                </VStack>
              </Box>
            )}
          </Box>
        )
      })}
    </VStack>
  )
}
