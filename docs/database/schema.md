# Database Schema

> Complete database schema for WaterBallSA platform

## Overview

**Database**: PostgreSQL 14+

**Migration Tool**: Flyway or Liquibase

**ORM**: Spring Data JPA (Hibernate)

**Conventions**:
- Table names: `snake_case`, plural (e.g., `users`, `curriculums`)
- Column names: `snake_case` (e.g., `created_at`, `user_id`)
- Primary keys: `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- Foreign keys: `{table}_id` (e.g., `user_id`, `curriculum_id`)
- Timestamps: `created_at`, `updated_at` (auto-managed by triggers)
- Soft deletes: `deleted_at TIMESTAMP` (nullable)

---

## Entity Relationship Diagram

```
┌─────────────────┐
│     Users       │
├─────────────────┤
│ id (UUID) PK    │
│ email           │
│ google_id       │◀────────────────┐
│ name            │                 │
│ avatar_url      │                 │
│ role (enum)     │                 │
│ total_exp       │                 │
│ current_level   │                 │
│ user_rank       │ (denormalized)  │
│ created_at      │                 │
│ updated_at      │                 │
└────────┬────────┘                 │
         │                          │
         │ 1:N                      │ N:1
         │                          │
┌────────▼────────┐        ┌────────┴────────┐
│   Purchases     │        │  Submissions    │
├─────────────────┤        ├─────────────────┤
│ id (UUID) PK    │        │ id (UUID) PK    │
│ user_id FK      │        │ user_id FK      │
│ curriculum_id FK│        │ assignment_id FK│
│ amount          │        │ content (JSON)  │
│ payment_provider│        │ status (enum)   │
│ payment_id      │        │ grade           │
│ status (enum)   │        │ feedback        │
│ purchased_at    │        │ submitted_at    │
└────────┬────────┘        │ graded_at       │
         │                 └─────────────────┘
         │ N:1                      │
         │                          │ N:1
┌────────▼────────┐                 │
│  Curriculums    │                 │
├─────────────────┤                 │
│ id (UUID) PK    │                 │
│ title           │                 │
│ description     │                 │
│ price           │                 │
│ thumbnail_url   │                 │
│ is_published    │                 │
│ created_at      │                 │
│ updated_at      │                 │
│ deleted_at      │                 │
└────────┬────────┘                 │
         │                          │
         │ 1:N                      │
         │                          │
┌────────▼────────┐                 │
│    Chapters     │                 │
├─────────────────┤                 │
│ id (UUID) PK    │                 │
│ curriculum_id FK│                 │
│ title           │                 │
│ description     │                 │
│ order_index     │                 │
│ created_at      │                 │
│ updated_at      │                 │
└────────┬────────┘                 │
         │                          │
         │ 1:N                      │
         │                          │
┌────────▼────────┐                 │
│    Lessons      │                 │
├─────────────────┤                 │
│ id (UUID) PK    │                 │
│ chapter_id FK   │                 │
│ title           │                 │
│ type (enum)     │ VIDEO/ARTICLE/  │
│ order_index     │ SURVEY          │
│ video_url       │ (nullable)      │
│ video_duration  │ (nullable)      │
│ article_content │ (nullable)      │
│ survey_config   │ (JSON)          │
│ created_at      │                 │
│ updated_at      │                 │
└────────┬────────┘                 │
         │                          │
         │ 1:N                      │
         │                          │
┌────────▼────────┐                 │
│  Assignments    │                 │
├─────────────────┤                 │
│ id (UUID) PK    │                 │
│ lesson_id FK    │                 │
│ title           │                 │
│ description     │                 │
│ type (enum)     │ CODE/FILE/      │
│ config (JSON)   │ TEXT/QUIZ       │
│ exp_reward      │                 │
│ created_at      │─────────────────┘
│ updated_at      │
└─────────────────┘

Additional Table:
┌─────────────────┐
│ User_Progress   │
├─────────────────┤
│ id (UUID) PK    │
│ user_id FK      │
│ lesson_id FK    │
│ completed       │
│ completed_at    │
│ UNIQUE(user_id, │
│  lesson_id)     │
└─────────────────┘
```

---

## Table Definitions

### Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    google_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    total_exp INTEGER DEFAULT 0 NOT NULL CHECK (total_exp >= 0),
    current_level INTEGER DEFAULT 1 NOT NULL CHECK (current_level >= 1),
    user_rank INTEGER, -- Denormalized, updated by trigger/job
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_rank ON users(user_rank) WHERE user_rank IS NOT NULL;
```

**Business Rules**:
- `google_id` is immutable after creation (enforced in application layer)
- `email` must match Google account email
- `user_rank` recalculated nightly via background job or trigger on exp changes
- Soft delete not applicable (users should never be deleted for audit trail)

**Indexes Rationale**:
- `idx_users_google_id`: OAuth login lookup
- `idx_users_email`: User search queries
- `idx_users_rank`: Leaderboard queries (partial index excludes NULL ranks)

---

### Curriculums Table

```sql
CREATE TABLE curriculums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    thumbnail_url TEXT,
    is_published BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP -- Soft delete for audit trail
);

CREATE INDEX idx_curriculums_published ON curriculums(is_published) WHERE deleted_at IS NULL;
CREATE INDEX idx_curriculums_deleted ON curriculums(deleted_at);
```

**Business Rules**:
- Price is in USD (decimal precision for cents)
- Unpublished curriculums (`is_published = false`) are not visible to students
- Soft deletes preserve purchase history integrity
- `thumbnail_url` points to S3 object (e.g., `https://s3.amazonaws.com/waterballsa/thumbnails/...`)

**Indexes Rationale**:
- `idx_curriculums_published`: Catalog queries (only published, non-deleted)
- `idx_curriculums_deleted`: Audit trail queries to find deleted curriculums

---

### Chapters Table

```sql
CREATE TABLE chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curriculum_id UUID NOT NULL REFERENCES curriculums(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL CHECK (order_index >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(curriculum_id, order_index)
);

CREATE INDEX idx_chapters_curriculum ON chapters(curriculum_id, order_index);
```

**Business Rules**:
- `order_index` determines chapter sequence (0-based)
- Unique constraint ensures no duplicate order within same curriculum
- Cascade delete: Deleting curriculum deletes all chapters
- Chapters cannot exist without a parent curriculum

**Indexes Rationale**:
- `idx_chapters_curriculum`: Fetch all chapters for a curriculum (ordered)

---

### Lessons Table

```sql
CREATE TYPE lesson_type AS ENUM ('VIDEO', 'ARTICLE', 'SURVEY');

CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type lesson_type NOT NULL,
    order_index INTEGER NOT NULL CHECK (order_index >= 0),
    video_url TEXT CHECK (
        (type = 'VIDEO' AND video_url IS NOT NULL) OR
        (type != 'VIDEO' AND video_url IS NULL)
    ),
    video_duration INTEGER, -- In seconds, nullable
    article_content TEXT CHECK (
        (type = 'ARTICLE' AND article_content IS NOT NULL) OR
        (type != 'ARTICLE' AND article_content IS NULL)
    ),
    survey_config JSONB CHECK (
        (type = 'SURVEY' AND survey_config IS NOT NULL) OR
        (type != 'SURVEY' AND survey_config IS NULL)
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(chapter_id, order_index)
);

CREATE INDEX idx_lessons_chapter ON lessons(chapter_id, order_index);
CREATE INDEX idx_lessons_type ON lessons(type);
```

**Business Rules**:
- Each lesson has exactly ONE type (VIDEO, ARTICLE, or SURVEY)
- CHECK constraints enforce type-specific fields:
  - VIDEO lessons MUST have `video_url`, MUST NOT have article/survey content
  - ARTICLE lessons MUST have `article_content`, MUST NOT have video/survey
  - SURVEY lessons MUST have `survey_config` (JSONB), MUST NOT have video/article
- `video_url` format: `https://s3.amazonaws.com/waterballsa/videos/{curriculumId}/{lessonId}/playlist.m3u8` (HLS)

**Survey Config JSON Structure**:
```json
{
  "questions": [
    {
      "id": "q1",
      "text": "What did you learn?",
      "type": "TEXT" | "MULTIPLE_CHOICE" | "RATING",
      "required": true,
      "options": ["Option A", "Option B"] // Only for MULTIPLE_CHOICE
    }
  ]
}
```

**Indexes Rationale**:
- `idx_lessons_chapter`: Fetch all lessons for a chapter (ordered)
- `idx_lessons_type`: Filter lessons by type (analytics, debugging)

---

### Purchases Table

```sql
CREATE TYPE purchase_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    curriculum_id UUID NOT NULL REFERENCES curriculums(id) ON DELETE RESTRICT,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    payment_provider VARCHAR(50) NOT NULL DEFAULT 'MOCK', -- 'MOCK', 'STRIPE', 'PAYPAL'
    payment_id VARCHAR(255) NOT NULL, -- External payment provider ID
    status purchase_status DEFAULT 'PENDING' NOT NULL,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(user_id, curriculum_id) -- User cannot purchase same curriculum twice
);

CREATE INDEX idx_purchases_user ON purchases(user_id, status);
CREATE INDEX idx_purchases_curriculum ON purchases(curriculum_id);
CREATE INDEX idx_purchases_payment ON purchases(payment_id);
```

**Business Rules**:
- UNIQUE constraint: One user can purchase a curriculum only once
- `amount` should match curriculum price at time of purchase (denormalized for audit)
- `payment_provider` = 'MOCK' for all purchases in Phase 1-3
- `payment_id` format for mock: `mock_{timestamp}_{randomUUID}`
- RESTRICT delete: Cannot delete users/curriculums with purchase history
- Only `COMPLETED` purchases grant content access

**Indexes Rationale**:
- `idx_purchases_user`: Access control queries (has user purchased?)
- `idx_purchases_curriculum`: Analytics (how many purchases per curriculum)
- `idx_purchases_payment`: Payment reconciliation, debugging

---

### Assignments Table

```sql
CREATE TYPE assignment_type AS ENUM ('CODE', 'FILE', 'TEXT', 'QUIZ');

CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type assignment_type NOT NULL,
    config JSONB NOT NULL, -- Type-specific configuration
    exp_reward INTEGER NOT NULL CHECK (exp_reward > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_assignments_lesson ON assignments(lesson_id);
```

**Business Rules**:
- One lesson can have multiple assignments
- `exp_reward` is fixed per assignment (defined by admin/content creator)
- `config` JSON structure varies by type (see below)

**Config JSON Structures**:

**CODE Assignment**:
```json
{
  "language": "java" | "typescript" | "python",
  "allowedExtensions": [".java", ".ts", ".py"],
  "maxFileSize": 10485760, // 10MB in bytes
  "instructions": "Implement the function..."
}
```

**FILE Assignment**:
```json
{
  "allowedFormats": [".pdf", ".docx", ".zip"],
  "maxFileSize": 104857600, // 100MB in bytes
  "instructions": "Upload your project report..."
}
```

**TEXT Assignment**:
```json
{
  "minLength": 100,
  "maxLength": 5000,
  "placeholder": "Share your reflections..."
}
```

**QUIZ Assignment**:
```json
{
  "questions": [
    {
      "id": "q1",
      "question": "What is polymorphism?",
      "type": "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER",
      "options": ["A", "B", "C", "D"], // For MULTIPLE_CHOICE
      "correctAnswer": "A", // For auto-grading
      "points": 10
    }
  ],
  "passingScore": 70, // Percentage
  "timeLimit": 3600 // Seconds, nullable
}
```

---

### Submissions Table

```sql
CREATE TYPE submission_status AS ENUM ('PENDING', 'GRADED', 'REJECTED');

CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    content JSONB NOT NULL, -- Submission data
    status submission_status DEFAULT 'PENDING' NOT NULL,
    grade NUMERIC(5, 2) CHECK (grade >= 0 AND grade <= 100), -- Percentage, nullable
    feedback TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    graded_at TIMESTAMP
);

CREATE INDEX idx_submissions_assignment_user ON submissions(assignment_id, user_id);
CREATE INDEX idx_submissions_user_status ON submissions(user_id, status);
CREATE INDEX idx_submissions_status ON submissions(status) WHERE status = 'PENDING';
```

**Business Rules**:
- Users can submit multiple times (latest submission is active)
- Only `GRADED` submissions with `grade >= passing_score` award EXP
- EXP awarded only once per assignment (even with multiple submissions)

**Content JSON Structures**:

**CODE Submission**:
```json
{
  "type": "CODE",
  "fileUrl": "/mock/user123/assignment456/Main.java", // Mock path
  "code": "public class Main { ... }", // Inline code
  "language": "java"
}
```

**FILE Submission**:
```json
{
  "type": "FILE",
  "fileUrl": "/mock/user123/assignment456/report.pdf",
  "fileName": "report.pdf",
  "fileSize": 2048576
}
```

**TEXT Submission**:
```json
{
  "type": "TEXT",
  "answer": "My reflection on this lesson is..."
}
```

**QUIZ Submission**:
```json
{
  "type": "QUIZ",
  "answers": {
    "q1": "A",
    "q2": "True",
    "q3": "Short answer text..."
  },
  "timeSpent": 1234 // Seconds
}
```

**Grading Rules** (Phase 3):
- QUIZ: Auto-graded by comparing `answers` with `correctAnswer` in assignment config
- CODE/FILE/TEXT: Manual grading (admin interface out of scope, can be done directly in DB for MVP)
- Trigger on status change to `GRADED` → Award EXP if grade >= passing score

**Indexes Rationale**:
- `idx_submissions_assignment_user`: Check if user submitted, fetch latest submission
- `idx_submissions_user_status`: User's submission history, pending submissions
- `idx_submissions_status`: Admin view of all pending submissions (partial index)

---

### User_Progress Table

```sql
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    completed_at TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_user_progress_user ON user_progress(user_id, completed);
CREATE INDEX idx_user_progress_lesson ON user_progress(lesson_id);
```

**Business Rules**:
- Tracks which lessons each user has completed
- Completion criteria (application logic):
  - VIDEO: Watched 80% or marked complete
  - ARTICLE: Scrolled to bottom or marked complete
  - SURVEY: Submitted survey response
- Used for progress tracking UI (e.g., "3/10 lessons completed")
- Independent of assignments (user can complete lesson without submitting assignment)

**Indexes Rationale**:
- `idx_user_progress_user`: User's completed lessons, progress calculations
- `idx_user_progress_lesson`: Analytics (completion rate per lesson)

---

## Data Integrity Constraints Summary

| Constraint Type | Example | Purpose |
|----------------|---------|---------|
| **Primary Keys** | `id UUID PRIMARY KEY` | Unique row identification |
| **Foreign Keys** | `user_id REFERENCES users(id)` | Referential integrity |
| **Unique Constraints** | `UNIQUE(user_id, curriculum_id)` | Prevent duplicate purchases |
| **Check Constraints** | `CHECK (total_exp >= 0)` | Data validation |
| **Not Null** | `email VARCHAR(255) NOT NULL` | Required fields |
| **Indexes** | `idx_purchases_user` | Query performance |
| **Enums** | `CREATE TYPE lesson_type AS ENUM` | Type safety |
| **Cascade Deletes** | `ON DELETE CASCADE` | Orphan prevention |
| **Restrict Deletes** | `ON DELETE RESTRICT` | Audit trail preservation |

---

## Database Migration Strategy

### Using Flyway

**Migration File Naming**: `V{version}__{description}.sql`

**Example**: `V1__initial_schema.sql`

```sql
-- V1__initial_schema.sql
-- Create enums
CREATE TYPE lesson_type AS ENUM ('VIDEO', 'ARTICLE', 'SURVEY');
-- ... (full schema here)
```

**Example**: `V2__add_user_rank_index.sql`

```sql
-- V2__add_user_rank_index.sql
CREATE INDEX idx_users_rank ON users(user_rank) WHERE user_rank IS NOT NULL;
```

### Migration Best Practices

1. **Never Modify Existing Migrations**: Always create new migration files
2. **Test Migrations**: Run on staging before production
3. **Backwards Compatibility**: Ensure migrations don't break existing code
4. **Data Migrations**: Separate schema changes from data changes
5. **Rollback Plan**: Have a rollback script for every migration

---

## See Also

- [Database Triggers](./triggers.md) - Auto-update functions and EXP awards
- [Migrations Guide](./migrations/) - Step-by-step migration files
- [API Documentation](../api/) - How API interacts with database
