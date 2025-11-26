'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

interface Lesson {
  id: number
  title: string
  lessonType: string
  durationMinutes?: number | null
}

interface Chapter {
  id: number
  title: string
  description?: string | null
  lessons: Lesson[]
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
    <div className="space-y-4">
      {chapters.map((chapter) => {
        const isOpen = openChapters.has(chapter.id)

        return (
          <div
            key={chapter.id}
            className="bg-dark-800 rounded-xl overflow-hidden border border-dark-600"
          >
            {/* Chapter Header */}
            <button
              onClick={() => toggleChapter(chapter.id)}
              className="w-full flex items-center justify-between p-6 hover:bg-dark-700 transition-colors"
            >
              <h3 className="text-lg font-bold text-white text-left">
                {chapter.title}
              </h3>
              <ChevronDownIcon
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                  isOpen ? 'transform rotate-180' : ''
                }`}
              />
            </button>

            {/* Chapter Content */}
            {isOpen && (
              <div className="border-t border-dark-600 p-4 space-y-2">
                {chapter.description && (
                  <p className="text-gray-400 text-sm mb-4 px-2">
                    {chapter.description}
                  </p>
                )}

                {chapter.lessons.length === 0 ? (
                  <p className="text-gray-500 text-sm px-2">尚無課程內容</p>
                ) : (
                  chapter.lessons.map((lesson) => (
                    <Link
                      key={lesson.id}
                      href={`/course/${curriculumId}/chapters/${chapter.orderIndex}/lessons/${lesson.orderIndex}`}
                      className="flex items-center justify-between p-3 hover:bg-dark-700 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-400 group-hover:text-accent-yellow transition-colors">
                          {lesson.lessonType === 'VIDEO' && '▶️'}
                          {lesson.lessonType === 'ARTICLE' && '📄'}
                          {lesson.lessonType === 'SURVEY' && '📝'}
                        </span>
                        <span className="text-white group-hover:text-accent-yellow transition-colors">
                          {lesson.title}
                        </span>
                      </div>
                      {lesson.durationMinutes && (
                        <span className="text-sm text-gray-500">
                          {lesson.durationMinutes} min
                        </span>
                      )}
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
