import apiClient from '../api-client'
import { Chapter } from '@/types'

export const chaptersApi = {
  /**
   * Get a chapter by ID (includes lessons)
   */
  getById: async (id: number): Promise<Chapter> => {
    const response = await apiClient.get(`/chapters/${id}`)
    return response.data
  },

  /**
   * Get all chapters for a curriculum
   */
  getByCurriculumId: async (curriculumId: number): Promise<Chapter[]> => {
    const response = await apiClient.get(`/chapters/curriculum/${curriculumId}`)
    return response.data
  },

  /**
   * Get chapter count for a curriculum
   */
  getCount: async (curriculumId: number): Promise<number> => {
    const response = await apiClient.get(`/chapters/curriculum/${curriculumId}/count`)
    return response.data
  },
}
