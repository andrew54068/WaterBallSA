# Purchase System Specification

## Document Information
- **Feature**: Purchase System with Simplified Mock Payment
- **Phase**: Phase 2 - Access Control & Payment
- **Status**: Database Design - Complete | Next: API Design
- **Created**: 2025-11-28
- **Updated**: 2025-11-28
- **Dependencies**: Phase 1 (Authentication, Curriculum Structure)

## Completion Status

- [x] Specification Phase - Stakeholder decisions confirmed
- [x] Database Design Phase - Schema created and tested
  - [x] `purchases` table created with all constraints
  - [x] `coupons` table created (Phase 3 ready)
  - [x] Seed data inserted and verified
  - [x] Migrations tested in Docker
  - [x] Database documentation created
- [ ] API Design Phase - Next
- [ ] Implementation Phase
- [ ] Testing Phase
- [ ] Documentation Phase

## Stakeholder Decisions (2025-11-28)
1. **No Refunds**: Courses are NOT refundable in Phase 2
2. **Pricing**: Fixed curriculum price with optional coupon support (coupons change final price)
3. **Payment**: Simplified mock - just a button click that updates purchase status to "completed" (no payment gateway simulation)
4. **No Gifting**: Users can only purchase for themselves
5. **No Email Notifications**: Phase 2 will not send purchase confirmation emails
6. **No Admin Features**: Admin transaction dashboard deferred to Phase 3

## Business Context

### Overview
The Purchase System enables users to buy curriculums and access paid content on the WaterBallSA platform. This system replaces the current mock access control with real purchase tracking and payment processing.

### User Stories

**As a student**, I want to:
- Browse curriculums and see their prices
- Purchase a curriculum with my preferred payment method
- Access all lessons in a curriculum after purchase
- View my purchase history
- Receive confirmation after successful purchase

**As the platform**, we need to:
- Track all purchases and payments
- Prevent duplicate purchases
- Validate ownership before serving content
- Handle payment failures gracefully
- Maintain financial records for auditing

### Business Goals
1. Generate revenue through curriculum sales
2. Provide secure and reliable payment processing
3. Improve user experience with clear purchase flows
4. Build foundation for future payment features (refunds, subscriptions)

## Domain Model

### Entities

#### Purchase
- **Purpose**: Records a user's ownership of a curriculum
- **Key Attributes**:
  - `id` (Primary Key, BIGSERIAL)
  - `user_id` (Foreign Key → users, NOT NULL)
  - `curriculum_id` (Foreign Key → curriculums, NOT NULL)
  - `original_price` (DECIMAL(10,2), NOT NULL) - Curriculum price at purchase time
  - `final_price` (DECIMAL(10,2), NOT NULL) - Price after coupon discount (if any)
  - `coupon_code` (VARCHAR(50), NULLABLE) - Coupon used (Phase 3 feature)
  - `status` (VARCHAR(20), NOT NULL) - PENDING, COMPLETED, CANCELLED
  - `purchased_at` (TIMESTAMP, NULLABLE) - When purchase completed
  - `created_at`, `updated_at` (TIMESTAMP, auto-updated)
- **Invariants**:
  - User can only purchase the same curriculum once (UNIQUE constraint on user_id + curriculum_id)
  - `original_price` must match curriculum price at time of purchase
  - `final_price` must be <= `original_price`
  - Status can only be: PENDING → COMPLETED or PENDING → CANCELLED
  - `purchased_at` is set when status changes to COMPLETED
- **Phase 2 Simplifications**:
  - No refunds (REFUNDED status removed)
  - Payment is instant (no PROCESSING status, just PENDING → COMPLETED)
  - Coupon support is deferred to Phase 3 (column exists but not used)

#### Coupon (Phase 3 - Schema Only)
- **Purpose**: Discount codes for promotional pricing
- **Key Attributes**:
  - `id` (Primary Key, BIGSERIAL)
  - `code` (VARCHAR(50), UNIQUE, NOT NULL)
  - `discount_type` (VARCHAR(20), NOT NULL) - PERCENTAGE, FIXED_AMOUNT
  - `discount_value` (DECIMAL(10,2), NOT NULL)
  - `valid_from` (TIMESTAMP, NOT NULL)
  - `valid_until` (TIMESTAMP, NOT NULL)
  - `max_uses` (INTEGER, NOT NULL) - Maximum total uses
  - `current_uses` (INTEGER, NOT NULL, DEFAULT 0) - Current usage count
  - `is_active` (BOOLEAN, NOT NULL, DEFAULT TRUE)
  - `created_at`, `updated_at` (TIMESTAMP, auto-updated)
- **Phase 2 Note**: Table created but NOT implemented in business logic (future-proofing)

## Acceptance Criteria (BDD Scenarios)

### Scenario 1: Successful Curriculum Purchase (Simplified)
```gherkin
Feature: Curriculum Purchase
  As a student
  I want to purchase a curriculum
  So that I can access all its lessons

Scenario: User successfully purchases a curriculum
  Given a logged-in user "john@example.com"
  And a curriculum "React Mastery" with price "$49.99"
  And the user does not own "React Mastery"
  When the user navigates to the curriculum detail page
  And the user clicks the "Purchase Now" button
  Then a purchase record should be created with:
    | user_id        | john@example.com's user ID |
    | curriculum_id  | React Mastery's ID         |
    | original_price | 49.99                      |
    | final_price    | 49.99                      |
    | status         | COMPLETED                  |
    | purchased_at   | current timestamp          |
  And the user should see a success message "Purchase completed successfully!"
  And the user should be redirected to the curriculum page
  And the user should now have access to all lessons in "React Mastery"
```

### Scenario 2: Purchase Cancellation (Edge Case)
```gherkin
Scenario: User cancels purchase before completion
  Given a logged-in user "jane@example.com"
  And a curriculum "Java Advanced" with price "$79.99"
  And the user does not own "Java Advanced"
  And the user starts a purchase (status "PENDING")
  When the user navigates away before clicking "Purchase Now"
  Or the user clicks a "Cancel" button
  Then the purchase record should be updated with status "CANCELLED"
  And the user should NOT have access to any lessons in "Java Advanced"

Note: Phase 2 simplified flow makes purchases instant, so CANCELLED status
      is primarily for future use (e.g., timeout scenarios, multi-step flows)
```

### Scenario 3: Duplicate Purchase Prevention
```gherkin
Scenario: User attempts to purchase already-owned curriculum
  Given a logged-in user "bob@example.com"
  And a curriculum "Data Structures" with price "$59.99"
  And the user already owns "Data Structures" (purchased on "2025-11-01")
  When the user navigates to the curriculum detail page
  Then the user should see "Already Purchased" instead of "Purchase" button
  And the user should see their purchase date "Purchased on November 1, 2025"
  And the user should have immediate access to all lessons
```

```gherkin
Scenario: Concurrent purchase attempt prevention
  Given a logged-in user "alice@example.com"
  And a curriculum "Machine Learning" with price "$99.99"
  And the user does not own "Machine Learning"
  When the user submits a purchase request
  And the system begins processing the payment
  And the user submits another purchase request for the same curriculum (concurrent request)
  Then the second request should be rejected with error "Purchase already in progress"
  And only one purchase record should be created
  And only one payment transaction should be initiated
```

### Scenario 4: Access Control After Purchase
```gherkin
Scenario: User accesses lesson after purchase
  Given a logged-in user "carol@example.com"
  And a curriculum "SQL Fundamentals" with price "$39.99"
  And the user purchased "SQL Fundamentals" on "2025-11-20"
  And the purchase status is "COMPLETED"
  When the user navigates to any lesson in "SQL Fundamentals"
  Then the user should be able to view the lesson content
  And no purchase prompt should be displayed
```

```gherkin
Scenario: User cannot access lesson without purchase
  Given a logged-in user "dave@example.com"
  And a curriculum "Python Advanced" with price "$69.99"
  And the user does not own "Python Advanced"
  When the user attempts to access a paid lesson in "Python Advanced"
  Then the user should see a message "Purchase required to access this content"
  And the user should see a "Purchase Curriculum" button
  And the lesson content should NOT be displayed
```

```gherkin
Scenario: Backend API validates ownership
  Given a logged-in user "eve@example.com"
  And a curriculum "DevOps Essentials" with price "$54.99"
  And the user does not own "DevOps Essentials"
  When the user makes a direct API call to GET /api/lessons/{lessonId}
  And the lesson belongs to "DevOps Essentials"
  And the lesson is not a free preview lesson
  Then the API should return 403 Forbidden
  And the error message should be "You must purchase this curriculum to access this lesson"
```

### Scenario 5: View Purchase History
```gherkin
Scenario: User views their purchase history
  Given a logged-in user "frank@example.com"
  And the user has made the following purchases:
    | curriculum           | price   | date       | status    |
    | React Basics         | $29.99  | 2025-10-15 | COMPLETED |
    | Node.js Intermediate | $49.99  | 2025-11-01 | COMPLETED |
    | GraphQL Essentials   | $39.99  | 2025-11-20 | COMPLETED |
  When the user navigates to "My Purchases" page
  Then the user should see a list of 3 purchases
  And each purchase should display:
    - Curriculum title and thumbnail
    - Purchase date
    - Amount paid
    - Status
    - "View Curriculum" link
  And the purchases should be sorted by date (newest first)
```

```gherkin
Scenario: User with no purchases views purchase history
  Given a logged-in user "grace@example.com"
  And the user has not made any purchases
  When the user navigates to "My Purchases" page
  Then the user should see message "You haven't purchased any curriculums yet"
  And the user should see a "Browse Curriculums" link
```

### Scenario 6: Price Changes Don't Affect Existing Purchases
```gherkin
Scenario: Curriculum price increases after user purchase
  Given a curriculum "TypeScript Pro" with price "$59.99"
  And a logged-in user "henry@example.com"
  And the user purchased "TypeScript Pro" for "$59.99" on "2025-11-01"
  When the platform increases the price of "TypeScript Pro" to "$79.99" on "2025-11-15"
  And the user views their purchase history
  Then the purchase record should show amount paid as "$59.99"
  And the user should retain full access to "TypeScript Pro"
  And new users should see the price as "$79.99"
```

### Scenario 7: Multiple Payment Methods
```gherkin
Scenario: User purchases with PayPal
  Given a logged-in user "iris@example.com"
  And a curriculum "Angular Deep Dive" with price "$64.99"
  And the user does not own "Angular Deep Dive"
  When the user attempts to purchase "Angular Deep Dive"
  And the user selects payment method "PayPal"
  And the user completes PayPal authentication
  And PayPal confirms the payment
  Then the purchase should be created with status "COMPLETED"
  And the payment transaction should record payment_method as "PAYPAL"
  And the user should receive a purchase confirmation
```

### Scenario 8: Free Curriculum Access (Edge Case)
```gherkin
Scenario: User accesses free curriculum without purchase
  Given a logged-in user "jack@example.com"
  And a curriculum "Git Basics" with price "$0.00" (free)
  And the user has not "purchased" "Git Basics"
  When the user navigates to any lesson in "Git Basics"
  Then the user should be able to view the lesson content
  And no purchase prompt should be displayed
  And no purchase record should be created
```

```gherkin
Scenario: Free curriculum does not appear in purchase history
  Given a logged-in user "kate@example.com"
  And the user has accessed free curriculum "Git Basics"
  And the user has purchased paid curriculum "Docker Fundamentals" for "$44.99"
  When the user views their purchase history
  Then the user should see only 1 purchase ("Docker Fundamentals")
  And "Git Basics" should NOT appear in the list
```

### Scenario 9: Network Error During Payment
```gherkin
Scenario: Payment gateway is unreachable
  Given a logged-in user "liam@example.com"
  And a curriculum "Kubernetes Mastery" with price "$89.99"
  And the user does not own "Kubernetes Mastery"
  When the user attempts to purchase "Kubernetes Mastery"
  And the user submits valid payment details
  And the payment gateway is unreachable (network timeout)
  Then the purchase record should be created with status "PENDING"
  And the payment transaction should be marked as "FAILED"
  And the error message should be "Payment gateway unavailable. Please try again later."
  And the user should see an error message
  And the user should be able to retry the purchase
```

### Scenario 10: Admin Views All Transactions (Future - Phase 3)
```gherkin
Scenario: Admin reviews payment transactions for auditing
  Given an admin user "admin@waterballsa.com"
  When the admin navigates to "Payment Transactions" dashboard
  Then the admin should see all payment transactions
  And the admin should be able to filter by:
    - Status (PENDING, COMPLETED, FAILED, REFUNDED)
    - Date range
    - Payment method
    - User email
  And the admin should see aggregate statistics:
    - Total revenue
    - Success rate
    - Failed payment count
```

## Business Rules

### Purchase Rules
1. **Authentication Required**: Only logged-in users can purchase curriculums
2. **Single Purchase**: A user can purchase the same curriculum only once
3. **Price Locking**: Amount paid is locked at purchase time (not affected by future price changes)
4. **Free Curriculum Exception**: Curriculums with price $0.00 do not require purchase records
5. **Idempotency**: Duplicate purchase requests (same user + curriculum) within 5 minutes should return existing purchase
6. **Purchase Status Lifecycle**:
   - PENDING: Payment initiated but not confirmed
   - COMPLETED: Payment successful, user has access
   - FAILED: Payment rejected, user has no access
   - REFUNDED: Purchase was refunded (Phase 3)

### Payment Rules
1. **Mock Gateway Simulation**: Use deterministic test data to simulate payment outcomes:
   - Card ending in `0000`: Always fails (insufficient funds)
   - Card ending in `1111`: Always times out (gateway error)
   - All other valid cards: Always succeed
2. **Transaction ID Generation**: Generate unique transaction ID in format `TXN-{timestamp}-{randomString}`
3. **Payment Status Lifecycle**:
   - PENDING → PROCESSING → COMPLETED/FAILED
   - COMPLETED → REFUNDED (Phase 3)
4. **Error Message Requirements**: All failed payments must store error message for debugging
5. **Retry Logic**: Failed payments can be retried; create new transaction record for each attempt

### Access Control Rules
1. **Ownership Check**: Backend API must validate ownership before serving paid lesson content
2. **Free Preview Exception**: Lessons marked as `is_free_preview = true` are accessible without purchase
3. **Course Ownership Scope**: Purchasing a curriculum grants access to ALL current and future lessons in that curriculum
4. **Token Validation**: All purchase and access APIs require valid JWT access token
5. **Frontend-Backend Sync**: Frontend `userHasPurchased` must call backend API, never use local-only checks

### Data Integrity Rules
1. **Referential Integrity**:
   - Deleting a user should soft-delete their purchases (not cascade delete)
   - Deleting a curriculum should prevent if purchases exist
2. **Audit Trail**: All purchase and payment records must retain `created_at` and `updated_at` timestamps
3. **Immutable Fields**: `amount_paid`, `purchase_date`, `transaction_id` cannot be modified after creation
4. **Unique Constraints**:
   - (user_id, curriculum_id) unique on purchases table
   - transaction_id unique on payment_transactions table

## API Contracts

### Endpoints Overview

#### Purchase Management
- `POST /api/purchases` - Create a purchase with payment
- `GET /api/purchases/my-purchases` - Get authenticated user's purchases (paginated)
- `GET /api/purchases/check-ownership/{curriculumId}` - Check if user owns curriculum
- `GET /api/purchases/{id}` - Get purchase details

#### Payment Processing
- `POST /api/payments/process` - Process mock payment (internal, called by purchase endpoint)
- `GET /api/payments/history` - Get authenticated user's payment history (paginated)
- `GET /api/payments/{transactionId}` - Get payment transaction details

### Detailed API Specifications

#### POST /api/purchases
**Purpose**: Create a purchase and process payment

**Authentication**: Required (JWT Bearer token)

**Request Body**:
```json
{
  "curriculumId": 1,
  "paymentMethod": "CREDIT_CARD",
  "paymentDetails": {
    "cardNumber": "4242424242424242",
    "expiryMonth": 12,
    "expiryYear": 2026,
    "cvv": "123",
    "cardholderName": "John Doe"
  }
}
```

**Success Response (201 Created)**:
```json
{
  "purchaseId": 42,
  "curriculumId": 1,
  "curriculumTitle": "React Mastery",
  "amountPaid": 49.99,
  "status": "COMPLETED",
  "purchaseDate": "2025-11-28T10:30:00Z",
  "transactionId": "TXN-1732792200-abc123"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid payment details or curriculum not found
- `401 Unauthorized`: Missing or invalid JWT token
- `409 Conflict`: User already owns this curriculum
- `422 Unprocessable Entity`: Payment processing failed
- `503 Service Unavailable`: Payment gateway unreachable

**Error Response Example (409)**:
```json
{
  "error": "DUPLICATE_PURCHASE",
  "message": "You already own this curriculum",
  "purchaseDate": "2025-11-01T14:20:00Z"
}
```

**Error Response Example (422)**:
```json
{
  "error": "PAYMENT_FAILED",
  "message": "Payment declined: Insufficient funds",
  "transactionId": "TXN-1732792200-abc123"
}
```

#### GET /api/purchases/my-purchases
**Purpose**: Get authenticated user's purchase history

**Authentication**: Required (JWT Bearer token)

**Query Parameters**:
- `page` (optional, default: 0)
- `size` (optional, default: 10)
- `sort` (optional, default: "purchaseDate,desc")

**Success Response (200 OK)**:
```json
{
  "content": [
    {
      "purchaseId": 42,
      "curriculum": {
        "id": 1,
        "title": "React Mastery",
        "thumbnailUrl": "https://example.com/thumb.jpg"
      },
      "amountPaid": 49.99,
      "status": "COMPLETED",
      "purchaseDate": "2025-11-28T10:30:00Z"
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 1,
  "totalPages": 1
}
```

#### GET /api/purchases/check-ownership/{curriculumId}
**Purpose**: Check if authenticated user owns a curriculum

**Authentication**: Required (JWT Bearer token)

**Path Parameters**:
- `curriculumId` (required, integer)

**Success Response (200 OK)**:
```json
{
  "owns": true,
  "purchaseId": 42,
  "purchaseDate": "2025-11-28T10:30:00Z"
}
```

**Success Response (Not Owned)**:
```json
{
  "owns": false
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: Curriculum does not exist

#### GET /api/payments/history
**Purpose**: Get authenticated user's payment transaction history

**Authentication**: Required (JWT Bearer token)

**Query Parameters**:
- `page` (optional, default: 0)
- `size` (optional, default: 10)
- `sort` (optional, default: "createdAt,desc")
- `status` (optional, filter by status)

**Success Response (200 OK)**:
```json
{
  "content": [
    {
      "transactionId": "TXN-1732792200-abc123",
      "purchaseId": 42,
      "curriculumTitle": "React Mastery",
      "paymentMethod": "CREDIT_CARD",
      "amount": 49.99,
      "status": "COMPLETED",
      "createdAt": "2025-11-28T10:30:00Z"
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 1,
  "totalPages": 1
}
```

## Error Handling

### Error Categories

#### Client Errors (4xx)
- **400 Bad Request**: Invalid request body, missing required fields, invalid curriculum ID
- **401 Unauthorized**: Missing JWT token, expired token, invalid token
- **403 Forbidden**: Attempting to access purchased content without ownership
- **404 Not Found**: Curriculum or purchase not found
- **409 Conflict**: Duplicate purchase attempt
- **422 Unprocessable Entity**: Payment processing failed

#### Server Errors (5xx)
- **500 Internal Server Error**: Unexpected server error
- **503 Service Unavailable**: Payment gateway unreachable

### Error Response Format
All error responses must follow this structure:
```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "timestamp": "2025-11-28T10:30:00Z",
  "path": "/api/purchases"
}
```

### Retry Strategy
- **Network Errors (503)**: Client should retry with exponential backoff (max 3 attempts)
- **Payment Failures (422)**: User should update payment details and resubmit
- **Conflict Errors (409)**: Do not retry, inform user of existing purchase

## Security Considerations

### Authentication & Authorization
1. **JWT Validation**: All purchase and payment endpoints require valid JWT access token
2. **User Isolation**: Users can only view/create their own purchases (no cross-user access)
3. **Admin Role**: Future admin endpoints require `ROLE_ADMIN` (Phase 3)

### Payment Security
1. **No Card Storage**: Never store full credit card numbers in database
2. **Mock Gateway Only**: Phase 2 uses deterministic mock payment processing (no real payments)
3. **Transaction Logging**: Log all payment attempts with sanitized data (mask card numbers)
4. **HTTPS Only**: Production must use HTTPS for all payment-related requests

### Data Privacy
1. **PII Protection**: Payment details are not stored after processing (mock gateway only)
2. **Purchase History Privacy**: Users can only access their own purchase history
3. **Audit Trail**: All purchase and payment records retained for compliance (7 years minimum)

### Input Validation
1. **Payment Details**: Validate card number format, expiry date, CVV
2. **Amount Validation**: Server-side validation of purchase amount matches curriculum price
3. **Idempotency**: Prevent duplicate charges from retry requests

## Future Enhancements (Phase 3+)

### Planned Features
1. **Refund System**: Allow users to request refunds within 30 days
2. **Subscriptions**: Monthly/annual subscription plans for unlimited access
3. **Discount Codes**: Coupon system for promotions
4. **Bundle Pricing**: Purchase multiple curriculums at discount
5. **Gift Purchases**: Buy curriculum access for another user
6. **Email Notifications**: Send purchase confirmation and receipt via email
7. **Invoice Generation**: PDF invoice for corporate users
8. **Real Payment Gateway**: Integrate Stripe or PayPal for production

### Out of Scope (Phase 2)
- Real payment processing (use mock only)
- Refund functionality
- Email notifications
- Invoice generation
- Admin dashboard for transaction management
- Analytics and reporting
- Currency conversion (USD only)

## Testing Requirements

### Unit Tests
- Purchase service methods (createPurchase, checkOwnership, getPurchases)
- Payment service methods (processPayment, validatePaymentDetails)
- Mock payment gateway logic (success, failure, timeout scenarios)
- Repository queries (findByUserIdAndCurriculumId, etc.)

### Integration Tests
- POST /api/purchases with valid payment (201 Created)
- POST /api/purchases with duplicate curriculum (409 Conflict)
- POST /api/purchases with invalid payment (422 Unprocessable Entity)
- GET /api/purchases/my-purchases (paginated results)
- GET /api/purchases/check-ownership/{id} (true/false responses)
- Backend access control for paid lessons (403 Forbidden without ownership)

### E2E Tests (Playwright)
- Complete purchase flow: Browse → Select → Pay → Access content
- Failed payment flow: Browse → Select → Pay (fail) → Retry → Success
- Duplicate purchase prevention: Purchase → Attempt purchase again → See "Already Owned"
- Purchase history: Make 3 purchases → View history → See all 3
- Access control: Purchase curriculum → Access lesson → See content
- Access control: No purchase → Attempt lesson access → See purchase prompt

### Test Data Requirements
- Seed data with mix of free and paid curriculums
- Test users with various purchase histories
- Mock payment gateway with deterministic responses

## Acceptance Checklist

Before marking this feature as complete, verify:

- [ ] Specification document approved by stakeholders
- [ ] Database migrations created and tested
- [ ] API endpoints documented and implemented
- [ ] Backend unit tests written and passing (>80% coverage)
- [ ] Backend integration tests written and passing
- [ ] Frontend components implemented
- [ ] Frontend unit tests written and passing (>80% coverage)
- [ ] E2E tests written and passing
- [ ] All Given-When-Then scenarios automated and passing
- [ ] Error handling tested for all failure scenarios
- [ ] Security considerations addressed
- [ ] Documentation updated (CLAUDE.md, README.md)
- [ ] Code review completed
- [ ] All tests run successfully in Docker environment
- [ ] Mock payment gateway tested with all card scenarios
- [ ] Access control integration tested (replaces mock `userHasPurchased`)

## Questions for Stakeholders

Before proceeding to implementation, please review and answer:

1. **Pricing Strategy**: Should we support time-limited discounts or promotional pricing?
2. **Payment Methods**: Which payment methods should we prioritize in Phase 2 mock? (Credit Card, PayPal, Bank Transfer?)
3. **Refund Policy**: Should we plan for automatic refunds or manual approval process?
4. **Purchase Limits**: Any restrictions on number of purchases per user or time period?
5. **Tax Handling**: Should we calculate and display sales tax? (Phase 3 concern)
6. **Currency**: USD only, or multi-currency support needed?
7. **Email Notifications**: Required for Phase 2 or can wait for Phase 3?
8. **Admin Tools**: Priority level for admin transaction dashboard?

## Revision History

| Version | Date       | Author | Changes                     |
|---------|------------|--------|-----------------------------|
| 1.0     | 2025-11-28 | Claude | Initial specification draft |

---

**Status**: 🟡 Awaiting Approval

**Next Steps**:
1. Review specification with stakeholders
2. Answer questions for stakeholders
3. Approve specification
4. Proceed to Phase 2: Database Design
