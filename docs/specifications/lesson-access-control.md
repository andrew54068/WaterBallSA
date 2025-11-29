# Lesson Access Control Specification

## Document Information
- **Feature**: Lesson Access Control & Content Protection
- **Phase**: Phase 2 - Access Control (Critical Bug Fix)
- **Created**: 2025-11-28
- **Status**: Draft
- **Priority**: CRITICAL

## Business Context

### Problem Statement
Currently, users can access any lesson regardless of whether they have purchased the curriculum or if the lesson is marked as free preview. This violates the intended access control model and allows unauthorized access to paid content.

### User Stories

**As a non-paying user**
- I want to preview free lessons so that I can evaluate the curriculum before purchasing
- I want clear indicators showing which lessons are locked so that I understand what I need to purchase to access them
- I want helpful messaging when I try to access locked content so that I know how to gain access

**As a paying user**
- I want immediate access to all lessons in my purchased curriculums so that I can learn without restrictions
- I want to see which lessons I have access to so that I can plan my learning path

**As a platform administrator**
- I want to protect paid content from unauthorized access so that the business model is sustainable
- I want to provide a good preview experience so that users can make informed purchase decisions

## Business Rules

### BR-1: Free Preview Access
- Any lesson with `free_to_preview = true` is accessible to all users (authenticated or not)
- Free preview lessons must be clearly marked in the UI
- There is no limit to how many times a user can access free preview lessons

### BR-2: Paid Content Access
- Lessons with `free_to_preview = false` require curriculum ownership
- Curriculum ownership is determined by:
  - User is authenticated (logged in)
  - User has an active purchase record for the curriculum
  - Purchase is not expired (Phase 2 - future implementation)

### BR-3: Access Control Enforcement
- Frontend MUST check access permissions before rendering lesson content
- Backend MUST validate access permissions on every lesson request (defense in depth)
- Access checks must occur on initial page load AND on client-side navigation

### BR-4: User Experience
- Locked lessons must display a clear "locked" indicator
- Users attempting to access locked content must see an informative message
- The UI must provide a clear call-to-action to purchase the curriculum
- Navigation to locked lessons should be prevented when possible

## Acceptance Criteria (Given-When-Then)

### Scenario 1: Anonymous User Accessing Free Preview Lesson
```gherkin
Given an anonymous user (not logged in)
And a lesson with free_to_preview = true
When the user navigates to the lesson page
Then the lesson content should be fully displayed
And no "locked" indicator should be shown
And no purchase prompt should be displayed
```

### Scenario 2: Anonymous User Accessing Paid Lesson
```gherkin
Given an anonymous user (not logged in)
And a lesson with free_to_preview = false
When the user navigates to the lesson page
Then the lesson content should be blocked/hidden
And a "locked" indicator should be displayed
And a message should prompt the user to sign in or purchase the curriculum
And a "Sign In" button should be visible
And a "Purchase Curriculum" button should be visible
```

### Scenario 3: Authenticated User Without Purchase Accessing Free Preview Lesson
```gherkin
Given an authenticated user (logged in)
And the user has NOT purchased the curriculum
And a lesson with free_to_preview = true
When the user navigates to the lesson page
Then the lesson content should be fully displayed
And no "locked" indicator should be shown
And no purchase prompt should be displayed
```

### Scenario 4: Authenticated User Without Purchase Accessing Paid Lesson
```gherkin
Given an authenticated user (logged in)
And the user has NOT purchased the curriculum
And a lesson with free_to_preview = false
When the user navigates to the lesson page
Then the lesson content should be blocked/hidden
And a "locked" indicator should be displayed
And a message should prompt the user to purchase the curriculum
And a "Purchase Curriculum" button should be visible
And the user's name/profile should still be visible in the header
```

### Scenario 5: Authenticated User With Purchase Accessing Any Lesson
```gherkin
Given an authenticated user (logged in)
And the user HAS purchased the curriculum
And a lesson (regardless of free_to_preview value)
When the user navigates to the lesson page
Then the lesson content should be fully displayed
And no "locked" indicator should be shown
And no purchase prompt should be displayed
```

### Scenario 6: Direct URL Access to Locked Lesson
```gherkin
Given an anonymous user
And a lesson with free_to_preview = false
When the user directly navigates to /course/{curriculumId}/chapters/{chapterId}/lessons/{lessonId}
Then the page should load but block content
And the access control check should happen immediately on page load
And the user should see the locked state without content flashing
```

### Scenario 7: Chapter Navigation Shows Locked State
```gherkin
Given an authenticated user without purchase
When the user views a chapter's lesson list
Then free preview lessons should have a "Free Preview" badge
And locked lessons should have a "Locked" icon
And clicking a locked lesson should show a modal or redirect to lesson page with locked state
```

### Scenario 8: Backend Access Control Validation
```gherkin
Given any user (authenticated or not)
And a lesson with free_to_preview = false
When the user makes a direct API call to GET /api/lessons/{id}
And the user has not purchased the curriculum
Then the API should return 403 Forbidden (Phase 2 implementation)
Or the API should return lesson metadata but flag it as locked
And the API should include curriculum ownership status in the response
```

### Scenario 9: Error Handling for Invalid Lesson Access
```gherkin
Given an authenticated user without purchase
And a lesson with free_to_preview = false
When the access control check fails due to network error
Then the UI should default to "locked" state (fail secure)
And an error message should inform the user to retry
And the lesson content should not be displayed
```

### Scenario 10: Curriculum Detail Page Shows Access Status
```gherkin
Given an authenticated user viewing a curriculum detail page
When the page displays the list of chapters and lessons
Then each lesson should show an access indicator:
  - "Free Preview" badge for free_to_preview = true
  - "Locked" icon for lessons requiring purchase
  - "Available" or no indicator for owned curriculum lessons
```

## Data Requirements

### Lesson Access Check Response
The frontend needs to receive:
```typescript
interface LessonAccessCheck {
  lessonId: number;
  canAccess: boolean;
  reason: 'free_preview' | 'owned' | 'requires_purchase' | 'requires_login';
  curriculumId: number;
  curriculumTitle: string;
  curriculumPrice?: number;
  freeToPreview: boolean;
}
```

### Enhanced Lesson Response
The existing lesson API response should include:
```typescript
interface LessonResponse {
  // ... existing fields
  freeToPreview: boolean;
  canAccess: boolean;  // NEW: calculated based on user's ownership
  accessReason: string; // NEW: reason for access decision
}
```

## UI/UX Requirements

### Locked Lesson Display
When a lesson is locked, the page should display:
1. **Blurred/Hidden Content Area**: The video player or article content is replaced with a locked state component
2. **Lock Icon**: Large, centered lock icon
3. **Clear Message**: "This lesson is part of the [Curriculum Name] curriculum"
4. **Call-to-Action**:
   - If not logged in: "Sign In" and "Purchase for $X.XX" buttons
   - If logged in: "Purchase Curriculum for $X.XX" button
5. **Preview Information**: "View free preview lessons to learn more about this curriculum"
6. **Breadcrumb/Context**: Still show curriculum → chapter → lesson path

### Free Preview Badge
Free preview lessons should display:
- A "Free Preview" badge in the lesson navigation
- A subtle indicator in the breadcrumb or header
- No access restrictions

### Navigation Behavior
- Lesson navigation (prev/next) should skip locked lessons for users without access
- OR show locked lessons but disable the navigation button with a tooltip: "Unlock by purchasing curriculum"

## Error Scenarios

### ES-1: Network Failure During Access Check
- **Behavior**: Default to locked state (fail secure)
- **User Message**: "Unable to verify access. Please check your connection and try again."
- **Recovery**: Retry button to re-check access

### ES-2: Invalid Lesson ID
- **Behavior**: Show 404 error page
- **User Message**: "Lesson not found"
- **Recovery**: Link back to curriculum list

### ES-3: Curriculum Not Found
- **Behavior**: Show 404 error page
- **User Message**: "Curriculum not found"
- **Recovery**: Link back to curriculum list

### ES-4: User Session Expired During Lesson View
- **Behavior**: If lesson requires authentication, show re-login prompt
- **User Message**: "Your session has expired. Please sign in again."
- **Recovery**: Re-login button that redirects back to lesson after authentication

## Security Considerations

### Defense in Depth
1. **Frontend Access Control**: Immediate UI blocking for better UX
2. **Backend Access Control**: Authoritative validation on every request
3. **URL Parameter Validation**: Ensure curriculumId in URL matches lesson's actual curriculum

### Data Minimization
- Do not send video URLs or article content URLs to frontend for locked lessons
- Only send access status and curriculum purchase information

### Audit Logging (Phase 3)
- Log unauthorized access attempts
- Monitor patterns of locked content access for fraud detection

## Technical Implementation Notes

### Frontend Changes Required
1. **New API Client Function**: `checkLessonAccess(lessonId, curriculumId)`
2. **New Component**: `<LockedLessonView>` to replace content for locked lessons
3. **Enhanced Lesson Page**: Add access check before rendering lesson content
4. **Enhanced Lesson Navigation**: Show lock icons for inaccessible lessons
5. **Context/Hook**: `useLessonAccess(lessonId, curriculumId)` for reusable access logic

### Backend Changes Required (Phase 2)
1. **New Service Method**: `LessonService.checkAccess(lessonId, userId)`
2. **Enhanced Lesson Response**: Include `canAccess` and `accessReason` fields
3. **Purchase Service**: `PurchaseService.userOwnsCurriculum(userId, curriculumId)`
4. **Access Control Interceptor**: Validate access on `GET /api/lessons/{id}`

### Database Changes Required
- None (existing `free_to_preview` column is sufficient)
- Phase 2 will add `purchases` table for ownership tracking

## Test Coverage Requirements

### Unit Tests (Frontend)
- `useLessonAccess` hook returns correct access status for each scenario
- `LockedLessonView` component renders correct UI elements
- Lesson page component correctly handles access check results

### Integration Tests (Frontend)
- Lesson page loads and checks access on mount
- Navigation between lessons respects access control
- Purchase button triggers correct flow

### E2E Tests (Playwright)
- Anonymous user cannot access paid lesson
- Anonymous user can access free preview lesson
- Authenticated user without purchase cannot access paid lesson
- Direct URL navigation to locked lesson shows locked state
- Lesson navigation skips or disables locked lessons

### Backend Tests (Phase 2)
- `LessonService.checkAccess()` returns correct status for all scenarios
- `GET /api/lessons/{id}` includes access information in response
- Unauthorized access attempts return 403 Forbidden

## Dependencies

### Current Phase (Phase 1 - Bug Fix)
- No new database migrations needed
- No new backend endpoints needed (use existing lesson and curriculum APIs)
- Frontend-only implementation with mock ownership check

### Future Phase (Phase 2)
- Purchase system implementation
- Backend access control enforcement
- Real ownership validation via `purchases` table

## Out of Scope

The following are NOT included in this specification (Phase 3+):
- Time-based access expiration
- Content DRM or video encryption
- Lesson completion tracking affecting access
- Access sharing or multi-user licenses
- Trial period access
- Subscription-based access models

## Success Metrics

After implementation, verify:
- [ ] 0% of users can access paid content without purchase
- [ ] 100% of free preview lessons remain accessible to all users
- [ ] User feedback indicates clear understanding of access restrictions
- [ ] No customer support tickets about "content not loading" (due to poor locked state UX)
- [ ] Test coverage >80% for access control logic

## Approval

This specification must be reviewed and approved before implementation begins.

**Approved by**: _____________
**Date**: _____________

---

**Next Steps**:
1. Review and approve this specification
2. Proceed to Database Phase (check for any schema changes needed)
3. Proceed to API Phase (document access check contract)
4. Proceed to Implementation Phase (TDD)
