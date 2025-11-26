# Specification: Lesson Viewer with Sidebar Navigation

## Business Context

The lesson viewer page provides an immersive learning experience where students can:
- Watch video lessons via embedded YouTube player
- Navigate between chapters and lessons via sidebar
- Track their progress through the curriculum
- Access free preview content (Chapter 0)
- See lesson completion status

## User Stories

### Story 1: Watch Video Lessons
As a student, I want to watch video lessons in an embedded player, so that I can learn without leaving the platform.

### Story 2: Navigate Between Lessons
As a student, I want to navigate between lessons using a sidebar, so that I can easily move through the curriculum.

### Story 3: See Lesson Progress
As a student, I want to see which lessons I've completed, so that I can track my learning progress.

### Story 4: Access Free Content
As a visitor, I want to access free preview lessons (Chapter 0), so that I can evaluate the course before purchasing.

## Sample Data Structure

```typescript
interface Course {
  id: number
  title: string
  chapters: Chapter[]
}

interface Chapter {
  id: number
  chapterNumber: number
  title: string
  isFree: boolean
  lessons: Lesson[]
}

interface Lesson {
  id: number
  title: string
  description: string
  youtubeUrl: string
  lessonType: 'VIDEO'
  isFree: boolean
  isCompleted: boolean
}
```

### Sample Course Data:

**Chapter 0 (Free)**
- Lesson: AI x BDD：規格驅動全自動開發術
  - URL: https://www.youtube.com/watch?v=W09vydJH6jo
  - Free: Yes

**Chapter 1**
- Lesson 1: 戰略戰術設計模式到底追求的是什麼？
  - URL: https://www.youtube.com/watch?v=mOJzH0U_3EU
  - Free: No

- Lesson 2: 水球軟體學院 2023 跨年頒獎典禮
  - URL: https://www.youtube.com/watch?v=MtdiKYAwjJw
  - Free: No

## Acceptance Criteria (BDD - Gherkin Format)

### Feature: Lesson Viewer with Sidebar Navigation

```gherkin
Feature: Lesson Viewer with Sidebar Navigation
  As a student
  I want to view video lessons with sidebar navigation
  So that I can learn efficiently and navigate between lessons easily

  Background:
    Given the course has the following structure:
      | Chapter | Title | Free | Lessons |
      | 0 | 課程介紹 & 試聽 | Yes | 1 |
      | 1 | 副本零：冒險者指引 | No | 2 |

  Scenario: Viewing the lesson page layout
    Given I am on a lesson viewer page
    Then I should see a sidebar on the left
    And I should see a video player on the right
    And I should see the course logo in the header
    And I should see navigation buttons in the header

  Scenario: Sidebar displays chapter structure
    Given I am on a lesson viewer page
    When I view the sidebar
    Then I should see all chapters listed
    And each chapter should show its chapter number and title
    And each chapter should be expandable/collapsible
    And the current chapter should be expanded by default

  Scenario: Expanding and collapsing chapters
    Given I am on a lesson viewer page
    And I see "課程介紹 & 試聽" chapter is expanded
    When I click on the chapter header
    Then the chapter should collapse
    And the lessons should be hidden
    When I click on the chapter header again
    Then the chapter should expand
    And the lessons should be visible

  Scenario: Viewing lessons within a chapter
    Given I am viewing an expanded chapter "課程介紹 & 試聽"
    Then I should see all lessons in that chapter
    And each lesson should display:
      | Element | Description |
      | Lock icon | If lesson is not free and user hasn't purchased |
      | Checkmark icon | If lesson is completed |
      | Lesson title | Full lesson name |
      | Play icon | Indicating it's a video lesson |

  Scenario: Current lesson is highlighted
    Given I am watching lesson "課程介紹：這門課手把手帶你成為架構設計的高手"
    When I view the sidebar
    Then that lesson should be highlighted with yellow background
    And other lessons should have dark background

  Scenario: Playing a YouTube video
    Given I am on a lesson page with YouTube URL "https://www.youtube.com/watch?v=W09vydJH6jo"
    When the page loads
    Then I should see an embedded YouTube player
    And the video should be ready to play
    And the player should fill the right side of the screen

  Scenario: Clicking on a different lesson
    Given I am watching a lesson
    And I see other lessons in the sidebar
    When I click on another lesson in the sidebar
    Then I should navigate to that lesson's page
    And the video player should load the new lesson's YouTube video
    And the new lesson should be highlighted in the sidebar

  Scenario: Accessing free lesson (Chapter 0) as unauthenticated user
    Given I am not logged in
    And I navigate to a lesson in "Chapter 0"
    Then I should be able to watch the video
    And I should not see a lock icon
    And I should see a message indicating it's a free preview

  Scenario: Attempting to access paid lesson without purchase
    Given I am logged in
    But I have not purchased the course
    When I click on a lesson in "Chapter 1"
    Then I should see a lock icon on the lesson
    And clicking it should show a message "購買課程以解鎖此內容"
    And the video should not load

  Scenario: Accessing paid lesson after purchase
    Given I am logged in
    And I have purchased the course
    When I click on a lesson in "Chapter 1"
    Then I should be able to watch the video
    And I should not see a lock icon
    And the lesson should load normally

  Scenario: Marking lesson as completed
    Given I am watching a video lesson
    When the video reaches 90% completion
    Then the lesson should be marked as completed
    And a checkmark icon should appear next to the lesson in the sidebar
    And my progress should be updated

  Scenario: Responsive design on mobile
    Given I am on a lesson viewer page on mobile device
    Then the sidebar should be collapsible/hidden
    And a hamburger menu should appear to toggle sidebar
    And the video player should be full width when sidebar is hidden

  Scenario: Video player controls
    Given I am watching a video
    Then I should see standard YouTube controls:
      | Control | Function |
      | Play/Pause | Start or pause video |
      | Volume | Adjust volume |
      | Fullscreen | Enter fullscreen mode |
      | Progress bar | Seek to different time |
      | Settings | Quality, speed settings |

  Scenario: Auto-play next lesson (optional)
    Given I am watching the last few seconds of a lesson
    And there is a next lesson available
    When the current video ends
    Then I should see a prompt "下一課即將開始"
    And after 5 seconds, the next lesson should auto-play
    Or I can click "跳過" to prevent auto-play

  Scenario: Chapter completion indicator
    Given I am viewing the sidebar
    When a chapter has all lessons completed
    Then the chapter should show a completion checkmark
    And the chapter title should show "100% 完成"

  Scenario: Lesson metadata display
    Given I am on a lesson page
    Then I should see lesson metadata in the sidebar:
      | Metadata | Example |
      | Lesson title | Full title of the lesson |
      | Duration | "15:30" (if available) |
      | Type | Video icon |
```

## UI Components

### New Components to Create:

1. **LessonSidebar**
   - Displays all chapters and lessons
   - Expandable/collapsible chapters
   - Highlights current lesson
   - Shows lock/completion icons

2. **YouTubePlayer**
   - Embeds YouTube videos using react-player
   - Responsive sizing
   - Progress tracking

3. **LessonViewerLayout**
   - Two-column layout (sidebar + player)
   - Responsive design
   - Header with navigation

### Component Hierarchy:

```
LessonViewerPage
├── Header
│   ├── Logo
│   ├── NavigationButtons (前往挑戰, Notifications, Profile)
│   └── Breadcrumb (optional)
├── MainLayout
│   ├── LessonSidebar (Left - 30%)
│   │   ├── ChapterList
│   │   │   ├── ChapterItem (expandable)
│   │   │   │   ├── ChapterHeader
│   │   │   │   └── LessonList
│   │   │   │       ├── LessonItem (highlighted if current)
│   │   │   │       │   ├── LockIcon (if locked)
│   │   │   │       │   ├── CheckmarkIcon (if completed)
│   │   │   │       │   └── LessonTitle
│   │   │   │       └── ...
│   │   └── ProgressIndicator (optional)
│   └── VideoPlayerArea (Right - 70%)
│       ├── YouTubePlayer
│       ├── LessonInfo
│       │   ├── LessonTitle
│       │   └── LessonDescription
│       └── LessonActions (Mark complete, Next lesson, etc.)
```

## Design Specifications

### Colors:
- Sidebar background: `#1a1a2e` (dark)
- Active lesson: `#FFD700` (yellow)
- Inactive lesson: `#2a2a3e`
- Completed checkmark: Green (`#10B981`)
- Lock icon: Gray (`#6B7280`)

### Layout:
- Desktop: Sidebar 30%, Video 70%
- Tablet: Collapsible sidebar
- Mobile: Sidebar as drawer/modal

### Typography:
- Chapter title: Bold, 18px
- Lesson title: Regular, 16px
- Active lesson: Bold, 16px

## Technical Implementation

### YouTube Embedding:
```typescript
// Using react-player for YouTube
import ReactPlayer from 'react-player/youtube'

<ReactPlayer
  url="https://www.youtube.com/watch?v=W09vydJH6jo"
  controls
  width="100%"
  height="100%"
  onProgress={handleProgress}
  onEnded={handleVideoEnd}
/>
```

### Progress Tracking:
- Track video progress (percentage watched)
- Mark as completed at 90% watched
- Store in localStorage or backend (Phase 3)

### URL Structure:
- `/lessons/[lessonId]` - View specific lesson
- Query params: `?curriculum=[id]&chapter=[id]` (optional context)

## Mock Data

```typescript
const mockCourse = {
  id: 2,
  title: "AI x BDD：規格驅動全自動開發術",
  chapters: [
    {
      id: 1,
      chapterNumber: 0,
      title: "課程介紹 & 試聽",
      isFree: true,
      lessons: [
        {
          id: 1,
          title: "AI x BDD：規格驅動全自動開發術 | 一次到位的 AI Coding",
          description: "Vibe Coding 最大的問題...",
          youtubeUrl: "https://www.youtube.com/watch?v=W09vydJH6jo",
          lessonType: "VIDEO",
          isFree: true,
          isCompleted: false,
        }
      ]
    },
    {
      id: 2,
      chapterNumber: 1,
      title: "副本零：冒險者指引",
      isFree: false,
      lessons: [
        {
          id: 2,
          title: "戰略戰術設計模式到底追求的是什麼？",
          description: "上一集中，水球開啟了全新的大章節...",
          youtubeUrl: "https://www.youtube.com/watch?v=mOJzH0U_3EU",
          lessonType: "VIDEO",
          isFree: false,
          isCompleted: false,
        },
        {
          id: 3,
          title: "水球軟體學院 2023 跨年頒獎典禮",
          description: "今年一樣抽免費軟設培訓...",
          youtubeUrl: "https://www.youtube.com/watch?v=MtdiKYAwjJw",
          lessonType: "VIDEO",
          isFree: false,
          isCompleted: false,
        }
      ]
    }
  ]
}
```

## Testing Strategy

### Unit Tests:
- LessonSidebar renders all chapters/lessons
- Active lesson is highlighted
- Lock icons show for locked lessons
- Checkmarks show for completed lessons

### Integration Tests:
- Clicking lesson navigates to correct page
- Video player loads correct YouTube URL
- Progress tracking updates correctly

### E2E Tests (Cucumber):
- Feature file with all scenarios above
- Step definitions for each Given/When/Then
- Test with real YouTube embeds

## Future Enhancements (Phase 3)

- Real-time progress sync with backend
- Video bookmarks
- Playback speed memory
- Subtitle support
- Discussion/comments per lesson
- Download lesson materials
- Certificate generation after course completion

## Definition of Done

- [ ] All Gherkin scenarios pass
- [ ] UI matches screenshot exactly
- [ ] YouTube videos embed and play correctly
- [ ] Sidebar navigation works smoothly
- [ ] Responsive on all screen sizes
- [ ] Progress tracking implemented (localStorage for now)
- [ ] Free lessons accessible without login
- [ ] Paid lessons show lock icon
- [ ] E2E tests with Cucumber pass
- [ ] Code reviewed and documented
