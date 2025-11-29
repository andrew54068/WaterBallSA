import { apiClient } from '../api-client'

export interface OwnershipCheckResponse {
  owns: boolean
  purchaseId?: number
  purchaseDate?: string
}

export interface PurchaseRequest {
  curriculumId: number
  couponCode?: string
}

export interface PurchaseResponse {
  purchaseId: number
  curriculumId: number
  curriculumTitle: string
  curriculumThumbnailUrl?: string
  originalPrice: number
  finalPrice: number
  couponCode?: string
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED'
  purchasedAt?: string
  createdAt: string
}

export interface GetPurchasesParams {
  page?: number
  size?: number
  sortBy?: string
  direction?: 'asc' | 'desc'
}

export interface PaginatedPurchasesResponse {
  content: PurchaseResponse[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export const purchasesApi = {
  /**
   * Check if user owns a curriculum
   */
  async checkOwnership(curriculumId: number): Promise<OwnershipCheckResponse> {
    const { data } = await apiClient.get<OwnershipCheckResponse>(
      `/purchases/check-ownership/${curriculumId}`
    )
    return data
  },

  /**
   * Create a purchase (simplified Phase 2 - instant completion)
   */
  async create(request: PurchaseRequest): Promise<PurchaseResponse> {
    const { data } = await apiClient.post<PurchaseResponse>('/purchases', request)
    return data
  },

  /**
   * Get user's purchase history
   */
  async getMyPurchases(
    params: GetPurchasesParams = {}
  ): Promise<PaginatedPurchasesResponse> {
    const { data } = await apiClient.get<PaginatedPurchasesResponse>('/purchases/my-purchases', {
      params: {
        page: params.page || 0,
        size: params.size || 10,
        sortBy: params.sortBy || 'purchasedAt',
        direction: params.direction || 'desc',
      },
    })
    return data
  },

  /**
   * Get completed purchases only
   */
  async getCompletedPurchases(
    params: GetPurchasesParams = {}
  ): Promise<PaginatedPurchasesResponse> {
    const { data } = await apiClient.get<PaginatedPurchasesResponse>('/purchases/completed', {
      params: {
        page: params.page || 0,
        size: params.size || 10,
      },
    })
    return data
  },

  /**
   * Get purchase by ID
   */
  async getById(purchaseId: number): Promise<PurchaseResponse> {
    const { data } = await apiClient.get<PurchaseResponse>(`/purchases/${purchaseId}`)
    return data
  },
}
