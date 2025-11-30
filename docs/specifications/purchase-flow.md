# Purchase Flow Specification

## Document Information
- **Feature**: Order Confirmation and Payment Flow (Frontend-Focused)
- **Phase**: Phase 2 - Access Control & Payment
- **Status**: Specification Phase - In Progress
- **Created**: 2025-12-01
- **Updated**: 2025-12-01
- **Dependencies**:
  - Phase 1 (Authentication, Curriculum Structure, Lesson Viewer)
  - Purchase System Database (V10, V11 migrations - COMPLETE)

## Table of Contents

1. [Overview](#overview)
2. [Business Context](#business-context)
3. [User Stories](#user-stories)
4. [Acceptance Criteria (BDD)](#acceptance-criteria-bdd)
5. [Technical Specifications](#technical-specifications)
6. [Error Scenarios](#error-scenarios)
7. [Edge Cases](#edge-cases)
8. [API Specifications](#api-specifications)
9. [Database Schema](#database-schema)
10. [Test Strategy](#test-strategy)
11. [Success Metrics](#success-metrics)

---

## Overview

The Purchase Flow feature provides a complete, user-friendly journey for students to purchase curriculums on the WaterBallSA platform. This specification focuses on the **frontend user experience** and **mock payment processing** for Phase 2.

### Goals

- Enable students to review curriculum details before purchase
- Provide transparent pricing with coupon/discount support
- Offer multiple payment method options (mock implementation)
- Create seamless order confirmation and payment experience
- Grant immediate curriculum access after successful payment

### Non-Goals (Phase 3+)

- Real payment gateway integration (Stripe, PayPal, etc.)
- Refund processing
- Email notifications
- Invoice generation
- Admin transaction dashboard
- Subscription plans

---

## Business Context

### Current State

The WaterBallSA platform currently:
- Displays curriculums with pricing on home page
- Shows curriculum details with chapter/lesson structure
- Has database tables for purchases and coupons (Phase 2 migrations complete)
- **Does NOT have** a purchase flow UI for users to buy curriculums

### Problem Statement

Students can browse curriculums but **cannot actually purchase them**. There is no:
1. Order confirmation page to review purchase details
2. Payment page to select payment method and complete purchase
3. Mock payment processing to simulate real payment flows
4. Success confirmation after purchase

This blocks Phase 2 completion and prevents monetization of the platform.

### Solution

Implement a 3-step purchase flow:

```
Step 1: Order Confirmation Page
  ↓
Step 2: Payment Page (with payment method selection)
  ↓
Step 3: Mock Payment Processing → Success Redirect
```

---

## User Stories

### US-1: Review Order Before Purchase
**As a** student
**I want to** review complete curriculum details and pricing before confirming purchase
**So that** I understand exactly what I'm buying and how much I'll pay

**Acceptance Criteria**:
- Order confirmation page displays curriculum title, description, thumbnail
- Full chapter and lesson list displayed
- Pricing breakdown: original price, discount (if any), final price
- Coupon code input field (optional)
- Clear "Confirm Purchase" button
- Ability to cancel and return to curriculum page

### US-2: Apply Discount Coupon
**As a** student
**I want to** apply a discount coupon during checkout
**So that** I can get promotional pricing

**Acceptance Criteria**:
- Coupon input field on order confirmation page
- "Apply Coupon" button validates coupon code
- Valid coupon updates final price immediately
- Invalid coupon shows error message
- Discount amount clearly displayed
- Coupon validation checks expiry date, max uses, active status

### US-3: Select Payment Method
**As a** student
**I want to** choose from multiple payment options
**So that** I can pay using my preferred method

**Acceptance Criteria**:
- Payment page displays order summary (order number, amount, deadline)
- Three payment method options:
  1. ATM Transfer (虛擬帳號匯款)
  2. Credit Card One-Time Payment (信用卡一次付清)
  3. Credit Card Installment (銀角零卡分期)
- Radio buttons or cards for selection
- Selected method highlighted visually
- "Proceed to Payment" button enabled only after selection

### US-4: Complete Mock Payment
**As a** student
**I want to** complete payment quickly in Phase 2
**So that** I can immediately access curriculum content

**Acceptance Criteria**:
- "Proceed to Payment" button triggers mock payment processing
- Processing indicator shown (spinner, progress message)
- Mock payment succeeds after 1-2 second delay (simulates gateway)
- Order status updated from PENDING → PAID
- User redirected to curriculum page or success page
- Curriculum immediately accessible after payment

### US-5: View Order Details
**As a** student
**I want to** see my order number and payment deadline
**So that** I can track my purchase

**Acceptance Criteria**:
- Unique order number generated (format: `YYYYMMDDHHMMSSXXX`)
- Order number displayed on payment page
- Payment deadline calculated (3 days from creation)
- Deadline displayed in readable format (e.g., "December 4, 2025 11:59 PM")
- Order expiration logic implemented (not shown in Phase 2 UI)

---

## Acceptance Criteria (BDD)

### Feature: Order Confirmation Page

#### Scenario 1: Student views order confirmation page
```gherkin
Feature: Order Confirmation
  As a student
  I want to review curriculum details before purchase
  So that I can make an informed buying decision

Scenario: User navigates to order confirmation page
  Given a logged-in user "john@example.com"
  And a curriculum "React Mastery" with ID 1
  And the curriculum has price "$49.99"
  And the curriculum has 5 chapters with 20 lessons
  And the user does not own "React Mastery"
  When the user navigates to "/curriculums/1/orders"
  Then the page should display curriculum title "React Mastery"
  And the page should display curriculum description
  And the page should display curriculum thumbnail image
  And the page should display "5 chapters, 20 lessons"
  And the page should display a list of all chapters with lesson titles
  And the page should display pricing section with:
    | Original Price | $49.99 |
    | Discount       | $0.00  |
    | Final Price    | $49.99 |
  And the page should display a "Confirm Purchase" button
  And the page should display a "Cancel" or "Back" button
```

#### Scenario 2: Student sees detailed chapter and lesson list
```gherkin
Scenario: User expands chapter to see lessons
  Given the user is on the order confirmation page for curriculum 1
  And chapter 1 "Getting Started" has lessons:
    | Lesson Title              | Type    |
    | Welcome to React          | VIDEO   |
    | Installing Node.js        | ARTICLE |
    | Knowledge Check           | SURVEY  |
  When the page loads
  Then chapter 1 should display "Getting Started"
  And chapter 1 should show lesson count "3 lessons"
  And the lessons should be displayed with:
    - Lesson title
    - Lesson type icon (VIDEO/ARTICLE/SURVEY)
    - Lesson duration (if available)
```

#### Scenario 3: Student cannot access order page for owned curriculum
```gherkin
Scenario: User attempts to order already-owned curriculum
  Given a logged-in user "jane@example.com"
  And a curriculum "React Mastery" with ID 1
  And the user already owns "React Mastery" (purchased on "2025-11-15")
  When the user navigates to "/curriculums/1/orders"
  Then the page should redirect to "/curriculums/1"
  And the curriculum page should display "Already Purchased"
  And the curriculum page should display "Purchased on November 15, 2025"
```

#### Scenario 4: Unauthenticated user cannot access order page
```gherkin
Scenario: Guest user attempts to access order confirmation page
  Given an unauthenticated user (not logged in)
  And a curriculum "React Mastery" with ID 1
  When the user navigates to "/curriculums/1/orders"
  Then the page should redirect to "/auth/login"
  And the login page should display "Please log in to purchase curriculums"
  And after successful login, the user should redirect to "/curriculums/1/orders"
```

---

### Feature: Coupon Application

#### Scenario 5: Student applies valid coupon code
```gherkin
Feature: Discount Coupons
  As a student
  I want to apply discount coupons
  So that I can get promotional pricing

Scenario: User applies valid percentage discount coupon
  Given the user is on the order confirmation page for curriculum 1
  And the curriculum price is "$49.99"
  And a coupon "REACT20" exists with:
    | Discount Type  | PERCENTAGE    |
    | Discount Value | 20            |
    | Valid From     | 2025-11-01    |
    | Valid Until    | 2025-12-31    |
    | Max Uses       | 100           |
    | Current Uses   | 45            |
    | Is Active      | true          |
  When the user enters "REACT20" in the coupon field
  And the user clicks "Apply Coupon"
  Then the coupon should be validated successfully
  And the pricing section should update to:
    | Original Price | $49.99  |
    | Discount (20%) | -$10.00 |
    | Final Price    | $39.99  |
  And the coupon field should display "Coupon applied: REACT20"
  And a "Remove Coupon" button should appear
```

#### Scenario 6: Student applies valid fixed amount coupon
```gherkin
Scenario: User applies valid fixed amount discount coupon
  Given the user is on the order confirmation page for curriculum 1
  And the curriculum price is "$49.99"
  And a coupon "SAVE15" exists with:
    | Discount Type  | FIXED_AMOUNT |
    | Discount Value | 15.00        |
    | Valid From     | 2025-11-01   |
    | Valid Until    | 2025-12-31   |
    | Is Active      | true         |
  When the user enters "SAVE15" in the coupon field
  And the user clicks "Apply Coupon"
  Then the pricing section should update to:
    | Original Price | $49.99 |
    | Discount       | -$15.00 |
    | Final Price    | $34.99 |
```

#### Scenario 7: Student applies expired coupon
```gherkin
Scenario: User attempts to apply expired coupon
  Given the user is on the order confirmation page for curriculum 1
  And a coupon "EXPIRED10" exists with:
    | Valid From  | 2025-10-01 |
    | Valid Until | 2025-10-31 |
    | Is Active   | true       |
  And today's date is "2025-12-01"
  When the user enters "EXPIRED10" in the coupon field
  And the user clicks "Apply Coupon"
  Then the page should display error "Coupon has expired"
  And the pricing should remain unchanged
  And the coupon should NOT be applied
```

#### Scenario 8: Student applies fully used coupon
```gherkin
Scenario: User attempts to apply coupon that reached max uses
  Given the user is on the order confirmation page for curriculum 1
  And a coupon "LIMITED" exists with:
    | Max Uses     | 100  |
    | Current Uses | 100  |
    | Valid Until  | 2025-12-31 |
    | Is Active    | true |
  When the user enters "LIMITED" in the coupon field
  And the user clicks "Apply Coupon"
  Then the page should display error "Coupon has reached maximum uses"
  And the pricing should remain unchanged
```

#### Scenario 9: Student applies invalid coupon code
```gherkin
Scenario: User enters non-existent coupon code
  Given the user is on the order confirmation page for curriculum 1
  And no coupon "INVALID123" exists in the system
  When the user enters "INVALID123" in the coupon field
  And the user clicks "Apply Coupon"
  Then the page should display error "Invalid coupon code"
  And the pricing should remain unchanged
```

#### Scenario 10: Student removes applied coupon
```gherkin
Scenario: User removes previously applied coupon
  Given the user is on the order confirmation page for curriculum 1
  And the user has applied coupon "REACT20" (20% discount)
  And the final price is "$39.99"
  When the user clicks "Remove Coupon"
  Then the coupon should be removed
  And the pricing section should update to:
    | Original Price | $49.99 |
    | Discount       | $0.00  |
    | Final Price    | $49.99 |
  And the coupon field should be empty
```

---

### Feature: Order Creation

#### Scenario 11: Student confirms purchase and creates order
```gherkin
Feature: Order Creation
  As a student
  I want to create an order after reviewing details
  So that I can proceed to payment

Scenario: User creates order successfully
  Given the user is on the order confirmation page for curriculum 1
  And the final price is "$49.99" (no coupon applied)
  When the user clicks "Confirm Purchase"
  Then a new order should be created in the database with:
    | user_id        | User's ID             |
    | curriculum_id  | 1                     |
    | order_number   | YYYYMMDDHHMMSSXXX     |
    | status         | PENDING               |
    | original_price | 49.99                 |
    | final_price    | 49.99                 |
    | coupon_code    | null                  |
    | expires_at     | 3 days from creation  |
  And the user should redirect to "/orders/{orderNumber}/payment"
  And the order number should be displayed on payment page
```

#### Scenario 12: Student creates order with coupon
```gherkin
Scenario: User creates order with applied coupon
  Given the user is on the order confirmation page for curriculum 1
  And the user has applied coupon "REACT20"
  And the final price is "$39.99" (20% discount)
  When the user clicks "Confirm Purchase"
  Then a new order should be created with:
    | original_price | 49.99    |
    | final_price    | 39.99    |
    | coupon_code    | REACT20  |
  And the coupon's current_uses should increment from 45 to 46
  And the user should redirect to payment page
```

#### Scenario 13: Order number format validation
```gherkin
Scenario: Order number is generated correctly
  Given the current date/time is "2025-12-01 14:46:35"
  When an order is created
  Then the order_number should match format "20251201144635XXX"
  Where:
    - "20251201" is the date (YYYYMMDD)
    - "144635" is the time (HHMMSS)
    - "XXX" is a 3-digit random number
  And the order_number should be unique across all orders
```

#### Scenario 14: Order expiration timestamp calculation
```gherkin
Scenario: Order expiration is set to 3 days from creation
  Given the current timestamp is "2025-12-01 14:46:35"
  When an order is created
  Then the expires_at timestamp should be "2025-12-04 23:59:59"
  And the order should automatically cancel if not paid before expiration
```

---

### Feature: Payment Page

#### Scenario 15: Student views payment page
```gherkin
Feature: Payment Page
  As a student
  I want to select a payment method and complete payment
  So that I can access the curriculum

Scenario: User lands on payment page after order creation
  Given a logged-in user "john@example.com"
  And an order with order_number "20251201144635001" exists with:
    | status         | PENDING  |
    | final_price    | $49.99   |
    | expires_at     | 2025-12-04 23:59:59 |
  When the user navigates to "/orders/20251201144635001/payment"
  Then the page should display:
    | Order Number      | 20251201144635001           |
    | Course Name       | React Mastery               |
    | Total Amount      | $49.99                      |
    | Payment Deadline  | December 4, 2025 11:59 PM   |
  And the page should display 3 payment method options:
    - ATM Transfer (虛擬帳號匯款)
    - Credit Card One-Time Payment (信用卡一次付清)
    - Credit Card Installment (銀角零卡分期)
  And all payment methods should be unselected initially
  And the "Proceed to Payment" button should be disabled
```

#### Scenario 16: Student selects payment method
```gherkin
Scenario: User selects credit card payment
  Given the user is on the payment page for order "20251201144635001"
  When the user clicks "Credit Card One-Time Payment" option
  Then the selected payment method should be highlighted
  And the "Proceed to Payment" button should be enabled
  And the button text should be "Pay $49.99"
```

#### Scenario 17: Student switches payment method
```gherkin
Scenario: User changes payment method selection
  Given the user is on the payment page for order "20251201144635001"
  And the user has selected "ATM Transfer"
  When the user clicks "Credit Card One-Time Payment"
  Then "Credit Card One-Time Payment" should be highlighted
  And "ATM Transfer" should be unhighlighted
  And only one payment method should be selected at a time
```

#### Scenario 18: Student cannot access payment page for expired order
```gherkin
Scenario: User attempts to pay for expired order
  Given a logged-in user "jane@example.com"
  And an order "20251128100000001" with:
    | status     | PENDING  |
    | expires_at | 2025-11-30 23:59:59 |
  And today's date is "2025-12-01"
  When the user navigates to "/orders/20251128100000001/payment"
  Then the page should display error "Order has expired"
  And the page should display a "Browse Curriculums" button
  And the order status should be updated to "EXPIRED"
```

#### Scenario 19: Student cannot access payment page for completed order
```gherkin
Scenario: User attempts to pay for already paid order
  Given a logged-in user "bob@example.com"
  And an order "20251201120000001" with:
    | status       | PAID |
    | purchased_at | 2025-12-01 12:00:00 |
  When the user navigates to "/orders/20251201120000001/payment"
  Then the page should redirect to "/curriculums/{curriculumId}"
  And the curriculum page should display "Already Purchased"
```

---

### Feature: Mock Payment Processing

#### Scenario 20: Student completes successful payment
```gherkin
Feature: Mock Payment Processing
  As a student
  I want my payment to process quickly in Phase 2
  So that I can immediately access content

Scenario: User completes mock credit card payment
  Given the user is on the payment page for order "20251201144635001"
  And the user has selected "Credit Card One-Time Payment"
  And the order status is "PENDING"
  When the user clicks "Proceed to Payment"
  Then the page should display a processing indicator
  And the page should show message "Processing payment..."
  And after 1-2 seconds, the mock payment should succeed
  And the order status should update to "PAID"
  And the purchased_at timestamp should be set to current time
  And the user should redirect to "/curriculums/{curriculumId}"
  And the curriculum page should display "Purchase successful! You now have access."
```

#### Scenario 21: Mock payment for ATM transfer
```gherkin
Scenario: User completes mock ATM transfer
  Given the user is on the payment page for order "20251201144635001"
  And the user has selected "ATM Transfer"
  When the user clicks "Proceed to Payment"
  Then the mock payment should process
  And the order status should update to "PAID"
  And a payment record should be created with:
    | payment_method | ATM_TRANSFER |
    | status         | COMPLETED    |
  And the user should gain immediate access to curriculum
```

#### Scenario 22: Mock payment for installment
```gherkin
Scenario: User completes mock credit card installment
  Given the user is on the payment page for order "20251201144635001"
  And the user has selected "Credit Card Installment"
  When the user clicks "Proceed to Payment"
  Then the mock payment should process
  And the order status should update to "PAID"
  And a payment record should be created with:
    | payment_method | CREDIT_CARD_INSTALLMENT |
    | status         | COMPLETED               |
```

#### Scenario 23: Payment processing timeout (Edge Case)
```gherkin
Scenario: Mock payment processing takes too long
  Given the user is on the payment page for order "20251201144635001"
  And the mock payment gateway is configured to timeout
  When the user clicks "Proceed to Payment"
  And the processing exceeds 10 seconds
  Then the page should display error "Payment processing timeout. Please try again."
  And the order status should remain "PENDING"
  And the user should see a "Retry Payment" button
```

---

### Feature: Post-Payment Access

#### Scenario 24: Student accesses curriculum after payment
```gherkin
Feature: Content Access After Purchase
  As a student
  I want immediate access to curriculum after payment
  So that I can start learning right away

Scenario: User views curriculum after successful purchase
  Given a logged-in user "john@example.com"
  And the user just completed payment for order "20251201144635001"
  And the order is for curriculum "React Mastery" with ID 1
  And the order status is "PAID"
  When the user lands on "/curriculums/1"
  Then the page should display "Purchase successful! You now have access to all lessons."
  And the "Purchase" button should be replaced with "Start Learning"
  And all lessons should be accessible (no lock icons)
```

#### Scenario 25: Student accesses lesson after payment
```gherkin
Scenario: User directly accesses lesson after purchase
  Given a logged-in user "jane@example.com"
  And the user purchased curriculum 1 via order "20251201144635001"
  And lesson 5 belongs to curriculum 1
  And lesson 5 is NOT a free preview lesson
  When the user navigates to "/lessons/5"
  Then the lesson content should load successfully
  And no "Purchase Required" message should appear
  And the video/article/survey should be fully accessible
```

---

## Error Scenarios

### ES-1: Curriculum Not Found
```gherkin
Scenario: User attempts to order non-existent curriculum
  Given a logged-in user "john@example.com"
  And no curriculum exists with ID 999
  When the user navigates to "/curriculums/999/orders"
  Then the page should return 404 Not Found
  And the page should display "Curriculum not found"
  And the page should provide a link to "Browse All Curriculums"
```

### ES-2: Free Curriculum Order Prevention
```gherkin
Scenario: User attempts to order free curriculum
  Given a logged-in user "jane@example.com"
  And curriculum "Git Basics" has price "$0.00"
  When the user navigates to "/curriculums/{id}/orders"
  Then the page should redirect to "/curriculums/{id}"
  And the curriculum page should NOT display a "Purchase" button
  And all lessons should be freely accessible
```

### ES-3: Network Error During Coupon Validation
```gherkin
Scenario: Coupon validation API fails due to network error
  Given the user is on the order confirmation page
  And the user enters a coupon code "REACT20"
  When the user clicks "Apply Coupon"
  And the API request fails with network error
  Then the page should display "Unable to validate coupon. Please try again."
  And the pricing should remain unchanged
  And a "Retry" button should appear
```

### ES-4: Order Creation Failure
```gherkin
Scenario: Order creation API returns server error
  Given the user is on the order confirmation page
  When the user clicks "Confirm Purchase"
  And the POST /api/orders request fails with 500 Internal Server Error
  Then the page should display "Failed to create order. Please try again."
  And the user should remain on the order confirmation page
  And a "Retry" button should appear
```

### ES-5: Payment Processing Failure
```gherkin
Scenario: Mock payment processing fails unexpectedly
  Given the user is on the payment page
  And the user has selected a payment method
  When the user clicks "Proceed to Payment"
  And the payment processing API returns error
  Then the page should display "Payment failed. Please try again or contact support."
  And the order status should remain "PENDING"
  And the user should be able to retry payment
```

### ES-6: Unauthorized Payment Access
```gherkin
Scenario: User attempts to pay for another user's order
  Given a logged-in user "alice@example.com"
  And an order "20251201144635001" belongs to user "bob@example.com"
  When "alice@example.com" navigates to "/orders/20251201144635001/payment"
  Then the page should return 403 Forbidden
  And the page should display "You cannot access this order"
```

---

## Edge Cases

### EC-1: Coupon Discount Exceeds Price
```gherkin
Scenario: Coupon discount is larger than curriculum price
  Given a curriculum with price "$29.99"
  And a coupon with fixed discount "$50.00"
  When the user applies the coupon
  Then the final price should be "$0.00" (not negative)
  And the discount shown should be "$29.99" (capped at original price)
```

### EC-2: Concurrent Coupon Usage Hitting Max Limit
```gherkin
Scenario: Multiple users apply coupon simultaneously near max uses
  Given a coupon "LIMITED" with max_uses 100 and current_uses 99
  And two users simultaneously apply the coupon
  When both users click "Apply Coupon" at the same time
  Then only ONE user should successfully apply the coupon
  And the other user should receive "Coupon has reached maximum uses"
  And the coupon current_uses should be exactly 100 (not 101)
```

### EC-3: Order Number Collision (Extremely Rare)
```gherkin
Scenario: Two orders created in same millisecond
  Given two users create orders at exactly the same millisecond
  When order numbers are generated
  Then both order numbers should be unique
  And the database constraint should prevent duplicate order_number
  And the second request should retry with new random suffix
```

### EC-4: User Refreshes Payment Page During Processing
```gherkin
Scenario: User refreshes browser during payment processing
  Given the user clicks "Proceed to Payment"
  And payment processing is in progress
  When the user refreshes the page
  Then the page should check the current order status
  And if status is "PAID", redirect to curriculum page
  And if status is "PENDING", allow retry payment
  And duplicate payment should be prevented
```

### EC-5: Timezone Issues with Order Expiration
```gherkin
Scenario: Order expires at midnight in user's timezone
  Given a user in timezone UTC+8
  And an order created on "2025-12-01 14:00:00 UTC"
  And expires_at is "2025-12-04 23:59:59 UTC"
  When the user views the payment page
  Then the deadline should display "December 5, 2025 7:59 AM" (user's local time)
  And expiration logic should use server time (UTC) for consistency
```

### EC-6: Very Long Curriculum Title
```gherkin
Scenario: Curriculum has extremely long title
  Given a curriculum with title exceeding 200 characters
  When the user views order confirmation page
  Then the title should display fully without truncation
  And the layout should remain responsive
  And the title should wrap to multiple lines if needed
```

---

## Technical Specifications

### Frontend Architecture

#### Page Structure

**1. Order Confirmation Page** (`/frontend/src/app/curriculums/[id]/orders/page.tsx`)
- Dynamic route: `/curriculums/{curriculumId}/orders`
- Server-side or client-side data fetching
- Authentication guard: redirect to login if not authenticated
- Ownership check: redirect to curriculum if already owned

**2. Payment Page** (`/frontend/src/app/orders/[orderNumber]/payment/page.tsx`)
- Dynamic route: `/orders/{orderNumber}/payment`
- Fetch order details by order number
- Validate order ownership (user must own order)
- Validate order status (must be PENDING)
- Check expiration before displaying payment options

**3. Payment Success Redirect** (Optional - can reuse curriculum page)
- Redirect to `/curriculums/{curriculumId}?success=true`
- Display success banner on curriculum page

#### Component Breakdown

**1. OrderSummary Component** (`/frontend/src/components/OrderSummary.tsx`)
```typescript
interface OrderSummaryProps {
  curriculum: Curriculum;
  chapters: Chapter[];
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  couponCode?: string | null;
}
```
- Displays curriculum details (title, description, thumbnail)
- Shows chapter/lesson breakdown
- Renders pricing breakdown table

**2. CouponInput Component** (`/frontend/src/components/CouponInput.tsx`)
```typescript
interface CouponInputProps {
  curriculumId: number;
  onCouponApplied: (coupon: AppliedCoupon) => void;
  onCouponRemoved: () => void;
}

interface AppliedCoupon {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  discountAmount: number; // calculated
}
```
- Input field with "Apply" button
- Validates coupon via API call
- Shows success/error messages
- Displays "Remove Coupon" button when applied

**3. PaymentMethodSelector Component** (`/frontend/src/components/PaymentMethodSelector.tsx`)
```typescript
interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

interface PaymentMethodSelectorProps {
  methods: PaymentMethod[];
  selectedMethod?: string;
  onMethodSelect: (methodId: string) => void;
}
```
- Radio buttons or card-based selection
- Three methods: ATM, Credit Card, Installment
- Visual highlight for selected method

**4. OrderDetails Component** (`/frontend/src/components/OrderDetails.tsx`)
```typescript
interface OrderDetailsProps {
  orderNumber: string;
  curriculumTitle: string;
  totalAmount: number;
  expiresAt: string;
}
```
- Displays order number, course name, amount, deadline
- Countdown timer (optional enhancement)

**5. MockPaymentProcessor Component** (`/frontend/src/components/MockPaymentProcessor.tsx`)
```typescript
interface MockPaymentProcessorProps {
  orderNumber: string;
  paymentMethod: string;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}
```
- Handles "Proceed to Payment" button click
- Shows processing indicator
- Calls backend API to complete payment
- Redirects on success

### API Client Functions

**Location**: `/frontend/src/lib/api/orders.ts`

```typescript
// Get order preview for curriculum
export async function getOrderPreview(curriculumId: number): Promise<OrderPreview> {
  // GET /api/curriculums/{id}/order-preview
}

// Validate coupon code
export async function validateCoupon(
  curriculumId: number,
  couponCode: string
): Promise<CouponValidation> {
  // POST /api/coupons/validate
}

// Create pending order
export async function createOrder(data: CreateOrderRequest): Promise<Order> {
  // POST /api/orders
}

// Get order by order number
export async function getOrder(orderNumber: string): Promise<Order> {
  // GET /api/orders/{orderNumber}
}

// Process payment (mock)
export async function processPayment(
  orderNumber: string,
  paymentMethod: string
): Promise<PaymentResult> {
  // POST /api/orders/{orderNumber}/pay
}

// Get user's purchase history
export async function getMyOrders(page?: number, size?: number): Promise<OrderPage> {
  // GET /api/orders/my-orders
}
```

### TypeScript Types

**Location**: `/frontend/src/types/index.ts`

```typescript
// Order types
export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  curriculumId: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED';
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  couponCode?: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  purchasedAt?: string | null;
}

export interface OrderPreview {
  curriculum: Curriculum;
  chapters: Chapter[];
  originalPrice: number;
}

export interface CreateOrderRequest {
  curriculumId: number;
  couponCode?: string | null;
}

export interface CouponValidation {
  valid: boolean;
  discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue?: number;
  discountAmount?: number;
  error?: string;
}

export interface PaymentResult {
  success: boolean;
  orderNumber: string;
  status: string;
  purchasedAt?: string;
  error?: string;
}

export interface OrderPage {
  content: Order[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
```

### Routing

```
/curriculums/[id]/orders  →  OrderConfirmationPage
/orders/[orderNumber]/payment  →  PaymentPage
/orders/my-orders  →  PurchaseHistoryPage (future)
```

### Styling & UX

**Design Principles**:
- Clean, trustworthy checkout experience
- Clear pricing breakdown (no hidden fees)
- Mobile-responsive layout
- Accessible form controls
- Loading states for all async operations
- Optimistic UI updates where safe

**Order Confirmation Page Layout**:
```
┌─────────────────────────────────────────────────────┐
│ Header                                               │
├─────────────────────────────────────────────────────┤
│ Breadcrumb: Home → Curriculums → React Mastery → Order
├─────────────────────────────────────────────────────┤
│                                                      │
│ ┌──────────────────────┐  ┌──────────────────────┐ │
│ │ Curriculum Details   │  │ Pricing Summary      │ │
│ │ - Title              │  │ Original: $49.99     │ │
│ │ - Description        │  │ Discount: -$0.00     │ │
│ │ - Thumbnail          │  │ ─────────────────    │ │
│ │ - 5 chapters         │  │ Total: $49.99        │ │
│ │ - 20 lessons         │  │                      │ │
│ │                      │  │ [Coupon Input]       │ │
│ │ Chapter 1: Getting   │  │                      │ │
│ │   ▸ Lesson 1.1       │  │ [Confirm Purchase]   │ │
│ │   ▸ Lesson 1.2       │  │ [Cancel]             │ │
│ │ ...                  │  └──────────────────────┘ │
│ └──────────────────────┘                           │
└─────────────────────────────────────────────────────┘
```

**Payment Page Layout**:
```
┌─────────────────────────────────────────────────────┐
│ Header                                               │
├─────────────────────────────────────────────────────┤
│ Payment                                              │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Order Summary:                                       │
│ Order Number: 20251201144635001                      │
│ Course: React Mastery                                │
│ Amount: $49.99                                       │
│ Deadline: December 4, 2025 11:59 PM                  │
│                                                      │
│ ─────────────────────────────────────────────────── │
│                                                      │
│ Select Payment Method:                               │
│                                                      │
│ ┌─────────────────────────────────────────────┐    │
│ │ ○ ATM Transfer (虛擬帳號匯款)                │    │
│ └─────────────────────────────────────────────┘    │
│ ┌─────────────────────────────────────────────┐    │
│ │ ● Credit Card One-Time (信用卡一次付清)      │    │
│ └─────────────────────────────────────────────┘    │
│ ┌─────────────────────────────────────────────┐    │
│ │ ○ Credit Card Installment (銀角零卡分期)     │    │
│ └─────────────────────────────────────────────┘    │
│                                                      │
│          [Proceed to Payment - $49.99]              │
│                                                      │
│ ─────────────────────────────────────────────────── │
│ ▸ Invoice Information (expandable)                  │
│ ─────────────────────────────────────────────────── │
│ Terms of Service | Privacy Policy                   │
└─────────────────────────────────────────────────────┘
```

---

## API Specifications

### Backend Endpoints

#### 1. GET /api/curriculums/{id}/order-preview
**Purpose**: Get order preview with full curriculum details for order confirmation page

**Authentication**: Required (JWT Bearer)

**Path Parameters**:
- `id` (required): Curriculum ID

**Success Response (200 OK)**:
```json
{
  "curriculum": {
    "id": 1,
    "title": "React Mastery",
    "description": "Master React from basics to advanced topics",
    "thumbnailUrl": "https://example.com/thumb.jpg",
    "price": 49.99,
    "difficultyLevel": "INTERMEDIATE",
    "isPublished": true
  },
  "chapters": [
    {
      "id": 1,
      "title": "Getting Started",
      "orderIndex": 0,
      "lessons": [
        {
          "id": 1,
          "title": "Welcome to React",
          "lessonType": "VIDEO",
          "durationMinutes": 15,
          "orderIndex": 0
        }
      ]
    }
  ],
  "originalPrice": 49.99
}
```

**Error Responses**:
- `401 Unauthorized`: Not logged in
- `404 Not Found`: Curriculum does not exist
- `409 Conflict`: User already owns curriculum

---

#### 2. POST /api/coupons/validate
**Purpose**: Validate coupon code for a curriculum

**Authentication**: Required (JWT Bearer)

**Request Body**:
```json
{
  "curriculumId": 1,
  "couponCode": "REACT20"
}
```

**Success Response (200 OK)**:
```json
{
  "valid": true,
  "discountType": "PERCENTAGE",
  "discountValue": 20,
  "discountAmount": 10.00
}
```

**Invalid Coupon Response (200 OK)**:
```json
{
  "valid": false,
  "error": "Coupon has expired"
}
```

**Error Response (400 Bad Request)**:
```json
{
  "error": "INVALID_REQUEST",
  "message": "Curriculum ID is required"
}
```

---

#### 3. POST /api/orders
**Purpose**: Create a pending order

**Authentication**: Required (JWT Bearer)

**Request Body**:
```json
{
  "curriculumId": 1,
  "couponCode": "REACT20"
}
```

**Success Response (201 Created)**:
```json
{
  "orderNumber": "20251201144635001",
  "curriculumId": 1,
  "curriculumTitle": "React Mastery",
  "status": "PENDING",
  "originalPrice": 49.99,
  "discountAmount": 10.00,
  "finalPrice": 39.99,
  "couponCode": "REACT20",
  "expiresAt": "2025-12-04T23:59:59Z",
  "createdAt": "2025-12-01T14:46:35Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid curriculum ID or coupon code
- `401 Unauthorized`: Not logged in
- `409 Conflict`: User already owns curriculum
- `404 Not Found`: Curriculum not found

---

#### 4. GET /api/orders/{orderNumber}
**Purpose**: Get order details for payment page

**Authentication**: Required (JWT Bearer)

**Path Parameters**:
- `orderNumber` (required): Unique order number

**Success Response (200 OK)**:
```json
{
  "orderNumber": "20251201144635001",
  "curriculumId": 1,
  "curriculumTitle": "React Mastery",
  "status": "PENDING",
  "originalPrice": 49.99,
  "discountAmount": 10.00,
  "finalPrice": 39.99,
  "couponCode": "REACT20",
  "expiresAt": "2025-12-04T23:59:59Z",
  "createdAt": "2025-12-01T14:46:35Z",
  "purchasedAt": null
}
```

**Error Responses**:
- `401 Unauthorized`: Not logged in
- `403 Forbidden`: Order belongs to another user
- `404 Not Found`: Order not found

---

#### 5. POST /api/orders/{orderNumber}/pay
**Purpose**: Process mock payment and complete order

**Authentication**: Required (JWT Bearer)

**Path Parameters**:
- `orderNumber` (required): Order number to pay

**Request Body**:
```json
{
  "paymentMethod": "CREDIT_CARD"
}
```

**Supported Payment Methods**:
- `ATM_TRANSFER`
- `CREDIT_CARD`
- `CREDIT_CARD_INSTALLMENT`

**Success Response (200 OK)**:
```json
{
  "success": true,
  "orderNumber": "20251201144635001",
  "status": "PAID",
  "purchasedAt": "2025-12-01T14:50:00Z",
  "curriculumId": 1
}
```

**Error Responses**:
- `400 Bad Request`: Invalid payment method or order already paid/expired
- `401 Unauthorized`: Not logged in
- `403 Forbidden`: Order belongs to another user
- `404 Not Found`: Order not found
- `422 Unprocessable Entity`: Payment processing failed

---

#### 6. GET /api/orders/my-orders
**Purpose**: Get authenticated user's order history

**Authentication**: Required (JWT Bearer)

**Query Parameters**:
- `page` (optional, default: 0)
- `size` (optional, default: 10)
- `sort` (optional, default: "createdAt,desc")

**Success Response (200 OK)**:
```json
{
  "content": [
    {
      "orderNumber": "20251201144635001",
      "curriculum": {
        "id": 1,
        "title": "React Mastery",
        "thumbnailUrl": "https://example.com/thumb.jpg"
      },
      "finalPrice": 39.99,
      "status": "PAID",
      "purchasedAt": "2025-12-01T14:50:00Z",
      "createdAt": "2025-12-01T14:46:35Z"
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 1,
  "totalPages": 1
}
```

---

## Database Schema

### Tables (Already Created in V10, V11 migrations)

#### orders Table
```sql
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    curriculum_id BIGINT NOT NULL REFERENCES curriculums(id),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'PAID', 'CANCELLED', 'EXPIRED')),
    original_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    final_price DECIMAL(10,2) NOT NULL,
    coupon_code VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    purchased_at TIMESTAMP,
    CONSTRAINT unique_user_curriculum UNIQUE (user_id, curriculum_id)
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
```

#### coupons Table
```sql
CREATE TABLE coupons (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FIXED_AMOUNT')),
    discount_value DECIMAL(10,2) NOT NULL,
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    max_uses INTEGER NOT NULL,
    current_uses INTEGER NOT NULL DEFAULT 0 CHECK (current_uses <= max_uses),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active);
```

### Business Logic Rules

1. **Order Number Generation**:
   - Format: `YYYYMMDDHHMMSS` + 3-digit random number
   - Must be unique (database constraint)
   - Generated server-side

2. **Order Expiration**:
   - `expires_at` = `created_at` + 3 days
   - Expiration checked before payment
   - Expired orders auto-update to EXPIRED status

3. **Coupon Validation**:
   - Check `is_active = true`
   - Check `CURRENT_TIMESTAMP BETWEEN valid_from AND valid_until`
   - Check `current_uses < max_uses`
   - Increment `current_uses` when order created with coupon

4. **Discount Calculation**:
   - **PERCENTAGE**: `discount_amount = original_price * (discount_value / 100)`
   - **FIXED_AMOUNT**: `discount_amount = MIN(discount_value, original_price)`
   - `final_price = original_price - discount_amount`
   - `final_price` cannot be negative

5. **Purchase Access**:
   - User owns curriculum if order exists with `status = 'PAID'`
   - Backend validates ownership before serving paid lesson content
   - Free curriculums (price = 0) do not require orders

---

## Test Strategy

### Test Coverage Requirements

- **Unit Tests**: >80% code coverage
- **Integration Tests**: All API endpoints tested
- **E2E Tests**: Complete user journeys automated

### Backend Tests (JUnit + TestContainers)

#### Unit Tests
**Location**: `backend/src/test/java/com/waterballsa/backend/service/`

```java
// OrderServiceTest.java
@Test
void createOrder_withValidData_shouldCreatePendingOrder() { }

@Test
void createOrder_withValidCoupon_shouldApplyDiscount() { }

@Test
void createOrder_withExpiredCoupon_shouldThrowException() { }

@Test
void createOrder_forOwnedCurriculum_shouldThrowConflictException() { }

@Test
void getOrder_withValidOrderNumber_shouldReturnOrder() { }

@Test
void getOrder_byDifferentUser_shouldThrowForbiddenException() { }

// PaymentServiceTest.java
@Test
void processPayment_withValidOrder_shouldMarkAsPaid() { }

@Test
void processPayment_onExpiredOrder_shouldThrowException() { }

@Test
void processPayment_onAlreadyPaidOrder_shouldThrowException() { }

// CouponServiceTest.java
@Test
void validateCoupon_withValidCode_shouldReturnDiscount() { }

@Test
void validateCoupon_withExpiredCode_shouldReturnInvalid() { }

@Test
void validateCoupon_withMaxUsesReached_shouldReturnInvalid() { }

@Test
void applyCoupon_shouldIncrementCurrentUses() { }
```

#### Integration Tests
**Location**: `backend/src/test/java/com/waterballsa/backend/controller/`

```java
// OrderControllerIntegrationTest.java
@Test
void getOrderPreview_withAuth_shouldReturn200() { }

@Test
void createOrder_withValidData_shouldReturn201() { }

@Test
void createOrder_withoutAuth_shouldReturn401() { }

@Test
void createOrder_forOwnedCurriculum_shouldReturn409() { }

@Test
void processPayment_withValidOrder_shouldReturn200AndGrantAccess() { }

@Test
void getMyOrders_shouldReturnPaginatedResults() { }
```

### Frontend Tests (Jest + React Testing Library)

#### Component Tests
**Location**: `frontend/src/components/__tests__/`

```typescript
// OrderSummary.test.tsx
test('renders curriculum details correctly', () => {});
test('displays pricing breakdown', () => {});
test('shows chapter and lesson list', () => {});

// CouponInput.test.tsx
test('validates coupon on apply click', () => {});
test('displays error for invalid coupon', () => {});
test('updates pricing after applying coupon', () => {});
test('allows removing applied coupon', () => {});

// PaymentMethodSelector.test.tsx
test('renders all payment methods', () => {});
test('highlights selected method', () => {});
test('allows switching methods', () => {});
test('enables proceed button when method selected', () => {});

// MockPaymentProcessor.test.tsx
test('shows processing indicator during payment', () => {});
test('redirects on successful payment', () => {});
test('displays error on payment failure', () => {});
```

#### Page Tests
**Location**: `frontend/src/app/**/__tests__/`

```typescript
// curriculums/[id]/orders/page.test.tsx
test('redirects if user already owns curriculum', () => {});
test('redirects if user not authenticated', () => {});
test('renders order confirmation page correctly', () => {});

// orders/[orderNumber]/payment/page.test.tsx
test('fetches and displays order details', () => {});
test('redirects if order expired', () => {});
test('redirects if order already paid', () => {});
test('prevents access to other users orders', () => {});
```

### E2E Tests (Playwright)

**Location**: `frontend/tests/e2e/purchase-flow.spec.ts`

```typescript
test.describe('Purchase Flow', () => {
  test('complete purchase with coupon', async ({ page }) => {
    // 1. Login
    // 2. Navigate to curriculum page
    // 3. Click "Purchase" button
    // 4. Apply coupon code
    // 5. Verify discount applied
    // 6. Click "Confirm Purchase"
    // 7. Select payment method
    // 8. Click "Proceed to Payment"
    // 9. Wait for processing
    // 10. Verify redirect to curriculum page
    // 11. Verify "Already Purchased" status
    // 12. Access a lesson and verify content loads
  });

  test('failed coupon application', async ({ page }) => {
    // 1. Navigate to order confirmation
    // 2. Enter invalid coupon
    // 3. Click "Apply Coupon"
    // 4. Verify error message
    // 5. Verify pricing unchanged
  });

  test('expired order payment prevention', async ({ page }) => {
    // 1. Create order via API
    // 2. Update order expires_at to past date via API
    // 3. Navigate to payment page
    // 4. Verify error message displayed
    // 5. Verify no payment button
  });

  test('duplicate purchase prevention', async ({ page }) => {
    // 1. Login as user with existing purchase
    // 2. Navigate to curriculum page
    // 3. Verify no "Purchase" button
    // 4. Verify "Already Purchased" message
    // 5. Attempt to access /orders page directly
    // 6. Verify redirect to curriculum page
  });
});
```

### Test Data (Seed Data)

**Location**: `backend/src/main/resources/db/migration/V12__insert_purchase_seed_data.sql`

Already includes:
- Sample orders with various statuses (PENDING, PAID, EXPIRED)
- Mix of orders with and without coupons
- Orders for different users and curriculums

**Location**: `backend/src/main/resources/db/migration/V14__insert_coupon_seed_data.sql`

Already includes:
- Valid active coupons
- Expired coupons
- Coupons near max uses
- Both PERCENTAGE and FIXED_AMOUNT types

---

## Success Metrics

### Functional Completeness
- All BDD scenarios pass automated tests
- Order confirmation page displays correctly
- Coupon application works with all validation rules
- Payment page shows all required information
- Mock payment processing completes successfully
- Users gain immediate curriculum access after payment

### Performance
- Order confirmation page loads within 2 seconds
- Coupon validation completes within 500ms
- Payment processing completes within 2 seconds
- Page transitions are smooth (client-side routing)

### User Experience
- Clear, trustworthy checkout flow
- No confusing error messages
- Mobile-responsive design works on all devices
- Loading states prevent user confusion
- Success confirmations are obvious

### Test Coverage
- >80% unit test coverage for order/payment services
- All API endpoints have integration tests
- E2E tests cover complete purchase flows
- All Given-When-Then scenarios automated

### Business Goals
- Users can successfully purchase curriculums
- Coupon system drives promotional sales
- No duplicate purchases allowed
- Purchase history accurately tracked
- Revenue generation enabled

---

## Implementation Checklist

### Phase 1: Database & API (Already Complete)
- [x] Create `orders` table (V10 migration)
- [x] Create `coupons` table (V11 migration)
- [x] Insert seed data (V12, V14 migrations)

### Phase 2: Backend Implementation
- [ ] Create `Order` entity and repository
- [ ] Create `Coupon` entity and repository
- [ ] Implement `OrderService`:
  - [ ] `getOrderPreview(curriculumId)`
  - [ ] `createOrder(userId, curriculumId, couponCode)`
  - [ ] `getOrder(orderNumber)`
  - [ ] `getMyOrders(userId, pageable)`
- [ ] Implement `CouponService`:
  - [ ] `validateCoupon(curriculumId, couponCode)`
  - [ ] `applyCoupon(orderNumber, couponCode)`
- [ ] Implement `PaymentService`:
  - [ ] `processPayment(orderNumber, paymentMethod)` (mock)
- [ ] Create `OrderController`:
  - [ ] `GET /api/curriculums/{id}/order-preview`
  - [ ] `POST /api/orders`
  - [ ] `GET /api/orders/{orderNumber}`
  - [ ] `POST /api/orders/{orderNumber}/pay`
  - [ ] `GET /api/orders/my-orders`
- [ ] Create `CouponController`:
  - [ ] `POST /api/coupons/validate`
- [ ] Write backend unit tests (>80% coverage)
- [ ] Write backend integration tests (all endpoints)

### Phase 3: Frontend Implementation
- [ ] Create TypeScript types for orders, coupons, payments
- [ ] Implement API client functions:
  - [ ] `getOrderPreview()`
  - [ ] `validateCoupon()`
  - [ ] `createOrder()`
  - [ ] `getOrder()`
  - [ ] `processPayment()`
  - [ ] `getMyOrders()`
- [ ] Create components:
  - [ ] `OrderSummary.tsx`
  - [ ] `CouponInput.tsx`
  - [ ] `PaymentMethodSelector.tsx`
  - [ ] `OrderDetails.tsx`
  - [ ] `MockPaymentProcessor.tsx`
- [ ] Create pages:
  - [ ] `/curriculums/[id]/orders/page.tsx`
  - [ ] `/orders/[orderNumber]/payment/page.tsx`
- [ ] Implement authentication guards
- [ ] Implement ownership checks and redirects
- [ ] Write component unit tests (>80% coverage)
- [ ] Write page integration tests

### Phase 4: E2E Testing
- [ ] Write Playwright tests for complete purchase flows
- [ ] Test coupon application scenarios
- [ ] Test payment method selection and processing
- [ ] Test error scenarios (expired order, invalid coupon, etc.)
- [ ] Test duplicate purchase prevention
- [ ] Test access control after purchase

### Phase 5: Documentation & Deployment
- [ ] Update `CLAUDE.md` with purchase flow details
- [ ] Update `README.md` if needed
- [ ] Create user documentation for purchase process
- [ ] Test in Docker environment
- [ ] Verify all tests pass in CI/CD pipeline
- [ ] Deploy to staging environment
- [ ] Perform QA testing
- [ ] Deploy to production

---

## Definition of Done

Before marking this feature as complete, verify:

- [ ] All BDD scenarios implemented and passing
- [ ] Backend unit tests >80% coverage
- [ ] Backend integration tests cover all endpoints
- [ ] Frontend component tests >80% coverage
- [ ] E2E tests cover all user journeys
- [ ] All tests run successfully in Docker
- [ ] Order confirmation page works correctly
- [ ] Coupon validation and application works
- [ ] Payment page displays correctly
- [ ] Mock payment processing succeeds
- [ ] Curriculum access granted after payment
- [ ] Duplicate purchase prevention works
- [ ] Order expiration logic works
- [ ] Error handling tested for all failure scenarios
- [ ] Mobile-responsive design verified
- [ ] Accessibility tested (keyboard navigation, screen readers)
- [ ] Documentation updated
- [ ] Code reviewed and approved
- [ ] Feature deployed to production

---

## Future Enhancements (Phase 3+)

1. **Real Payment Gateway Integration**
   - Stripe or PayPal integration
   - Webhook handling for payment confirmations
   - Payment status reconciliation

2. **Refund System**
   - Refund request workflow
   - Admin approval for refunds
   - Partial and full refunds

3. **Email Notifications**
   - Order confirmation emails
   - Payment receipts
   - Order expiration reminders

4. **Invoice Generation**
   - PDF invoice creation
   - Tax calculation
   - Corporate billing support

5. **Advanced Coupon Features**
   - User-specific coupons
   - First-time buyer discounts
   - Curriculum-specific coupons
   - Bulk coupon generation

6. **Purchase History Page**
   - Dedicated `/orders/my-orders` page
   - Filtering and sorting
   - Download invoices

7. **Order Countdown Timer**
   - Live countdown on payment page
   - Email reminders before expiration
   - Auto-cancellation on expiration

---

## Questions for Stakeholders

1. **Payment Methods**: Should we display different payment methods for different regions or user types?
2. **Order Expiration**: Is 3 days the correct expiration period? Should it be configurable?
3. **Coupon Stacking**: Can users apply multiple coupons to one order?
4. **Invoice Requirements**: Are invoices required for Phase 2 or can they wait for Phase 3?
5. **Refund Policy**: What should be the refund policy when we implement it in Phase 3?
6. **Currency**: USD only in Phase 2, or multi-currency support needed?
7. **Tax Handling**: Should sales tax be calculated and displayed?

---

## Revision History

| Version | Date       | Author | Changes                                |
|---------|------------|--------|----------------------------------------|
| 1.0     | 2025-12-01 | Claude | Initial specification for purchase flow |

---

**Status**: 🟡 Specification Phase - In Progress

**Next Steps**:
1. Review specification with stakeholders
2. Answer stakeholder questions
3. Approve specification
4. Proceed to Backend Implementation Phase
5. Follow with Frontend Implementation Phase
6. Complete with E2E Testing Phase
