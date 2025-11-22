import { apiClient } from '../api-client'
import type { Chapter, Lesson } from '@/types'

export const chaptersApi = {
  /**
   * Get chapter by ID with lessons
   */
  async getById(id: number): Promise<Chapter> {
    const { data } = await apiClient.get<Chapter>(`/chapters/${id}`)
    return data
  },

  /**
   * Get chapters by curriculum ID
   */
  async getByCurriculumId(curriculumId: number): Promise<Chapter[]> {
    const { data } = await apiClient.get<Chapter[]>(`/chapters/curriculum/${curriculumId}`)
    return data
  },
}

export const lessonsApi = {
  /**
   * Get lesson by ID
   */
  async getById(id: number): Promise<Lesson> {
    const { data } = await apiClient.get<Lesson>(`/lessons/${id}`)
    return data
  },

  /**
   * Get lessons by chapter ID
   */
  async getByChapterId(chapterId: number): Promise<Lesson[]> {
    const { data } = await apiClient.get<Lesson[]>(`/lessons/chapter/${chapterId}`)
    return data
  },

  /**
   * Get free preview lessons for a curriculum
   */
  async getFreePreview(curriculumId: number): Promise<Lesson[]> {
    const { data } = await apiClient.get<Lesson[]>(`/lessons/curriculum/${curriculumId}/free-preview`)
    return data
  },
}
