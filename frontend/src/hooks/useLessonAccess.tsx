'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { lessonsApi } from '@/lib/api/lessons'
import { useOwnership } from './useOwnership'

export type AccessReason = 'free_preview' | 'owned' | 'requires_purchase' | 'requires_login'

export interface LessonAccessResult {
  canAccess: boolean
  reason: AccessReason
  freeToPreview: boolean
  showLockedView: boolean
  isLoading: boolean
  error: Error | null
  curriculumId: number
  retry: () => void
}

/**
 * Hook to check if user has access to a lesson
 * Implements access control logic based on:
 * - Lesson's free_to_preview flag (isFree property)
 * - User authentication status
 * - User's curriculum ownership (checked via API)
 *
 * @param lessonId - The ID of the lesson to check access for
 * @param curriculumId - The ID of the curriculum the lesson belongs to
 * @returns Access control state and functions
 */
export function useLessonAccess(
  lessonId: number,
  curriculumId: number
): LessonAccessResult {
  const { user, isLoading: authLoading } = useAuth()
  const [lessonLoading, setLessonLoading] = useState(true)
  const [lessonError, setLessonError] = useState<Error | null>(null)
  const [freeToPreview, setFreeToPreview] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  // Use useOwnership hook with caching
  const ownership = useOwnership(curriculumId, !!user)

  // Fetch lesson data to check if it's free
  const checkLesson = async () => {
    try {
      setLessonLoading(true)
      setLessonError(null)

      const lesson = await lessonsApi.getById(lessonId)
      const isFreeLesson = lesson.isFreePreview === true
      setFreeToPreview(isFreeLesson)

      setLessonLoading(false)
    } catch (err) {
      console.error('[useLessonAccess] Error fetching lesson:', err)
      setLessonError(err instanceof Error ? err : new Error('Failed to fetch lesson'))
      setLessonLoading(false)
      // Fail secure - default to not free
      setFreeToPreview(false)
    }
  }

  useEffect(() => {
    checkLesson()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, retryCount])

  const retry = () => {
    setRetryCount((prev) => prev + 1)
    ownership.retry()
  }

  const isLoading = authLoading || lessonLoading || ownership.isLoading
  const error = lessonError || ownership.error

  // Determine access based on business rules
  const determineAccess = (): LessonAccessResult => {
    // If still loading, return loading state with locked default
    if (isLoading || authLoading) {
      return {
        canAccess: false,
        reason: 'requires_login',
        freeToPreview: false,
        showLockedView: false,
        isLoading: true,
        error: null,
        curriculumId,
        retry,
      }
    }

    // If error occurred, fail secure (deny access)
    if (error) {
      return {
        canAccess: false,
        reason: 'requires_login',
        freeToPreview: false,
        showLockedView: true,
        isLoading: false,
        error,
        curriculumId,
        retry,
      }
    }

    // BR-2: If user has purchased the curriculum, grant access to all lessons
    // This takes precedence over free preview status
    if (ownership.owns) {
      return {
        canAccess: true,
        reason: 'owned',
        freeToPreview: freeToPreview,
        showLockedView: false,
        isLoading: false,
        error: null,
        curriculumId,
        retry,
      }
    }

    // BR-1: Free preview lessons are accessible to all users (without purchase)
    if (freeToPreview) {
      return {
        canAccess: true,
        reason: 'free_preview',
        freeToPreview: true,
        showLockedView: false,
        isLoading: false,
        error: null,
        curriculumId,
        retry,
      }
    }

    // User doesn't have purchase
    if (user) {
      // Authenticated but no purchase
      return {
        canAccess: false,
        reason: 'requires_purchase',
        freeToPreview: false,
        showLockedView: true,
        isLoading: false,
        error: null,
        curriculumId,
        retry,
      }
    }

    // Not authenticated
    return {
      canAccess: false,
      reason: 'requires_login',
      freeToPreview: false,
      showLockedView: true,
      isLoading: false,
      error: null,
      curriculumId,
      retry,
    }
  }

  return determineAccess()
}
