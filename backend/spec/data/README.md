# WaterBallSA Database Schema Files

This directory contains the database schema definitions for the WaterBallSA online learning platform, organized by development phases.

## File Structure

```
backend/spec/data/
├── README.md                          # This file
├── entity_to_table_mapping.yml        # Entity to table name mapping (Chinese to English)
├── phase1_foundation.sql              # Phase 1: Foundation features (users, curriculums, chapters, lessons, video_progress)
├── phase2_purchases.sql               # Phase 2: Purchase system (coupons, purchases, payment_transactions)
├── phase3_gamification.sql            # Phase 3: Gamification (assignments, submissions, achievements)
├── common_triggers.sql                # Auto-update triggers for updated_at columns
└── schema.sql                         # Complete schema (all phases combined) - LEGACY, kept for reference
```

## Development Phases

### Phase 1: Foundation Features (CURRENT)
**File:** `phase1_foundation.sql`

Core learning platform features:
- **users** - Google OAuth authenticated users
- **curriculums** - Course metadata (pricing, difficulty, instructor)
- **chapters** - Curriculum subdivisions
- **lessons** - Content items (VIDEO/ARTICLE/SURVEY with JSONB metadata)
- **video_progress** - User video watching progress tracking

**Status:** ✅ Implemented (backend + frontend)

### Phase 2: Purchase System & Access Control (PLANNED)
**File:** `phase2_purchases.sql`

Purchase and payment features:
- **coupons** - Discount coupons (PERCENTAGE/FIXED_AMOUNT)
- **purchases** - Purchase order records (PENDING → COMPLETED flow)
- **payment_transactions** - Payment gateway integration (Phase 2 uses mock payment)

**Status:** 📋 Planned

**Dependencies:** Requires Phase 1 tables (`users`, `curriculums`)

### Phase 3: Gamification & Assignment System (FUTURE)
**File:** `phase3_gamification.sql`

Assignment and gamification features:
- **assignments** - Course assignments (CODE/FILE_UPLOAD/TEXT/QUIZ)
- **submissions** - Student submissions and grading
- **achievements** - Achievement definitions
- **user_achievements** - User unlocked achievements

**Status:** 🔮 Future

**Dependencies:** Requires Phase 1 tables (`users`, `lessons`)

## Common Files

### `common_triggers.sql`
Auto-update triggers for `updated_at` columns across all tables. Execute this file **AFTER** creating tables from phase files.

### `entity_to_table_mapping.yml`
Maps Chinese entity names to English table names for reference.

## PostgreSQL Compatibility

All schema files are **100% PostgreSQL compatible** and use:
- ✅ `COMMENT ON TABLE/COLUMN` for documentation (not inline `COMMENT`)
- ✅ Separate `CREATE INDEX` statements (not inline `INDEX`)
- ✅ `CONSTRAINT` syntax for all constraints
- ✅ `SERIAL` for auto-incrementing primary keys
- ✅ `JSONB` for flexible JSON storage
- ✅ PostgreSQL-specific features (full-text search with GIN indexes)
- ✅ Modern trigger syntax (`EXECUTE FUNCTION`)

## Usage

### Using Docker Compose (RECOMMENDED)

```bash
# Start the database
docker-compose up -d postgres

# Execute schema files inside the container
docker-compose exec postgres psql -U postgres -d waterballsa -f /docker-entrypoint-initdb.d/phase1_foundation.sql
docker-compose exec postgres psql -U postgres -d waterballsa -f /docker-entrypoint-initdb.d/common_triggers.sql

# Or copy files to container first
docker cp backend/spec/data/phase1_foundation.sql waterballsa_db:/tmp/
docker-compose exec postgres psql -U postgres -d waterballsa -f /tmp/phase1_foundation.sql
```

### Direct PostgreSQL Connection (for local PostgreSQL installations)

For **incremental development**:

```bash
# Phase 1 (Foundation)
psql -U postgres -d waterballsa -f phase1_foundation.sql

# Phase 2 (Purchase System) - when ready
psql -U postgres -d waterballsa -f phase2_purchases.sql

# Phase 3 (Gamification) - when ready
psql -U postgres -d waterballsa -f phase3_gamification.sql

# Apply common triggers after all tables are created
psql -U postgres -d waterballsa -f common_triggers.sql
```

### Syntax Validation

Before executing, you can validate syntax:

```bash
# Using the validation script
./validate_syntax.sh

# Or manually with psql
psql -U postgres -d waterballsa --set ON_ERROR_STOP=1 --single-transaction -f phase1_foundation.sql
```

### Complete Setup (all phases at once)

If you want to set up all phases at once:

```bash
# Execute all phase files in order
psql -U postgres -d waterballsa -f phase1_foundation.sql
psql -U postgres -d waterballsa -f phase2_purchases.sql
psql -U postgres -d waterballsa -f phase3_gamification.sql
psql -U postgres -d waterballsa -f common_triggers.sql
```

Or use the legacy `schema.sql` file:

```bash
psql -U postgres -d waterballsa -f schema.sql
```

## Key Features

### JSONB Metadata Fields
Tables use PostgreSQL JSONB fields for flexible metadata storage:

- **lessons.content_metadata** - Lesson-specific metadata (varies by VIDEO/ARTICLE/SURVEY type)
- **assignments.assignment_metadata** - Assignment configuration
- **coupons.applicable_curriculum_ids** - Applicable curriculum list
- **transaction_metadata** - Payment gateway responses

### Indexes
Each phase file includes:
- **Primary indexes** - For foreign key relationships
- **Composite indexes** - For common query patterns
- **Full-text search indexes** - For search functionality (Phase 1 curriculums)

### Triggers
The `common_triggers.sql` file automatically updates `updated_at` timestamps on record modifications.

### Constraints
Each phase includes:
- **Foreign key constraints** - Referential integrity
- **CHECK constraints** - Data validation (e.g., price >= 0, discount ranges)
- **UNIQUE constraints** - Prevent duplicates

## Database Migration Strategy

### Using Flyway (Current Approach)

The actual database migrations are managed by Flyway in:
```
backend/src/main/resources/db/migration/
├── V1__create_users_table.sql
├── V2__create_curriculums_table.sql
├── V3__create_chapters_table.sql
└── ... (versioned migration files)
```

**These spec files are for reference and planning only.** The actual migration scripts follow Flyway versioning conventions.

### Migration Rules
- **NEVER modify existing migrations** - Create new migrations for schema changes
- **Version migrations** - Use `V{N}__{description}.sql` format
- **Test migrations** - Always test on clean database first
- **Backward compatibility** - Consider data migration for breaking changes

## Notes

- All tables use `SERIAL` primary keys (auto-incrementing integers)
- Timestamps use `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` for creation
- Soft deletes are NOT used; use `ON DELETE CASCADE` or `ON DELETE RESTRICT` based on business logic
- Foreign keys are indexed automatically by PostgreSQL
- Table and column comments use `COMMENT` syntax (PostgreSQL-specific)

## References

- [PostgreSQL JSONB Documentation](https://www.postgresql.org/docs/current/datatype-json.html)
- [Flyway Migration Guide](https://flywaydb.org/documentation/)
- Project Documentation: `CLAUDE.md` in project root
