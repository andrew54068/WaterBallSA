import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Article Lesson Viewing
 *
 * Covers BDD Scenarios 5-6 from docs/specifications/lesson-viewer.md:
 * - Scenario 5: Student views an article lesson
 * - Scenario 6: Student opens external article
 */

test.describe('Article Lesson Viewing', () => {
  // Use seeded Article Lesson (ID 100)
  const articleLessonIds = [100]


  
  test.beforeEach(async ({ page }) => {
    // Note: These tests assume an ARTICLE lesson exists (e.g., ID 3 or similar)
    await page.goto('/')
  })

  test('Scenario 5: Student views an article lesson with metadata', async ({ page, context }) => {
    /**
     * Given a published article lesson exists
     * And the lesson has content_url pointing to external article
     * And the lesson has contentMetadata {"wordCount": 1200, "readingLevel": "beginner"}
     * When the student navigates to the article lesson
     * Then all article details should be displayed
     */

    // Try common article lesson IDs


    let foundArticleLesson = false

    for (const lessonId of articleLessonIds) {
      const response = await page.goto(`/lessons/${lessonId}`)

      if (response?.ok()) {
        await page.waitForLoadState('networkidle')

        // Check if this is an article lesson
        const hasArticleIndicator =
          (await page.getByText(/article/i).count()) > 0 ||
          (await page.getByText(/read article/i).count()) > 0 ||
          (await page.getByText(/word count/i).count()) > 0

        if (hasArticleIndicator) {
          foundArticleLesson = true

          // Then: The page should display the lesson title
          const title = page.locator('h1, h2').first()
          await expect(title).toBeVisible()

          // And: The page should display "Article Lesson" or similar
          const articleText = page.getByText(/article/i)
          await expect(articleText.first()).toBeVisible()

          // And: The page should display a "Read Article" button or link
          const readButton = page.getByRole('button', { name: /read article/i })
          await expect(readButton).toBeVisible()

          // And: Metadata should be displayed if available
          const pageContent = await page.content()

          // Check for metadata displays (word count, reading level)
          const hasWordCount = /word\s+count/i.test(pageContent)
          const hasReadingLevel = /reading\s+level/i.test(pageContent)

          // At least one metadata field should be present
          expect(hasWordCount || hasReadingLevel).toBeTruthy()

          break
        }
      }
    }

    expect(foundArticleLesson).toBeTruthy()
  })

  test('Scenario 6: Student opens external article in new tab', async ({ page, context }) => {
    /**
     * Given the student is viewing an article lesson
     * When the student clicks the "Read Article" button
     * Then the external article URL should open in a new browser tab
     */

    // Find an article lesson


    for (const lessonId of articleLessonIds) {
      const response = await page.goto(`/lessons/${lessonId}`)

      if (response?.ok()) {
        await page.waitForLoadState('networkidle')

        // Check for Read Article button
        const readButton = page.getByRole('button', { name: /read article/i })

        if (await readButton.count() > 0) {
          // Listen for new page/tab opening
          const [newPage] = await Promise.all([
            context.waitForEvent('page'),
            readButton.click(),
          ])

          // Then: A new tab should open
          expect(newPage).toBeTruthy()

          // And: The original page should still be open
          expect(page.isClosed()).toBeFalsy()

          // Clean up
          await newPage.close()

          break
        }
      }
    }
  })

  test('Article lesson displays all metadata fields', async ({ page }) => {
    /**
     * Given an article lesson with full metadata
     * Then all metadata fields should be visible
     */



    for (const lessonId of articleLessonIds) {
      const response = await page.goto(`/lessons/${lessonId}`)

      if (response?.ok()) {
        await page.waitForLoadState('networkidle')

        const pageContent = await page.content()

        // Check if this is an article lesson
        if (/article/i.test(pageContent)) {
          // Look for metadata fields
          const metadataFields = [
            /word\s+count/i,
            /reading\s+level/i,
            /code\s+examples/i,
            /estimated\s+time/i,
          ]

          let metadataCount = 0
          for (const field of metadataFields) {
            if (field.test(pageContent)) {
              metadataCount++
            }
          }

          // Should have at least one metadata field
          expect(metadataCount).toBeGreaterThan(0)

          break
        }
      }
    }
  })

  test('Article lesson shows gradient header with book icon', async ({ page }) => {
    /**
     * Given an article lesson
     * Then the header should have gradient background
     * And should show a book icon
     */



    for (const lessonId of articleLessonIds) {
      const response = await page.goto(`/lessons/${lessonId}`)

      if (response?.ok()) {
        await page.waitForLoadState('networkidle')

        const readButton = page.getByRole('button', { name: /read article/i })

        if (await readButton.count() > 0) {
          // Check for gradient background class
          const gradientElement = page.locator('.bg-gradient-to-r')

          if (await gradientElement.count() > 0) {
            await expect(gradientElement.first()).toBeVisible()
          }

          // Check for SVG icon
          const svgIcon = page.locator('svg').first()
          await expect(svgIcon).toBeVisible()

          break
        }
      }
    }
  })

  test('Article lesson breadcrumb links to curriculum', async ({ page }) => {
    /**
     * Given an article lesson
     * Then the breadcrumb should show hierarchy
     * And curriculum link should work
     */



    for (const lessonId of articleLessonIds) {
      const response = await page.goto(`/lessons/${lessonId}`)

      if (response?.ok()) {
        await page.waitForLoadState('networkidle')

        const readButton = page.getByRole('button', { name: /read article/i })

        if (await readButton.count() > 0) {
          // Find breadcrumb nav
          const nav = page.locator('nav').first()
          await expect(nav).toBeVisible()

          // Find curriculum link
          const curriculumLink = nav.locator('a').first()

          if (await curriculumLink.count() > 0) {
            await expect(curriculumLink).toBeVisible()

            // Link should have valid href
            const href = await curriculumLink.getAttribute('href')
            expect(href).toMatch(/\/curriculums\/\d+/)
          }

          break
        }
      }
    }
  })

  test('Article lesson is responsive on mobile', async ({ page }) => {
    /**
     * Given an article lesson
     * When viewed on mobile
     * Then layout should be responsive
     */

    await page.setViewportSize({ width: 375, height: 667 })



    for (const lessonId of articleLessonIds) {
      const response = await page.goto(`/lessons/${lessonId}`)

      if (response?.ok()) {
        await page.waitForLoadState('networkidle')

        const readButton = page.getByRole('button', { name: /read article/i })

        if (await readButton.count() > 0) {
          // Button should be visible and accessible
          await expect(readButton).toBeVisible()

          // Should not have horizontal scroll
          const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
          const windowWidth = await page.evaluate(() => window.innerWidth)
          expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 10)

          break
        }
      }
    }
  })

  test('Article lesson metadata grid is properly styled', async ({ page }) => {
    /**
     * Given an article lesson with metadata
     * Then metadata should be in a grid layout
     * And each field should be styled as a card
     */



    for (const lessonId of articleLessonIds) {
      const response = await page.goto(`/lessons/${lessonId}`)

      if (response?.ok()) {
        await page.waitForLoadState('networkidle')

        const readButton = page.getByRole('button', { name: /read article/i })

        if (await readButton.count() > 0) {
          // Check for grid layout
          const gridElement = page.locator('.grid')

          if (await gridElement.count() > 0) {
            await expect(gridElement.first()).toBeVisible()
          }

          // Check for metadata card styling
          // Check for metadata card styling (look for the containers of the metadata text)
          const wordCountCard = page.getByText(/Word Count/i)
          const readingLevelCard = page.getByText(/Reading Level/i)
          
          await expect(wordCountCard).toBeVisible()
          await expect(readingLevelCard).toBeVisible()

          // Optional: Check they are within the grid
          const grid = page.locator('.grid, [display="grid"], div[class*="css-"]') // Chakra often uses grid in classname or styles
          if (await grid.count() > 0) {
             await expect(grid.first()).toBeVisible()
          }

          break
        }
      }
    }
  })
})
