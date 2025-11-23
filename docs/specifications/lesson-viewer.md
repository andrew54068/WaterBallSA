# Lesson Viewer Specification

> **Feature**: Lesson content viewing system for WaterBallSA platform (Phase 1)
>
> **Status**: In Development
>
> **Owner**: Frontend Team
>
> **Last Updated**: 2025-01-23

---

## Table of Contents

1. [Overview](#overview)
2. [Business Context](#business-context)
3. [User Stories](#user-stories)
4. [Acceptance Criteria (BDD)](#acceptance-criteria-bdd)
5. [Technical Specifications](#technical-specifications)
6. [Error Scenarios](#error-scenarios)
7. [Edge Cases](#edge-cases)
8. [Success Metrics](#success-metrics)

---

## Overview

The Lesson Viewer is the core content consumption feature of the WaterBallSA platform. It enables students to view and interact with three types of educational content: VIDEO lessons (YouTube videos), ARTICLE lessons (external articles), and SURVEY lessons (knowledge checks/quizzes).

### Goals

- ✅ Enable students to consume lesson content seamlessly
- ✅ Support three distinct lesson types with appropriate UI/UX
- ✅ Provide intuitive navigation between lessons
- ✅ Display lesson metadata (title, description, duration, progress)
- ✅ Integrate with existing authentication and curriculum browsing

### Non-Goals (Future Phases)

- ❌ Access control based on purchase status (Phase 2)
- ❌ Lesson progress tracking and completion (Phase 2)
- ❌ Assignment submission (Phase 3)
- ❌ Video playback analytics (Future)
- ❌ Offline content viewing (Future)

---

## Business Context

### Problem Statement

Currently, the WaterBallSA platform allows users to:
1. Browse curriculums on the home page
2. View curriculum details with chapters and lessons

However, **there is no way for users to actually view lesson content**. The curriculum detail page (`/curriculums/[id]`) links to `/lessons/{id}`, but these pages don't exist.

This blocks Phase 1 completion and prevents users from consuming any educational content.

### Solution

Implement a responsive lesson viewer page that:
- Fetches lesson data from backend API (`GET /api/lessons/{id}`)
- Renders appropriate content based on `lesson_type` (VIDEO, ARTICLE, SURVEY)
- Displays lesson metadata and context (chapter, curriculum)
- Provides navigation to previous/next lessons

---

## User Stories

### US-1: View Video Lesson
**As a** student
**I want to** watch video lessons embedded in the platform
**So that** I can learn from video content without leaving the site

**Acceptance Criteria**:
- Video player embedded in lesson page
- Video URL from `content_url` field (YouTube format)
- Video controls (play, pause, seek, volume, fullscreen)
- Display duration and current playback time
- Responsive player (mobile, tablet, desktop)

### US-2: View Article Lesson
**As a** student
**I want to** read article lessons in a clean, readable format
**So that** I can absorb text-based educational content

**Acceptance Criteria**:
- Article content displayed in readable format
- External article URL from `content_url` field opens in new tab
- Display article metadata (word count, reading level) if available
- Clean typography optimized for reading
- Responsive layout for mobile and desktop

### US-3: View Survey/Quiz Lesson
**As a** student
**I want to** complete quizzes and surveys
**So that** I can test my knowledge and get feedback

**Acceptance Criteria**:
- Survey/quiz questions displayed clearly
- Survey path from `content_url` field
- Display metadata (question count, passing score) if available
- Note: Full quiz functionality is Phase 3; Phase 1 shows survey metadata only

### US-4: Navigate Between Lessons
**As a** student
**I want to** easily move to the next or previous lesson
**So that** I can progress through the chapter sequentially

**Acceptance Criteria**:
- "Previous Lesson" button (disabled if first lesson in chapter)
- "Next Lesson" button (disabled if last lesson in chapter)
- Breadcrumb showing: Curriculum → Chapter → Current Lesson
- Display current lesson's position (e.g., "Lesson 3 of 5")

### US-5: View Lesson Context
**As a** student
**I want to** see which curriculum and chapter this lesson belongs to
**So that** I understand the lesson's context in my learning path

**Acceptance Criteria**:
- Display curriculum title
- Display chapter title
- Display lesson title and description
- Display lesson duration (if available)
- Link back to curriculum detail page

---

## Acceptance Criteria (BDD)

### Feature: Video Lesson Viewing

#### Scenario 1: Student views a video lesson
```gherkin
Given a published video lesson exists with ID 1
And the lesson has content_url "https://www.youtube.com/watch?v=eIrMbAQSU34"
And the lesson has contentMetadata {"resolution": "1080p", "hasSubtitles": true}
When the student navigates to /lessons/1
Then the page should display the lesson title "Welcome to Java Programming"
And the page should display the lesson description
And the page should display a video player
And the video player should load the YouTube video "eIrMbAQSU34"
And the video player should show playback controls
And the page should display duration "15 minutes"
And the page should display the chapter title "Getting Started with Java"
And the page should display the curriculum title "Complete Java Programming Masterclass"
```

#### Scenario 2: Student plays a video lesson
```gherkin
Given the student is viewing a video lesson at /lessons/1
When the student clicks the play button
Then the video should start playing
And the playback time should increment
When the student clicks the pause button
Then the video should pause
And the playback time should stop incrementing
```

#### Scenario 3: Student seeks in a video
```gherkin
Given the student is viewing a video lesson at /lessons/1
And the video is currently playing
When the student drags the seek bar to 50%
Then the video should jump to the 50% timestamp
And the playback should continue from that point
```

#### Scenario 4: Student enables fullscreen mode
```gherkin
Given the student is viewing a video lesson at /lessons/1
When the student clicks the fullscreen button
Then the video player should expand to fullscreen
And browser controls should be hidden
And the video should continue playing
```

---

### Feature: Article Lesson Viewing

#### Scenario 5: Student views an article lesson
```gherkin
Given a published article lesson exists with ID 3
And the lesson has content_url "https://www.jetbrains.com/help/idea/getting-started.html"
And the lesson has contentMetadata {"wordCount": 1200, "readingLevel": "beginner"}
When the student navigates to /lessons/3
Then the page should display the lesson title "Setting up IntelliJ IDEA"
And the page should display the lesson description
And the page should display a "Read Article" button or link
And the page should display "Word count: 1200"
And the page should display "Reading level: beginner"
And the page should display duration "15 minutes"
```

#### Scenario 6: Student opens external article
```gherkin
Given the student is viewing an article lesson at /lessons/3
When the student clicks the "Read Article" button
Then the external article URL should open in a new browser tab
And the lesson page should remain open in the original tab
```

---

### Feature: Survey/Quiz Lesson Viewing

#### Scenario 7: Student views a survey lesson
```gherkin
Given a published survey lesson exists with ID 6
And the lesson has content_url "/surveys/java-basics"
And the lesson has contentMetadata {"questionCount": 10, "passingScore": 70}
When the student navigates to /lessons/6
Then the page should display the lesson title "Knowledge Check: Java Basics"
And the page should display the lesson description
And the page should display "10 questions"
And the page should display "Passing score: 70%"
And the page should display duration "10 minutes"
And the page should show a message "Survey/quiz functionality coming in Phase 3"
```

---

### Feature: Lesson Navigation

#### Scenario 8: Student navigates to next lesson
```gherkin
Given the student is viewing lesson 1 in chapter 1
And chapter 1 has lessons [1, 2, 3, 4, 5, 6]
When the student clicks "Next Lesson"
Then the page should navigate to /lessons/2
And the new lesson content should load
```

#### Scenario 9: Student navigates to previous lesson
```gherkin
Given the student is viewing lesson 2 in chapter 1
And chapter 1 has lessons [1, 2, 3, 4, 5, 6]
When the student clicks "Previous Lesson"
Then the page should navigate to /lessons/1
And the new lesson content should load
```

#### Scenario 10: Student is on first lesson
```gherkin
Given the student is viewing lesson 1 in chapter 1
And lesson 1 is the first lesson in the chapter
When the page loads
Then the "Previous Lesson" button should be disabled
And the "Next Lesson" button should be enabled
```

#### Scenario 11: Student is on last lesson
```gherkin
Given the student is viewing lesson 6 in chapter 1
And lesson 6 is the last lesson in the chapter
When the page loads
Then the "Next Lesson" button should be disabled
And the "Previous Lesson" button should be enabled
```

#### Scenario 12: Student navigates via breadcrumb
```gherkin
Given the student is viewing lesson 3 at /lessons/3
When the student clicks the curriculum title in the breadcrumb
Then the page should navigate to /curriculums/{curriculumId}
And the curriculum detail page should load with all chapters
```

---

### Feature: Lesson Context Display

#### Scenario 13: Student views lesson with full context
```gherkin
Given lesson 3 belongs to chapter "Getting Started with Java"
And the chapter belongs to curriculum "Complete Java Programming Masterclass"
When the student navigates to /lessons/3
Then the page should display "Complete Java Programming Masterclass" as curriculum title
And the page should display "Getting Started with Java" as chapter title
And the page should display "Setting up IntelliJ IDEA" as lesson title
And the curriculum title should be a clickable link to /curriculums/{id}
```

#### Scenario 14: Student views lesson progress indicator
```gherkin
Given the student is viewing lesson 3 in chapter 1
And chapter 1 has 6 total lessons
When the page loads
Then the page should display "Lesson 3 of 6" or similar progress indicator
```

---

## Technical Specifications

### Data Model

#### Lesson Entity (from backend)
```typescript
interface Lesson {
  id: number
  chapterId: number
  title: string
  description?: string
  lessonType: 'VIDEO' | 'ARTICLE' | 'SURVEY'
  contentUrl: string  // YouTube URL, article URL, or survey path
  contentMetadata: Record<string, any>  // Type-specific metadata
  orderIndex: number  // 0-based position in chapter
  durationMinutes?: number
  isFreePreview: boolean
  isPublished: boolean
  createdAt: string
  updatedAt: string
}
```

#### Content Metadata Formats

**VIDEO Lessons**:
```json
{
  "resolution": "1080p",
  "hasSubtitles": true
}
```

**ARTICLE Lessons**:
```json
{
  "wordCount": 1200,
  "readingLevel": "beginner",
  "codeExamples": 15
}
```

**SURVEY Lessons**:
```json
{
  "questionCount": 10,
  "passingScore": 70,
  "difficulty": "medium"
}
```

### API Endpoints

**Primary Endpoint**:
```
GET /api/lessons/{id}
Response: Lesson object
```

**Supporting Endpoints**:
```
GET /api/chapters/{id}
Response: Chapter object with lessons[] array

GET /api/lessons/chapter/{chapterId}
Response: Lesson[] array
```

### Frontend Architecture

#### Page Structure
```
/frontend/src/app/lessons/[id]/page.tsx
```

This page will:
1. Use Next.js 14 App Router dynamic route `[id]`
2. Fetch lesson data server-side or client-side
3. Determine lesson type from `lessonType` field
4. Render appropriate component based on type
5. Display navigation and metadata

#### Component Breakdown

**1. VideoPlayer Component** (`/frontend/src/components/VideoPlayer.tsx`)
- Props: `{ videoUrl: string; title: string; duration?: number }`
- Uses `react-player` library for YouTube embedding
- Provides controls: play, pause, seek, volume, fullscreen
- Responsive design (16:9 aspect ratio)
- Shows loading state while video loads
- Handles errors (invalid URL, video unavailable)

**2. ArticleRenderer Component** (`/frontend/src/components/ArticleRenderer.tsx`)
- Props: `{ articleUrl: string; title: string; metadata?: ArticleMetadata }`
- Displays article metadata (word count, reading level)
- Provides "Read Article" button/link
- Opens external URL in new tab (`target="_blank" rel="noopener noreferrer"`)
- Clean typography with proper spacing
- Note: Phase 1 only links to external articles; embedded content in Phase 2+

**3. SurveyForm Component** (`/frontend/src/components/SurveyForm.tsx`)
- Props: `{ surveyPath: string; title: string; metadata?: SurveyMetadata }`
- Displays survey metadata (question count, passing score)
- Shows placeholder message: "Survey/quiz functionality coming in Phase 3"
- Reserved for full implementation in Phase 3
- Clean card-based design

**4. LessonNavigation Component** (`/frontend/src/components/LessonNavigation.tsx`)
- Props: `{ currentLessonId: number; chapterId: number; lessons: Lesson[] }`
- Calculates previous/next lesson IDs
- Renders "Previous" and "Next" buttons
- Disables buttons at chapter boundaries
- Shows progress indicator (e.g., "3 / 6")

**5. LessonBreadcrumb Component** (`/frontend/src/components/LessonBreadcrumb.tsx`)
- Props: `{ curriculumId: number; curriculumTitle: string; chapterTitle: string; lessonTitle: string }`
- Displays: Curriculum → Chapter → Lesson
- Links to curriculum detail page
- Responsive truncation on mobile

### Dependencies

**New Dependencies to Install**:
```json
{
  "react-player": "^2.13.0"  // For YouTube video embedding
}
```

**Optional (for future enhancements)**:
```json
{
  "react-markdown": "^9.0.0",  // For rendering markdown articles (Phase 2+)
  "gray-matter": "^4.0.3"       // For parsing frontmatter (Phase 2+)
}
```

### Routing

```
/lessons/[id]  →  LessonViewerPage
```

**URL Parameters**:
- `id` (required): Lesson ID (number)

**Query Parameters** (optional, future):
- `t` (optional): Timestamp for video playback (e.g., `?t=120` starts at 2:00)

### Styling & UX

**Design Principles**:
- Clean, distraction-free content viewing
- Responsive layout (mobile-first)
- Consistent with existing curriculum browsing UI
- Accessible keyboard navigation
- Loading states for all async operations
- Error states with retry options

**Layout**:
```
┌─────────────────────────────────────────┐
│ Header (existing)                        │
├─────────────────────────────────────────┤
│ Breadcrumb: Curriculum → Chapter → Lesson│
├─────────────────────────────────────────┤
│                                          │
│ Lesson Title                             │
│ Lesson Description                       │
│ Duration: 15 minutes                     │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │                                    │  │
│ │   [VIDEO PLAYER / ARTICLE / SURVEY]│  │
│ │                                    │  │
│ └────────────────────────────────────┘  │
│                                          │
│ ┌──────────────┐ ┌──────────────┐       │
│ │ ← Previous   │ │   Next →     │       │
│ └──────────────┘ └──────────────┘       │
│                                          │
│ Lesson 3 of 6                            │
└─────────────────────────────────────────┘
```

---

## Error Scenarios

### ES-1: Lesson Not Found
```gherkin
Given no lesson exists with ID 999
When the student navigates to /lessons/999
Then the page should return a 404 status
And the page should display "Lesson not found"
And the page should provide a link to browse curriculums
```

### ES-2: Lesson Not Published
```gherkin
Given a lesson exists with ID 10
And the lesson has is_published = false
When the student navigates to /lessons/10
Then the page should return a 404 status
And the page should display "Lesson not available"
```

### ES-3: Invalid Video URL
```gherkin
Given the student is viewing a video lesson
And the content_url is invalid or video is unavailable
When the video player attempts to load
Then the player should display "Video unavailable"
And the player should show a retry button
```

### ES-4: Network Error During Fetch
```gherkin
Given the student navigates to /lessons/5
And the network connection fails during API request
When the page attempts to load lesson data
Then the page should display "Failed to load lesson"
And the page should provide a retry button
When the student clicks retry
Then the page should re-fetch the lesson data
```

### ES-5: External Article Unavailable
```gherkin
Given the student is viewing an article lesson
And the external article URL is broken or unavailable
When the student clicks "Read Article"
Then the external URL should open in a new tab
And if the article fails to load, the browser will show its own error
Note: We cannot control external article availability
```

---

## Edge Cases

### EC-1: Single Lesson in Chapter
```gherkin
Given a chapter has only one lesson (lesson ID 1)
When the student views lesson 1
Then both "Previous" and "Next" buttons should be disabled
And the progress indicator should show "Lesson 1 of 1"
```

### EC-2: Lesson with No Description
```gherkin
Given lesson 5 has description = null
When the student views lesson 5
Then the description section should not render
And the page should proceed directly to content
```

### EC-3: Lesson with No Duration
```gherkin
Given lesson 7 has duration_minutes = null
When the student views lesson 7
Then the duration display should not render
And the page should proceed without showing duration
```

### EC-4: Lesson with Empty Content Metadata
```gherkin
Given lesson 8 has content_metadata = {}
When the student views lesson 8
Then the page should still render the lesson
And metadata-dependent UI elements should gracefully hide
```

### EC-5: Very Long Lesson Title
```gherkin
Given lesson 9 has a title with 200+ characters
When the student views lesson 9
Then the title should render completely (no truncation)
And the layout should remain responsive
And the title should wrap to multiple lines if needed
```

### EC-6: YouTube Video with Timestamp
```gherkin
Given the student navigates to /lessons/1?t=120
When the video player loads
Then the video should start playing at 2:00 (120 seconds)
Note: This is a future enhancement; Phase 1 ignores query params
```

---

## Success Metrics

### Functional Completeness
- ✅ All three lesson types (VIDEO, ARTICLE, SURVEY) render correctly
- ✅ Navigation between lessons works seamlessly
- ✅ Breadcrumb navigation provides context
- ✅ All acceptance criteria scenarios pass

### Performance
- ✅ Page loads within 2 seconds (on 4G connection)
- ✅ Video player initializes within 3 seconds
- ✅ Navigation between lessons is instant (client-side routing)

### Accessibility
- ✅ Keyboard navigation works for all interactive elements
- ✅ Screen reader announces lesson title and type
- ✅ Video player controls are keyboard accessible
- ✅ Color contrast meets WCAG AA standards

### Test Coverage
- ✅ >80% unit test coverage for all components
- ✅ Integration tests for lesson data fetching
- ✅ E2E tests for complete user journeys
- ✅ All BDD scenarios automated

### User Experience
- ✅ Responsive design works on mobile, tablet, desktop
- ✅ Loading states prevent confusion
- ✅ Error messages are clear and actionable
- ✅ UI is consistent with existing curriculum browsing pages

---

## Implementation Plan

Following the SDD/BDD workflow:

1. ✅ **Specification Phase** (Current) - Write this document
2. ⏳ **Database Phase** - Verify schema supports requirements (already complete)
3. ⏳ **API Phase** - Document API contracts (already complete)
4. ⏳ **Implementation Phase** - Build components and pages with TDD
5. ⏳ **Testing Phase** - Write comprehensive tests
6. ⏳ **Documentation Phase** - Update CLAUDE.md and plan.md

---

## References

- [Business Rules](./business-rules.md) - Content access and lesson type constraints
- [Database Schema](../../backend/src/main/resources/db/migration/V4__create_lessons_table.sql) - Lesson table structure
- [API Documentation](http://localhost:8080/swagger-ui.html) - Backend API endpoints (when running)
- [Frontend Types](../../frontend/src/types/index.ts) - TypeScript type definitions
