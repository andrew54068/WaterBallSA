# Phase 2: Purchase System Database Schema

## Overview
Database schema for the Purchase System (Phase 2) featuring curriculum purchases with optional coupon support.

**Migration Files:**
- `V10__create_purchases_table.sql` - Purchase records table
- `V11__create_coupons_table.sql` - Coupon codes table (Phase 3 ready)
- `V12__insert_purchase_seed_data.sql` - Test purchase data
- `V13__fix_coupons_current_uses_constraint.sql` - Constraint fix for unlimited coupons
- `V14__insert_coupon_seed_data.sql` - Test coupon data

## Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   users     │         │  purchases   │         │ curriculums  │
├─────────────┤         ├──────────────┤         ├──────────────┤
│ id (PK)     │◄────────│ user_id (FK) │         │ id (PK)      │
│ email       │         │ curriculum_id├────────►│ title        │
│ ...         │         │ (FK)         │         │ price        │
└─────────────┘         │ original_price│        │ ...          │
                        │ final_price  │         └──────────────┘
                        │ coupon_code  │
                        │ status       │         ┌──────────────┐
                        │ purchased_at │         │   coupons    │
                        │ created_at   │         ├──────────────┤
                        │ updated_at   │         │ id (PK)      │
                        └──────────────┘         │ code (UNIQUE)│
                               │                 │ discount_type│
                               └─ ─ ─ ─ ─ ─ ─ ─►│ discount_val │
                                 (Phase 3)       │ valid_from   │
                                                 │ valid_until  │
                                                 │ max_uses     │
                                                 │ current_uses │
                                                 │ is_active    │
                                                 └──────────────┘
```

## Tables

### purchases

Records user ownership of curriculums after purchase.

**Columns:**
- `id` (BIGSERIAL, PK) - Unique purchase identifier
- `user_id` (BIGINT, FK → users.id, NOT NULL) - Purchaser
- `curriculum_id` (BIGINT, FK → curriculums.id, NOT NULL) - Purchased curriculum
- `original_price` (DECIMAL(10,2), NOT NULL) - Curriculum price at purchase time
- `final_price` (DECIMAL(10,2), NOT NULL) - Price after coupon discount
- `coupon_code` (VARCHAR(50), NULLABLE) - Coupon used (Phase 3)
- `status` (VARCHAR(20), NOT NULL, DEFAULT 'PENDING') - Purchase status
- `purchased_at` (TIMESTAMP, NULLABLE) - Completion timestamp
- `created_at` (TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP) - Auto-updated timestamp

**Status Values:**
- `PENDING` - Purchase initiated but not completed
- `COMPLETED` - Purchase successful, user has access
- `CANCELLED` - Purchase cancelled/abandoned

**Constraints:**
- `purchases_pkey` - Primary key on `id`
- `purchases_user_curriculum_unique` - UNIQUE(user_id, curriculum_id) - Prevents duplicate purchases
- `fk_purchases_user` - Foreign key to users (ON DELETE RESTRICT)
- `fk_purchases_curriculum` - Foreign key to curriculums (ON DELETE RESTRICT)
- `purchases_original_price_check` - CHECK(original_price >= 0)
- `purchases_final_price_check` - CHECK(final_price >= 0)
- `purchases_discount_check` - CHECK(final_price <= original_price)
- `purchases_status_check` - CHECK(status IN ('PENDING', 'COMPLETED', 'CANCELLED'))

**Indexes:**
- `idx_purchases_user_id` - Lookup purchases by user
- `idx_purchases_curriculum_id` - Lookup purchases by curriculum
- `idx_purchases_status` - Filter by status
- `idx_purchases_purchased_at` - Sort by purchase date
- `idx_purchases_created_at` - Sort by creation date (DESC)
- `idx_purchases_user_curriculum_status` - Composite index for ownership checks

**Triggers:**
- `update_purchases_updated_at` - Auto-updates `updated_at` on row modification

---

### coupons (Phase 3 - Schema Only)

Promotional discount codes. **Note:** Table exists but is NOT used in Phase 2 business logic.

**Columns:**
- `id` (BIGSERIAL, PK) - Unique coupon identifier
- `code` (VARCHAR(50), UNIQUE, NOT NULL) - Coupon code (e.g., "WELCOME20")
- `discount_type` (VARCHAR(20), NOT NULL) - PERCENTAGE or FIXED_AMOUNT
- `discount_value` (DECIMAL(10,2), NOT NULL) - Discount value
- `valid_from` (TIMESTAMP, NOT NULL) - Start of validity period
- `valid_until` (TIMESTAMP, NOT NULL) - End of validity period
- `max_uses` (INTEGER, NOT NULL, DEFAULT 0) - Max total uses (0 = unlimited)
- `current_uses` (INTEGER, NOT NULL, DEFAULT 0) - Current usage count
- `is_active` (BOOLEAN, NOT NULL, DEFAULT TRUE) - Activation status
- `created_at` (TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP) - Auto-updated timestamp

**Discount Types:**
- `PERCENTAGE` - Percentage discount (1-100)
- `FIXED_AMOUNT` - Fixed amount discount (e.g., $10 off)

**Constraints:**
- `coupons_pkey` - Primary key on `id`
- `coupons_code_key` - UNIQUE on `code`
- `coupons_discount_type_check` - CHECK(discount_type IN ('PERCENTAGE', 'FIXED_AMOUNT'))
- `coupons_discount_value_check` - CHECK(discount_value > 0)
- `coupons_percentage_range_check` - CHECK(discount_type != 'PERCENTAGE' OR discount_value <= 100)
- `coupons_date_range_check` - CHECK(valid_until > valid_from)
- `coupons_max_uses_check` - CHECK(max_uses >= 0)
- `coupons_current_uses_check` - CHECK(current_uses >= 0 AND (max_uses = 0 OR current_uses <= max_uses))

**Indexes:**
- `idx_coupons_code` - Lookup by code
- `idx_coupons_is_active` - Filter active coupons
- `idx_coupons_valid_from` - Filter by start date
- `idx_coupons_valid_until` - Filter by end date
- `idx_coupons_validity` - Composite index for validity checks

**Triggers:**
- `update_coupons_updated_at` - Auto-updates `updated_at` on row modification

---

## Seed Data

### Purchases (5 records)

| User Email             | Curriculum                     | Original | Final   | Coupon    | Status    | Purchased At        |
|------------------------|--------------------------------|----------|---------|-----------|-----------|---------------------|
| john.doe@example.com   | React & Next.js 現代網頁開發   | 3999.00  | 3999.00 | -         | COMPLETED | 2025-11-01 10:30:00 |
| john.doe@example.com   | Java 從零開始                  | 2999.00  | 2399.20 | WELCOME20 | COMPLETED | 2025-11-10 14:15:00 |
| jane.smith@example.com | 資料結構與演算法 (Python)      | 2599.00  | 2599.00 | -         | COMPLETED | 2025-11-20 09:00:00 |
| bob.wilson@example.com | 軟體設計模式精通之旅           | 3000.00  | 3000.00 | -         | COMPLETED | 2025-11-15 16:45:00 |
| john.doe@example.com   | AI x BDD：規格驅動全自動開發術 | 4500.00  | 4500.00 | -         | PENDING   | (null)              |

### Coupons (6 records - Phase 3 Ready)

| Code        | Type         | Value  | Max Uses | Current Uses | Active | Valid From | Valid Until |
|-------------|--------------|--------|----------|--------------|--------|------------|-------------|
| WELCOME20   | PERCENTAGE   | 20.00  | 0        | 1            | Yes    | 2025-01-01 | 2025-12-31  |
| NEWYEAR2025 | FIXED_AMOUNT | 10.00  | 100      | 0            | Yes    | 2025-01-01 | 2025-01-31  |
| BLACKFRIDAY | PERCENTAGE   | 50.00  | 500      | 0            | Yes    | 2025-11-25 | 2025-11-30  |
| EXPIRED10   | PERCENTAGE   | 10.00  | 0        | 15           | No     | 2025-01-01 | 2025-06-30  |
| STUDENT15   | PERCENTAGE   | 15.00  | 0        | 42           | Yes    | 2025-01-01 | 2025-12-31  |
| EARLYBIRD   | FIXED_AMOUNT | 25.00  | 50       | 49           | Yes    | 2025-01-01 | 2025-12-31  |

---

## Business Rules

### Purchase Rules
1. **One Purchase Per Curriculum**: A user can only purchase the same curriculum once (enforced by UNIQUE constraint)
2. **Price Locking**: `original_price` is locked at purchase time and never changes
3. **Discount Validation**: `final_price` must be <= `original_price`
4. **Status Lifecycle**: PENDING → COMPLETED or PENDING → CANCELLED
5. **Completion Timestamp**: `purchased_at` is set when status changes to COMPLETED

### Coupon Rules (Phase 3 - Not Enforced in Phase 2)
1. **Unlimited Uses**: When `max_uses = 0`, coupon has unlimited uses
2. **Limited Uses**: When `max_uses > 0`, `current_uses` cannot exceed `max_uses`
3. **Percentage Range**: Percentage discounts must be 1-100
4. **Validity Period**: Coupons have start and end dates
5. **Manual Deactivation**: Coupons can be deactivated via `is_active = FALSE`

---

## Query Examples

### Check User Ownership
```sql
SELECT EXISTS(
  SELECT 1 FROM purchases
  WHERE user_id = 1
    AND curriculum_id = 4
    AND status = 'COMPLETED'
) AS owns_curriculum;
```

### Get User's Purchase History
```sql
SELECT
  p.id,
  c.title,
  p.original_price,
  p.final_price,
  p.coupon_code,
  p.status,
  p.purchased_at
FROM purchases p
JOIN curriculums c ON p.curriculum_id = c.id
WHERE p.user_id = 1
ORDER BY p.purchased_at DESC NULLS LAST;
```

### Get Completed Purchases Count
```sql
SELECT COUNT(*) AS total_purchases
FROM purchases
WHERE status = 'COMPLETED';
```

### Find Valid Coupons (Phase 3)
```sql
SELECT code, discount_type, discount_value
FROM coupons
WHERE is_active = TRUE
  AND valid_from <= NOW()
  AND valid_until >= NOW()
  AND (max_uses = 0 OR current_uses < max_uses);
```

---

## Migration History

| Version | Description                           | Applied    | Status  |
|---------|---------------------------------------|------------|---------|
| V10     | create_purchases_table                | 2025-11-28 | Success |
| V11     | create_coupons_table                  | 2025-11-28 | Success |
| V12     | insert_purchase_seed_data             | 2025-11-28 | Success |
| V13     | fix_coupons_current_uses_constraint   | 2025-11-28 | Success |
| V14     | insert_coupon_seed_data               | 2025-11-28 | Success |

---

## Testing Verification

### Verify Purchase Table Structure
```bash
docker-compose exec postgres psql -U postgres -d waterballsa -c "\d purchases"
```

### Verify Coupons Table Structure
```bash
docker-compose exec postgres psql -U postgres -d waterballsa -c "\d coupons"
```

### Verify Seed Data
```bash
# View purchases
docker-compose exec postgres psql -U postgres -d waterballsa -c "
  SELECT p.id, u.email, c.title, p.final_price, p.status
  FROM purchases p
  JOIN users u ON p.user_id = u.id
  JOIN curriculums c ON p.curriculum_id = c.id;"

# View coupons
docker-compose exec postgres psql -U postgres -d waterballsa -c "
  SELECT code, discount_type, discount_value, is_active
  FROM coupons;"
```

---

## Phase 2 Notes

### Implemented
- Purchases table with full constraints and indexes
- Coupons table structure (future-ready)
- Seed data for testing
- Auto-updating timestamps
- Foreign key constraints preventing orphan records

### Not Implemented (Deferred to Phase 3)
- Coupon validation logic in application code
- Coupon usage tracking (incrementing `current_uses`)
- Coupon expiration enforcement
- Refund functionality (REFUNDED status removed)
- Payment gateway integration (simplified to instant completion)

---

## Next Steps

1. Create JPA entities (`Purchase.java`, `Coupon.java`)
2. Create repositories (`PurchaseRepository.java`, `CouponRepository.java`)
3. Create services (`PurchaseService.java`)
4. Create controllers (`PurchaseController.java`)
5. Write unit and integration tests
6. Implement frontend purchase flow

---

**Document Status**: Complete - Database Design Phase
**Last Updated**: 2025-11-28
**Next Phase**: API Design & Implementation
