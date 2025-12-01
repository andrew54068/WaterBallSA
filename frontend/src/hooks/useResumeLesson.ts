import { useState, useEffect, useCallback } from 'react'
import { curriculumsApi } from '@/lib/api/curriculums'
import { getChapterProgress } from '@/lib/api/video-progress'
import { useAuth } from '@/lib/auth-context'
import { Curriculum, Chapter, Lesson } from '@/types'

interface ResumeLessonResult {
  nextChapterIndex?: number
  nextLessonIndex?: number
  isLoading: boolean
  error: Error | null
}

export function useResumeLesson(curriculumId: number): ResumeLessonResult {
  const { user } = useAuth()
  const [nextChapterIndex, setNextChapterIndex] = useState<number>()
  const [nextLessonIndex, setNextLessonIndex] = useState<number>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchResumeLesson = useCallback(async () => {
    if (!user || !curriculumId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      
      // 1. Fetch curriculum to get structure
      const curriculum = await curriculumsApi.getById(curriculumId)
      
      if (!curriculum.chapters || curriculum.chapters.length === 0) {
        setIsLoading(false)
        return
      }

      // Sort chapters by orderIndex
      const sortedChapters = [...curriculum.chapters].sort((a, b) => a.orderIndex - b.orderIndex)

      // 2. Iterate through chapters to find the first uncompleted lesson
      for (const chapter of sortedChapters) {
        if (!chapter.lessons || chapter.lessons.length === 0) continue

        // Fetch progress for this chapter
        const progressList = await getChapterProgress(chapter.id)
        
        // Sort lessons by orderIndex
        const sortedLessons = [...chapter.lessons].sort((a, b) => a.orderIndex - b.orderIndex)

        for (const lesson of sortedLessons) {
          const progress = progressList.find(p => p.lessonId === lesson.id)
          
          // If no progress or not completed, this is the next lesson
          if (!progress || !progress.isCompleted) {
            setNextChapterIndex(chapter.orderIndex)
            setNextLessonIndex(lesson.orderIndex)
            setIsLoading(false)
            return
          }
        }
      }

      // 3. If all lessons are completed, return the first lesson (or could be last)
      // Defaulting to first lesson of first chapter
      if (sortedChapters.length > 0 && sortedChapters[0].lessons.length > 0) {
        const firstChapter = sortedChapters[0]
        const firstLesson = firstChapter.lessons.sort((a, b) => a.orderIndex - b.orderIndex)[0]
        setNextChapterIndex(firstChapter.orderIndex)
        setNextLessonIndex(firstLesson.orderIndex)
      }

    } catch (err) {
      console.error('Failed to calculate resume lesson:', err)
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [curriculumId, user])

  useEffect(() => {
    fetchResumeLesson()
  }, [fetchResumeLesson])

  return {
    nextChapterIndex,
    nextLessonIndex,
    isLoading,
    error
  }
}
