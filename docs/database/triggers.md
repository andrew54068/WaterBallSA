# Database Triggers & Functions

> Auto-update functions for timestamps, user ranks, and EXP awards

## Overview

Database triggers automate critical business logic:
1. **Auto-Update Timestamps**: Keep `updated_at` current
2. **Auto-Calculate User Rank**: Recalculate rankings when EXP changes
3. **Award EXP on Graded Submission**: Automatically grant EXP when submissions are graded

---

## 1. Auto-Update Timestamps

### Function Definition

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Apply to All Tables

```sql
-- Users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Curriculums table
CREATE TRIGGER update_curriculums_updated_at
    BEFORE UPDATE ON curriculums
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Chapters table
CREATE TRIGGER update_chapters_updated_at
    BEFORE UPDATE ON chapters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Lessons table
CREATE TRIGGER update_lessons_updated_at
    BEFORE UPDATE ON lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Assignments table
CREATE TRIGGER update_assignments_updated_at
    BEFORE UPDATE ON assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### Behavior

- **Trigger Type**: `BEFORE UPDATE`
- **Execution**: On every row update
- **Effect**: Sets `updated_at` to current timestamp automatically
- **Benefit**: No need to manually set `updated_at` in application code

---

## 2. Auto-Calculate User Rank

### Function Definition

```sql
CREATE OR REPLACE FUNCTION update_user_rank()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculate rank for all users
    WITH ranked_users AS (
        SELECT
            id,
            ROW_NUMBER() OVER (
                ORDER BY total_exp DESC, created_at ASC
            ) AS rank
        FROM users
        WHERE role = 'STUDENT'
    )
    UPDATE users u
    SET user_rank = r.rank
    FROM ranked_users r
    WHERE u.id = r.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Trigger Definition

```sql
CREATE TRIGGER trigger_update_user_rank
    AFTER UPDATE OF total_exp ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_user_rank();
```

### Behavior

- **Trigger Type**: `AFTER UPDATE` (only when `total_exp` changes)
- **Execution**: Per row (but updates all user ranks)
- **Effect**: Recalculates rankings for all students
- **Performance Note**: For MVP with <1000 users, this is acceptable. For production, use background job instead.

### Ranking Logic

1. **Primary Sort**: `total_exp DESC` (higher EXP = lower rank number)
2. **Tiebreaker**: `created_at ASC` (older account wins ties)
3. **Filter**: Only users with `role = 'STUDENT'` are ranked
4. **Result**: Rank #1 = highest EXP

### Performance Optimization (Future)

For production with >1000 users:

**Option 1: Conditional Trigger**
```sql
-- Only recalculate if top 100 affected
CREATE OR REPLACE FUNCTION update_user_rank_conditional()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if this user might affect top 100
    IF NEW.total_exp > (
        SELECT total_exp FROM users
        WHERE role = 'STUDENT'
        ORDER BY total_exp DESC
        OFFSET 100 LIMIT 1
    ) THEN
        -- Recalculate top 100 only
        -- ... (partial update logic)
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Option 2: Nightly Cron Job**
```bash
# Cron job runs at 2 AM daily
0 2 * * * psql -d waterballsa -c "
    WITH ranked_users AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY total_exp DESC, created_at ASC) AS rank
        FROM users WHERE role = 'STUDENT'
    )
    UPDATE users u SET user_rank = r.rank
    FROM ranked_users r WHERE u.id = r.id;
"
```

---

## 3. Award EXP on Graded Submission

### Function Definition

```sql
CREATE OR REPLACE FUNCTION award_exp_on_graded_submission()
RETURNS TRIGGER AS $$
DECLARE
    assignment_exp INTEGER;
    passing_grade NUMERIC := 60.0;
    already_awarded BOOLEAN;
BEGIN
    -- Only award EXP when status changes to GRADED
    IF NEW.status = 'GRADED' AND (OLD.status IS NULL OR OLD.status != 'GRADED') THEN

        -- Get assignment EXP reward
        SELECT exp_reward INTO assignment_exp
        FROM assignments
        WHERE id = NEW.assignment_id;

        -- Check if user already received EXP for this assignment
        SELECT EXISTS(
            SELECT 1
            FROM submissions
            WHERE assignment_id = NEW.assignment_id
              AND user_id = NEW.user_id
              AND status = 'GRADED'
              AND id != NEW.id  -- Exclude current submission
        ) INTO already_awarded;

        -- Award EXP if:
        -- 1. Grade >= passing grade (60%)
        -- 2. User hasn't already received EXP for this assignment
        IF NOT already_awarded AND NEW.grade >= passing_grade THEN
            UPDATE users
            SET total_exp = total_exp + assignment_exp
            WHERE id = NEW.user_id;

            -- Note: current_level will be recalculated by application layer
            -- Note: user_rank will be updated by update_user_rank() trigger
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Trigger Definition

```sql
CREATE TRIGGER trigger_award_exp
    AFTER UPDATE ON submissions
    FOR EACH ROW
    EXECUTE FUNCTION award_exp_on_graded_submission();
```

### Behavior

- **Trigger Type**: `AFTER UPDATE` (on submissions table)
- **Activation**: Only when `status` changes to `'GRADED'`
- **Effect**:
  1. Checks if grade >= 60% (passing grade)
  2. Checks if user already received EXP for this assignment
  3. If both conditions met → Updates `users.total_exp`
  4. `total_exp` update triggers `update_user_rank()` automatically

### EXP Award Logic

```
┌─────────────────────────────────────────────────┐
│ Submission Status Updated to GRADED             │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ Check: Is grade >= 60%?                         │
└────────────┬─────────────────┬──────────────────┘
             │ Yes             │ No
             ▼                 ▼
┌────────────────────────┐   ┌──────────────────┐
│ Check: EXP already     │   │ No EXP awarded   │
│ awarded for this       │   │ (grade too low)  │
│ assignment?            │   └──────────────────┘
└─────┬──────────┬───────┘
      │ No       │ Yes
      ▼          ▼
┌─────────┐   ┌──────────────┐
│ Award   │   │ No EXP       │
│ EXP     │   │ (already     │
└─────┬───┘   │ awarded)     │
      │       └──────────────┘
      ▼
┌──────────────────────────┐
│ Update users.total_exp   │
│ + assignment.exp_reward  │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Trigger: update_user_    │
│ rank() recalculates rank │
└──────────────────────────┘
```

### Example Scenarios

#### Scenario 1: First Submission, Passing Grade

```sql
-- Student submits quiz assignment (exp_reward = 25)
INSERT INTO submissions (assignment_id, user_id, status, grade, content)
VALUES ('assignment-uuid', 'user-uuid', 'GRADED', 80.0, '{"answers": {...}}');

-- Trigger logic:
-- 1. status = GRADED ✓
-- 2. grade = 80 >= 60 ✓
-- 3. already_awarded = FALSE ✓
-- 4. Award 25 EXP → users.total_exp increases
-- 5. update_user_rank() triggered → user_rank updated
```

#### Scenario 2: Resubmission, Better Grade

```sql
-- Student already submitted with grade 70 (EXP already awarded)
-- Student resubmits and gets grade 90

UPDATE submissions
SET status = 'GRADED', grade = 90.0
WHERE id = 'new-submission-uuid';

-- Trigger logic:
-- 1. status = GRADED ✓
-- 2. grade = 90 >= 60 ✓
-- 3. already_awarded = TRUE (from previous submission) ✗
-- 4. No EXP awarded (already received for first submission)
```

#### Scenario 3: Failing Grade

```sql
-- Student submits assignment (exp_reward = 50)
UPDATE submissions
SET status = 'GRADED', grade = 45.0
WHERE id = 'submission-uuid';

-- Trigger logic:
-- 1. status = GRADED ✓
-- 2. grade = 45 < 60 ✗
-- 3. No EXP awarded (grade too low)
```

---

## 4. Auto-Calculate Current Level (Application Layer)

**Note**: `current_level` is **NOT** calculated by trigger. It's calculated in application logic.

### Why Not a Trigger?

- Triggers should be simple and fast
- Level calculation involves square root (computational overhead)
- Better to calculate in application layer for flexibility

### Application Logic (Java)

```java
@Service
public class GamificationService {

    public static int calculateLevel(int totalExp) {
        return (int) Math.floor(Math.sqrt(totalExp / 100.0)) + 1;
    }

    public static int expRequiredForNextLevel(int currentLevel) {
        return (currentLevel) * (currentLevel) * 100;
    }

    public void updateUserLevel(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow();
        int newLevel = calculateLevel(user.getTotalExp());

        if (newLevel != user.getCurrentLevel()) {
            user.setCurrentLevel(newLevel);
            userRepository.save(user);

            // Optionally: Create activity event "Level Up!"
            createActivityEvent(userId, "LEVEL_UP", "You reached Level " + newLevel + "!");
        }
    }
}
```

### When to Recalculate Level

1. **After EXP Award**: When `award_exp_on_graded_submission()` triggers
2. **On User Profile Load**: Ensure level is current
3. **Nightly Batch Job**: Recalculate all levels for consistency

---

## Trigger Performance Considerations

### Current Setup (MVP)

| Trigger | Frequency | Impact | Acceptable For |
|---------|-----------|--------|----------------|
| `update_updated_at_column` | Every row update | Negligible | All scales |
| `update_user_rank` | Every EXP change | **High** (updates all users) | < 1000 users |
| `award_exp_on_graded_submission` | Per grading | Low | All scales |

### Optimization Strategies

#### For update_user_rank (Production)

**Problem**: Recalculating all user ranks on every EXP change is expensive.

**Solution 1: Background Job**
- Remove trigger
- Run nightly cron job to recalculate ranks
- Accept stale ranks (max 24 hours)

**Solution 2: Conditional Updates**
- Only recalculate if user's new EXP affects top 100
- Use materialized view for leaderboard

**Solution 3: Redis Cache**
- Calculate ranks on-demand
- Cache in Redis with 1-hour TTL
- No database trigger needed

### Monitoring Triggers

```sql
-- Check trigger execution count (PostgreSQL 13+)
SELECT
    schemaname,
    tablename,
    triggername,
    calls,
    total_time,
    self_time
FROM pg_stat_user_triggers
ORDER BY total_time DESC;
```

---

## Testing Triggers

### Test 1: Auto-Update Timestamps

```sql
-- Create test user
INSERT INTO users (email, google_id, name)
VALUES ('test@example.com', 'google123', 'Test User');

-- Check initial timestamps
SELECT id, created_at, updated_at FROM users WHERE email = 'test@example.com';

-- Wait 1 second, then update
SELECT pg_sleep(1);
UPDATE users SET name = 'Updated Name' WHERE email = 'test@example.com';

-- Verify updated_at changed
SELECT id, created_at, updated_at FROM users WHERE email = 'test@example.com';
-- Expected: updated_at > created_at
```

### Test 2: Auto-Calculate User Rank

```sql
-- Create 3 test students
INSERT INTO users (email, google_id, name, total_exp)
VALUES
    ('student1@example.com', 'g1', 'Alice', 1000),
    ('student2@example.com', 'g2', 'Bob', 500),
    ('student3@example.com', 'g3', 'Carol', 1500);

-- Check initial ranks
SELECT name, total_exp, user_rank FROM users WHERE role = 'STUDENT' ORDER BY user_rank;
-- Expected:
-- Carol  1500  1
-- Alice  1000  2
-- Bob    500   3

-- Update Alice's EXP to 2000
UPDATE users SET total_exp = 2000 WHERE email = 'student1@example.com';

-- Check updated ranks
SELECT name, total_exp, user_rank FROM users WHERE role = 'STUDENT' ORDER BY user_rank;
-- Expected:
-- Alice  2000  1  ← Rank changed!
-- Carol  1500  2
-- Bob    500   3
```

### Test 3: Award EXP on Graded Submission

```sql
-- Setup: Create test data
INSERT INTO curriculums (id, title, description, price) VALUES ('curr-uuid', 'Test Course', 'Desc', 99.99);
INSERT INTO chapters (id, curriculum_id, title, order_index) VALUES ('chap-uuid', 'curr-uuid', 'Chapter 1', 0);
INSERT INTO lessons (id, chapter_id, title, type, order_index, article_content) VALUES ('lesson-uuid', 'chap-uuid', 'Lesson 1', 'ARTICLE', 0, 'Content');
INSERT INTO assignments (id, lesson_id, title, description, type, config, exp_reward) VALUES ('assign-uuid', 'lesson-uuid', 'Quiz', 'Test quiz', 'QUIZ', '{}', 50);
INSERT INTO users (id, email, google_id, name, total_exp) VALUES ('user-uuid', 'student@test.com', 'g123', 'Student', 0);

-- Check initial EXP
SELECT total_exp FROM users WHERE id = 'user-uuid';
-- Expected: 0

-- Submit assignment with passing grade
INSERT INTO submissions (assignment_id, user_id, status, grade, content)
VALUES ('assign-uuid', 'user-uuid', 'GRADED', 80.0, '{"answers": {}}');

-- Check updated EXP
SELECT total_exp FROM users WHERE id = 'user-uuid';
-- Expected: 50 (0 + 50 EXP reward)

-- Resubmit with higher grade
INSERT INTO submissions (assignment_id, user_id, status, grade, content)
VALUES ('assign-uuid', 'user-uuid', 'GRADED', 95.0, '{"answers": {}}');

-- Check EXP (should NOT increase again)
SELECT total_exp FROM users WHERE id = 'user-uuid';
-- Expected: 50 (no change, EXP already awarded)
```

---

## Migration: Adding Triggers

### Migration File: `V3__add_triggers.sql`

```sql
-- V3__add_triggers.sql

-- 1. Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_curriculums_updated_at BEFORE UPDATE ON curriculums
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ... (apply to all tables)

-- 2. Auto-calculate user rank
CREATE OR REPLACE FUNCTION update_user_rank()
RETURNS TRIGGER AS $$
BEGIN
    WITH ranked_users AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY total_exp DESC, created_at ASC) AS rank
        FROM users WHERE role = 'STUDENT'
    )
    UPDATE users u SET user_rank = r.rank
    FROM ranked_users r WHERE u.id = r.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_rank AFTER UPDATE OF total_exp ON users
    FOR EACH ROW EXECUTE FUNCTION update_user_rank();

-- 3. Award EXP on graded submission
CREATE OR REPLACE FUNCTION award_exp_on_graded_submission()
RETURNS TRIGGER AS $$
-- ... (full function definition)
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_award_exp AFTER UPDATE ON submissions
    FOR EACH ROW EXECUTE FUNCTION award_exp_on_graded_submission();
```

---

## See Also

- [Database Schema](./schema.md) - Complete table definitions
- [Gamification System](../specifications/gamification.md) - EXP and level formulas
- [API Documentation](../api/) - How API interacts with triggers
