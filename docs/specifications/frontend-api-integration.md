# Frontend API Integration - Replace Mock Data with Backend APIs

**Feature**: Replace mock curriculum data in frontend with real backend API calls
**Phase**: Phase 1 - Foundation
**Priority**: HIGH
**Status**: Specification

## Business Context

Currently, the frontend pages (Home, Courses) use hardcoded mock data for curriculum information. This creates several issues:
1. Data is not synchronized with the actual database
2. Changes to curriculum data require frontend code changes
3. Cannot test real API integration end-to-end
4. User experience doesn't reflect actual data availability

This specification defines how to replace all mock curriculum data with real API calls to the backend.

## Scope

### In Scope
- Home page (`frontend/src/app/(main)/page.tsx`)
  - Replace `featuredCoursesData` with API calls to `/api/curriculums`
- Courses page (`frontend/src/app/(main)/courses/page.tsx`)
  - Replace `coursesData` with API calls to `/api/curriculums`
- Update API client functions if needed
- Write comprehensive tests for API integration

### Out of Scope (Future Phases)
- Roadmap page (Phase 3 - Gamification feature)
- Order history (Phase 2 - Purchase system)
- Leaderboard page (Phase 3 - Gamification feature)

## Available Backend APIs

Based on `CurriculumController.java`, the following endpoints are available:

| Endpoint | Method | Description | Pagination |
|----------|--------|-------------|------------|
| `/api/curriculums` | GET | Get all published curriculums | Yes |
| `/api/curriculums/{id}` | GET | Get curriculum by ID with chapters | No |
| `/api/curriculums/search` | GET | Search curriculums by title/description | Yes |
| `/api/curriculums/difficulty/{level}` | GET | Filter by difficulty level | Yes |
| `/api/curriculums/instructor/{name}` | GET | Filter by instructor name | Yes |
| `/api/curriculums/free` | GET | Get free curriculums only | Yes |
| `/api/curriculums/count` | GET | Count total published curriculums | No |

**Note**: All paginated endpoints support `page`, `size`, `sortBy`, and `direction` query parameters.

## Current Mock Data

### Home Page Mock Data
```typescript
const featuredCoursesData = [
  {
    id: 1,
    title: "軟體設計模式精通之旅",
    provider: "水球潘",
    description: "用一趟旅程的時間，成為硬核的 Coding 實戰高手",
    image: "/images/design-patterns-hero.jpg",
    hasCoupon: true,
    couponValue: 3000,
    isPurchased: false,
    hasFreeTrial: true,
    isPaidOnly: false,
  },
  {
    id: 2,
    title: "AI x BDD：規格驅動全自動開發術",
    provider: "水球潘",
    description: "AI Top 1% 工程師必修課，掌握規格驅動的全自動化開發",
    image: "/images/ai-bdd-hero.jpg",
    hasCoupon: false,
    isPurchased: false,
    hasFreeTrial: true,
    isPaidOnly: false,
  },
]
```

### Courses Page Mock Data
```typescript
const coursesData = [
  // Same as featuredCoursesData
]

const orders: Order[] = []
```

## User Stories

### US-1: Display Real Curriculum Data on Home Page
**As a** visitor to WaterBall SA
**I want** to see actual curriculum data from the backend
**So that** I can browse up-to-date course offerings

### US-2: Display Real Curriculum Data on Courses Page
**As a** user browsing courses
**I want** to see all available curriculums from the backend
**So that** I can explore all course options

### US-3: Handle API Errors Gracefully
**As a** user
**I want** to see helpful error messages when data fails to load
**So that** I understand what went wrong and can retry if needed

## Acceptance Criteria (Given-When-Then)

### Scenario 1: Load Featured Courses on Home Page

**Given** the backend has published curriculums in the database
**And** at least 2 curriculums exist
**When** a user navigates to the home page
**Then** the page should call `GET /api/curriculums?page=0&size=2&sortBy=createdAt&direction=desc`
**And** display the first 2 curriculums as featured courses
**And** each curriculum card should show:
- Title from `curriculum.title`
- Instructor from `curriculum.instructor`
- Description from `curriculum.description`
- Has free trial status (based on free preview lessons)

### Scenario 2: Load All Courses on Courses Page

**Given** the backend has published curriculums in the database
**When** a user navigates to the courses page
**Then** the page should call `GET /api/curriculums?page=0&size=100&sortBy=createdAt&direction=desc`
**And** display all curriculums as course cards
**And** each curriculum card should show the same information as Scenario 1

### Scenario 3: Fetch Free Preview Lessons (Already Implemented)

**Given** a curriculum has lessons marked as `isFreePreview = true`
**When** the page loads curriculum data
**Then** it should call `GET /api/lessons/curriculum/{id}/free-preview`
**And** determine the first free lesson for navigation
**And** pass `firstFreeLessonIndex` and `firstFreeChapterIndex` to the card component

### Scenario 4: Handle No Curriculums Available

**Given** the backend has no published curriculums
**When** a user navigates to the home page or courses page
**Then** the page should display an empty state message
**And** the message should say "目前沒有課程" (No courses available)

### Scenario 5: Handle API Connection Error

**Given** the backend API is unavailable or returns an error
**When** a user navigates to the home page or courses page
**Then** the page should display an error message
**And** the error message should say "無法載入課程資料，請稍後再試" (Failed to load course data, please try again later)
**And** show a "重試" (Retry) button
**When** the user clicks the retry button
**Then** the page should re-attempt to fetch data

### Scenario 6: Display Loading State

**Given** the page is fetching curriculum data from the API
**When** data is being loaded
**Then** the page should display a loading skeleton or spinner
**And** the loading indicator should be accessible (ARIA labels)

### Scenario 7: Map Backend DTO Fields to Frontend Display

**Given** the backend returns `CurriculumDto` with these fields:
```json
{
  "id": 1,
  "title": "Course Title",
  "description": "Course Description",
  "instructor": "Instructor Name",
  "difficultyLevel": "BEGINNER",
  "price": 0,
  "isPublished": true,
  "thumbnailUrl": "https://...",
  "createdAt": "2024-01-01T00:00:00",
  "updatedAt": "2024-01-01T00:00:00"
}
```

**When** the frontend receives this data
**Then** it should map the fields as follows:
- `title` → `title`
- `instructor` → `provider`
- `description` → `description`
- `thumbnailUrl` → `image` (fallback to placeholder if null)
- `price === 0` → `isPaidOnly = false`
- Default values for Phase 2 fields:
  - `hasCoupon = false` (Phase 2 feature)
  - `couponValue = undefined` (Phase 2 feature)
  - `isPurchased = false` (Phase 2 feature)
- `hasFreeTrial` determined by checking if `freePreviewLessons.length > 0`

### Scenario 8: Preserve Existing Free Preview Functionality

**Given** the current implementation fetches free preview lessons
**When** replacing mock data with API calls
**Then** the free preview fetching logic should remain unchanged
**And** continue to use `lessonsApi.getFreePreview(courseId)`
**And** continue to find `firstFreeLessonIndex` and `firstFreeChapterIndex`

## Implementation Plan

### 1. Update API Client (if needed)

**File**: `frontend/src/lib/api/curriculums.ts`

Check if the following function exists and works correctly:
```typescript
export const curriculumsApi = {
  getAll: async (params?: {
    page?: number
    size?: number
    sortBy?: string
    direction?: 'asc' | 'desc'
  }): Promise<Page<CurriculumDto>> => {
    const response = await apiClient.get('/curriculums', { params })
    return response.data
  },
  // ... other methods
}
```

If not, add it.

### 2. Update Home Page

**File**: `frontend/src/app/(main)/page.tsx`

**Changes**:
1. Remove `featuredCoursesData` constant
2. Add API call to `curriculumsApi.getAll({ page: 0, size: 2 })`
3. Add error handling and loading states
4. Map backend DTO fields to frontend display format
5. Keep the free preview fetching logic

**Before**:
```typescript
const featuredCoursesData = [/* hardcoded data */]

const featuredCourses = await Promise.all(
  featuredCoursesData.map(async (course) => {
    // ... free preview logic
  })
)
```

**After**:
```typescript
let curriculumsData = []
let error = null

try {
  const response = await curriculumsApi.getAll({ page: 0, size: 2 })
  curriculumsData = response.content
} catch (err) {
  error = err instanceof Error ? err.message : 'Failed to load curriculums'
  console.error('Error loading curriculums:', err)
}

const featuredCourses = await Promise.all(
  curriculumsData.map(async (curriculum) => {
    // Map DTO fields
    const course = {
      id: curriculum.id,
      title: curriculum.title,
      provider: curriculum.instructor,
      description: curriculum.description,
      image: curriculum.thumbnailUrl || '/images/placeholder.jpg',
      hasCoupon: false, // Phase 2
      couponValue: undefined, // Phase 2
      isPurchased: false, // Phase 2
      hasFreeTrial: false, // Will be determined below
      isPaidOnly: curriculum.price > 0,
    }

    // ... existing free preview logic
    return course
  })
)
```

### 3. Update Courses Page

**File**: `frontend/src/app/(main)/courses/page.tsx`

**Changes**: Same as home page, but use `size: 100` to get all courses

### 4. Add Error and Loading States

**Create**: `frontend/src/components/ErrorState.tsx`
```typescript
export function ErrorState({
  message,
  onRetry
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
      <p className="text-red-400 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-accent-yellow text-dark-900 rounded-lg"
        >
          重試
        </button>
      )}
    </div>
  )
}
```

**Create**: `frontend/src/components/LoadingState.tsx`
```typescript
export function LoadingState() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {[1, 2].map((i) => (
        <div key={i} className="bg-dark-800 rounded-2xl p-6 animate-pulse">
          <div className="h-6 bg-dark-700 rounded mb-4" />
          <div className="h-4 bg-dark-700 rounded mb-2" />
          <div className="h-4 bg-dark-700 rounded w-3/4" />
        </div>
      ))}
    </div>
  )
}
```

### 5. Update TypeScript Types

**File**: `frontend/src/types/index.ts`

Ensure the following types exist:
```typescript
export interface CurriculumDto {
  id: number
  title: string
  description: string
  instructor: string
  difficultyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  price: number
  isPublished: boolean
  thumbnailUrl: string | null
  createdAt: string
  updatedAt: string
  chapters?: ChapterDto[]
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}
```

## Testing Strategy

### Unit Tests

**File**: `frontend/src/lib/api/__tests__/curriculums.test.ts`

Test scenarios:
1. ✅ `getAll()` returns paginated curriculum data
2. ✅ `getAll()` handles API errors
3. ✅ `getAll()` passes correct query parameters

### Integration Tests

**File**: `frontend/src/app/(main)/__tests__/page.test.tsx`

Test scenarios:
1. ✅ Home page fetches and displays curriculum data
2. ✅ Home page displays loading state while fetching
3. ✅ Home page displays error state on API failure
4. ✅ Home page displays empty state when no curriculums
5. ✅ Home page maps DTO fields correctly
6. ✅ Home page fetches free preview lessons

**File**: `frontend/src/app/(main)/courses/__tests__/page.test.tsx`

Same test scenarios as home page.

### E2E Tests (Playwright)

**File**: `frontend/e2e/curriculum-display.spec.ts`

Test scenarios:
1. ✅ User can view featured courses on home page with real data
2. ✅ User can view all courses on courses page with real data
3. ✅ User sees error message when backend is unavailable
4. ✅ User can retry loading when error occurs
5. ✅ User sees loading skeleton while data loads

## Error Handling

| Error Scenario | HTTP Status | Frontend Behavior |
|----------------|-------------|-------------------|
| Backend unavailable | Network Error | Display "無法連接到伺服器" + Retry button |
| No curriculums found | 200 OK (empty array) | Display "目前沒有課程" |
| Invalid request | 400 Bad Request | Log error, display generic error message |
| Server error | 500 Internal Server Error | Display "伺服器錯誤，請稍後再試" + Retry button |

## Performance Considerations

1. **Caching**: Next.js will cache API responses during SSR (Server-Side Rendering)
2. **Parallel Requests**: Free preview lessons are fetched in parallel using `Promise.all()`
3. **Pagination**: Limit initial load to 2 courses on home page, up to 100 on courses page
4. **Error Boundaries**: Wrap components with React Error Boundaries to prevent full page crashes

## Data Migration

**No database migration required** - this is a frontend-only change.

## Rollback Plan

If issues occur:
1. Revert commits to restore mock data
2. No backend changes required
3. No database rollback needed

## Definition of Done

- [ ] All mock curriculum data removed from home page
- [ ] All mock curriculum data removed from courses page
- [ ] API integration tested with real backend data
- [ ] Error states implemented and tested
- [ ] Loading states implemented and tested
- [ ] Unit tests written and passing (>80% coverage)
- [ ] Integration tests written and passing
- [ ] E2E tests written and passing
- [ ] TypeScript types updated
- [ ] No console errors or warnings
- [ ] Accessibility checked (ARIA labels, keyboard navigation)
- [ ] CLAUDE.md updated with new patterns (if applicable)

## Dependencies

- Backend APIs must be running and accessible
- Database must have seed data (at least 2 curriculums)
- API client (`frontend/src/lib/api-client.ts`) must be configured correctly

## Related Specifications

- `docs/specifications/lesson-viewer.md` - Already uses real API data
- `docs/specifications/ui-redesign-home-page.md` - UI spec for home page
- `docs/specifications/ui-courses-page-with-orders.md` - UI spec for courses page

## Open Questions

1. ❓ Should we implement client-side caching (React Query, SWR)?
   - **Answer**: Not in this phase. Use Next.js built-in caching for now.

2. ❓ Should we paginate courses page or load all at once?
   - **Answer**: Load all at once with `size: 100` for now. Implement pagination in Phase 2 if needed.

3. ❓ What should we use as placeholder images if `thumbnailUrl` is null?
   - **Answer**: Use `/images/placeholder.jpg` as fallback.

## Approval

**Created**: 2024-11-27
**Author**: Development Team
**Status**: ⏳ Awaiting Approval

---

**Next Steps After Approval**:
1. Implement API integration in home page
2. Implement API integration in courses page
3. Add error and loading components
4. Write comprehensive tests
5. Update documentation
