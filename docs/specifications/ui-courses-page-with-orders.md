# Specification: Courses Page with Order History

## Business Context

The courses page displays all available courses in a grid layout and shows the user's purchase history. This allows users to:
- Browse all available courses
- View their purchased courses with special badges
- Access their order history
- Quickly enroll or purchase courses

This combines existing course browsing with **Phase 2 features** (purchase history), so we'll use mock data for the order history section.

## User Stories

### Story 1: Browse All Courses
As a user, I want to see all available courses, so that I can discover and enroll in learning paths.

### Story 2: View Purchase Status
As a user, I want to see which courses I've purchased, so that I can quickly access my enrolled content.

### Story 3: Check Order History
As a user, I want to see my order history, so that I can track my purchases and receipts.

### Story 4: Access Trial Courses
As a user, I want to try courses before purchasing, so that I can evaluate the content quality.

## Acceptance Criteria (BDD Format)

### Scenario 1: Accessing the Courses Page
```gherkin
Given I am on the website
When I click "課程" in the sidebar
Then I should be navigated to the courses page
And "課程" should be highlighted in yellow in the sidebar
And I should see the promotional banner
And I should see the top dropdown selector
```

### Scenario 2: Course Grid Display
```gherkin
Given I am on the courses page
Then I should see a grid of course cards
And each course card should display:
  | Element | Description |
  | Course image | Hero image/thumbnail |
  | Course title | Full course name |
  | Provider badge | "水球潘" or provider name |
  | Purchase status badge | "尚未購券" or "已購買" |
  | Description | Brief course description |
  | Pricing info | Discount/coupon information if applicable |
  | Action buttons | Purchase or trial buttons |
```

### Scenario 3: Unpurchased Course Card
```gherkin
Given I am viewing an unpurchased course
Then the card should show "尚未購券" badge in top right
And I should see available actions:
  | Action | Condition |
  | 立刻體驗 | If free trial available (yellow button) |
  | 立即購買 | Always available (outline button) |
And if there's a coupon, I should see "你有一張 3,000 折價券" banner
```

### Scenario 4: Purchased Course Card (Future - Phase 2)
```gherkin
Given I have purchased a course
When I view the courses page
Then the purchased course card should show "已購買" badge
And the card should be visually distinct (e.g., different badge color)
And I should see a "開始學習" button instead of "立即購買"
```

### Scenario 5: Paid-Only Course Card
```gherkin
Given I am viewing a paid-only course without free trial
Then I should see "尚未購券" badge
And I should see "立即購買" button (enabled, outline style)
And there should be no "立刻體驗" button
```

### Scenario 6: Order History Section - Empty State
```gherkin
Given I have no purchase history
When I view the order history section
Then I should see a card with heading "📋 訂單紀錄"
And I should see the message "目前沒有訂單紀錄" centered in the card
And the card should have a dark background with subtle border
```

### Scenario 7: Order History Section - With Orders (Future - Phase 2)
```gherkin
Given I have purchased courses
When I view the order history section
Then I should see a list of my orders with:
  | Field | Description |
  | Order ID | Unique identifier |
  | Date | Purchase date |
  | Course name | Name of purchased curriculum |
  | Amount | Price paid |
  | Status | Completed, Pending, Refunded |
And orders should be sorted by date (newest first)
```

### Scenario 8: Responsive Course Grid
```gherkin
Given I am on the courses page
When I view on desktop
Then courses should display in 2 columns
When I view on tablet
Then courses should display in 1-2 columns
When I view on mobile
Then courses should display in 1 column
```

### Scenario 9: Clicking Trial Button
```gherkin
Given I am viewing a course with free trial
When I click "立刻體驗"
Then I should be navigated to the curriculum detail page
And I should have access to free preview lessons
```

### Scenario 10: Clicking Purchase Button
```gherkin
Given I am viewing any course
When I click "立即購買"
Then I should be navigated to the purchase flow (Phase 2)
Or I should see a modal explaining purchase process (mock)
```

## UI Components

### Existing Components to Update:
1. **CurriculumCard** - Update to show purchase status badges and new button styles

### New Components to Create:
1. **OrderHistory** - Section displaying purchase history
2. **OrderHistoryCard** - Individual order entry (Phase 2)

### Component Hierarchy:
```
CoursesPage
├── Sidebar (課程 active)
├── Header (with dropdown and login button)
├── PromotionalBanner
├── Main Content
│   ├── Course Grid
│   │   ├── CurriculumCard (Design Patterns)
│   │   ├── CurriculumCard (AI x BDD)
│   │   └── ... (other courses)
│   └── OrderHistory
│       ├── Heading: "📋 訂單紀錄"
│       └── EmptyState or OrderHistoryCard[]
```

## Design Specifications

### Colors:
- Purchase status badge "尚未購券": Yellow/Gold background
- Purchase status badge "已購買": Green background (future)
- Order history card: Dark background (`#2a2a3e`)
- Empty state text: Gray (`#a0a0a0`)

### Typography:
- Course card title: Medium-large, bold
- Badge text: Small, bold, uppercase
- Empty state: Regular, gray

### Layout:
- Course grid: 2 columns with gap (2rem)
- Order history: Full width below courses
- Card padding: 2rem
- Section margin-top: 4rem

### Badge Styles:
- Position: Absolute top-right corner of card image
- Padding: 0.5rem 1rem
- Border-radius: Full rounded (pill shape)
- Font-size: Small (12-14px)

## Mock Data

```typescript
interface CourseWithStatus {
  id: number;
  title: string;
  provider: string;
  description: string;
  image: string;
  isPurchased: boolean;
  hasFreeTrial: boolean;
  isPaidOnly: boolean;
  hasCoupon: boolean;
  couponValue?: number;
}

const courses: CourseWithStatus[] = [
  {
    id: 1,
    title: "軟體設計模式精通之旅",
    provider: "水球潘",
    description: "用一趟旅程的時間，成為硬核的 Coding 實戰高手",
    image: "/images/design-patterns.jpg",
    isPurchased: false,
    hasFreeTrial: true,
    isPaidOnly: false,
    hasCoupon: true,
    couponValue: 3000,
  },
  {
    id: 2,
    title: "AI x BDD：規格驅動全自動開發術",
    provider: "水球潘",
    description: "AI Top 1% 工程師必修課，掌握規格驅動的全自動化開發",
    image: "/images/ai-bdd.jpg",
    isPurchased: false,
    hasFreeTrial: false,
    isPaidOnly: true,
    hasCoupon: false,
  },
];

interface Order {
  id: string;
  orderId: string;
  date: string;
  curriculumId: number;
  curriculumTitle: string;
  amount: number;
  status: "completed" | "pending" | "refunded";
}

const orders: Order[] = [
  // Empty for now, will be populated in Phase 2
];
```

## Technical Notes

- Use existing `/app/page.tsx` and update to `/app/courses/page.tsx`
- Or keep home as separate and create courses route
- Update CurriculumCard to accept purchase status props
- Order history uses conditional rendering (empty state vs. order list)
- Mock data for orders (empty array for now)

## Backend Requirements (Phase 2 - Future)

### Database Schema (Phase 2):
```sql
-- Already planned in CLAUDE.md Phase 2
CREATE TABLE purchases (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  curriculum_id BIGINT REFERENCES curriculums(id),
  amount DECIMAL(10, 2),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payment_transactions (
  id BIGSERIAL PRIMARY KEY,
  purchase_id BIGINT REFERENCES purchases(id),
  payment_method VARCHAR(100),
  transaction_id VARCHAR(255),
  amount DECIMAL(10, 2),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints (Phase 2):
- `GET /api/curriculums/my-courses` - Get user's purchased courses
- `GET /api/orders` - Get user's order history
- `POST /api/purchases` - Create new purchase
- `GET /api/purchases/{id}` - Get purchase details

## Testing Strategy

### Unit Tests:
- CurriculumCard renders different states (purchased, unpurchased, trial, paid-only)
- Order history shows empty state correctly
- Badge displays correct text and style

### E2E Tests:
- Navigate to courses page
- Verify courses display in grid
- Verify purchase status badges
- Verify order history section shows empty state
- Click trial button navigates correctly
- Click purchase button triggers modal (mock)

## Future Enhancements (Phase 2+)

- Real purchase flow integration
- Receipt download functionality
- Order filtering and sorting
- Refund request functionality
- Course recommendation engine
- Search and filter courses

## Definition of Done

- [ ] All Given-When-Then scenarios are testable
- [ ] UI matches screenshot exactly
- [ ] Course grid displays properly
- [ ] Purchase status badges show correctly
- [ ] Order history shows empty state
- [ ] Responsive on all screen sizes
- [ ] Sidebar highlights "課程"
- [ ] E2E tests pass
- [ ] Code reviewed and documented
