# User Endpoints

> User profile, dashboard, and leaderboard

## Overview

User endpoints provide access to:
- User profile and statistics
- Dashboard with recent activity
- Global leaderboard and rankings

---

## GET `/api/users/me/dashboard`

Get user dashboard data (EXP, level, progress, recent activity).

### Request Headers

```
Authorization: Bearer <access_token>
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "avatarUrl": "https://lh3.googleusercontent.com/...",
      "totalExp": 1250,
      "currentLevel": 4,
      "userRank": 42,
      "expToNextLevel": 350 // 1600 - 1250 = 350 more needed
    },
    "stats": {
      "curriculumsPurchased": 3,
      "lessonsCompleted": 45,
      "assignmentsCompleted": 28,
      "totalStudents": 1234
    },
    "recentActivity": [
      {
        "type": "ASSIGNMENT_GRADED",
        "message": "Your quiz was graded: 80%",
        "timestamp": "2025-11-22T10:41:00Z"
      },
      {
        "type": "LEVEL_UP",
        "message": "You reached Level 4!",
        "timestamp": "2025-11-21T18:30:00Z"
      },
      {
        "type": "LESSON_COMPLETED",
        "message": "You completed: Spring Boot Basics",
        "timestamp": "2025-11-21T15:20:00Z"
      }
    ]
  }
}
```

### Activity Types

| Type | Description | Trigger |
|------|-------------|---------|
| `ASSIGNMENT_GRADED` | Assignment was graded | Instructor grades submission |
| `LEVEL_UP` | User leveled up | EXP threshold reached |
| `LESSON_COMPLETED` | Lesson marked complete | User completes lesson |
| `CURRICULUM_PURCHASED` | Curriculum purchased | Successful purchase |

---

## GET `/api/users/leaderboard`

Get global leaderboard (top 100 students).

### Query Parameters

| Parameter | Type | Description | Default | Max |
|-----------|------|-------------|---------|-----|
| `limit` | integer | Number of top users | 100 | 100 |

### Request Headers

```
Authorization: Bearer <access_token>
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "top100": [
      {
        "rank": 1,
        "userId": "user1-uuid",
        "name": "Alice Chen",
        "avatarUrl": "https://...",
        "level": 12,
        "totalExp": 15000
      },
      {
        "rank": 2,
        "userId": "user2-uuid",
        "name": "Bob Lin",
        "avatarUrl": "https://...",
        "level": 11,
        "totalExp": 13500
      }
      // ... up to 100 users
    ],
    "currentUser": {
      "rank": 247,
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "name": "You",
      "level": 8,
      "totalExp": 6200
    },
    "nearbyUsers": [
      {
        "rank": 245,
        "name": "User A",
        "level": 8,
        "totalExp": 6220
      },
      {
        "rank": 246,
        "name": "User B",
        "level": 8,
        "totalExp": 6210
      },
      {
        "rank": 247,
        "name": "You",
        "level": 8,
        "totalExp": 6200,
        "isCurrentUser": true
      },
      {
        "rank": 248,
        "name": "User C",
        "level": 8,
        "totalExp": 6190
      },
      {
        "rank": 249,
        "name": "User D",
        "level": 8,
        "totalExp": 6180
      }
    ]
  }
}
```

### Notes

- **Top 100**: Shows top 100 students by total EXP
- **Current User**: Always includes current user's position
- **Nearby Users**: Shows ±5 users around current user for context
- **Sorting**: Ranked by `totalExp DESC, createdAt ASC` (older accounts win ties)

---

## Gamification Details

### Level Progression

**Formula**: `level = floor(sqrt(totalExp / 100)) + 1`

**Examples**:
- 0-99 EXP → Level 1
- 100-399 EXP → Level 2
- 400-899 EXP → Level 3
- 900-1599 EXP → Level 4
- 1600-2499 EXP → Level 5
- 10000+ EXP → Level 11

**EXP Required for Next Level**:
```
next_level_exp = (current_level^2) * 100

Examples:
- Level 1 → 2: Need 100 EXP total
- Level 2 → 3: Need 400 EXP total (300 more)
- Level 3 → 4: Need 900 EXP total (500 more)
- Level 4 → 5: Need 1600 EXP total (700 more)
```

### Ranking Calculation

**Query**:
```sql
SELECT
  id,
  name,
  total_exp,
  current_level,
  ROW_NUMBER() OVER (ORDER BY total_exp DESC, created_at ASC) AS rank
FROM users
WHERE role = 'STUDENT'
ORDER BY rank;
```

**Rules**:
1. Primary sort: Total EXP (descending)
2. Tiebreaker: Account creation date (ascending)
3. Only STUDENT role included
4. Rank #1 = highest EXP

**Performance**:
- Cached in Redis (1-hour TTL)
- Denormalized `user_rank` column updated nightly
- For MVP (<1000 users): Calculate on-demand

---

## Dashboard UI Examples

### User Profile Display

```
┌─────────────────────────────────────┐
│  Level 4 Learner                    │
│  ████████████░░░░░░░░ 1250/1600 EXP │
│  Next level in 350 EXP              │
│  Rank: #42 out of 1,234 students    │
└─────────────────────────────────────┘
```

### Progress Stats

```
┌───────────────────────────────────────┐
│  Your Learning Progress               │
│                                       │
│  📚 3 Curriculums Purchased           │
│  ✅ 45 Lessons Completed              │
│  📝 28 Assignments Submitted          │
└───────────────────────────────────────┘
```

### Recent Activity Feed

```
┌───────────────────────────────────────┐
│  Recent Activity                      │
│                                       │
│  🎉 Your quiz was graded: 80%         │
│      2 hours ago                      │
│                                       │
│  ⭐ You reached Level 4!               │
│      Yesterday at 6:30 PM             │
│                                       │
│  ✅ You completed: Spring Boot Basics │
│      Yesterday at 3:20 PM             │
└───────────────────────────────────────┘
```

### Leaderboard Display

```
┌────────────────────────────────────────┐
│  🏆 Global Leaderboard                 │
│                                        │
│  1. 👑 Alice Chen    Level 12  15000   │
│  2. 🥈 Bob Lin       Level 11  13500   │
│  3. 🥉 Carol Wu      Level 11  12800   │
│  ...                                   │
│  42. You             Level 8   6200    │
│  ...                                   │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  Nearby Rankings                       │
│                                        │
│  245. User A         Level 8   6220    │
│  246. User B         Level 8   6210    │
│  247. ➤ You          Level 8   6200    │
│  248. User C         Level 8   6190    │
│  249. User D         Level 8   6180    │
└────────────────────────────────────────┘
```

---

## Business Rules

### Dashboard Access

- **Students**: Can view own dashboard only

### Leaderboard Rules

1. **Ranking Eligibility**:
   - All users are eligible for ranking

2. **Ranking Updates**:
   - Real-time for MVP (<1000 users)
   - Cached/scheduled for production (>1000 users)

3. **Privacy**:
   - All users can see all leaderboard entries
   - No option to hide from leaderboard in MVP
   - Future: Privacy settings to opt out

### Activity Feed

1. **Activity Retention**:
   - Last 50 activities per user
   - Older activities auto-deleted

2. **Activity Types**:
   - System-generated only (no user posts)
   - Stored in database or derived on-the-fly

3. **Real-Time Updates**:
   - Not required for MVP
   - Future: WebSocket for live updates

---

## Example Flows

### Student Viewing Dashboard

```
1. Student logs in
2. Frontend redirects to dashboard
3. Frontend calls: GET /api/users/me/dashboard
4. Backend returns:
   - User profile (level, EXP, rank)
   - Progress stats (curriculums, lessons, assignments)
   - Recent activity (last 10 events)
5. Frontend renders dashboard:
   - Progress bar showing EXP to next level
   - Stats cards
   - Activity feed
```

### Student Viewing Leaderboard

```
1. Student clicks "Leaderboard" tab
2. Frontend calls: GET /api/users/leaderboard
3. Backend queries:
   - Top 100 users (ORDER BY total_exp DESC)
   - Current user's rank
   - ±5 users around current user
4. Backend returns all three sections
5. Frontend renders:
   - Top 100 in main list
   - Current user highlighted
   - Nearby users in separate card
```

### After Assignment Graded

```
1. Instructor grades student's assignment
2. Backend:
   - Updates submission (status = GRADED, grade = 80)
   - Awards EXP (if grade >= 60%)
   - Updates user.total_exp
   - Recalculates user.current_level
   - Triggers rank recalculation
   - Creates activity event: "Your quiz was graded: 80%"
3. Next time student opens dashboard:
   - Sees updated EXP, level, rank
   - Sees "Your quiz was graded: 80%" in activity feed
```

---

## Future Enhancements

- **Customizable Dashboard**: Drag-and-drop widgets
- **Comparison View**: Compare progress with friends
- **Achievements Display**: Show earned badges on dashboard
- **Calendar View**: Visualize daily activity
- **Export Progress**: Download progress report as PDF
- **Privacy Settings**: Opt out of leaderboard visibility
- **Filter Leaderboard**: By curriculum, by timeframe (monthly/yearly)
