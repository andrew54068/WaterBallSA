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

export interface Lesson {
  id: number
  chapterId: number
  title: string
  description?: string
  lessonType: 'VIDEO' | 'ARTICLE' | 'SURVEY'
  contentUrl?: string
  contentMetadata: Record<string, any>
  orderIndex: number
  durationMinutes?: number
  isFree?: boolean
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

// NextAuth Type Extensions
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    idToken?: string
    accessToken?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    idToken?: string
    accessToken?: string
  }
}
