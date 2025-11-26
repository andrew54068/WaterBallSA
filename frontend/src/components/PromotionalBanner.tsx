'use client'

import Link from 'next/link'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

interface PromotionalBannerProps {
  hasCoupons?: boolean
  couponAmount?: number
  couponLink?: string
}

export function PromotionalBanner({
  hasCoupons = false,
  couponAmount = 3000,
  couponLink = '/journeys/software-design-pattern/chapters/8/missions/1',
}: PromotionalBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  // Only show banner if user has coupons
  if (!hasCoupons || !isVisible) return null

  return (
    <div className="rounded-lg border shadow-sm top-0 left-0 right-0 m-4 p-4 bg-background text-foreground dark:text-foreground static mb-0">
      <div className="flex justify-between items-center">
        <div className="flex-grow">
          <div className="flex items-center justify-between gap-2">
            <Link
              href={couponLink}
              className="text-sm md:text-base text-left underline hover:opacity-80 transition-opacity"
            >
              你有一張 {couponAmount.toLocaleString()} 折價券
            </Link>
            <button
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3"
            >
              前往
            </button>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-4 p-1 rounded-md hover:bg-muted transition-colors"
          aria-label="Close banner"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
