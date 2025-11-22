# Gamification System

> Experience points, leveling, and ranking system

## Overview

WaterBallSA uses a gamification system to encourage learning through:
- **Experience Points (EXP)**: Earned by completing assignments
- **Levels**: Progress through levels as you gain EXP
- **Rankings**: Compete with other students on the global leaderboard

---

## Experience Points (EXP)

### How to Earn EXP

- **Complete Assignments**: Each assignment has a fixed `exp_reward` value
- **Passing Grade Required**: Must score >= 60% to earn EXP
- **One-Time Award**: EXP awarded only once per assignment (even if resubmitted)

### Recommended EXP Ranges

| Assignment Type | EXP Range | Based On |
|----------------|-----------|----------|
| **QUIZ** | 10-50 | Difficulty and question count |
| **TEXT** | 25-75 | Length and complexity |
| **CODE** | 50-150 | Implementation complexity |
| **FILE** | 25-100 | Deliverable scope |

---

## Level Progression

### Formula

```
Level = floor(sqrt(total_exp / 100)) + 1

Examples:
- 0-99 EXP → Level 1
- 100-399 EXP → Level 2
- 400-899 EXP → Level 3
- 900-1599 EXP → Level 4
- 1600-2499 EXP → Level 5
- 10000+ EXP → Level 11
```

### EXP Required for Next Level

```
next_level_exp = (current_level^2) * 100

Examples:
- Level 1 → 2: Need 100 EXP total (100 more)
- Level 2 → 3: Need 400 EXP total (300 more)
- Level 3 → 4: Need 900 EXP total (500 more)
- Level 4 → 5: Need 1600 EXP total (700 more)
```

### Implementation (Java)

```java
public static int calculateLevel(int totalExp) {
    return (int) Math.floor(Math.sqrt(totalExp / 100.0)) + 1;
}

public static int expRequiredForLevel(int level) {
    return (level - 1) * (level - 1) * 100;
}

public static int expRequiredForNextLevel(int currentExp) {
    int currentLevel = calculateLevel(currentExp);
    return expRequiredForLevel(currentLevel + 1) - currentExp;
}
```

---

## Ranking System

### Calculation

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

### Ranking Rules

1. **Primary Sort**: Total EXP (descending) - Higher EXP = Higher rank
2. **Tiebreaker**: Account creation date (ascending) - Older account wins ties
3. **Exclusions**: Admin users are NOT included in rankings
4. **Rank #1**: User with highest EXP

### Leaderboard Display

- **Top 100**: Show top 100 users globally
- **User's Position**: Always show current user's rank
- **Nearby Users**: Show ±5 users around current user

---

## See Also

- [Database Triggers](../database/triggers.md) - EXP award implementation
- [User API](../api/users.md) - Leaderboard endpoints
- [Business Rules](./business-rules.md) - Gamification business rules
