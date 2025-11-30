# Purchase Flow Backend Implementation Status

**Date**: 2025-12-01
**Task**: Implement backend components for purchase flow feature following TDD

## Completed Components

### Phase 1: Entities and DTOs ✅

1. **Coupon Entity** (`backend/src/main/java/com/waterballsa/backend/entity/Coupon.java`)
   - Maps to `coupons` table
   - Includes business logic methods: `isValid()`, `isExpired()`, `calculateDiscountAmount()`, etc.
   - Validation constraints with `@PrePersist` and `@PreUpdate`

2. **DiscountType Enum** (`backend/src/main/java/com/waterballsa/backend/entity/DiscountType.java`)
   - PERCENTAGE
   - FIXED_AMOUNT

3. **DTOs Created**:
   - `ValidateCouponRequest.java` - Request DTO for coupon validation
   - `CouponValidationResponse.java` - Response DTO with static factory methods
   - `OrderPreviewResponse.java` - Order preview with curriculum details
   - **Existing**: `PurchaseRequest.java`, `PurchaseResponse.java` (already existed)

### Phase 2: Repositories ✅

1. **CouponRepository** (`backend/src/main/java/com/waterballsa/backend/repository/CouponRepository.java`)
   - Custom queries:
     - `findByCode(String code)` - case-insensitive
     - `findActiveByCode(String code, LocalDateTime now)` - finds valid active coupons
     - `existsByCode(String code)` - check existence

2. **PurchaseRepository** (already existed)
   - All required methods already present

### Phase 3: Custom Exceptions ✅

1. **InvalidCouponException.java** - For coupon validation failures
2. **FreeCurriculumException.java** - For free curriculum purchase attempts
3. **DuplicatePurchaseException.java** (already existed)

### Phase 4: Services ✅

1. **CouponService** (`backend/src/main/java/com/waterballsa/backend/service/CouponService.java`)
   - `validateCoupon(curriculumId, couponCode)` - Full validation logic with detailed error responses
   - `applyCoupon(couponCode)` - Increments usage count
   - **Unit Test**: `CouponServiceTest.java` with 9 test cases covering all scenarios

## Remaining Components (To Be Implemented)

### Phase 5: Purchase Service

**File**: `backend/src/main/java/com/waterballsa/backend/service/PurchaseService.java`

**Methods Needed**:
1. `getOrderPreview(Long curriculumId, Long userId)` - Returns curriculum with chapters/lessons
2. `createPurchase(Long userId, Long curriculumId, String couponCode)` - Creates PENDING purchase
3. `completePurchase(Long purchaseId, Long userId)` - Marks purchase as COMPLETED (mock payment)
4. `getUserPurchases(Long userId, Pageable pageable)` - Get user's purchase history
5. `hasAccess(Long userId, Long curriculumId)` - Check if user owns curriculum

**Business Logic**:
- Prevent duplicate purchases (check existing COMPLETED purchases)
- Prevent purchasing free curriculums
- Apply coupon discount if provided
- Calculate original_price and final_price
- Set purchased_at timestamp when completing purchase

**Test File**: `backend/src/test/java/com/waterballsa/backend/service/PurchaseServiceTest.java`

**Test Scenarios**:
- Create purchase successfully
- Create purchase with coupon
- Prevent duplicate purchase
- Prevent free curriculum purchase
- Complete purchase successfully
- Check access grants correctly

### Phase 6: Controllers

**File**: `backend/src/main/java/com/waterballsa/backend/controller/PurchaseController.java`

**Endpoints**:
1. `GET /api/curriculums/{id}/order-preview` - Get order preview
2. `POST /api/purchases` - Create pending purchase
3. `POST /api/purchases/{id}/complete` - Complete purchase (mock payment)
4. `GET /api/purchases/my-purchases` - Get user's purchases
5. `GET /api/purchases/check-access/{curriculumId}` - Check ownership

**File**: `backend/src/main/java/com/waterballsa/backend/controller/CouponController.java`

**Endpoints**:
1. `POST /api/coupons/validate` - Validate coupon code

**Integration Tests**:
- `PurchaseControllerIntegrationTest.java`
- `CouponControllerIntegrationTest.java`

### Phase 7: Exception Handling

**File**: `backend/src/main/java/com/waterballsa/backend/exception/GlobalExceptionHandler.java`

**Updates Needed**:
- Add handler for `InvalidCouponException` → 400 Bad Request
- Add handler for `FreeCurriculumException` → 409 Conflict
- Add handler for `DuplicatePurchaseException` → 409 Conflict (may already exist)

### Phase 8: Database Migration (if needed)

**Check if needed**: Verify if `user_curriculums` table exists for access control

If not, create:
- `V16__create_user_curriculums_table.sql`

However, the existing `purchases` table with `status = 'COMPLETED'` may be sufficient for access control.

## Important Notes

### Adaptation from Specification

The specification mentions:
- `orders` table with `order_number`, `expires_at`, etc.
- `payment_transactions` table

**Actual schema has**:
- `purchases` table (simpler, instant purchase model)
- No order numbers or payment transactions
- Status: PENDING → COMPLETED (no expiration logic)

**Implementation approach**:
- Using `purchases` table as-is (simpler Phase 2 model)
- Purchase flow: Create PENDING purchase → Complete purchase (mock payment) → Grant access
- No order expiration or payment transaction tracking

### Key Business Rules

1. **Prevent duplicate purchases**: Check `existsByUserIdAndCurriculumIdAndStatus(userId, curriculumId, COMPLETED)`
2. **Free curriculum check**: `curriculum.isFree()` → Cannot create purchase
3. **Coupon validation**: All checks in `CouponService.validateCoupon()`
4. **Access control**: `purchaseRepository.existsByUserIdAndCurriculumIdAndStatus(userId, curriculumId, COMPLETED)`

### Testing Strategy

- **Unit tests**: Mockito for services (isolated testing)
- **Integration tests**: `@SpringBootTest` + `@AutoConfigureMockMvc` for controllers
- **Coverage target**: >80%

## Next Steps

1. Create `PurchaseService` with full unit tests
2. Create `PurchaseController` with integration tests
3. Create `CouponController` with integration tests
4. Update `GlobalExceptionHandler`
5. Run all tests to ensure >80% coverage
6. Test end-to-end purchase flow manually

## File Summary

### Created Files
```
backend/src/main/java/com/waterballsa/backend/
├── entity/
│   ├── Coupon.java ✅
│   └── DiscountType.java ✅
├── dto/
│   ├── ValidateCouponRequest.java ✅
│   ├── CouponValidationResponse.java ✅
│   └── OrderPreviewResponse.java ✅
├── repository/
│   └── CouponRepository.java ✅
├── service/
│   └── CouponService.java ✅
└── exception/
    ├── InvalidCouponException.java ✅
    └── FreeCurriculumException.java ✅

backend/src/test/java/com/waterballsa/backend/
└── service/
    └── CouponServiceTest.java ✅
```

### Files to Create
```
backend/src/main/java/com/waterballsa/backend/
├── service/
│   └── PurchaseService.java ⏳
└── controller/
    ├── PurchaseController.java ⏳
    └── CouponController.java ⏳

backend/src/test/java/com/waterballsa/backend/
├── service/
│   └── PurchaseServiceTest.java ⏳
└── controller/
    ├── PurchaseControllerIntegrationTest.java ⏳
    └── CouponControllerIntegrationTest.java ⏳
```

### Files to Update
```
backend/src/main/java/com/waterballsa/backend/
└── exception/
    └── GlobalExceptionHandler.java ⏳
```

## Summary

**Completed**: 60% of backend implementation
- All entities, DTOs, repositories, and CouponService with tests ✅

**Remaining**: 40%
- PurchaseService (core logic) ⏳
- Controllers (API endpoints) ⏳
- Exception handling updates ⏳
- Integration tests ⏳

The foundation is solid. The remaining work focuses on PurchaseService (business logic for creating/completing purchases) and controllers (API endpoints).
