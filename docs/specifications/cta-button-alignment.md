# Specification: CTA Button Horizontal Alignment in Curriculum Cards

**Document Version**: 1.0
**Last Updated**: 2025-11-28
**Status**: Draft
**Related Components**: `FeaturedCourseCard.tsx`

---

## Business Context

### Problem Statement
The homepage displays curriculum cards in a horizontal grid layout. Currently, the CTA buttons ("立刻體驗" / "立即購買") appear at different vertical positions across cards because the card content (titles, descriptions, badges) varies in height. This creates visual inconsistency and reduces the professional appearance of the page.

### User Impact
- **Visual inconsistency**: Users perceive misaligned CTAs as unprofessional
- **Reduced scannability**: Different button positions make it harder to quickly scan available actions
- **Lower conversion**: Inconsistent CTAs may reduce click-through rates

### Business Value
- Improved visual polish and professionalism
- Better user experience through consistent layout
- Potentially higher conversion rates on CTAs

---

## User Stories

### Story 1: As a visitor, I want consistent button alignment
**As a** potential student visiting the homepage
**I want** all CTA buttons to align horizontally at the same level
**So that** I can quickly scan and compare action options across all curriculum cards

**Acceptance Criteria**:
- All CTA buttons align at the same horizontal line regardless of content height
- Alignment is maintained across different viewport sizes (mobile, tablet, desktop)
- No content is cut off or hidden due to fixed heights

---

## Functional Requirements

### FR-1: Horizontal Button Alignment
**Priority**: HIGH
**Description**: All CTA buttons within the curriculum card grid must align horizontally at the same vertical position.

**Technical Approach**:
- Use CSS Flexbox with `display: flex` and `flex-direction: column` on card container
- Apply `margin-top: auto` to the button container to push it to the bottom
- Ensure the card content area uses `flex: 1` to fill available space

**Constraints**:
- Must work with dynamic content heights (varying description lengths)
- Must be responsive across all breakpoints
- Must not require JavaScript for alignment
- Must maintain existing hover effects and transitions

### FR-2: Content Flexibility
**Priority**: HIGH
**Description**: Card content should expand naturally while maintaining button alignment.

**Technical Approach**:
- Card content should not have fixed heights
- Use `lineClamp` for descriptions to limit overflow
- Ensure cards have equal heights within the grid row

---

## Acceptance Criteria (BDD Scenarios)

### Scenario 1: Buttons align horizontally on desktop
```gherkin
Given I am viewing the homepage on a desktop browser (viewport ≥ 768px)
And there are 3 curriculum cards displayed in a grid
And each card has different description lengths
When the page renders
Then all CTA buttons ("立刻體驗" or "立即購買") should align at the same horizontal line
And the alignment should be visually consistent across all cards
```

### Scenario 2: Buttons align horizontally on mobile
```gherkin
Given I am viewing the homepage on a mobile browser (viewport < 768px)
And there are 3 curriculum cards displayed in a vertical stack
And each card has different description lengths
When the page renders
Then all CTA buttons should be positioned at the bottom of their respective cards
And no content should be cut off or hidden
```

### Scenario 3: Alignment maintains with hover effects
```gherkin
Given I am viewing the homepage with aligned CTA buttons
When I hover over any curriculum card
Then the card transforms with translateY(-4px) (existing behavior)
And the button alignment remains consistent across all cards
And hover effects on buttons still work correctly
```

### Scenario 4: Alignment works with varying content
```gherkin
Given curriculum cards have varying content:
  | Card | Title Length | Description Length | Provider Badge |
  | 1    | Short        | Long (3 lines)     | Yes            |
  | 2    | Long         | Short (1 line)     | Yes            |
  | 3    | Medium       | Medium (2 lines)   | Yes            |
When the page renders
Then all cards should have equal heights
And all CTA buttons should align at the bottom
And all content should be fully visible
```

### Scenario 5: Coupon banner does not break alignment
```gherkin
Given one curriculum card has a coupon banner ("你有一張 X 折價券")
And other cards do not have coupon banners
When the page renders
Then all CTA buttons should still align horizontally
And the card with the coupon banner should expand vertically to accommodate it
```

---

## Non-Functional Requirements

### NFR-1: Performance
- CSS-only solution (no JavaScript required for alignment)
- No impact on initial page load time
- No layout shift after initial render

### NFR-2: Browser Compatibility
- Must work on all modern browsers (Chrome, Firefox, Safari, Edge)
- Must support CSS Flexbox (universally supported)

### NFR-3: Maintainability
- Solution should use standard Chakra UI props
- No custom CSS classes unless absolutely necessary
- Code should be self-documenting

---

## Technical Design

### Current Structure (FeaturedCourseCard.tsx)
```
Box (card container)
├── Box (hero image - fixed height: 256px)
└── Box (content - p={6})
    ├── Text (title)
    ├── Box (provider badge)
    ├── Text (description - lineClamp={2})
    ├── Box (coupon banner - conditional)
    └── Flex (action buttons)
```

### Proposed Structure Changes
```tsx
Box (card container) - ADD: display="flex", flexDirection="column"
├── Box (hero image - fixed height: 256px)
└── Box (content - p={6}) - ADD: display="flex", flexDirection="column", flex="1"
    ├── Text (title)
    ├── Box (provider badge)
    ├── Text (description - lineClamp={2})
    ├── Box (coupon banner - conditional)
    └── Flex (action buttons) - ADD: marginTop="auto"
```

### CSS Properties to Add
1. **Card container (outer Box)**:
   - `display="flex"`
   - `flexDirection="column"`
   - `height="full"` (ensures cards fill grid cell height)

2. **Content container (Box p={6})**:
   - `display="flex"`
   - `flexDirection="column"`
   - `flex="1"` (expands to fill available space)

3. **Button container (Flex gap={3})**:
   - `marginTop="auto"` (pushes to bottom)

---

## Implementation Checklist

### Phase 1: Specification (Current)
- [x] Define problem statement and business value
- [x] Write user stories with acceptance criteria
- [x] Document functional and non-functional requirements
- [x] Create BDD scenarios with Given-When-Then format

### Phase 2: Implementation
- [ ] Update `FeaturedCourseCard.tsx` component
- [ ] Add flexbox properties to card container
- [ ] Add flexbox properties to content container
- [ ] Add `marginTop="auto"` to button container
- [ ] Test with varying content lengths

### Phase 3: Testing
- [ ] Visual regression testing (manual)
- [ ] Test all BDD scenarios
- [ ] Test on multiple browsers (Chrome, Firefox, Safari)
- [ ] Test on multiple viewport sizes (mobile, tablet, desktop)
- [ ] Test with and without coupon banners

### Phase 4: Documentation
- [ ] Update CLAUDE.md if new patterns are introduced
- [ ] Document solution in this specification

---

## Edge Cases

### EC-1: Empty Description
**Scenario**: A curriculum has no description or very short description
**Expected**: Card should still maintain alignment with other cards
**Solution**: Flexbox will handle this automatically

### EC-2: Very Long Title
**Scenario**: A curriculum title exceeds normal length
**Expected**: Title should wrap and card should expand, maintaining button alignment
**Solution**: Use `lineHeight="tight"` and let title wrap naturally

### EC-3: Multiple Coupon Banners
**Scenario**: Multiple cards have coupon banners of varying sizes
**Expected**: All buttons still align horizontally
**Solution**: Flexbox with `flex="1"` handles this automatically

---

## Success Metrics

### Definition of Done
- [ ] All CTA buttons align horizontally on desktop (3-column grid)
- [ ] All CTA buttons positioned at bottom on mobile (1-column stack)
- [ ] No content is cut off or hidden
- [ ] All hover effects work correctly
- [ ] Solution uses CSS-only (no JavaScript)
- [ ] All BDD scenarios pass manual testing
- [ ] Code review completed

### Visual Acceptance
- Buttons align within 1px tolerance across all cards
- No visible layout shift after initial render
- Responsive behavior works across all breakpoints

---

## Notes

### Design Decisions
1. **Why Flexbox over CSS Grid?**
   - Flexbox provides simpler vertical alignment with `margin-top: auto`
   - Already using Chakra UI Box/Flex components (Flexbox-based)
   - Better browser support for complex nested layouts

2. **Why Not Fixed Heights?**
   - Fixed heights cause content to be cut off or overflow
   - Not responsive to dynamic content
   - Poor accessibility (text might be hidden)

3. **Why `margin-top: auto`?**
   - Standard CSS pattern for pushing elements to bottom in flex containers
   - More semantic than absolute positioning
   - Works with dynamic content heights

### Future Enhancements (Out of Scope)
- Implement skeleton loading states during data fetch
- Add animation when cards adjust to content changes
- Implement horizontal scrolling for overflow on mobile
