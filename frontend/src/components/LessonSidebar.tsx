'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDownIcon, LockClosedIcon, CheckCircleIcon, PlayIcon } from '@heroicons/react/24/solid'

interface Lesson {
  id: number
  title: string
  lessonType: string
  isFree?: boolean
  isCompleted?: boolean
}

interface Chapter {
  id: number
  title: string
  orderIndex: number
  lessons: Lesson[]
}

interface LessonSidebarProps {
  chapters: Chapter[]
  currentLessonId: number
  curriculumId: number
  userHasPurchased?: boolean
}

export function LessonSidebar({
  chapters,
  currentLessonId,
  curriculumId,
  userHasPurchased = false,
}: LessonSidebarProps) {
  // Find which chapter contains the current lesson
  const currentChapterId = chapters.find((ch) =>
    ch.lessons.some((l) => l.id === currentLessonId)
  )?.id

  // Initialize expanded chapters (current chapter is expanded by default)
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(
    new Set(currentChapterId ? [currentChapterId] : [])
  )

  const toggleChapter = (chapterId: number) => {
    setExpandedChapters((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId)
      } else {
        newSet.add(chapterId)
      }
      return newSet
    })
  }

  const isLessonLocked = (lesson: Lesson, chapterIndex: number) => {
    // Chapter 0 is always free
    if (chapterIndex === 0) return false
    // Free lessons are never locked
    if (lesson.isFree) return false
    // If user purchased, nothing is locked
    if (userHasPurchased) return false
    // Otherwise, it's locked
    return true
  }

  return (
    <div className="h-full bg-dark-800 overflow-y-auto">
      <div className="p-4 space-y-2">
        {chapters
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((chapter, index) => {
            const isExpanded = expandedChapters.has(chapter.id)

            return (
              <div key={chapter.id} className="bg-dark-700 rounded-lg overflow-hidden">
                {/* Chapter Header */}
                <button
                  onClick={() => toggleChapter(chapter.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-dark-600 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-accent-yellow font-bold">
                      副本{index === 0 ? '零' : index}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {chapter.title}
                    </span>
                  </div>
                  <ChevronDownIcon
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      isExpanded ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Lessons List */}
                {isExpanded && (
                  <div className="border-t border-dark-600">
                    {chapter.lessons.map((lesson) => {
                      const isCurrentLesson = lesson.id === currentLessonId
                      const isLocked = isLessonLocked(lesson, index)

                      return (
                        <Link
                          key={lesson.id}
                          href={`/course/${curriculumId}/chapters/${chapter.orderIndex}/lessons/${lesson.orderIndex}`}
                          className={`flex items-center space-x-3 p-4 transition-colors ${
                            isCurrentLesson
                              ? 'bg-accent-yellow text-dark-900'
                              : 'hover:bg-dark-600 text-white'
                          }`}
                        >
                          {/* Status Icon */}
                          <div className="flex-shrink-0">
                            {lesson.isCompleted ? (
                              <CheckCircleIcon className="w-5 h-5 text-green-500" />
                            ) : isLocked ? (
                              <LockClosedIcon className="w-5 h-5 text-gray-400" />
                            ) : (
                              <PlayIcon className="w-5 h-5 text-gray-400" />
                            )}
                          </div>

                          {/* Lesson Title */}
                          <span className="flex-1 text-sm font-medium line-clamp-2">
                            {lesson.title}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}
