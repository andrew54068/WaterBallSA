# Purchase Flow - Specification-Driven Development Plan

## Executive Summary

This document provides a complete Specification-Driven Development (SDD) plan for implementing the **Purchase Flow** feature in the WaterBallSA online learning platform. The plan follows BDD/TDD principles and includes comprehensive specifications, API documentation, Gherkin feature files, and test scaffolding.

**Status**: Specification Phase Complete ✅
**Next Phase**: Backend Implementation
**Estimated Effort**: 2-3 weeks
**Phase**: Phase 2 - Access Control & Payment

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [Deliverables](#deliverables)
3. [Development Workflow](#development-workflow)
4. [Implementation Roadmap](#implementation-roadmap)
5. [Key Scenarios](#key-scenarios)
6. [Technical Architecture](#technical-architecture)
7. [Testing Strategy](#testing-strategy)
8. [Next Steps](#next-steps)

---

## Feature Overview

### What We're Building

A complete purchase flow that allows students to:
1. **Review curriculum details** on an order confirmation page
2. **Apply discount coupons** to get promotional pricing
3. **Create pending orders** with unique order numbers
4. **Select payment methods** (ATM, Credit Card, Installment)
5. **Complete mock payments** to gain curriculum access
6. **View order history** and manage purchases

### User Journey

```
┌─────────────────────┐
│ Browse Curriculums  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Click "Purchase"    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ Order Confirmation Page             │
│ - View curriculum details           │
│ - See chapter/lesson breakdown      │
│ - Apply coupon (optional)           │
│ - Review pricing                    │
│ - Click "Confirm Purchase"          │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ Payment Page                        │
│ - View order number & deadline      │
│ - Select payment method             │
│ - Click "Proceed to Payment"        │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ Mock Payment Processing             │
│ - Simulate 1-2 second delay         │
│ - Update order status to PAID       │
│ - Grant curriculum access           │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ Success Redirect                    │
│ - Redirect to curriculum page       │
│ - Display success message           │
│ - User can now access all lessons   │
└─────────────────────────────────────┘
```

### Key Features

1. **Order Confirmation Page** (`/curriculums/{id}/orders`)
   - Complete curriculum details (title, description, thumbnail)
   - Full chapter and lesson list
   - Pricing breakdown (original, discount, final)
   - Coupon input with validation
   - "Confirm Purchase" and "Cancel" buttons

2. **Coupon System**
   - Percentage discounts (e.g., 20% off)
   - Fixed amount discounts (e.g., $15 off)
   - Validation: expiry date, max uses, active status
   - Real-time price updates
   - Error handling for invalid coupons

3. **Order Creation**
   - Generate unique order numbers (format: `YYYYMMDDHHMMSSXXX`)
   - Set 3-day expiration deadline
   - Store coupon code and discount details
   - Prevent duplicate purchases
   - Handle free curriculum edge cases

4. **Payment Page** (`/orders/{orderNumber}/payment`)
   - Display order summary (number, course, amount, deadline)
   - Three payment method options:
     - ATM Transfer (虛擬帳號匯款)
     - Credit Card One-Time Payment (信用卡一次付清)
     - Credit Card Installment (銀角零卡分期)
   - Invoice information section (expandable)
   - Terms of service link

5. **Mock Payment Processing**
   - Simulate 1-2 second payment gateway delay
   - Always succeed (no failure scenarios in Phase 2)
   - Update order status: PENDING → PAID
   - Set `purchased_at` timestamp
   - Grant immediate curriculum access

---

## Deliverables

All deliverables have been created and are ready for implementation.

### 1. Specification Document ✅

**Location**: `/docs/specifications/purchase-flow.md`

**Contents**:
- Business context and user stories
- 25+ BDD scenarios with Given-When-Then format
- Error scenarios and edge cases
- Technical specifications
- API endpoint definitions
- Database schema requirements
- Success metrics

**Key Sections**:
- Order confirmation page scenarios (4 scenarios)
- Coupon application scenarios (6 scenarios)
- Order creation scenarios (4 scenarios)
- Payment page scenarios (5 scenarios)
- Payment processing scenarios (3 scenarios)
- Post-payment access control scenarios (2 scenarios)
- Error scenarios (6 scenarios)
- Edge cases (6 scenarios)

### 2. API Documentation ✅

**Location**: `/docs/api/purchase-flow.md`

**Contents**:
- Complete API endpoint specifications
- Request/response schemas
- Authentication requirements
- Error codes and responses
- Example requests and responses
- Rate limiting (future)
- Versioning strategy

**Endpoints Documented**:
1. `GET /api/curriculums/{id}/order-preview` - Get order preview
2. `POST /api/coupons/validate` - Validate coupon code
3. `POST /api/orders` - Create pending order
4. `GET /api/orders/{orderNumber}` - Get order details
5. `POST /api/orders/{orderNumber}/pay` - Process payment
6. `GET /api/orders/my-orders` - Get user's order history

### 3. Gherkin Feature File ✅

**Location**: `/docs/features/purchase-flow.feature`

**Contents**:
- 30+ Gherkin scenarios in BDD format
- Organized by feature areas with tags
- Background setup with test data
- Scenario outlines for data-driven tests
- Tags for filtering: `@purchase-flow`, `@coupon`, `@payment-processing`, etc.

**Tag Categories**:
- `@order-confirmation` - Order confirmation page tests
- `@coupon` - Coupon validation and application
- `@order-creation` - Order creation logic
- `@payment-page` - Payment page display and interaction
- `@payment-processing` - Payment processing flow
- `@post-payment` - Access control after purchase
- `@edge-case` - Edge case handling
- `@error` - Error scenario handling
- `@happy-path` - Successful flow scenarios

### 4. Test Plan ✅

**Location**: `/docs/specifications/purchase-flow-test-plan.md`

**Contents**:
- Comprehensive test strategy
- Test pyramid (Unit → Integration → E2E)
- Backend test scaffolding (JUnit examples)
- Frontend test scaffolding (Jest/RTL examples)
- E2E test scaffolding (Playwright examples)
- Test data setup and helpers
- Running tests in Docker
- Coverage requirements (>80%)

**Test Categories**:
- **Backend Unit Tests**: OrderService, CouponService, PaymentService
- **Backend Integration Tests**: OrderController, CouponController
- **Frontend Component Tests**: OrderSummary, CouponInput, PaymentMethodSelector
- **Frontend Page Tests**: Order confirmation page, Payment page
- **E2E Tests**: Complete purchase flows, error handling

---

## Development Workflow

Following the SDD/BDD methodology defined in `CLAUDE.md`:

### Phase 1: Specification ✅ COMPLETE

- [x] Create specification document with Given-When-Then scenarios
- [x] Document API endpoints and contracts
- [x] Create Gherkin feature files
- [x] Create test plan and scaffolding
- [x] Review and approve specification

### Phase 2: Database ✅ COMPLETE

- [x] Design database schema (orders, coupons tables)
- [x] Create Flyway migrations (V10, V11)
- [x] Insert seed data (V12, V14)
- [x] Test migrations in Docker

**Note**: Database phase was completed on 2025-11-28. Tables already exist.

### Phase 3: Backend Implementation 🔄 NEXT

**Order of Implementation** (TDD):

1. **Entities & Repositories** (Week 1, Days 1-2)
   - Create `Order` entity (`@Entity`, `@Table`, Lombok annotations)
   - Create `Coupon` entity
   - Create `OrderRepository` (Spring Data JPA)
   - Create `CouponRepository`
   - Write repository tests

2. **Service Layer** (Week 1, Days 3-5)
   - **Write failing tests FIRST** for each service method
   - Implement `OrderService`:
     - `getOrderPreview(curriculumId)`
     - `createOrder(userId, CreateOrderRequest)`
     - `getOrder(orderNumber, userId)`
     - `getMyOrders(userId, Pageable)`
   - Implement `CouponService`:
     - `validateCoupon(curriculumId, couponCode)`
     - `applyCoupon(couponCode)`
   - Implement `PaymentService`:
     - `processPayment(orderNumber, userId, paymentMethod)`
   - Ensure all unit tests pass (>80% coverage)

3. **Controller Layer** (Week 2, Days 1-2)
   - **Write integration tests FIRST**
   - Implement `OrderController`:
     - `GET /api/curriculums/{id}/order-preview`
     - `POST /api/orders`
     - `GET /api/orders/{orderNumber}`
     - `POST /api/orders/{orderNumber}/pay`
     - `GET /api/orders/my-orders`
   - Implement `CouponController`:
     - `POST /api/coupons/validate`
   - Add OpenAPI/Swagger annotations
   - Ensure all integration tests pass

4. **Access Control Integration** (Week 2, Day 3)
   - Update `LessonService` to check purchase ownership
   - Update `CurriculumService` to check purchase ownership
   - Write tests for access control scenarios

### Phase 4: Frontend Implementation (Week 2-3)

**Order of Implementation** (TDD):

1. **API Client Functions** (Week 2, Days 4-5)
   - Create TypeScript types (`Order`, `CouponValidation`, etc.)
   - Implement API client functions in `/lib/api/orders.ts`
   - Write API client tests

2. **Components** (Week 3, Days 1-3)
   - **Write component tests FIRST**
   - Implement `OrderSummary.tsx`
   - Implement `CouponInput.tsx`
   - Implement `PaymentMethodSelector.tsx`
   - Implement `OrderDetails.tsx`
   - Implement `MockPaymentProcessor.tsx`
   - Ensure all component tests pass (>80% coverage)

3. **Pages** (Week 3, Days 4-5)
   - **Write page tests FIRST**
   - Implement `/curriculums/[id]/orders/page.tsx`
   - Implement `/orders/[orderNumber]/payment/page.tsx`
   - Add authentication guards
   - Add ownership checks and redirects
   - Ensure all page tests pass

### Phase 5: E2E Testing (Week 3, Day 5)

- Write Playwright tests for complete flows
- Test happy paths and error scenarios
- Ensure all BDD scenarios are automated
- Verify >80% total coverage

### Phase 6: Documentation (Week 3, Day 5)

- Update `CLAUDE.md` with purchase flow details
- Update `README.md` if needed
- Verify all documentation is current

---

## Implementation Roadmap

### Week 1: Backend Foundation

**Day 1-2: Entities & Repositories**
- [ ] Create `Order` entity with JPA annotations
- [ ] Create `Coupon` entity
- [ ] Create `OrderRepository` with custom queries
- [ ] Create `CouponRepository`
- [ ] Write repository tests (TestContainers)
- [ ] Verify migrations work correctly

**Day 3-5: Service Layer (TDD)**
- [ ] Write OrderService tests (10+ test cases)
- [ ] Implement OrderService methods
- [ ] Write CouponService tests (8+ test cases)
- [ ] Implement CouponService methods
- [ ] Write PaymentService tests (5+ test cases)
- [ ] Implement PaymentService methods
- [ ] Achieve >80% service layer coverage

### Week 2: Backend Controllers + Frontend Start

**Day 1-2: Controller Layer (TDD)**
- [ ] Write OrderController integration tests (8+ tests)
- [ ] Implement OrderController endpoints
- [ ] Write CouponController integration tests (3+ tests)
- [ ] Implement CouponController endpoints
- [ ] Add Swagger/OpenAPI annotations
- [ ] Test all endpoints with Postman/curl

**Day 3: Access Control**
- [ ] Update LessonService ownership check
- [ ] Update CurriculumService ownership check
- [ ] Write access control tests
- [ ] Verify paid lessons require purchase

**Day 4-5: Frontend API Client**
- [ ] Create TypeScript types
- [ ] Implement API client functions
- [ ] Write API client tests
- [ ] Test authentication flow

### Week 3: Frontend Implementation + E2E

**Day 1-3: React Components (TDD)**
- [ ] Write OrderSummary tests → Implement component
- [ ] Write CouponInput tests → Implement component
- [ ] Write PaymentMethodSelector tests → Implement component
- [ ] Write OrderDetails tests → Implement component
- [ ] Write MockPaymentProcessor tests → Implement component
- [ ] Achieve >80% component coverage

**Day 4-5: Pages + E2E**
- [ ] Write order confirmation page tests → Implement page
- [ ] Write payment page tests → Implement page
- [ ] Add authentication guards
- [ ] Write Playwright E2E tests (5+ flows)
- [ ] Run all tests in Docker
- [ ] Verify all BDD scenarios pass

---

## Key Scenarios

### Happy Path: Complete Purchase with Coupon

```gherkin
Scenario: User successfully purchases curriculum with 20% discount
  Given a logged-in user "john@example.com"
  And a curriculum "React Mastery" with price "$49.99"
  And a valid coupon "REACT20" with 20% discount
  And the user does not own the curriculum

  # Step 1: Order Confirmation
  When the user navigates to "/curriculums/1/orders"
  Then the page displays curriculum details and pricing "$49.99"

  # Step 2: Apply Coupon
  When the user enters "REACT20" and clicks "Apply Coupon"
  Then the final price updates to "$39.99"
  And the discount shows "-$10.00"

  # Step 3: Create Order
  When the user clicks "Confirm Purchase"
  Then a pending order is created with final price "$39.99"
  And the user redirects to "/orders/{orderNumber}/payment"

  # Step 4: Payment Page
  Then the payment page displays order number
  And shows payment deadline "3 days from now"
  And shows 3 payment method options

  # Step 5: Select Payment Method
  When the user selects "Credit Card One-Time Payment"
  Then the "Proceed to Payment" button is enabled

  # Step 6: Process Payment
  When the user clicks "Proceed to Payment"
  Then a processing indicator appears
  And after 1-2 seconds, payment succeeds
  And order status updates to "PAID"

  # Step 7: Success Redirect
  Then the user redirects to "/curriculums/1"
  And sees "Purchase successful!" message
  And can access all lessons immediately
```

### Error Scenario: Expired Coupon

```gherkin
Scenario: User attempts to apply expired coupon
  Given a logged-in user on order confirmation page
  And a coupon "EXPIRED10" that expired on "2025-10-31"
  And today's date is "2025-12-01"

  When the user enters "EXPIRED10" and clicks "Apply Coupon"
  Then the page displays error "Coupon has expired"
  And the pricing remains unchanged at "$49.99"
  And the coupon is NOT applied
```

### Edge Case: Duplicate Purchase Prevention

```gherkin
Scenario: User attempts to purchase already-owned curriculum
  Given a logged-in user "jane@example.com"
  And the user owns "React Mastery" purchased on "2025-11-15"

  When the user navigates to "/curriculums/1/orders"
  Then the page redirects to "/curriculums/1"
  And displays "Already Purchased" status
  And shows purchase date "November 15, 2025"
  And does NOT show "Purchase" button
```

---

## Technical Architecture

### Frontend Pages

```
/curriculums/[id]/orders/
  └─ page.tsx (Order Confirmation Page)
     ├─ OrderSummary component
     ├─ CouponInput component
     └─ Pricing breakdown

/orders/[orderNumber]/payment/
  └─ page.tsx (Payment Page)
     ├─ OrderDetails component
     ├─ PaymentMethodSelector component
     └─ MockPaymentProcessor component
```

### Backend Services

```
OrderService
  ├─ getOrderPreview(curriculumId)
  ├─ createOrder(userId, request)
  ├─ getOrder(orderNumber, userId)
  └─ getMyOrders(userId, pageable)

CouponService
  ├─ validateCoupon(curriculumId, code)
  └─ applyCoupon(code)

PaymentService
  └─ processPayment(orderNumber, userId, method)
```

### Database Tables (Existing)

```sql
orders
  ├─ id (PK)
  ├─ user_id (FK → users)
  ├─ curriculum_id (FK → curriculums)
  ├─ order_number (UNIQUE)
  ├─ status (PENDING | PAID | CANCELLED | EXPIRED)
  ├─ original_price
  ├─ discount_amount
  ├─ final_price
  ├─ coupon_code (nullable)
  ├─ created_at
  ├─ updated_at
  ├─ expires_at
  └─ purchased_at (nullable)

coupons
  ├─ id (PK)
  ├─ code (UNIQUE)
  ├─ discount_type (PERCENTAGE | FIXED_AMOUNT)
  ├─ discount_value
  ├─ valid_from
  ├─ valid_until
  ├─ max_uses
  ├─ current_uses
  ├─ is_active
  ├─ created_at
  └─ updated_at
```

---

## Testing Strategy

### Test Coverage Requirements

| Layer               | Tool                  | Coverage Target |
|---------------------|-----------------------|-----------------|
| Backend Unit        | JUnit 5 + Mockito     | >80%            |
| Backend Integration | TestContainers        | All endpoints   |
| Frontend Components | Jest + RTL            | >80%            |
| Frontend Pages      | Jest + RTL            | >80%            |
| E2E Tests           | Playwright            | All user flows  |

### Test Pyramid

```
       E2E (5-10 tests)
      /  Complete user journeys
     /   Payment processing flows
    /    Error scenarios
   /
  Integration (15-20 tests)
 /  All API endpoints
/   Database operations
\   Access control
 \
  Unit Tests (50+ tests)
 /  Service layer logic
/   Component rendering
\   Utility functions
 \  Business rules
```

### Running Tests

**All tests run inside Docker**:

```bash
# Backend tests
docker-compose exec backend ./mvnw test

# Backend with coverage
docker-compose exec backend ./mvnw verify

# Frontend tests
docker-compose exec frontend yarn test

# E2E tests
docker-compose exec frontend yarn test:e2e

# All tests
make test
```

---

## Next Steps

### Immediate Actions

1. **Review Specifications** ✅
   - Read `/docs/specifications/purchase-flow.md`
   - Read `/docs/api/purchase-flow.md`
   - Read `/docs/features/purchase-flow.feature`
   - Understand all BDD scenarios

2. **Start Backend Implementation** 🔄
   - Create feature branch: `git checkout -b feature/purchase-flow`
   - Start with entities and repositories
   - Follow TDD: Write tests first, then implementation
   - Run tests in Docker frequently

3. **Follow Red-Green-Refactor**
   - 🔴 **Red**: Write a failing test
   - 🟢 **Green**: Write minimal code to pass
   - 🔵 **Refactor**: Clean up code while keeping tests green
   - ♻️ **Repeat** for each feature

### Implementation Checklist

**Week 1**:
- [ ] Create `Order` and `Coupon` entities
- [ ] Create repositories with custom queries
- [ ] Write and pass all service layer tests
- [ ] Implement OrderService, CouponService, PaymentService
- [ ] Achieve >80% backend unit test coverage

**Week 2**:
- [ ] Write and pass all controller integration tests
- [ ] Implement OrderController and CouponController
- [ ] Update access control for lessons and curriculums
- [ ] Create TypeScript types and API client
- [ ] Test API endpoints with Postman

**Week 3**:
- [ ] Write and pass all component tests
- [ ] Implement all React components
- [ ] Write and pass all page tests
- [ ] Implement order confirmation and payment pages
- [ ] Write and pass all E2E tests
- [ ] Verify all BDD scenarios automated
- [ ] Update documentation

### Definition of Done

Before marking this feature complete:

- [ ] All BDD scenarios implemented and passing
- [ ] Backend tests >80% coverage
- [ ] Frontend tests >80% coverage
- [ ] E2E tests cover all user journeys
- [ ] All tests run successfully in Docker
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Feature deployed to staging
- [ ] QA testing completed
- [ ] Feature deployed to production

---

## Resources

### Documentation Files

1. **Specification**: `/docs/specifications/purchase-flow.md`
2. **API Docs**: `/docs/api/purchase-flow.md`
3. **Gherkin Features**: `/docs/features/purchase-flow.feature`
4. **Test Plan**: `/docs/specifications/purchase-flow-test-plan.md`
5. **Project Guidelines**: `/CLAUDE.md`
6. **Database Docs**: `/docs/database/schema-phase2.md`

### Existing Code References

1. **Lesson Viewer Spec**: `/docs/specifications/lesson-viewer.md` (similar structure)
2. **Database Migrations**: `/backend/src/main/resources/db/migration/V10__*.sql`
3. **Seed Data**: `/backend/src/main/resources/db/migration/V12__*.sql`
4. **Frontend Components**: `/frontend/src/components/` (for patterns)

### Helpful Commands

```bash
# Start services
docker-compose up -d

# Run backend tests
docker-compose exec backend ./mvnw test

# Run frontend tests
docker-compose exec frontend yarn test

# View logs
docker-compose logs -f backend

# Access database
docker-compose exec db psql -U postgres -d waterballsa

# Clean restart
make clean && make up
```

---

## Contact & Support

**Questions?**
- Review the specification documents first
- Check existing implementations (lesson-viewer) for patterns
- Follow TDD/BDD workflow from `CLAUDE.md`
- Ask stakeholders for business rule clarifications

**Remember**:
- ✅ **Specification First** - Never implement without specs
- ✅ **Tests First** - Write failing tests before implementation
- ✅ **Docker Always** - All commands run inside Docker
- ✅ **Small Commits** - Commit after each green test
- ✅ **Review Often** - Ensure alignment with specs

---

**Status**: 🟢 Ready for Implementation

**Created**: 2025-12-01
**Phase**: Phase 2 - Access Control & Payment
**Priority**: High
**Estimated Effort**: 2-3 weeks
**Test Coverage Target**: >80%

---

Good luck with implementation! Follow the SDD/BDD workflow, write tests first, and ship quality code. 🚀
