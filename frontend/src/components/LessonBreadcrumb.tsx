'use client'

import React from 'react'
import Link from 'next/link'

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
  return (
    <nav className="flex items-center space-x-2 text-sm mb-6 overflow-x-auto">
      {/* Curriculum Link */}
      <Link
        href={`/curriculums/${curriculumId}`}
        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors whitespace-nowrap"
      >
        {curriculumTitle}
      </Link>

      {/* Separator */}
      <svg
        className="w-4 h-4 text-gray-400 dark:text-gray-600 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>

      {/* Chapter (non-clickable) */}
      <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap truncate max-w-[200px] md:max-w-none">
        {chapterTitle}
      </span>

      {/* Separator */}
      <svg
        className="w-4 h-4 text-gray-400 dark:text-gray-600 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>

      {/* Current Lesson (non-clickable, bold) */}
      <span className="text-gray-900 dark:text-white font-semibold whitespace-nowrap truncate max-w-[200px] md:max-w-none">
        {lessonTitle}
      </span>
    </nav>
  )
}
