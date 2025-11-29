# Specification: Header Curriculum Navigation

## 1. Business Context

**Feature**: Curriculum Navigation from Header
**Priority**: High
**Phase**: 1 (Enhancement)
**Status**: Specification Complete

### Problem Statement

Currently, when users are viewing a curriculum detail page (e.g., `/curriculums/1`), they cannot navigate to other curriculums without returning to the homepage. This creates unnecessary friction in the user experience, especially for users who want to browse multiple curriculums.

The header already has a curriculum selector (dropdown/select component) that updates the `CurriculumContext`, but it does not trigger navigation to the selected curriculum's detail page.

### Business Goals

1. Enable seamless curriculum-to-curriculum navigation from any curriculum detail page
2. Improve user experience by reducing navigation friction
3. Maintain consistency with Next.js routing patterns
4. Ensure the solution works across all device sizes (responsive)

### User Stories

**As a** logged-in or guest user viewing a curriculum detail page
**I want** to select a different curriculum from the header dropdown
**So that** I can navigate directly to that curriculum's detail page without going back to the homepage

**As a** user browsing multiple curriculums
**I want** the URL to update when I select a different curriculum
**So that** I can bookmark or share specific curriculum pages

**As a** user on a mobile device
**I want** the curriculum navigation to work smoothly
**So that** I have a consistent experience across all devices

---

## 2. Acceptance Criteria (Given-When-Then)

### Scenario 1: Navigate to Different Curriculum from Detail Page

**Given** a user is on a curriculum detail page (e.g., `/curriculums/1`)
**And** the header displays a curriculum selector with all available curriculums
**When** the user clicks the curriculum selector dropdown
**Then** all available curriculums should be displayed in the dropdown
**And** the current curriculum should be visually highlighted/selected

**When** the user selects a different curriculum from the dropdown (e.g., "React & Next.js")
**Then** the page should navigate to the new curriculum's detail page (e.g., `/curriculums/2`)
**And** the URL should update to reflect the new curriculum ID
**And** the page should display the new curriculum's title, description, and chapters
**And** the curriculum selector should update to show the newly selected curriculum

### Scenario 2: Navigation Preserves State

**Given** a user is on a curriculum detail page
**When** the user selects a different curriculum from the header
**Then** the `CurriculumContext` should update with the new selected curriculum
**And** the context state should remain consistent across the navigation

### Scenario 3: URL Change Detection

**Given** a user is on curriculum detail page `/curriculums/1`
**When** the URL changes to `/curriculums/2` via header navigation
**Then** the page should fetch and display curriculum #2's data
**And** the header curriculum selector should reflect curriculum #2 as selected

### Scenario 4: Responsive Navigation (Mobile)

**Given** a user is on a mobile device viewing a curriculum detail page
**When** the user opens the curriculum selector dropdown
**Then** the dropdown should be touch-friendly and properly sized
**And** selecting a curriculum should navigate correctly
**And** the dropdown should close after selection

### Scenario 5: Loading State Handling

**Given** a user selects a different curriculum from the header
**When** the navigation is in progress
**Then** the curriculum selector should remain interactive (no double-click prevention needed)
**And** the page should update smoothly without flickering

### Scenario 6: Error Handling

**Given** a user selects a curriculum from the header
**When** the curriculum ID is invalid or the page fails to load
**Then** the user should see an appropriate error message
**And** the curriculum selector should still display all available curriculums
**And** the user should be able to select a different curriculum

---

## 3. Business Rules

### Navigation Rules
- Navigation should occur immediately when a curriculum is selected (no confirmation needed)
- Navigation should use Next.js router for smooth client-side transitions
- The URL should update to `/curriculums/{id}` where `{id}` is the selected curriculum ID

### State Management Rules
- The `CurriculumContext` must be updated when navigation occurs
- The selected curriculum in the context must match the curriculum displayed on the page
- The context state should persist across navigation (context is at app layout level)

### UI/UX Rules
- The curriculum selector should always show the currently viewed curriculum as selected
- The dropdown should close automatically after selection
- The component should be responsive and work on all screen sizes
- No loading spinners are required (Next.js handles page transitions)

### Accessibility Rules
- The curriculum selector should be keyboard navigable
- The dropdown should have proper ARIA labels
- Screen readers should announce curriculum changes

---

## 4. Technical Considerations

### Current Implementation Analysis

**Header Component** (`frontend/src/components/Header.tsx`):
- Already has curriculum selector using Chakra UI's `Select` component
- Uses `CurriculumContext` to get curriculums and selected curriculum
- Has `setSelectedCurriculum` handler that updates context
- **Missing**: Navigation logic when curriculum is selected

**Curriculum Detail Page** (`frontend/src/app/(main)/curriculums/[id]/page.tsx`):
- Server component that fetches curriculum data by ID
- Uses Next.js dynamic routes `[id]`
- **Missing**: Client-side logic to detect context changes and trigger navigation

**CurriculumContext** (`frontend/src/lib/curriculum-context.tsx`):
- Provides global curriculum state
- Has `selectedCurriculum` and `setSelectedCurriculum`
- **Works well**: Can be used to trigger navigation

### Proposed Solution

**Approach**: Enhance the Header component to use Next.js router for navigation when curriculum is selected.

**Key Changes**:
1. Import `useRouter` from `next/navigation` in Header component
2. Update the `onValueChange` handler to call `router.push(/curriculums/${id})`
3. The page component remains a server component (no changes needed)
4. Navigation will be client-side and smooth

**Why This Approach**:
- Minimal code changes (only Header component)
- Leverages Next.js built-in navigation
- Server component remains server component (better performance)
- Context state is maintained across navigation
- URL updates automatically

### Alternative Approaches Considered

**Approach 2**: Make curriculum detail page a client component with `useEffect` watching context
- **Rejected**: Converts server component to client component, losing server-side benefits

**Approach 3**: Add navigation logic in CurriculumContext
- **Rejected**: Context should not handle navigation; separation of concerns

**Approach 4**: Use middleware or route handlers
- **Rejected**: Overcomplicated for this simple feature

---

## 5. Edge Cases

### Edge Case 1: Same Curriculum Selected
**Scenario**: User selects the currently displayed curriculum from dropdown
**Expected**: No navigation occurs, dropdown closes, no error

**Resolution**: Check if selected curriculum ID matches current URL parameter before navigating

### Edge Case 2: Invalid Curriculum ID
**Scenario**: User somehow selects a curriculum that doesn't exist
**Expected**: Navigation occurs, but Next.js notFound() is triggered

**Resolution**: Existing error handling in page component handles this

### Edge Case 3: Navigation During Loading
**Scenario**: User quickly selects multiple curriculums in succession
**Expected**: Only the last selection is navigated to

**Resolution**: Next.js router handles this automatically (latest navigation wins)

### Edge Case 4: Context Out of Sync
**Scenario**: URL parameter and context selected curriculum don't match
**Expected**: Page displays curriculum from URL, header shows correct selection

**Resolution**: Use URL as source of truth; context is updated for display purposes

---

## 6. Non-Functional Requirements

### Performance
- Navigation should feel instant (< 100ms perceived delay)
- No unnecessary re-renders or data fetches
- Leverage Next.js client-side routing for smooth transitions

### Usability
- Dropdown should be easy to use on touch devices
- Visual feedback when hovering over curriculum options
- Selected curriculum clearly indicated in dropdown

### Compatibility
- Must work on all modern browsers (Chrome, Firefox, Safari, Edge)
- Must work on mobile devices (iOS, Android)
- Must work with keyboard navigation

### Accessibility
- WCAG 2.1 Level AA compliance
- Screen reader support
- Keyboard navigation support

---

## 7. Out of Scope

The following are explicitly **not** included in this feature:

- Curriculum search/filtering in header dropdown
- Recently viewed curriculums tracking
- Curriculum favorites/bookmarks
- Curriculum preview on hover
- Breadcrumb navigation enhancements
- Mobile menu/drawer navigation (separate feature)

---

## 8. Testing Strategy

### Unit Tests
- Test Header component renders curriculum selector correctly
- Test curriculum selection updates router navigation
- Test dropdown displays all curriculums
- Test selected curriculum is highlighted

### Integration Tests
- Test navigation from curriculum A to curriculum B updates URL
- Test context state remains consistent across navigation
- Test error handling when curriculum doesn't exist

### E2E Tests (Playwright)
- Test user can navigate between curriculums via header
- Test URL updates correctly
- Test page content updates to show new curriculum
- Test responsive behavior on mobile
- Test keyboard navigation works

### Manual Testing
- Test on various browsers
- Test on mobile devices
- Test with slow network conditions
- Test with many curriculums in dropdown

---

## 9. Implementation Checklist

Before implementing, ensure:
- [ ] This specification is reviewed and approved
- [ ] No database changes are required (✓ confirmed)
- [ ] No API changes are required (✓ confirmed)
- [ ] Frontend changes are clear and scoped

During implementation:
- [ ] Update Header component with navigation logic
- [ ] Add router navigation on curriculum selection
- [ ] Test navigation works correctly
- [ ] Test responsive behavior
- [ ] Write unit tests for Header component
- [ ] Write E2E tests for navigation flow
- [ ] Update documentation if needed

After implementation:
- [ ] All tests pass (>80% coverage)
- [ ] Manual testing completed on multiple devices
- [ ] No console errors or warnings
- [ ] Performance is acceptable (< 100ms navigation)
- [ ] Accessibility requirements met

---

## 10. Success Metrics

This feature will be considered successful when:

1. **Functionality**: Users can navigate between curriculums from the header on curriculum detail pages
2. **UX**: Navigation feels smooth and instant (< 100ms perceived delay)
3. **Correctness**: URL always matches displayed curriculum
4. **Test Coverage**: >80% code coverage with passing tests
5. **Zero Errors**: No console errors or navigation bugs
6. **Accessibility**: Passes WCAG 2.1 Level AA automated checks

---

## 11. Dependencies

### External Dependencies
- Next.js 14 (already in project)
- Chakra UI Select component (already in use)
- CurriculumContext (already implemented)

### Internal Dependencies
- `frontend/src/components/Header.tsx`
- `frontend/src/lib/curriculum-context.tsx`
- `frontend/src/app/(main)/curriculums/[id]/page.tsx`

### No Blockers
- All dependencies are already in place
- No backend changes required
- No database migrations required

---

## 12. Timeline Estimate

- **Specification**: ✅ Complete
- **Implementation**: 30-45 minutes (single component change)
- **Testing**: 45-60 minutes (unit + E2E tests)
- **Total**: ~2 hours

---

## Appendix: Current vs. Desired Flow

### Current Flow
1. User is on `/curriculums/1`
2. User clicks curriculum selector in header
3. User selects "React & Next.js"
4. Context updates with new curriculum
5. **Nothing happens** - user stays on `/curriculums/1`

### Desired Flow
1. User is on `/curriculums/1`
2. User clicks curriculum selector in header
3. User selects "React & Next.js" (curriculum ID: 2)
4. Context updates with new curriculum
5. **Router navigates to `/curriculums/2`**
6. Page displays "React & Next.js" curriculum content
7. URL bar shows `/curriculums/2`
8. Header selector shows "React & Next.js" as selected

---

**Document Version**: 1.0
**Last Updated**: 2025-11-28
**Author**: Claude Code (SDD/BDD Specification)
**Status**: Ready for Implementation
