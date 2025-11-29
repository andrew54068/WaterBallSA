# Test Plan: CTA Button Horizontal Alignment

**Document Version**: 1.0
**Last Updated**: 2025-11-28
**Related Specification**: `cta-button-alignment.md`
**Test Type**: Manual Visual Regression Testing

---

## Test Environment

### Setup
1. Ensure Docker Compose services are running: `make up`
2. Frontend accessible at: `http://localhost:3001`
3. Backend API accessible at: `http://localhost:8081/api`
4. Database has seed data loaded (5 curriculums with varying descriptions)

### Test Data
The homepage displays 2 curriculum cards by default (configured in `page.tsx`):
- Cards may have different title lengths
- Cards may have different description lengths
- Cards may have different metadata (badges, coupons)

---

## Test Scenarios (BDD)

### Scenario 1: Buttons align horizontally on desktop ✅

**Test Steps**:
1. Open browser at `http://localhost:3001`
2. Set viewport to desktop size (≥ 768px, e.g., 1920x1080)
3. Observe the curriculum card grid (should show 3 columns on desktop)
4. Take a screenshot with horizontal ruler overlay

**Expected Result**:
- All CTA buttons ("立刻體驗" or "立即購買") align at the same horizontal line
- Buttons appear at the bottom of each card
- Visual alignment is consistent (within 1px tolerance)

**Pass Criteria**: ✅
- [ ] All buttons align horizontally
- [ ] No content is cut off
- [ ] Cards have equal heights

**Manual Verification**:
```
Test Date: ___________
Tester: ___________
Browser: ___________
Result: PASS / FAIL
Notes: ___________________________________________
Screenshot: ___________________________________________
```

---

### Scenario 2: Buttons align horizontally on mobile ✅

**Test Steps**:
1. Open browser at `http://localhost:3001`
2. Set viewport to mobile size (< 768px, e.g., 375x667)
3. Observe the curriculum card stack (should show 1 column on mobile)
4. Scroll through all cards

**Expected Result**:
- Each card's CTA button appears at the bottom of its card
- No horizontal misalignment (vertical stacking)
- All content is visible and readable

**Pass Criteria**: ✅
- [ ] Buttons positioned at bottom of each card
- [ ] No content overflow
- [ ] Cards render correctly in vertical stack

**Manual Verification**:
```
Test Date: ___________
Tester: ___________
Device: ___________
Result: PASS / FAIL
Notes: ___________________________________________
Screenshot: ___________________________________________
```

---

### Scenario 3: Alignment maintains with hover effects ✅

**Test Steps**:
1. Open browser at `http://localhost:3001` (desktop viewport)
2. Hover over each curriculum card in sequence
3. Observe the hover transform effect (translateY(-4px))
4. Observe button alignment during hover

**Expected Result**:
- Card transforms upward on hover (existing behavior)
- Border color changes to accent yellow (existing behavior)
- Button alignment remains consistent across all cards
- Button hover effects (color change) work correctly

**Pass Criteria**: ✅
- [ ] Hover transform works on cards
- [ ] Button alignment preserved during hover
- [ ] Button hover effects work
- [ ] No layout shift during hover

**Manual Verification**:
```
Test Date: ___________
Tester: ___________
Browser: ___________
Result: PASS / FAIL
Notes: ___________________________________________
```

---

### Scenario 4: Alignment works with varying content ✅

**Test Steps**:
1. Review the curriculum cards on homepage
2. Identify cards with different content lengths:
   - Short title vs long title
   - Short description (1 line) vs long description (2 lines with lineClamp)
   - Different provider names
3. Verify button alignment

**Expected Result**:
- Cards have different content heights
- All cards expand to match the tallest card in the row
- All CTA buttons align at the bottom
- No content is truncated unexpectedly

**Pass Criteria**: ✅
- [ ] Cards have equal heights in grid row
- [ ] Buttons align despite content differences
- [ ] All content fully visible
- [ ] LineClamp works correctly (max 2 lines for description)

**Manual Verification**:
```
Test Date: ___________
Tester: ___________

Card 1 - Title: __________ | Description Lines: ____ | Button Aligned: YES/NO
Card 2 - Title: __________ | Description Lines: ____ | Button Aligned: YES/NO
Card 3 - Title: __________ | Description Lines: ____ | Button Aligned: YES/NO

Result: PASS / FAIL
Notes: ___________________________________________
```

---

### Scenario 5: Coupon banner does not break alignment ⚠️

**Note**: This scenario requires modifying seed data or component props to add coupon banners.

**Test Steps**:
1. Modify `page.tsx` to add `hasCoupon: true` and `couponValue: 3000` to one curriculum
2. Reload the homepage
3. Verify button alignment with coupon banner present

**Expected Result**:
- Card with coupon banner expands vertically
- Coupon banner displays: "你有一張 3,000 折價券"
- All buttons still align horizontally
- Other cards match the height of the tallest card

**Pass Criteria**: ✅
- [ ] Coupon banner displays correctly
- [ ] Buttons still align horizontally
- [ ] Card heights adjust accordingly
- [ ] No layout breaks

**Manual Verification**:
```
Test Date: ___________
Tester: ___________
Result: PASS / FAIL
Notes: ___________________________________________
Screenshot: ___________________________________________
```

---

## Browser Compatibility Testing

### Desktop Browsers

| Browser | Version | Viewport | Result | Notes |
|---------|---------|----------|--------|-------|
| Chrome  | Latest  | 1920x1080 | PASS/FAIL | |
| Firefox | Latest  | 1920x1080 | PASS/FAIL | |
| Safari  | Latest  | 1920x1080 | PASS/FAIL | |
| Edge    | Latest  | 1920x1080 | PASS/FAIL | |

### Mobile Browsers

| Browser | Device | Viewport | Result | Notes |
|---------|--------|----------|--------|-------|
| Chrome Mobile | iPhone 12 | 390x844 | PASS/FAIL | |
| Safari Mobile | iPhone 12 | 390x844 | PASS/FAIL | |
| Chrome Mobile | Pixel 5 | 393x851 | PASS/FAIL | |
| Samsung Internet | Galaxy S21 | 360x800 | PASS/FAIL | |

---

## Responsive Breakpoint Testing

### Test Viewports

| Breakpoint | Width | Expected Layout | Result | Notes |
|------------|-------|-----------------|--------|-------|
| Mobile (S) | 320px | 1 column | PASS/FAIL | |
| Mobile (M) | 375px | 1 column | PASS/FAIL | |
| Mobile (L) | 425px | 1 column | PASS/FAIL | |
| Tablet | 768px | 3 columns (md breakpoint) | PASS/FAIL | |
| Laptop | 1024px | 3 columns | PASS/FAIL | |
| Desktop | 1920px | 3 columns | PASS/FAIL | |
| Wide | 2560px | 3 columns | PASS/FAIL | |

**Pass Criteria**:
- Buttons align correctly at each breakpoint
- Layout transitions smoothly between breakpoints
- No horizontal scrolling

---

## Edge Case Testing

### EC-1: Empty or Missing Description

**Setup**: Modify curriculum data to have empty description
**Expected**: Card still maintains alignment
**Result**: PASS / FAIL
**Notes**: ___________

### EC-2: Very Long Title

**Setup**: Modify curriculum title to be very long (> 50 characters)
**Expected**: Title wraps, card expands, buttons still align
**Result**: PASS / FAIL
**Notes**: ___________

### EC-3: Free vs Paid Curriculum Mix

**Setup**: Verify cards with "FREE" badge and paid courses
**Expected**: All buttons align regardless of badge presence
**Result**: PASS / FAIL
**Notes**: ___________

---

## Performance Testing

### Page Load Performance

**Test Steps**:
1. Open Chrome DevTools (Performance tab)
2. Reload `http://localhost:3001`
3. Measure First Contentful Paint (FCP) and Largest Contentful Paint (LCP)
4. Check for Cumulative Layout Shift (CLS)

**Expected Results**:
- No layout shift after initial render (CLS = 0)
- FCP < 1.5s
- LCP < 2.5s
- No JavaScript required for alignment (CSS-only)

**Results**:
```
FCP: _____ ms
LCP: _____ ms
CLS: _____
Layout Shift Count: _____
Notes: ___________________________________________
```

---

## Accessibility Testing

### Keyboard Navigation

**Test Steps**:
1. Navigate to homepage using keyboard only
2. Tab through curriculum cards
3. Verify focus states on buttons

**Expected**: All buttons are keyboard accessible
**Result**: PASS / FAIL

### Screen Reader Testing

**Test Steps**:
1. Enable VoiceOver (Mac) or NVDA (Windows)
2. Navigate through curriculum cards
3. Verify button labels are announced correctly

**Expected**: "立刻體驗" and "立即購買" announced correctly
**Result**: PASS / FAIL

---

## Regression Testing

### Pre-Implementation Checklist
- [ ] Take screenshots of current layout (before changes)
- [ ] Document current button positions
- [ ] Note any existing issues

### Post-Implementation Checklist
- [ ] Compare before/after screenshots
- [ ] Verify no existing features broken
- [ ] Verify all new requirements met
- [ ] Check console for errors
- [ ] Verify no TypeScript errors

---

## Test Summary

### Overall Results

**Total Scenarios**: 5
**Passed**: _____
**Failed**: _____
**Pass Rate**: _____%

### Critical Issues Found
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________

### Non-Critical Issues Found
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________

### Recommendations
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________

---

## Sign-off

**Tested By**: ___________
**Date**: ___________
**Approved By**: ___________
**Date**: ___________

**Status**: ✅ APPROVED / ❌ REJECTED / ⚠️ CONDITIONAL APPROVAL

**Notes**: ___________________________________________
___________________________________________
___________________________________________
