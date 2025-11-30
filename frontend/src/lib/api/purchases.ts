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

export interface OrderPreviewResponse {
  curriculum: {
    id: number
    title: string
    description: string
    thumbnailUrl?: string
    instructorName?: string
    price: number
    currency: string
    difficultyLevel?: string
    estimatedDurationHours?: number
  }
  chapters: Array<{
    id: number
    title: string
    description?: string
    orderIndex: number
    lessons: Array<{
      id: number
      title: string
      lessonType: string
      durationMinutes?: number
      isFreePreview: boolean
      orderIndex: number
    }>
  }>
  originalPrice: number
  totalChapters: number
  totalLessons: number
}

export const purchasesApi = {
  /**
   * Get order preview for a curriculum (for order confirmation page)
   */
  async getOrderPreview(curriculumId: number): Promise<OrderPreviewResponse> {
    const { data } = await apiClient.get<OrderPreviewResponse>(
      `/curriculums/${curriculumId}/order-preview`
    )
    return data
  },

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
   * Create a purchase (creates PENDING purchase awaiting payment)
   */
  async create(request: PurchaseRequest): Promise<PurchaseResponse> {
    const { data } = await apiClient.post<PurchaseResponse>('/purchases', request)
    return data
  },

  /**
   * Complete a pending purchase (mock payment - always succeeds in Phase 2)
   */
  async completePurchase(purchaseId: number): Promise<PurchaseResponse> {
    const { data} = await apiClient.post<PurchaseResponse>(`/purchases/${purchaseId}/complete`)
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
