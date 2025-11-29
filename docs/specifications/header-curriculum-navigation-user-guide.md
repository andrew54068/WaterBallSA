# User Guide: Curriculum Navigation from Header

## Overview

This guide explains how to use the curriculum navigation feature in the header to quickly switch between different curriculums.

---

## How to Use

### Step 1: Navigate to Any Curriculum Detail Page

Visit any curriculum detail page, for example:
- http://localhost:3001/curriculums/1 (Java Programming Masterclass)
- http://localhost:3001/curriculums/2 (React & Next.js Complete Guide)
- http://localhost:3001/curriculums/3 (Data Structures & Algorithms)

### Step 2: Open the Curriculum Selector

In the header (top navigation bar), you'll see a dropdown/selector that displays the current curriculum name.

**Location**: Top center of the page, next to the logo

**What it looks like**:
- A dropdown button with the current curriculum title
- Example: "Java Programming Masterclass"

### Step 3: Select a Different Curriculum

1. Click on the curriculum selector dropdown
2. A list of all available curriculums will appear
3. Click on any curriculum to switch to it

**Example**:
- Currently viewing: "Java Programming Masterclass"
- Click dropdown
- Select: "React & Next.js Complete Guide"
- Result: Page navigates to React curriculum detail page

### Step 4: Enjoy Seamless Navigation

- The page will instantly navigate to the new curriculum
- The URL will update automatically
- The curriculum content, chapters, and lessons will all update
- No need to go back to the homepage!

---

## Key Features

### 1. Fast Navigation
- Switch between curriculums instantly
- No page reload required
- Client-side routing for smooth transitions

### 2. Persistent Selection
- The selected curriculum is remembered
- When you return to a curriculum page, the header shows the correct curriculum

### 3. Visual Feedback
- Current curriculum is highlighted in the dropdown
- Dropdown closes automatically after selection
- URL updates to reflect the new curriculum

### 4. Mobile Friendly
- Works on all devices (desktop, tablet, mobile)
- Touch-friendly dropdown
- Responsive design

---

## When Does Navigation Occur?

Navigation **ONLY** happens when:
- You are on a curriculum detail page (`/curriculums/[id]`)
- You select a **different** curriculum from the dropdown

Navigation **DOES NOT** happen when:
- You are on the homepage
- You are on a lesson page
- You select the **same** curriculum that's already displayed

This design ensures you can browse curriculums without unintended navigation.

---

## Example User Journeys

### Journey 1: Comparing Multiple Curriculums
1. Start on "Java Programming Masterclass" detail page
2. Click header curriculum selector
3. Select "React & Next.js Complete Guide"
4. Review the React curriculum chapters
5. Click header curriculum selector again
6. Select "Data Structures & Algorithms"
7. Compare all three curriculums without going back to home

### Journey 2: Quick Curriculum Switching
1. Viewing "Java Programming Masterclass"
2. Remember you wanted to check "Machine Learning Basics"
3. Click header dropdown
4. Select "Machine Learning Basics"
5. Instantly navigate to ML curriculum page

---

## Troubleshooting

### Dropdown Doesn't Open
- **Solution**: Ensure JavaScript is enabled in your browser
- **Solution**: Refresh the page (F5 or Cmd+R)

### Selection Doesn't Navigate
- **Check**: Are you on a curriculum detail page? (URL should be `/curriculums/[id]`)
- **Check**: Did you select a different curriculum? (Same curriculum won't navigate)

### Dropdown is Empty
- **Solution**: Wait for curriculums to load (you'll see a loading skeleton)
- **Solution**: Check your internet connection
- **Solution**: Refresh the page

### URL Doesn't Update
- **Check**: Ensure JavaScript is enabled
- **Check**: Browser compatibility (use modern browser)

---

## Accessibility

### Keyboard Navigation
- Press `Tab` to focus on the curriculum selector
- Press `Enter` or `Space` to open the dropdown
- Use `Arrow Up/Down` to navigate curriculum options
- Press `Enter` to select a curriculum
- Press `Esc` to close the dropdown without selecting

### Screen Readers
- The curriculum selector is properly labeled
- Current selection is announced
- All curriculums in the list are accessible

---

## Browser Support

This feature works on:
- ✅ Chrome/Chromium (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Android Chrome)

---

## Tips & Best Practices

1. **Use the Breadcrumb**: The header selector is great for quick switching, but you can also use the breadcrumb trail for context

2. **Bookmark Favorites**: You can bookmark specific curriculum pages for quick access

3. **Direct URL**: You can also navigate by typing the URL directly: `/curriculums/[id]`

4. **Homepage Access**: If you want to see all curriculums at once, go to the homepage (click the logo)

---

## What's Next?

Planned enhancements (not yet implemented):
- Search/filter curriculums in the dropdown
- Recently viewed curriculums
- Favorite/bookmark curriculums
- Curriculum preview on hover

---

## Need Help?

If you encounter any issues with curriculum navigation:
1. Check the troubleshooting section above
2. Refresh the page
3. Clear browser cache
4. Contact support (if applicable)

---

**Last Updated**: 2025-11-28
**Feature Version**: 1.0
**Specification**: [header-curriculum-navigation.md](./header-curriculum-navigation.md)
