# Specification: Enhanced Curriculum Detail Pages

## Business Context

The curriculum detail page (also referred to as "journey" pages) provides comprehensive information about a course/curriculum. Users can view course details, syllabus, pricing, and enrollment options. The enhanced design includes:
- Hero section with course title and description
- Right sidebar with enrollment CTA, language selection, and course info
- Expandable accordion sections for curriculum content (chapters)
- Course certificate preview
- Consultation booking option
- Enhanced visual hierarchy and information architecture

This combines existing functionality with new UI/UX improvements.

## User Stories

### Story 1: View Course Details
As a visitor, I want to see comprehensive course information, so that I can decide if the course is right for me.

### Story 2: Enroll in Course
As a user, I want to easily enroll or purchase a course, so that I can start learning quickly.

### Story 3: Browse Course Syllabus
As a visitor, I want to see the course syllabus organized by chapters, so that I understand the learning path.

### Story 4: Access Free Trials
As a visitor, I want to access free trial content, so that I can evaluate the course before purchasing.

### Story 5: View Course Certificate
As a user, I want to see what certificate I'll receive, so that I'm motivated to complete the course.

## Acceptance Criteria (BDD Format)

### Scenario 1: Accessing Curriculum Detail Page
```gherkin
Given I am on the website
When I navigate to a curriculum detail page (/curriculums/{id})
Then I should see the course hero section
And I should see the sidebar navigation with "所有單元" highlighted
And I should see the right sidebar with enrollment options
And I should see expandable chapter sections
```

### Scenario 2: Hero Section - Design Patterns Course
```gherkin
Given I am viewing the "軟體設計模式精通之旅" curriculum
Then the hero section should display:
  | Element | Content |
  | Title | 軟體設計模式精通之旅 |
  | Tagline | "用一趟旅程的時間，成為硬核的 Coding 高手。" |
  | Description | Full course description (3-4 paragraphs) |
  | Stats | "49 部影片" and "大量實戰題" |
And I should see two CTA buttons:
  | Button | Style |
  | 立即加入課程 | Yellow filled |
  | 預約 1v1 諮詢 | Yellow outline |
```

### Scenario 3: Hero Section - AI BDD Course
```gherkin
Given I am viewing the "AI x BDD" curriculum
Then the hero section should display:
  | Element | Content |
  | Title | AI x BDD：規格驅動全自動開發術 |
  | Description | Course description about TDD, BDD, AI |
  | Stats | "8 部影片" and "大量實戰題" |
And I should see one CTA button "立即加入課程" (yellow filled)
```

### Scenario 4: Right Sidebar - Enrollment Card
```gherkin
Given I am on a curriculum detail page
Then the right sidebar should display:
  | Element | Description |
  | Certificate image | Course completion certificate preview |
  | Heading | "課程證書" |
  | CTA button | "立即加入課程" (yellow filled, full width) |
And the certificate should show:
  - "CERTIFICATE OF ACHIEVEMENT" heading
  - Placeholder name "John Doe"
  - Course completion text
  - Signature area
  - Waterball logo
```

### Scenario 5: Right Sidebar - Course Info
```gherkin
Given I am on a curriculum detail page
Then below the enrollment card I should see:
  | Info Item | Icon | Example |
  | 中文課程 | Globe | Language indicator |
  | 支援行動裝置 | Mobile | Device compatibility |
  | 專業的完課認證 | Document | Certificate info |
And each item should have an icon on the left
And text should be aligned consistently
```

### Scenario 6: Chapter Accordion - Collapsed State
```gherkin
Given I am viewing the curriculum content sections
Then I should see expandable chapter sections like:
  | Section Title |
  | 課程介紹 & 試聽 |
  | 劇本零：冒險者指引 |
  | 劇本一：行雲流水的設計底層思路 |
  | 劇本二：Christopher Alexander 設計模式 |
  | 劇本三：掌握所有樣板行為變動 |
And each section should have a chevron down icon on the right
And sections should have a dark card background
And sections should be clickable to expand
```

### Scenario 7: Chapter Accordion - Expanded State
```gherkin
Given I have clicked on a chapter section
Then the section should expand to show:
  - List of lessons within the chapter
  - Lesson titles
  - Lesson duration (if available)
  - Play icons or lesson type indicators
And the chevron should rotate to point up
And I should be able to click lessons to navigate to them
```

### Scenario 8: Enrollment Button - Unpurchased Course
```gherkin
Given I have not purchased the course
When I click "立即加入課程"
Then I should be directed to the purchase flow (Phase 2)
Or I should see a modal explaining enrollment process (mock)
```

### Scenario 9: Consultation Button
```gherkin
Given I am viewing a course with consultation option
When I click "預約 1v1 諮詢"
Then I should be directed to a consultation booking page
Or I should see a modal with booking information (mock)
```

### Scenario 10: Free Trial Access
```gherkin
Given a course has free trial lessons
Then the first chapter section should indicate free content
And clicking free lessons should allow access without purchase
```

### Scenario 11: Language Indicator
```gkerkin
Given I am viewing the course info section
Then I should see "中文課程" indicating the course language
And the icon should be a globe or language symbol
```

### Scenario 12: Mobile Responsive Layout
```gherkin
Given I am on a curriculum detail page on mobile
Then the right sidebar should move below the main content
And the hero section should stack vertically
And accordion sections should remain functional
And CTAs should remain accessible
```

### Scenario 13: Certificate Preview Modal (Future)
```gherkin
Given I am viewing the certificate image
When I click on the certificate
Then a modal should open with a larger preview
And I should be able to close the modal
```

## UI Components

### Existing Components to Update:
1. **CurriculumDetailPage** - Major redesign with new layout

### New Components to Create:
1. **CurriculumHero** - Hero section with title, description, stats, CTAs
2. **EnrollmentSidebar** - Right sidebar with certificate and enrollment options
3. **CourseInfoList** - List of course features with icons
4. **ChapterAccordion** - Expandable chapter sections
5. **AccordionItem** - Individual accordion section
6. **CertificatePreview** - Certificate image with styling

### Component Hierarchy:
```
CurriculumDetailPage
├── Sidebar (所有單元 active)
├── Header (with dropdown and login button)
├── PromotionalBanner
├── Main Content Layout (2 columns)
│   ├── Left Column (Main Content)
│   │   ├── CurriculumHero
│   │   │   ├── Title
│   │   │   ├── Description
│   │   │   ├── Stats (videos, exercises)
│   │   │   └── CTA Buttons
│   │   └── ChapterAccordion
│   │       ├── AccordionItem (課程介紹)
│   │       ├── AccordionItem (劇本零)
│   │       ├── AccordionItem (劇本一)
│   │       └── ...
│   └── Right Column (Sidebar)
│       ├── EnrollmentCard
│       │   ├── CertificatePreview
│       │   ├── Heading: "課程證書"
│       │   └── CTA: "立即加入課程"
│       └── CourseInfoList
│           ├── Info: 中文課程
│           ├── Info: 支援行動裝置
│           └── Info: 專業的完課認證
```

## Design Specifications

### Colors:
- Hero background: Dark (`#1a1a2e`)
- Accordion sections: Dark card (`#2a2a3e`)
- Right sidebar card: Dark (`#2a2a3e`)
- CTA buttons: Yellow (`#FFD700`)
- Text white: `#ffffff`
- Text gray: `#a0a0a0`
- Borders: Subtle gray (`#3a3a4e`)

### Typography:
- Hero title: Extra large, bold, white
- Hero description: Regular, light gray
- Stats: Medium, gray with icons
- Accordion headers: Medium, white
- Info list: Small-medium, white

### Layout:
- Desktop: 2-column grid (70% main, 30% sidebar)
- Tablet: 2-column grid (60% main, 40% sidebar)
- Mobile: Single column, sidebar below main
- Accordion gap: 1rem
- Card padding: 2rem
- Sidebar sticky position (optional)

### Spacing:
- Hero section padding: 3rem
- Section margin-bottom: 3rem
- Accordion item padding: 1.5rem
- Info list item gap: 1rem

### Images:
- Certificate: Responsive image, max-width 100%
- Aspect ratio: Maintained
- Border-radius: Slight rounding (8px)

## Mock Data

```typescript
interface CurriculumDetail {
  id: number;
  title: string;
  tagline: string;
  description: string;
  totalVideos: number;
  hasExercises: boolean;
  language: string;
  supportsM Mobile: boolean;
  hasCertificate: boolean;
  certificateImage: string;
  hasConsultation: boolean;
  chapters: ChapterDetail[];
}

interface ChapterDetail {
  id: number;
  title: string;
  orderIndex: number;
  lessons: LessonSummary[];
}

interface LessonSummary {
  id: number;
  title: string;
  duration?: string;
  type: "VIDEO" | "ARTICLE" | "SURVEY";
  isFree: boolean;
}

const mockCurriculum: CurriculumDetail = {
  id: 1,
  title: "軟體設計模式精通之旅",
  tagline: "「用一趟旅程的時間，成為硬核的 Coding 高手。」",
  description: `這門課帶你從軟體開發思路出發，透過... (full description)`,
  totalVideos: 49,
  hasExercises: true,
  language: "中文",
  supportsMobile: true,
  hasCertificate: true,
  certificateImage: "/images/certificate-preview.jpg",
  hasConsultation: true,
  chapters: [
    {
      id: 1,
      title: "課程介紹 & 試聽",
      orderIndex: 0,
      lessons: [
        { id: 1, title: "課程介紹", type: "VIDEO", isFree: true },
      ],
    },
    {
      id: 2,
      title: "劇本零：冒險者指引",
      orderIndex: 1,
      lessons: [
        { id: 2, title: "冒險者手冊", type: "ARTICLE", isFree: false },
      ],
    },
    // ... more chapters
  ],
};
```

## Technical Notes

- Route: `/app/curriculums/[id]/page.tsx` (update existing)
- Use React state for accordion expand/collapse
- Use CSS Grid for 2-column layout
- Certificate image should be optimized with Next.js Image
- Sticky sidebar on desktop (optional enhancement)
- Smooth expand/collapse animations for accordion

## Testing Strategy

### Unit Tests:
- CurriculumHero renders all data correctly
- ChapterAccordion expands and collapses
- EnrollmentSidebar shows correct CTA
- CourseInfoList displays all items
- Responsive layout adapts correctly

### E2E Tests:
- Navigate to curriculum detail page
- Verify all sections display
- Click accordion to expand/collapse
- Click enrollment button
- Click consultation button (if available)
- Verify responsive layout on mobile

## Future Enhancements

- Video preview modal
- Lesson completion indicators
- Course progress bar (Phase 3)
- Student reviews and ratings
- Instructor bio section
- Related courses recommendations
- Social sharing buttons
- Add to wishlist functionality (Phase 2)

## Definition of Done

- [ ] All Given-When-Then scenarios are testable
- [ ] UI matches screenshots exactly
- [ ] Hero section displays correctly
- [ ] Right sidebar shows enrollment card
- [ ] Accordion sections expand/collapse
- [ ] Course info displays correctly
- [ ] Certificate preview shows
- [ ] Responsive on all screen sizes
- [ ] Sidebar highlights "所有單元"
- [ ] E2E tests pass
- [ ] Code reviewed and documented
