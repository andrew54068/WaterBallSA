// API Response Types

export interface User {
  id: number
  googleId: string
  email: string
  name: string
  profilePicture?: string
  createdAt: string
  updatedAt: string
}

export interface Curriculum {
  id: number
  title: string
  description: string
  thumbnailUrl?: string
  instructorName: string
  price: number
  currency: string
  difficultyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  estimatedDurationHours: number
  isPublished: boolean
  publishedAt?: string
  createdAt: string
  chapters: Chapter[]
}

export interface Chapter {
  id: number
  curriculumId: number
  title: string
  description?: string
  orderIndex: number
  createdAt: string
  lessons: Lesson[]
}

// Content metadata types for different lesson types
export interface VideoMetadata {
  videoProvider?: string
  videoId?: string
  thumbnailUrl?: string
  [key: string]: string | number | boolean | undefined
}

export interface ArticleMetadata {
  author?: string
  publishedDate?: string
  readingTime?: number
  [key: string]: string | number | boolean | undefined
}

export interface SurveyMetadata {
  questionsCount?: number
  passingScore?: number
  timeLimit?: number
  [key: string]: string | number | boolean | undefined
}

export type LessonMetadata = VideoMetadata | ArticleMetadata | SurveyMetadata | Record<string, string | number | boolean | undefined>

export interface Lesson {
  id: number
  chapterId: number
  title: string
  description?: string
  lessonType: 'VIDEO' | 'ARTICLE' | 'SURVEY'
  contentUrl?: string
  contentMetadata: LessonMetadata
  orderIndex: number
  durationMinutes?: number
  isFreePreview?: boolean
  isCompleted?: boolean
  createdAt: string
}

export interface PaginatedResponse<T> {
  content: T[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: {
      empty: boolean
      sorted: boolean
      unsorted: boolean
    }
    offset: number
    paged: boolean
    unpaged: boolean
  }
  totalPages: number
  totalElements: number
  last: boolean
  size: number
  number: number
  sort: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  first: boolean
  numberOfElements: number
  empty: boolean
}

export interface ApiError {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
  validationErrors?: Record<string, string>
}

// NextAuth Type Extensions (not currently used - Phase 2)
// import { DefaultSession } from 'next-auth'
//
// declare module 'next-auth' {
//   interface Session extends DefaultSession {
//     idToken?: string
//     accessToken?: string
//   }
// }
//
// declare module 'next-auth/jwt' {
//   interface JWT {
//     idToken?: string
//     accessToken?: string
//   }
// }
