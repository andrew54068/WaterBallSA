# Specification: Home Page Redesign

## Business Context

The home page is the entry point for the WaterBallSA learning platform. It should showcase featured courses, provide easy navigation, and promote the platform's value proposition. The redesigned home page includes:
- Promotional banner for course discounts
- Featured course cards with enrollment options
- Information sections highlighting course offerings and blog content
- Consistent sidebar navigation

## User Stories

### Story 1: Browse Featured Courses
As a visitor, I want to see featured courses on the home page, so that I can quickly discover popular learning paths.

### Story 2: Access Promotional Offers
As a visitor, I want to see promotional banners, so that I can take advantage of special offers.

### Story 3: Navigate Platform Sections
As a user, I want to access different platform sections from the sidebar, so that I can easily explore courses, leaderboards, and other features.

## Acceptance Criteria (BDD Format)

### Scenario 1: Viewing the Home Page
```gherkin
Given I am on the home page
Then I should see the promotional banner at the top
And I should see the welcome section with "歡迎來到水球軟體學院" heading
And I should see two featured course cards
And I should see the "軟體設計模式之旅課程" section
And I should see the "水球潘的部落格" section
And I should see the sidebar with navigation items
```

### Scenario 2: Promotional Banner Display
```gherkin
Given I am on the home page
When I view the promotional banner
Then the banner should display "將軟體設計精通之旅體驗課程的全部影片看完就可以獲得 3000 元課程折價券！"
And the banner should have a yellow background
And the banner should show a "前往" (Go) button on the right
```

### Scenario 3: Featured Course Cards
```gherkin
Given I am on the home page
When I view the featured course section
Then I should see "軟體設計模式精通之旅" course card
And I should see "AI x BDD：規格驅動全自動開發術" course card
And each card should display:
  | Field | Description |
  | Course image | Hero image with course branding |
  | Course title | Full course name |
  | Provider tag | "水球潘" badge |
  | Description | Brief course description |
  | Pricing info | Discount or price information |
  | CTA button | "立即購體驗" or "立即購買" button |
```

### Scenario 4: Course Card - Free Trial Offer
```gherkin
Given I am viewing the "軟體設計模式精通之旅" course card
Then I should see "尚未購券" badge in top right
And I should see "你有一張 3,000 折價券" in yellow banner
And I should see two buttons:
  | Button | Style |
  | 立刻體驗 | Yellow filled |
  | 立即購買 | Dark outline |
```

### Scenario 5: Course Card - Paid Course
```gherkin
Given I am viewing the "AI x BDD" course card
Then I should see "尚未購券" badge in top right
And I should see "立即購買" button (dark outline)
```

### Scenario 6: Course Information Section
```gherkin
Given I am on the home page
When I scroll to the course information section
Then I should see a section with heading "軟體設計模式之旅課程"
And I should see descriptive text about the OOAD journey
And I should see a "查看課程 →" button
```

### Scenario 7: Blog Section
```gherkin
Given I am on the home page
When I scroll to the blog section
Then I should see a section with heading "水球潘的部落格"
And I should see descriptive text about blog content
And I should see an "閱讀文章 →" button
```

### Scenario 8: Sidebar Navigation
```gherkin
Given I am on the home page
Then the sidebar should display navigation items:
  | Item | Icon | Active |
  | 首頁 | Home icon | Yes (yellow) |
  | 課程 | Grid icon | No |
  | 排行榜 | Trophy icon | No |
  | 所有單元 | Calendar icon | No |
  | 挑戰地圖 | Map icon | No |
  | SOP 寶典 | Book icon | No |
```

### Scenario 9: Top Dropdown Selector
```gherkin
Given I am on the home page
Then I should see a dropdown selector at the top
And the dropdown should display "軟體設計模式精通之旅" as the current selection
When I click the dropdown
Then I should see a list of available curriculums
```

### Scenario 10: Clicking Featured Course Card
```gherkin
Given I am viewing a featured course card
When I click the "立即購買" or "立刻體驗" button
Then I should be navigated to the course detail page
```

## UI Components

### New Components to Create:
1. **PromotionalBanner** - Yellow banner with promotional message and CTA
2. **FeaturedCourseCard** - Enhanced course card with pricing, badges, and multiple CTAs
3. **InfoSection** - Content section with icon, heading, description, and CTA button
4. **Sidebar** - Updated sidebar with all navigation items (already exists but needs updates)

### Component Hierarchy:
```
HomePage
├── Sidebar
├── Header (with dropdown and login button)
├── PromotionalBanner
├── Main Content
│   ├── Welcome Section
│   │   ├── Heading
│   │   ├── Description
│   │   └── Featured Course Cards Grid
│   │       ├── FeaturedCourseCard (Design Patterns)
│   │       └── FeaturedCourseCard (AI x BDD)
│   ├── InfoSection (Course Section)
│   └── InfoSection (Blog Section)
```

## Design Specifications

### Colors:
- Primary Yellow: `#FFD700` or similar (promotional banner, active nav, CTA buttons)
- Dark Background: `#1a1a2e` or similar
- Card Background: `#2a2a3e` or similar
- Text White: `#ffffff`
- Text Gray: `#a0a0a0`

### Typography:
- Headings: Large, bold, white
- Body text: Regular weight, light gray
- CTA buttons: Medium weight, uppercase or regular

### Layout:
- Sidebar: Fixed left, ~200px width
- Main content: Full width with sidebar offset
- Max content width: Responsive, centered
- Card grid: 2 columns on desktop, 1 column on mobile

### Spacing:
- Section gaps: 4-6rem
- Card gaps: 2rem
- Internal padding: 1.5-2rem

## Mock Data

### Featured Courses:
```typescript
const featuredCourses = [
  {
    id: 1,
    title: "軟體設計模式精通之旅",
    provider: "水球潘",
    description: "用一趟旅程的時間，成為硬核的 Coding 實戰高手",
    image: "/images/design-patterns-hero.jpg",
    hasCoupon: true,
    couponValue: 3000,
    isFree: false,
    isPurchased: false,
    hasFreeTrial: true,
  },
  {
    id: 2,
    title: "AI x BDD：規格驅動全自動開發術",
    provider: "水球潘",
    description: "AI Top 1% 工程師必修課，掌握規格驅動的全自動化開發",
    image: "/images/ai-bdd-hero.jpg",
    hasCoupon: false,
    isPaid: true,
    isPurchased: false,
  }
];
```

## Technical Notes

- Use Next.js 14 app directory structure
- Use TypeScript for all components
- Use Tailwind CSS for styling
- Ensure responsive design for mobile, tablet, desktop
- Images should be optimized with Next.js Image component
- Components should be reusable and well-documented

## Future Enhancements (Phase 2+)

- Connect promotional banner to actual coupon system (Phase 2)
- Connect featured courses to real backend data
- Add user purchase status checks (Phase 2)
- Add analytics tracking for CTA clicks
- Add A/B testing for promotional messaging

## Definition of Done

- [ ] All Given-When-Then scenarios are testable
- [ ] UI matches screenshots pixel-perfectly
- [ ] Components are responsive on all screen sizes
- [ ] Mock data is used for featured courses
- [ ] Navigation works correctly
- [ ] E2E tests cover all scenarios
- [ ] Code is reviewed and documented
