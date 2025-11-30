import { apiClient } from '../api-client'

export interface ValidateCouponRequest {
  code: string
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
   * Validate a coupon code
   */
  async validateCoupon(code: string): Promise<CouponValidationResponse> {
    const { data } = await apiClient.post<CouponValidationResponse>('/coupons/validate', { code })
    return data
  }
}
