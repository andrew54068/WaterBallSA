import { chaptersApi } from '../chapters'
import { apiClient } from '../../api-client'
import type { Chapter } from '@/types'

// Mock the api-client
jest.mock('../../api-client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

describe('chaptersApi', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getById', () => {
    it('should fetch chapter by ID', async () => {
      const mockChapter: Chapter = {
        id: 1,
        curriculumId: 1,
        title: 'Test Chapter',
        description: 'Test Description',
        orderIndex: 1,
        isPublished: true,
        createdAt: '2024-01-01T00:00:00Z',
        lessons: [],
      }

      mockApiClient.get.mockResolvedValueOnce({ data: mockChapter })

      const result = await chaptersApi.getById(1)

      expect(mockApiClient.get).toHaveBeenCalledWith('/chapters/1')
      expect(mockApiClient.get).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockChapter)
    })

    it('should handle API errors', async () => {
      const errorMessage = 'Chapter not found'
      mockApiClient.get.mockRejectedValueOnce(new Error(errorMessage))

      await expect(chaptersApi.getById(999)).rejects.toThrow(errorMessage)
      expect(mockApiClient.get).toHaveBeenCalledWith('/chapters/999')
    })

    it('should work with different chapter IDs', async () => {
      const mockChapter: Chapter = {
        id: 42,
        curriculumId: 5,
        title: 'Advanced Topics',
        orderIndex: 10,
        isPublished: true,
        createdAt: '2024-01-01T00:00:00Z',
        lessons: [],
      }

      mockApiClient.get.mockResolvedValueOnce({ data: mockChapter })

      const result = await chaptersApi.getById(42)

      expect(mockApiClient.get).toHaveBeenCalledWith('/chapters/42')
      expect(result.id).toBe(42)
    })

    it('should include lessons array in response', async () => {
      const mockChapter: Chapter = {
        id: 1,
        curriculumId: 1,
        title: 'Test Chapter',
        orderIndex: 1,
        isPublished: true,
        createdAt: '2024-01-01T00:00:00Z',
        lessons: [
          {
            id: 1,
            chapterId: 1,
            title: 'Lesson 1',
            lessonType: 'VIDEO',
            contentMetadata: {},
            orderIndex: 1,
            createdAt: '2024-01-01T00:00:00Z',
          },
        ],
      }

      mockApiClient.get.mockResolvedValueOnce({ data: mockChapter })

      const result = await chaptersApi.getById(1)

      expect(result.lessons).toHaveLength(1)
      expect(result.lessons![0].title).toBe('Lesson 1')
    })
  })

  describe('getByCurriculumId', () => {
    it('should fetch all chapters for a curriculum', async () => {
      const mockChapters: Chapter[] = [
        {
          id: 1,
          curriculumId: 1,
          title: 'Chapter 1',
          orderIndex: 1,
          isPublished: true,
          createdAt: '2024-01-01T00:00:00Z',
          lessons: [],
        },
        {
          id: 2,
          curriculumId: 1,
          title: 'Chapter 2',
          orderIndex: 2,
          isPublished: true,
          createdAt: '2024-01-02T00:00:00Z',
          lessons: [],
        },
      ]

      mockApiClient.get.mockResolvedValueOnce({ data: mockChapters })

      const result = await chaptersApi.getByCurriculumId(1)

      expect(mockApiClient.get).toHaveBeenCalledWith('/chapters/curriculum/1')
      expect(mockApiClient.get).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockChapters)
      expect(result).toHaveLength(2)
    })

    it('should return empty array when no chapters exist', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: [] })

      const result = await chaptersApi.getByCurriculumId(999)

      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('should handle API errors', async () => {
      const errorMessage = 'Curriculum not found'
      mockApiClient.get.mockRejectedValueOnce(new Error(errorMessage))

      await expect(chaptersApi.getByCurriculumId(999)).rejects.toThrow(
        errorMessage
      )
    })

    it('should work with different curriculum IDs', async () => {
      const mockChapters: Chapter[] = [
        {
          id: 10,
          curriculumId: 5,
          title: 'Advanced Chapter',
          orderIndex: 1,
          isPublished: true,
          createdAt: '2024-01-01T00:00:00Z',
          lessons: [],
        },
      ]

      mockApiClient.get.mockResolvedValueOnce({ data: mockChapters })

      const result = await chaptersApi.getByCurriculumId(5)

      expect(mockApiClient.get).toHaveBeenCalledWith('/chapters/curriculum/5')
      expect(result[0].curriculumId).toBe(5)
    })

    it('should handle chapters with lessons included', async () => {
      const mockChapters: Chapter[] = [
        {
          id: 1,
          curriculumId: 1,
          title: 'Chapter 1',
          orderIndex: 1,
          isPublished: true,
          createdAt: '2024-01-01T00:00:00Z',
          lessons: [
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
          ],
        },
      ]

      mockApiClient.get.mockResolvedValueOnce({ data: mockChapters })

      const result = await chaptersApi.getByCurriculumId(1)

      expect(result[0].lessons).toHaveLength(2)
    })
  })

  describe('getCount', () => {
    it('should fetch chapter count for a curriculum', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: 5 })

      const result = await chaptersApi.getCount(1)

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/chapters/curriculum/1/count'
      )
      expect(mockApiClient.get).toHaveBeenCalledTimes(1)
      expect(result).toBe(5)
    })

    it('should return 0 when no chapters exist', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: 0 })

      const result = await chaptersApi.getCount(999)

      expect(result).toBe(0)
    })

    it('should handle API errors', async () => {
      const errorMessage = 'Failed to get count'
      mockApiClient.get.mockRejectedValueOnce(new Error(errorMessage))

      await expect(chaptersApi.getCount(1)).rejects.toThrow(errorMessage)
    })

    it('should work with different curriculum IDs', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: 10 })

      const result = await chaptersApi.getCount(42)

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/chapters/curriculum/42/count'
      )
      expect(result).toBe(10)
    })

    it('should return correct count for large numbers', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: 999 })

      const result = await chaptersApi.getCount(1)

      expect(result).toBe(999)
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero as chapter ID', async () => {
      const mockChapter: Chapter = {
        id: 0,
        curriculumId: 1,
        title: 'Test Chapter',
        orderIndex: 1,
        isPublished: true,
        createdAt: '2024-01-01T00:00:00Z',
        lessons: [],
      }

      mockApiClient.get.mockResolvedValueOnce({ data: mockChapter })

      const result = await chaptersApi.getById(0)

      expect(mockApiClient.get).toHaveBeenCalledWith('/chapters/0')
      expect(result.id).toBe(0)
    })

    it('should handle negative chapter ID', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Invalid ID'))

      await expect(chaptersApi.getById(-1)).rejects.toThrow('Invalid ID')
    })

    it('should handle network errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(
        new Error('Network Error')
      )

      await expect(chaptersApi.getById(1)).rejects.toThrow('Network Error')
    })

    it('should handle timeout errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Timeout'))

      await expect(chaptersApi.getByCurriculumId(1)).rejects.toThrow('Timeout')
    })

    it('should handle malformed response data', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: null })

      const result = await chaptersApi.getById(1)

      expect(result).toBeNull()
    })
  })
})
