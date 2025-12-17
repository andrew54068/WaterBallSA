'use client'

import React from 'react'
import Link from 'next/link'
import { Breadcrumb, Text, Icon, Box } from '@chakra-ui/react'

interface LessonBreadcrumbProps {
  curriculumId: number
  curriculumTitle: string
  chapterTitle: string
  lessonTitle: string
}

export default function LessonBreadcrumb({
  curriculumId,
  curriculumTitle,
  chapterTitle,
  lessonTitle,
}: LessonBreadcrumbProps) {
  const SeparatorIcon = () => (
    <Icon viewBox="0 0 24 24" boxSize={4} color="gray.600" flexShrink={0}>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </Icon>
  )

  return (
    <Breadcrumb.Root fontSize="sm" mb={6} overflowX="auto">
      {/* Curriculum Link */}
      <Breadcrumb.Item>
        <Box display="inline-flex" alignItems="center">
          <Link href={`/curriculums/${curriculumId}`}>
            <Text
              color="blue.400"
              _hover={{ color: 'blue.300', textDecoration: 'underline' }}
              transition="color 0.2s"
              whiteSpace="nowrap"
              as="span"
            >
              {curriculumTitle}
            </Text>
          </Link>
        </Box>
      </Breadcrumb.Item>

      <Breadcrumb.Separator>
        <SeparatorIcon />
      </Breadcrumb.Separator>

      {/* Chapter (non-clickable) */}
      <Breadcrumb.Item>
        <Text
          color="gray.400"
          whiteSpace="nowrap"
          lineClamp={1}
          maxW={{ base: '200px', md: 'none' }}
        >
          {chapterTitle}
        </Text>
      </Breadcrumb.Item>

      <Breadcrumb.Separator>
        <SeparatorIcon />
      </Breadcrumb.Separator>

      {/* Current Lesson (non-clickable, bold) */}
      <Breadcrumb.Item>
        <Breadcrumb.CurrentLink
          color="white"
          fontWeight="semibold"
          whiteSpace="nowrap"
          lineClamp={1}
          maxW={{ base: '200px', md: 'none' }}
        >
          {lessonTitle}
        </Breadcrumb.CurrentLink>
      </Breadcrumb.Item>
    </Breadcrumb.Root>
  )
}
