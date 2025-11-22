# Business Rules

> Complete business logic and constraints for WaterBallSA platform

## Content Access Rules

### Curriculum Visibility

1. **Published Curriculums** (`is_published = true`):
   - ✅ Visible to all users in catalog
   - ✅ Can be purchased by students
   - ✅ Displayed in curriculum list

2. **Unpublished Curriculums** (`is_published = false`):
   - ❌ Hidden from all users
   - ❌ Cannot be purchased

### Lesson Access

- **Students**: Can only access lessons from **purchased** curriculums (status = `COMPLETED`)
- **Unpurchased Content**: Students see 403 Forbidden with purchase modal

### Assignment Submission

- Students can only submit assignments for lessons they have access to
- Multiple submissions allowed per assignment
- Latest submission is considered active
- Submissions require manual grading (except QUIZ which is auto-graded)

---

## Purchase Rules

### Purchase Model

1. **Purchase Unit**: Users can **only** purchase entire curriculums (not individual chapters/lessons)
2. **One-Time Purchase**: Each curriculum can be purchased **only once** per user
   - Enforced by database UNIQUE constraint: `UNIQUE(user_id, curriculum_id)`
3. **Instant Access**: Upon successful payment, immediate access to all chapters and lessons
4. **No Refunds**: All purchases are final (for MVP; refund policy out of scope)
5. **Price Lock**: Curriculum price at time of purchase is recorded
   - Future price changes don't affect past purchases
6. **Mock Payments**: All payments use mock provider (no real money in Phase 1-3)

### Purchase Flow

```
1. User clicks "Purchase Curriculum" → Mock payment form appears
2. User fills mock card details → Clicks "Pay $99.99"
3. 2-second loading animation (simulates payment processing)
4. Backend creates purchase record with status = 'COMPLETED'
5. Redirect to curriculum page → All lessons now accessible
```

### Payment Provider

- **Phase 1-3**: `payment_provider = 'MOCK'`
- **Payment ID Format**: `mock_{timestamp}_{randomUUID}`
- **Example**: `mock_1732272000000_abc123`

---

## Gamification Rules

### EXP Award Conditions

1. **Assignment must be graded**: `status = 'GRADED'`
2. **Grade must be passing**: `grade >= 60%`
3. **One-time award**: EXP awarded **only once** per assignment
   - Even if user resubmits multiple times
   - Database trigger checks for prior EXP awards

### Level Calculation

- **Formula**: `level = floor(sqrt(total_exp / 100)) + 1`
- **Auto-Update**: Recalculated when `total_exp` changes
- **Minimum Level**: 1 (at 0 EXP)

### Ranking Rules

1. **Sorting**: `total_exp DESC, created_at ASC`
2. **Eligibility**: All users are eligible for ranking
3. **Rank #1**: Highest EXP (or oldest account if tied)

### Grading Rules

| Assignment Type | Grading Method | Timeline |
|----------------|----------------|----------|
| **QUIZ** | Auto-graded | Instant |
| **CODE** | Manual grading | 1-3 business days (out of scope for MVP) |
| **FILE** | Manual grading | 1-3 business days (out of scope for MVP) |
| **TEXT** | Manual grading | 1-3 business days (out of scope for MVP) |

**Passing Grade**: 60% or above

---

## Content Organization Rules

### Hierarchy

**Strict 3-level structure**:
```
Curriculum → Chapters → Lessons
```

- Curriculums contain 1+ chapters
- Chapters contain 1+ lessons
- Lessons cannot exist without parent chapter
- Chapters cannot exist without parent curriculum

### Ordering

- **Chapters**: Use `order_index` (0-based, sequential)
- **Lessons**: Use `order_index` (0-based, sequential)
- **Unique Constraint**: `UNIQUE(curriculum_id, order_index)` for chapters
- **Unique Constraint**: `UNIQUE(chapter_id, order_index)` for lessons

### Lesson Types

Each lesson has exactly **one type**:

| Type | Required Fields | Nullable Fields |
|------|----------------|-----------------|
| **VIDEO** | `video_url`, `video_duration` | `article_content`, `survey_config` |
| **ARTICLE** | `article_content` | `video_url`, `video_duration`, `survey_config` |
| **SURVEY** | `survey_config` | `video_url`, `video_duration`, `article_content` |

### Video Constraints

- Each lesson can have **at most one video**
- Video URL format: HLS streaming (`.m3u8` playlist)
- Path: `https://s3.amazonaws.com/waterballsa/videos/{curriculumId}/{lessonId}/playlist.m3u8`

### Cascade Deletes

- Deleting curriculum → Deletes all child chapters and lessons
- Deleting chapter → Deletes all child lessons
- **Exception**: Curriculums use soft delete (`deleted_at`) to preserve purchase history

---

## User Roles & Permissions

### Student Role (Default)

| Action | Allowed? | Notes |
|--------|----------|-------|
| Browse published curriculums | ✅ Yes | Catalog view |
| Purchase curriculum | ✅ Yes | Mock payment |
| Access purchased lessons | ✅ Yes | Only if `purchase.status = COMPLETED` |
| Access unpurchased lessons | ❌ No | 403 Forbidden or paywall modal |
| Submit assignments | ✅ Yes | Only for accessible lessons |
| View own submissions | ✅ Yes | Own submissions only |
| View own ranking/EXP | ✅ Yes | Dashboard |
| View global leaderboard | ✅ Yes | Top 100 + nearby users |
| Grade submissions | ❌ No | Out of scope |
| Create/edit content | ❌ No | Out of scope |

---

## Assignment & Submission Rules

### Submission Rules

1. **Multiple Submissions Allowed**: Users can resubmit assignments
2. **Latest Submission Active**: Most recent submission is primary
3. **All Submissions Stored**: History preserved for audit

### EXP Award Logic

```
IF submission.status = 'GRADED'
AND submission.grade >= 60
AND user has NOT received EXP for this assignment before
THEN
    users.total_exp += assignment.exp_reward
    Recalculate users.current_level
    Recalculate users.user_rank
END IF
```

### Grading Timeline

- **QUIZ**: Instant (auto-graded)
- **CODE/FILE/TEXT**: Manual grading (SLA out of scope for MVP)

---

## Data Validation Rules

### Users

- `email`: Must be valid email format, unique
- `google_id`: Required, unique, immutable
- `total_exp`: >= 0
- `current_level`: >= 1
- `role`: Default `STUDENT`

### Curriculums

- `title`: Required, max 255 chars
- `description`: Required
- `price`: >= 0, decimal (10,2)
- `is_published`: Default `false`

### Purchases

- `amount`: Must match curriculum price at purchase time
- `payment_provider`: Default `'MOCK'`
- `status`: Default `'PENDING'`
- Unique constraint: `(user_id, curriculum_id)`

### Submissions

- `status`: Default `'PENDING'`
- `grade`: 0-100 (percentage), nullable
- `feedback`: Optional, max 5000 chars
- Content validation varies by assignment type

---

## See Also

- [Gamification System](./gamification.md) - EXP and level formulas
- [User Roles](./user-roles.md) - Detailed role permissions
- [Database Schema](../database/schema.md) - Database constraints
- [API Documentation](../api/) - API implementation of rules
