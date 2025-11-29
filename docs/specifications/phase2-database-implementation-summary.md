# Phase 2: Purchase System - Database Implementation Summary

## Overview
Successfully completed the Database Design phase for the Purchase System (Phase 2) following SDD/BDD principles.

**Date**: 2025-11-28
**Status**: Complete ✅
**Next Phase**: API Design

---

## What Was Accomplished

### 1. Stakeholder Requirements Clarified

Confirmed simplified requirements for Phase 2:
- ❌ **No refunds** - Purchase statuses: PENDING, COMPLETED, CANCELLED only
- 💰 **Fixed pricing** with optional coupon support (coupons change final price)
- 💳 **Simplified payment** - Button click instantly completes purchase (no gateway simulation)
- 🎁 **No gifting** - Users can only purchase for themselves
- 📧 **No emails** - No purchase confirmation emails in Phase 2
- 👨‍💼 **No admin** - Admin features deferred to Phase 3

### 2. Database Schema Designed

Created two main tables:

#### purchases Table
- Tracks user ownership of curriculums
- Unique constraint prevents duplicate purchases
- Price locking (original_price never changes)
- Support for future coupon codes
- Status: PENDING → COMPLETED/CANCELLED
- Foreign keys to users and curriculums (ON DELETE RESTRICT)
- 7 indexes for query performance
- Auto-updating timestamps

#### coupons Table (Phase 3 Ready)
- Promotional discount codes
- Support for PERCENTAGE and FIXED_AMOUNT discounts
- Validity period (valid_from, valid_until)
- Usage limits (max_uses, current_uses)
- Manual activation control (is_active)
- Schema ready but NOT used in Phase 2 business logic

### 3. Flyway Migrations Created

Successfully created and tested 5 migrations:
- `V10__create_purchases_table.sql` - Purchase table with constraints
- `V11__create_coupons_table.sql` - Coupon table (Phase 3 ready)
- `V12__insert_purchase_seed_data.sql` - Test data (5 purchases)
- `V13__fix_coupons_current_uses_constraint.sql` - Constraint fix for unlimited coupons
- `V14__insert_coupon_seed_data.sql` - Test data (6 coupons)

### 4. Seed Data Inserted

**Purchases (5 records)**:
- 4 COMPLETED purchases across 3 users
- 1 PENDING purchase (for testing cancellation scenarios)
- Includes one purchase with coupon code (WELCOME20, 20% discount)

**Coupons (6 records - Phase 3 ready)**:
- Mix of PERCENTAGE and FIXED_AMOUNT discounts
- Active and inactive coupons
- Unlimited and limited-use coupons
- Examples: WELCOME20, NEWYEAR2025, BLACKFRIDAY, STUDENT15, etc.

### 5. Database Testing

All migrations tested inside Docker:
```bash
docker-compose exec backend mvn flyway:migrate
```

Verification queries run successfully:
- Table structure validated (`\d purchases`, `\d coupons`)
- Seed data confirmed (5 purchases, 6 coupons)
- Constraints working correctly
- Foreign keys enforced
- Indexes created

---

## Database Schema Highlights

### Key Business Rules Enforced

1. **One Purchase Per Curriculum**: UNIQUE(user_id, curriculum_id)
2. **Price Integrity**: final_price <= original_price
3. **Prevent Orphans**: ON DELETE RESTRICT on foreign keys
4. **Status Validation**: CHECK constraint for valid statuses
5. **Coupon Limits**: CHECK constraint for max_uses logic (max_uses = 0 allows unlimited)

### Performance Optimizations

- Composite index on (user_id, curriculum_id, status) for ownership checks
- Indexes on user_id, curriculum_id, status, purchased_at for filtering
- Descending index on created_at for sorting purchase history

---

## Files Created

### Migration Files
1. `/backend/src/main/resources/db/migration/V10__create_purchases_table.sql`
2. `/backend/src/main/resources/db/migration/V11__create_coupons_table.sql`
3. `/backend/src/main/resources/db/migration/V12__insert_purchase_seed_data.sql`
4. `/backend/src/main/resources/db/migration/V13__fix_coupons_current_uses_constraint.sql`
5. `/backend/src/main/resources/db/migration/V14__insert_coupon_seed_data.sql`

### Documentation Files
1. `/docs/database/phase2-purchase-system-schema.md` - Complete schema documentation
2. `/docs/specifications/purchase-system.md` - Updated with stakeholder decisions
3. `/docs/specifications/phase2-database-implementation-summary.md` - This file

---

## Technical Decisions

### Why DECIMAL(10,2) for Prices?
- Precision: Avoids floating-point errors
- Range: Supports prices up to $99,999,999.99
- Standard: Matches financial application best practices

### Why VARCHAR(20) for Status?
- Flexibility: Easy to add new statuses without migration
- Readability: Self-documenting in queries
- Performance: VARCHAR is efficient for short strings

### Why Separate Coupon Table?
- Normalization: Avoid duplication of coupon details
- Extensibility: Easy to add coupon features (per-curriculum, per-user, etc.)
- Auditing: Track coupon usage independently

### Why ON DELETE RESTRICT?
- Data Integrity: Prevent accidental data loss
- Business Logic: Cannot delete user/curriculum with active purchases
- Audit Trail: Preserve purchase history for compliance

---

## Challenges Encountered & Solutions

### Challenge 1: Coupon Constraint Logic
**Problem**: Original constraint `current_uses <= max_uses` failed when `max_uses = 0` (unlimited)
**Solution**: Modified constraint to: `current_uses >= 0 AND (max_uses = 0 OR current_uses <= max_uses)`
**Migration**: V13 fixes the constraint after initial table creation

### Challenge 2: Seed Data Curriculum Titles
**Problem**: Initial seed data used English titles, but actual curriculums have Chinese titles
**Solution**: Updated V12 to use actual curriculum titles from database
**Verification**: Queries confirmed 5 purchases inserted successfully

### Challenge 3: Migration Checksum Mismatch
**Problem**: Modified V11 after it was applied, causing Flyway validation error
**Solution**:
1. Reverted V11 to original state
2. Created V13 to fix constraint properly
3. Deleted migration history for V10-V14 and re-ran migrations

---

## Verification Results

### Flyway Migration Status
```
Current version of schema "public": 14
Successfully applied 5 migrations to schema "public", now at version v14
```

### Purchases Table Verification
```
 - COMPLETED purchases: 4
 - PENDING purchases: 1
 - CANCELLED purchases: 0
Total purchases: 5
```

### Coupons Table Verification
```
 - Active coupons: 5
 - Inactive coupons: 1
 - Percentage discounts: 4
 - Fixed amount discounts: 2
Total coupons: 6
```

### Sample Data Query
```sql
SELECT p.id, u.email, c.title, p.original_price, p.final_price, p.coupon_code, p.status
FROM purchases p
JOIN users u ON p.user_id = u.id
JOIN curriculums c ON p.curriculum_id = c.id;
```

Results: 5 rows with correct relationships and data

---

## Next Steps: API Design Phase

### API Endpoints to Design

1. **POST /api/purchases** - Create purchase (instant completion)
2. **GET /api/purchases/my-purchases** - User's purchase history (paginated)
3. **GET /api/purchases/check-ownership/{curriculumId}** - Check if user owns curriculum
4. **GET /api/purchases/{id}** - Get purchase details

### Phase 3 Endpoints (Not for Phase 2)
- **POST /api/purchases/{id}/cancel** - Cancel pending purchase
- **GET /api/coupons/validate/{code}** - Validate coupon code
- **POST /api/coupons** - Create coupon (admin)

### DTOs to Design
- `PurchaseRequest` - Create purchase request
- `PurchaseResponse` - Purchase details
- `PurchaseListResponse` - Purchase history (paginated)
- `OwnershipCheckResponse` - Simple owns/doesn't own

### Service Methods to Implement
- `PurchaseService.createPurchase(userId, curriculumId, couponCode?)`
- `PurchaseService.getUserPurchases(userId, pageable)`
- `PurchaseService.checkOwnership(userId, curriculumId)`
- `PurchaseService.getPurchaseById(id)`

---

## Lessons Learned

### SDD/BDD Best Practices
1. **Clarify requirements upfront** - Stakeholder decisions prevented over-engineering
2. **Design for future** - Coupon table ready for Phase 3 without blocking Phase 2
3. **Test incrementally** - Run migrations in Docker after each change
4. **Document immediately** - Create schema docs while design is fresh

### Flyway Best Practices
1. **Never modify applied migrations** - Use new migrations to fix issues
2. **Test migrations on clean database** - Delete and re-run to verify idempotency
3. **Use ON CONFLICT DO NOTHING** - Make seed data safe to re-run
4. **Add descriptive comments** - Explain business rules in SQL comments

### PostgreSQL Best Practices
1. **Use CHECK constraints** - Enforce business rules at database level
2. **Create meaningful indexes** - Plan for most common queries
3. **Use triggers for audit fields** - Auto-update timestamps
4. **Add table/column comments** - Self-documenting schema

---

## Acceptance Criteria Met

- [x] Specification document with Given-When-Then scenarios exists
- [x] Database migrations are versioned and tested
- [x] All migrations run successfully inside Docker
- [x] Seed data is comprehensive and realistic
- [x] Constraints enforce all business rules
- [x] Indexes support expected query patterns
- [x] Foreign keys prevent orphan records
- [x] Auto-updating timestamps configured
- [x] Database documentation created
- [x] No modification of existing migrations (V1-V9 untouched)

---

## Summary

The Database Design phase for the Purchase System is **complete**. The schema is:
- ✅ **Robust** - Constraints enforce business rules
- ✅ **Performant** - Indexes support common queries
- ✅ **Extensible** - Ready for Phase 3 coupon features
- ✅ **Tested** - All migrations verified in Docker
- ✅ **Documented** - Comprehensive schema documentation

**Ready to proceed to API Design phase.**

---

**Document Status**: Complete
**Prepared by**: Claude (SDD/BDD Expert)
**Date**: 2025-11-28
