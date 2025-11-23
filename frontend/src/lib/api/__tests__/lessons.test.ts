import { lessonsApi } from '../lessons'
import { apiClient } from '../../api-client'
import type { Lesson } from '@/types'

// Mock the api-client
jest.mock('../../api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

describe('lessonsApi', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getById', () => {
    it('should fetch lesson by ID', async () => {
      const mockLesson: Lesson = {
        id: 1,
        chapterId: 1,
        title: 'Introduction to React',
        description: 'Learn React basics',
        lessonType: 'VIDEO',
        contentMetadata: { videoUrl: 'https://youtube.com/watch?v=123' },
        orderIndex: 1,
        durationMinutes: 15,
        createdAt: '2024-01-01T00:00:00Z',
      }

      mockApiClient.get.mockResolvedValueOnce({ data: mockLesson })

      const result = await lessonsApi.getById(1)

      expect(mockApiClient.get).toHaveBeenCalledWith('/lessons/1')
      expect(mockApiClient.get).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockLesson)
    })

    it('should handle API errors', async () => {
      const errorMessage = 'Lesson not found'
      mockApiClient.get.mockRejectedValueOnce(new Error(errorMessage))

      await expect(lessonsApi.getById(999)).rejects.toThrow(errorMessage)
      expect(mockApiClient.get).toHaveBeenCalledWith('/lessons/999')
    })

    it('should work with different lesson types', async () => {
      const videoLesson: Lesson = {
        id: 1,
        chapterId: 1,
        title: 'Video Lesson',
        lessonType: 'VIDEO',
        contentMetadata: {},
        orderIndex: 1,
        createdAt: '2024-01-01T00:00:00Z',
      }

      mockApiClient.get.mockResolvedValueOnce({ data: videoLesson })

      const result = await lessonsApi.getById(1)

      expect(result.lessonType).toBe('VIDEO')
    })

    it('should include content metadata', async () => {
      const mockLesson: Lesson = {
        id: 1,
        chapterId: 1,
        title: 'Article Lesson',
        lessonType: 'ARTICLE',
        contentMetadata: {
          articleUrl: 'https://example.com/article',
          wordCount: 1500,
          readingLevel: 'intermediate',
        },
        orderIndex: 1,
        createdAt: '2024-01-01T00:00:00Z',
      }

      mockApiClient.get.mockResolvedValueOnce({ data: mockLesson })

      const result = await lessonsApi.getById(1)

      expect(result.contentMetadata.articleUrl).toBe(
        'https://example.com/article'
      )
      expect(result.contentMetadata.wordCount).toBe(1500)
    })
  })

  describe('getByChapterId', () => {
    it('should fetch all lessons for a chapter', async () => {
      const mockLessons: Lesson[] = [
        {
          id: 1,
          chapterId: 1,
          title: 'Lesson 1',
          lessonType: 'VIDEO',
          contentMetadata: {},
          orderIndex: 1,
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 2,
          chapterId: 1,
          title: 'Lesson 2',
          lessonType: 'ARTICLE',
          contentMetadata: {},
          orderIndex: 2,
          createdAt: '2024-01-02T00:00:00Z',
        },
      ]

      mockApiClient.get.mockResolvedValueOnce({ data: mockLessons })

      const result = await lessonsApi.getByChapterId(1)

      expect(mockApiClient.get).toHaveBeenCalledWith('/lessons/chapter/1')
      expect(mockApiClient.get).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockLessons)
      expect(result).toHaveLength(2)
    })

    it('should return empty array when no lessons exist', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: [] })

      const result = await lessonsApi.getByChapterId(999)

      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('should handle API errors', async () => {
      const errorMessage = 'Chapter not found'
      mockApiClient.get.mockRejectedValueOnce(new Error(errorMessage))

      await expect(lessonsApi.getByChapterId(999)).rejects.toThrow(
        errorMessage
      )
    })

    it('should work with different chapter IDs', async () => {
      const mockLessons: Lesson[] = [
        {
          id: 10,
          chapterId: 5,
          title: 'Advanced Lesson',
          lessonType: 'SURVEY',
          contentMetadata: {},
          orderIndex: 1,
          createdAt: '2024-01-01T00:00:00Z',
        },
      ]

      mockApiClient.get.mockResolvedValueOnce({ data: mockLessons })

      const result = await lessonsApi.getByChapterId(5)

      expect(mockApiClient.get).toHaveBeenCalledWith('/lessons/chapter/5')
      expect(result[0].chapterId).toBe(5)
    })

    it('should handle lessons with different types', async () => {
      const mockLessons: Lesson[] = [
        {
          id: 1,
          chapterId: 1,
          title: 'Video Lesson',
          lessonType: 'VIDEO',
          contentMetadata: {},
          orderIndex: 1,
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 2,
          chapterId: 1,
          title: 'Article Lesson',
          lessonType: 'ARTICLE',
          contentMetadata: {},
          orderIndex: 2,
          createdAt: '2024-01-02T00:00:00Z',
        },
        {
          id: 3,
          chapterId: 1,
          title: 'Survey Lesson',
          lessonType: 'SURVEY',
          contentMetadata: {},
          orderIndex: 3,
          createdAt: '2024-01-03T00:00:00Z',
        },
      ]

      mockApiClient.get.mockResolvedValueOnce({ data: mockLessons })

      const result = await lessonsApi.getByChapterId(1)

      expect(result).toHaveLength(3)
      expect(result[0].lessonType).toBe('VIDEO')
      expect(result[1].lessonType).toBe('ARTICLE')
      expect(result[2].lessonType).toBe('SURVEY')
    })
  })

  describe('getFreePreview', () => {
    it('should fetch free preview lessons for a curriculum', async () => {
      const mockLessons: Lesson[] = [
        {
          id: 1,
          chapterId: 1,
          title: 'Free Preview Lesson 1',
          lessonType: 'VIDEO',
          contentMetadata: {},
          orderIndex: 1,
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 5,
          chapterId: 2,
          title: 'Free Preview Lesson 2',
          lessonType: 'ARTICLE',
          contentMetadata: {},
          orderIndex: 1,
          createdAt: '2024-01-05T00:00:00Z',
        },
      ]

      mockApiClient.get.mockResolvedValueOnce({ data: mockLessons })

      const result = await lessonsApi.getFreePreview(1)

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/lessons/curriculum/1/free-preview'
      )
      expect(mockApiClient.get).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockLessons)
      expect(result).toHaveLength(2)
    })

    it('should return empty array when no free previews exist', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: [] })

      const result = await lessonsApi.getFreePreview(999)

      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('should handle API errors', async () => {
      const errorMessage = 'Curriculum not found'
      mockApiClient.get.mockRejectedValueOnce(new Error(errorMessage))

      await expect(lessonsApi.getFreePreview(999)).rejects.toThrow(
        errorMessage
      )
    })

    it('should work with different curriculum IDs', async () => {
      const mockLessons: Lesson[] = [
        {
          id: 100,
          chapterId: 10,
          title: 'Free Lesson',
          lessonType: 'VIDEO',
          contentMetadata: {},
          orderIndex: 1,
          createdAt: '2024-01-01T00:00:00Z',
        },
      ]

      mockApiClient.get.mockResolvedValueOnce({ data: mockLessons })

      const result = await lessonsApi.getFreePreview(42)

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/lessons/curriculum/42/free-preview'
      )
      expect(result[0].id).toBe(100)
    })

    it('should only return free preview lessons', async () => {
      // Free preview lessons might have specific metadata
      const mockLessons: Lesson[] = [
        {
          id: 1,
          chapterId: 1,
          title: 'Free Intro Video',
          lessonType: 'VIDEO',
          contentMetadata: { isFreePreview: true },
          orderIndex: 1,
          createdAt: '2024-01-01T00:00:00Z',
        },
      ]

      mockApiClient.get.mockResolvedValueOnce({ data: mockLessons })

      const result = await lessonsApi.getFreePreview(1)

      // Should only get lessons marked as free preview
      expect(result).toHaveLength(1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero as lesson ID', async () => {
      const mockLesson: Lesson = {
        id: 0,
        chapterId: 1,
        title: 'Test Lesson',
        lessonType: 'VIDEO',
        contentMetadata: {},
        orderIndex: 1,
        createdAt: '2024-01-01T00:00:00Z',
      }

      mockApiClient.get.mockResolvedValueOnce({ data: mockLesson })

      const result = await lessonsApi.getById(0)

      expect(mockApiClient.get).toHaveBeenCalledWith('/lessons/0')
      expect(result.id).toBe(0)
    })

    it('should handle negative lesson ID', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Invalid ID'))

      await expect(lessonsApi.getById(-1)).rejects.toThrow('Invalid ID')
    })

    it('should handle network errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Network Error'))

      await expect(lessonsApi.getById(1)).rejects.toThrow('Network Error')
    })

    it('should handle timeout errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Timeout'))

      await expect(lessonsApi.getByChapterId(1)).rejects.toThrow('Timeout')
    })

    it('should handle malformed response data', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: null })

      const result = await lessonsApi.getById(1)

      expect(result).toBeNull()
    })

    it('should handle empty contentMetadata', async () => {
      const mockLesson: Lesson = {
        id: 1,
        chapterId: 1,
        title: 'Test Lesson',
        lessonType: 'VIDEO',
        contentMetadata: {},
        orderIndex: 1,
        createdAt: '2024-01-01T00:00:00Z',
      }

      mockApiClient.get.mockResolvedValueOnce({ data: mockLesson })

      const result = await lessonsApi.getById(1)

      expect(result.contentMetadata).toEqual({})
    })

    it('should handle lessons without optional fields', async () => {
      const mockLesson: Lesson = {
        id: 1,
        chapterId: 1,
        title: 'Minimal Lesson',
        lessonType: 'SURVEY',
        contentMetadata: {},
        orderIndex: 1,
        createdAt: '2024-01-01T00:00:00Z',
      }

      mockApiClient.get.mockResolvedValueOnce({ data: mockLesson })

      const result = await lessonsApi.getById(1)

      expect(result.description).toBeUndefined()
      expect(result.durationMinutes).toBeUndefined()
    })
  })
})
