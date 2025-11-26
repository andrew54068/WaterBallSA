# Specification: Roadmap / Challenge Map Page

## Business Context

The challenge map (挑戰地圖) gamifies the learning experience by presenting curriculum content as a visual roadmap of challenges. Users progress through "stages" (challenges) by completing lessons, earning stars for difficulty, and tracking their progress. This motivates continuous learning and provides clear progression paths.

Key features include:
- Visual roadmap showing learning progression
- Main path (主線) and side quests (支線)
- Progress tracking: days left, challenges cleared, XP earned
- Star ratings for challenge difficulty
- Lock indicators for incomplete prerequisites

This is a **Phase 3 feature** but we're building the UI mockup with hardcoded data for now.

## User Stories

### Story 1: View Learning Roadmap
As a user, I want to see my learning path as a visual roadmap, so that I understand my progression and next steps.

### Story 2: Track Progress
As a user, I want to see how many challenges I've completed, so that I can measure my progress.

### Story 3: Identify Locked Content
As a user, I want to see which challenges are locked, so that I know what prerequisites I need to complete.

### Story 4: Understand Challenge Difficulty
As a user, I want to see star ratings for each challenge, so that I can understand the difficulty level.

## Acceptance Criteria (BDD Format)

### Scenario 1: Accessing the Challenge Map
```gherkin
Given I am logged in
When I click "挑戰地圖" in the sidebar
Then I should navigate to the challenge map page
And "挑戰地圖" should be highlighted in yellow in the sidebar
And I should see the promotional banner at the top
And I should see the curriculum title "軟體設計模式精通之旅" in yellow
And I should see the subtitle "挑戰地圖"
```

### Scenario 2: Progress Stats Display
```gherkin
Given I am on the challenge map page
Then I should see three progress stats:
  | Stat | Icon | Value |
  | Days left | Clock/Timer | "0 days left" |
  | Cleared | Star | "0/20 cleared" |
  | XP | Trending up | "0 XP" |
And stats should be displayed in a horizontal row
And each stat should have an icon on the left
```

### Scenario 3: Path Tabs
```gherkin
Given I am on the challenge map page
Then I should see two tabs:
  | Tab | Translation | Default Active |
  | 主線 | Main Path | Yes |
  | 支線 | Side Quests | No |
And the active tab should have a yellow background
And the inactive tab should have a darker background
```

### Scenario 4: Section Headers
```gherkin
Given I am viewing the main path (主線)
Then I should see section headers like "自段道館"
And section headers should be centered
And section headers should have decorative lines on both sides
```

### Scenario 5: Challenge Entry Display
```gherkin
Given I am viewing a challenge in the roadmap
Then each challenge should display:
  | Element | Description |
  | Number badge | Circular badge with challenge number (1, 2, 3...) |
  | Lock icon | Lock icon if challenge is locked |
  | Title | Challenge/lesson title |
  | Star rating | 1-3 gold stars indicating difficulty |
And challenges should be arranged vertically
And challenges should have connecting lines (vertical) between them
```

### Scenario 6: Challenge Number Badge
```gherkin
Given I am viewing a challenge entry
Then the number badge should be:
  - Circular shape
  - Dark background
  - White number text
  - Positioned on the left
And there should be a small lock icon overlay if locked
```

### Scenario 7: Locked Challenge State
```gherkin
Given a challenge has prerequisites not yet completed
Then the challenge should show a lock icon
And the lock icon should be overlaid on the number badge
And the challenge title should be displayed normally
And clicking the challenge should show a tooltip or message about prerequisites
```

### Scenario 8: Unlocked Challenge State
```gherkin
Given a challenge has no prerequisites or prerequisites are completed
Then the challenge should NOT show a lock icon
And clicking the challenge should navigate to the lesson/chapter
```

### Scenario 9: Star Rating Display
```gherkin
Given a challenge has a difficulty rating
Then 1-3 gold stars should be displayed on the right side
And stars should be filled (gold color)
And the number of stars indicates difficulty:
  | Stars | Difficulty |
  | 1 | Easy/Beginner |
  | 2 | Medium/Intermediate |
  | 3 | Hard/Advanced |
```

### Scenario 10: Challenge List Layout
```gherkin
Given I am viewing the challenge list
Then challenges should be displayed as:
  - Full-width cards
  - Vertically stacked
  - Connected by vertical lines (roadmap visual)
  - Spaced evenly with gaps
And each card should have a dark background
And cards should have subtle borders or shadows
```

### Scenario 11: Main Path vs Side Quests
```gherkin
Given I am viewing the main path (主線)
Then I should see essential curriculum challenges
When I switch to side quests (支線)
Then I should see optional/bonus challenges
And the layout should be identical
```

### Scenario 12: Responsive Design
```gherkin
Given I am on the challenge map page
When I view on desktop
Then challenges should display in full width
When I view on mobile
Then challenges should stack and remain readable
And the layout should adapt to smaller screens
```

### Scenario 13: Empty State (No Challenges)
```gherkin
Given a curriculum has no challenges configured
When I view the challenge map
Then I should see a message "此課程尚未配置挑戰地圖"
```

### Scenario 14: Clicking a Challenge
```gherkin
Given I am viewing an unlocked challenge
When I click the challenge card
Then I should be navigated to the corresponding lesson or chapter
```

## UI Components

### New Components to Create:
1. **ProgressStats** - Three-stat display (days, cleared, XP)
2. **PathTabs** - Tab switcher for main/side paths
3. **ChallengeEntry** - Individual challenge card with lock, title, stars
4. **ChallengeList** - Vertical list of challenges with connectors
5. **RoadmapPage** - Main page component

### Component Hierarchy:
```
RoadmapPage
├── Sidebar (挑戰地圖 active)
├── Header (with dropdown and login button)
├── PromotionalBanner
├── Main Content
│   ├── Title: "軟體設計模式精通之旅" (yellow)
│   ├── Subtitle: "挑戰地圖"
│   ├── ProgressStats
│   │   ├── Stat: Days left
│   │   ├── Stat: Cleared
│   │   └── Stat: XP
│   ├── PathTabs
│   │   ├── Tab: 主線 (active)
│   │   └── Tab: 支線
│   └── ChallengeList
│       ├── SectionHeader: "自段道館"
│       ├── ChallengeEntry (1) - 行雲流水的設計底層思路
│       ├── ChallengeEntry (2) - Christopher Alexander：設計模式
│       ├── ChallengeEntry (3) - 掌握「樣板方法」最基礎的控制反轉
│       ├── ChallengeEntry (4) - 規劃行為實踐流派：Big 2
│       └── ChallengeEntry (5) - 多重設計範型決策戰演練：RPG
```

## Design Specifications

### Colors:
- Title yellow: `#FFD700`
- Active tab: Yellow background (`#FFD700`)
- Inactive tab: Dark background (`#3a3a4e`)
- Challenge card: Dark background (`#2a2a3e`)
- Number badge: Dark circle (`#1a1a2e`)
- Lock icon: Light gray or white
- Stars: Gold (`#FFD700`)
- Progress stats background: Darker card (`#1a1a2e`)

### Typography:
- Title: Large, bold, yellow
- Subtitle: Medium, white
- Progress stats: Medium, white
- Challenge title: Medium, white
- Section header: Medium, gray

### Layout:
- Progress stats: Horizontal flex, evenly spaced
- Challenge cards: Full width with padding (2rem)
- Card gap: 1rem
- Number badge: 48px circle
- Star size: 16-20px

### Visual Elements:
- Connecting lines: Vertical lines between number badges
- Lock icon: Small overlay on badge
- Stars: Filled icons on the right side

## Mock Data

```typescript
interface Challenge {
  id: number;
  number: number;
  title: string;
  isLocked: boolean;
  stars: 1 | 2 | 3;
  lessonId?: number;
  chapterId?: number;
}

interface RoadmapSection {
  title: string;
  challenges: Challenge[];
}

interface RoadmapData {
  curriculumId: number;
  curriculumTitle: string;
  daysLeft: number;
  totalChallenges: number;
  clearedChallenges: number;
  totalXP: number;
  mainPath: RoadmapSection[];
  sidePath: RoadmapSection[];
}

const mockRoadmap: RoadmapData = {
  curriculumId: 1,
  curriculumTitle: "軟體設計模式精通之旅",
  daysLeft: 0,
  totalChallenges: 20,
  clearedChallenges: 0,
  totalXP: 0,
  mainPath: [
    {
      title: "自段道館",
      challenges: [
        {
          id: 1,
          number: 1,
          title: "行雲流水的設計底層思路",
          isLocked: true,
          stars: 1,
        },
        {
          id: 2,
          number: 2,
          title: "Christopher Alexander：設計模式",
          isLocked: true,
          stars: 1,
        },
        {
          id: 3,
          number: 3,
          title: "掌握「樣板方法」最基礎的控制反轉",
          isLocked: true,
          stars: 2,
        },
        {
          id: 4,
          number: 4,
          title: "規劃行為實踐流派：Big 2",
          isLocked: true,
          stars: 2,
        },
        {
          id: 5,
          number: 5,
          title: "多重設計範型決策戰演練：RPG",
          isLocked: true,
          stars: 3,
        },
      ],
    },
  ],
  sidePath: [
    // Similar structure for side quests
  ],
};
```

## Technical Notes

- Route: `/app/roadmap/page.tsx` or `/app/curriculums/[id]/roadmap/page.tsx`
- Use TypeScript for all components
- Tab state managed with React useState
- Mock data hardcoded for now
- CSS Grid or Flexbox for layout
- Consider using SVG for connecting lines

## Backend Requirements (Phase 3 - Future)

### Database Schema:
```sql
-- Challenges table
CREATE TABLE challenges (
  id BIGSERIAL PRIMARY KEY,
  curriculum_id BIGINT REFERENCES curriculums(id),
  path_type VARCHAR(50), -- 'main' or 'side'
  section_title VARCHAR(255),
  order_index INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 3),
  lesson_id BIGINT REFERENCES lessons(id),
  chapter_id BIGINT REFERENCES chapters(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- User challenge progress
CREATE TABLE user_challenge_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  challenge_id BIGINT REFERENCES challenges(id),
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);
```

### API Endpoints:
- `GET /api/curriculums/{id}/roadmap` - Get roadmap data
- `GET /api/curriculums/{id}/roadmap/progress` - Get user progress
- `POST /api/challenges/{id}/complete` - Mark challenge complete
- `GET /api/challenges/{id}/unlock` - Check if challenge is unlocked

## Testing Strategy

### Unit Tests:
- ProgressStats displays correct values
- PathTabs switches correctly
- ChallengeEntry renders lock state
- Star ratings display correctly

### E2E Tests:
- Navigate to roadmap page
- Verify progress stats
- Switch between main/side tabs
- Verify challenges display
- Verify locked/unlocked states

## Future Enhancements (Phase 3)

- Real-time progress updates
- Unlock animations
- Click challenge to view details modal
- Achievement notifications
- Progress persistence
- Curriculum completion certificate trigger
- Social sharing of progress
- Estimated completion time calculations

## Definition of Done

- [ ] All Given-When-Then scenarios are testable
- [ ] UI matches screenshot exactly
- [ ] Progress stats display correctly
- [ ] Tabs switch properly
- [ ] Challenges show lock states
- [ ] Star ratings display correctly
- [ ] Responsive on all screen sizes
- [ ] Sidebar highlights "挑戰地圖"
- [ ] E2E tests pass
- [ ] Code reviewed and documented
