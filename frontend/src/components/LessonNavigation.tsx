'use client'

import React from 'react'
import Link from 'next/link'
import { Lesson } from '@/types'

interface LessonNavigationProps {
  currentLessonId: number
  lessons: Lesson[]
  curriculumId: number
}

export default function LessonNavigation({ currentLessonId, lessons, curriculumId }: LessonNavigationProps) {
  // Find current lesson index
  const currentIndex = lessons.findIndex(lesson => lesson.id === currentLessonId)

  // Determine previous and next lessons
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null

  // Calculate progress
  const progress = `${currentIndex + 1} of ${lessons.length}`

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-8">
      {/* Progress Indicator */}
      <div className="text-center mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Lesson Progress
        </p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {progress}
        </p>
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / lessons.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        {/* Previous Button */}
        {prevLesson ? (
          <Link
            href={`/course/${curriculumId}/chapters/${prevLesson.chapterId}/lessons/${prevLesson.orderIndex}`}
            className="flex-1 group"
          >
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors">
              <svg
                className="w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <div className="text-left min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Previous Lesson
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {prevLesson.title}
                </p>
              </div>
            </div>
          </Link>
        ) : (
          <div className="flex-1">
            <div className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg opacity-50 cursor-not-allowed">
              <svg
                className="w-6 h-6 text-gray-400 dark:text-gray-600 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <div className="text-left">
                <p className="text-xs text-gray-400 dark:text-gray-600 mb-1">
                  Previous Lesson
                </p>
                <p className="text-sm font-semibold text-gray-400 dark:text-gray-600">
                  No previous lesson
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Next Button */}
        {nextLesson ? (
          <Link
            href={`/course/${curriculumId}/chapters/${nextLesson.chapterId}/lessons/${nextLesson.orderIndex}`}
            className="flex-1 group"
          >
            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
              <div className="text-right min-w-0 flex-1">
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                  Next Lesson
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {nextLesson.title}
                </p>
              </div>
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors flex-shrink-0"
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
            </div>
          </Link>
        ) : (
          <div className="flex-1">
            <div className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg opacity-50 cursor-not-allowed">
              <div className="text-right flex-1">
                <p className="text-xs text-gray-400 dark:text-gray-600 mb-1">
                  Next Lesson
                </p>
                <p className="text-sm font-semibold text-gray-400 dark:text-gray-600">
                  No next lesson
                </p>
              </div>
              <svg
                className="w-6 h-6 text-gray-400 dark:text-gray-600 flex-shrink-0"
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
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
