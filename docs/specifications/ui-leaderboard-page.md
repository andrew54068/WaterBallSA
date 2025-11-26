# Specification: Leaderboard Page

## Business Context

The leaderboard page gamifies the learning experience by displaying user rankings based on experience points (EXP). This motivates learners to complete more courses and engage with the platform. The leaderboard includes:
- Learning rankings (學習排行榜) showing all-time top performers
- Weekly growth rankings (本週成長榜) showing recent progress
- User profiles with levels, titles, and EXP points
- Visual ranking indicators

This is a **Phase 3 feature** but we're building the UI mockup with hardcoded data for now.

## User Stories

### Story 1: View Learning Rankings
As a user, I want to see the top learners on the platform, so that I can be motivated to improve my ranking.

### Story 2: Check Weekly Growth
As a user, I want to see who has progressed the most this week, so that I can see recent active learners.

### Story 3: View User Details
As a user, I want to see each learner's level, title, and EXP, so that I understand their achievements.

## Acceptance Criteria (BDD Format)

### Scenario 1: Accessing the Leaderboard Page
```gherkin
Given I am logged in
When I navigate to the leaderboard page via sidebar
Then I should see "排行榜" highlighted in the sidebar
And I should see the promotional banner at the top
And I should see the leaderboard content area
```

### Scenario 2: Leaderboard Tabs
```gherkin
Given I am on the leaderboard page
Then I should see two tabs:
  | Tab Name | Translation | Default Active |
  | 學習排行榜 | Learning Rankings | Yes |
  | 本週成長榜 | Weekly Growth | No |
And the active tab should have a yellow background
And the inactive tab should have a dark background
```

### Scenario 3: Learning Rankings Display
```gherkin
Given I am viewing the "學習排行榜" tab
Then I should see the top 5 users ranked by EXP:
  | Rank | Name | Title | Level | EXP |
  | 1 | Elliot | 初級工程師 | Lv.19 | 31040 |
  | 2 | 精靈Ken Lin | 初級工程師 | Lv.18 | 29130 |
  | 3 | Clark Chen | 初級工程師 | Lv.17 | 27260 |
  | 4 | Adam Huang | 初級工程師 | Lv.16 | 25440 |
  | 5 | 酥炸香菇天婦羅 | 初級工程師 | Lv.16 | 25374 |
```

### Scenario 4: Leaderboard Entry Layout
```gherkin
Given I am viewing a leaderboard entry
Then each entry should display:
  | Element | Description |
  | Rank number | Large number on the left (1-5) |
  | Avatar | User profile image |
  | Name | User's display name |
  | Title | User's title (e.g., "初級工程師") |
  | Level badge | White rounded badge showing level (e.g., "Lv.19") |
  | EXP points | Total experience points on the right |
And entries should have a dark card background
And entries should have subtle borders or dividers
```

### Scenario 5: Ranking Visual Hierarchy
```gherkin
Given I am viewing the leaderboard
Then the rank numbers should be displayed prominently
And rank 1 should be the most visually prominent
And each rank should be clearly separated from others
And the list should be ordered from rank 1 to 5
```

### Scenario 6: Avatar Display
```gherkin
Given I am viewing leaderboard entries
Then each user should have a circular avatar
And avatars should be consistent in size
And if a user has no avatar, a default placeholder should be shown
```

### Scenario 7: Level Badge Display
```gherkin
Given I am viewing a user's level
Then the level should be displayed in a white rounded badge
And the format should be "Lv.XX" where XX is the level number
And the badge should be clearly visible against the dark background
```

### Scenario 8: EXP Points Display
```gherkin
Given I am viewing a user's EXP
Then the EXP should be displayed as a large number on the right side
And the number should be right-aligned
And the number should be in white text
```

### Scenario 9: Weekly Growth Tab (Future)
```gherkin
Given I am on the leaderboard page
When I click the "本週成長榜" tab
Then the tab should become active (yellow background)
And I should see users ranked by weekly EXP growth
And the display format should match the learning rankings
```

### Scenario 10: No Data State (Future)
```gherkin
Given there are no users to display
When I view the leaderboard
Then I should see a message "目前沒有排行榜數據"
```

### Scenario 11: Current User Highlight (Future - Phase 3)
```gherkin
Given I am logged in and on the leaderboard
When my rank is in the top 5
Then my entry should be highlighted with a special border or background
```

### Scenario 12: Pagination (Future - Phase 3)
```gherkin
Given there are more than 5 users
When I scroll to the bottom of the leaderboard
Then I should see a "查看更多" (Load More) button
When I click "查看更多"
Then I should see the next 5 ranked users
```

## UI Components

### New Components to Create:
1. **LeaderboardTabs** - Tab switcher for different ranking views
2. **LeaderboardEntry** - Individual user ranking card
3. **LeaderboardList** - Container for leaderboard entries

### Component Hierarchy:
```
LeaderboardPage
├── Sidebar (排行榜 active)
├── Header (with dropdown and login button)
├── PromotionalBanner
├── Main Content
│   ├── LeaderboardTabs
│   │   ├── Tab: 學習排行榜 (active)
│   │   └── Tab: 本週成長榜
│   └── LeaderboardList
│       ├── LeaderboardEntry (Rank 1)
│       ├── LeaderboardEntry (Rank 2)
│       ├── LeaderboardEntry (Rank 3)
│       ├── LeaderboardEntry (Rank 4)
│       └── LeaderboardEntry (Rank 5)
```

## Design Specifications

### Colors:
- Active tab: Yellow background (`#FFD700`)
- Inactive tab: Dark background (`#2a2a3e`)
- Entry background: Dark card (`#2a2a3e`)
- Border/divider: Subtle gray (`#3a3a4e`)
- Text white: `#ffffff`
- Text gray: `#a0a0a0`
- Level badge: White background with dark text

### Typography:
- Rank number: Extra large, bold (48px+)
- User name: Medium-large, bold
- Title: Small, gray
- Level: Medium, bold
- EXP: Large, bold

### Layout:
- Entry height: ~100-120px
- Entry padding: 24px
- Avatar size: 56px (circular)
- Level badge: Rounded pill shape
- Spacing between entries: 16px

### Responsive Design:
- Desktop: Full entry layout with all elements
- Tablet: Slightly condensed, maintain layout
- Mobile: Stack elements if needed, reduce padding

## Mock Data

```typescript
interface LeaderboardUser {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  title: string;
  level: number;
  exp: number;
}

const learningRankings: LeaderboardUser[] = [
  {
    rank: 1,
    userId: "user-1",
    name: "Elliot",
    avatar: "/avatars/elliot.png",
    title: "初級工程師",
    level: 19,
    exp: 31040,
  },
  {
    rank: 2,
    userId: "user-2",
    name: "精靈Ken Lin",
    avatar: "/avatars/ken.png",
    title: "初級工程師",
    level: 18,
    exp: 29130,
  },
  {
    rank: 3,
    userId: "user-3",
    name: "Clark Chen",
    avatar: "/avatars/clark.png",
    title: "初級工程師",
    level: 17,
    exp: 27260,
  },
  {
    rank: 4,
    userId: "user-4",
    name: "Adam Huang",
    avatar: "/avatars/adam.png",
    title: "初級工程師",
    level: 16,
    exp: 25440,
  },
  {
    rank: 5,
    userId: "user-5",
    name: "酥炸香菇天婦羅",
    avatar: "/avatars/mushroom.png",
    title: "初級工程師",
    level: 16,
    exp: 25374,
  },
];

const weeklyGrowthRankings: LeaderboardUser[] = [
  // Similar structure, different rankings based on weekly growth
];
```

## Technical Notes

- Use Next.js 14 app directory: `/app/leaderboard/page.tsx`
- Use TypeScript for type safety
- Use Tailwind CSS for styling
- Tab state managed with React state (useState)
- Mock data hardcoded for now
- Ensure proper semantic HTML (ordered list for rankings)

## Backend Requirements (Phase 3 - Future)

### Database Schema (Future):
```sql
-- This will be implemented in Phase 3
-- User EXP tracking
ALTER TABLE users ADD COLUMN exp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN title VARCHAR(100) DEFAULT '初級工程師';

-- Weekly EXP tracking
CREATE TABLE user_exp_history (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  exp_gained INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_exp_history_user_id_created_at
ON user_exp_history(user_id, created_at);
```

### API Endpoints (Phase 3 - Future):
- `GET /api/leaderboard/learning` - Get all-time learning rankings
- `GET /api/leaderboard/weekly` - Get weekly growth rankings
- `GET /api/leaderboard/me` - Get current user's rank and stats

## Testing Strategy

### Unit Tests:
- LeaderboardTabs component switches correctly
- LeaderboardEntry renders all user data
- Level badge displays correct format
- EXP formatting (thousands separator if needed)

### E2E Tests:
- Navigate to leaderboard page
- Verify top 5 users are displayed
- Switch between tabs
- Verify data persistence on navigation

## Future Enhancements (Phase 3)

- Real-time ranking updates
- User profile links (click to view profile)
- Filtering by curriculum or topic
- Monthly/yearly rankings
- Achievement badges on leaderboard
- User's current rank indicator (if outside top 5)
- Pagination for viewing more users
- Animation when rankings change

## Definition of Done

- [ ] All Given-When-Then scenarios are testable
- [ ] UI matches screenshot exactly
- [ ] Tabs switch correctly
- [ ] Mock data displays properly
- [ ] Responsive on all screen sizes
- [ ] Sidebar highlights "排行榜"
- [ ] E2E tests pass
- [ ] Code reviewed and documented
