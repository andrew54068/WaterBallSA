import { apiClient } from '../api-client'
import type { Curriculum, PaginatedResponse } from '@/types'

export interface GetCurriculumsParams {
  page?: number
  size?: number
  sort?: string
}

export const curriculumsApi = {
  /**
   * Get paginated list of curriculums
   */
  async getAll(params: GetCurriculumsParams = {}): Promise<PaginatedResponse<Curriculum>> {
    const { data } = await apiClient.get<PaginatedResponse<Curriculum>>('/curriculums', {
      params: {
        page: params.page || 0,
        size: params.size || 10,
        sort: params.sort || 'createdAt,desc',
      },
    })
    return data
  },

  /**
   * Get curriculum by ID with chapters
   */
  async getById(id: number): Promise<Curriculum> {
    const { data } = await apiClient.get<Curriculum>(`/curriculums/${id}`)
    return data
  },

  /**
   * Search curriculums by title or description
   */
  async search(query: string, params: GetCurriculumsParams = {}): Promise<PaginatedResponse<Curriculum>> {
    const { data } = await apiClient.get<PaginatedResponse<Curriculum>>('/curriculums/search', {
      params: {
        q: query,
        page: params.page || 0,
        size: params.size || 10,
        sort: params.sort || 'createdAt,desc',
      },
    })
    return data
  },

  /**
   * Get free curriculums only
   */
  async getFree(params: GetCurriculumsParams = {}): Promise<PaginatedResponse<Curriculum>> {
    const { data } = await apiClient.get<PaginatedResponse<Curriculum>>('/curriculums/free', {
      params: {
        page: params.page || 0,
        size: params.size || 10,
        sort: params.sort || 'createdAt,desc',
      },
    })
    return data
  },
}
