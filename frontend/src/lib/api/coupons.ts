import { apiClient } from '../api-client'

export interface ValidateCouponRequest {
  curriculumId: number
  couponCode: string
}

export interface CouponValidationResponse {
  valid: boolean
  code?: string
  discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT'
  discountValue?: number
  errorCode?: string
  errorMessage?: string
}

export const couponApi = {
  /**
   * Validate a coupon code for a specific curriculum
   */
  async validateCoupon(curriculumId: number, couponCode: string): Promise<CouponValidationResponse> {
    const { data } = await apiClient.post<CouponValidationResponse>('/coupons/validate', {
      curriculumId,
      couponCode
    })
    return data
  }
}
