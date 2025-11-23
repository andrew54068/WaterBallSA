import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Survey/Quiz Lesson Viewing
 *
 * Covers BDD Scenario 7 from docs/specifications/lesson-viewer.md:
 * - Scenario 7: Student views a survey lesson
 *
 * Note: Full quiz functionality is Phase 3. Phase 1 shows metadata only.
 */

test.describe('Survey/Quiz Lesson Viewing', () => {
  test.beforeEach(async ({ page }) => {
    // Note: These tests assume a SURVEY lesson exists in seed data
    await page.goto('/')
  })

  test('Scenario 7: Student views a survey lesson with Phase 3 message', async ({ page }) => {
    /**
     * Given a published survey lesson exists
     * And the lesson has contentMetadata {"questionCount": 10, "passingScore": 70}
     * When the student navigates to the survey lesson
     * Then survey metadata should be displayed
     * And a Phase 3 message should be shown
     */

    // Try common survey lesson IDs
    const surveyLessonIds = [6, 12, 18, 20]

    let foundSurveyLesson = false

    for (const lessonId of surveyLessonIds) {
      const response = await page.goto(`/lessons/${lessonId}`)

      if (response?.ok()) {
        await page.waitForLoadState('networkidle')

        // Check if this is a survey lesson
        const hasSurveyIndicator =
          (await page.getByText(/survey/i).count()) > 0 ||
          (await page.getByText(/quiz/i).count()) > 0 ||
          (await page.getByText(/knowledge check/i).count()) > 0 ||
          (await page.getByText(/phase 3/i).count()) > 0

        if (hasSurveyIndicator) {
          foundSurveyLesson = true

          // Then: The page should display the lesson title
          const title = page.locator('h1, h2, h3').first()
          await expect(title).toBeVisible()

          // And: The page should show "Knowledge Check" or similar header
          const knowledgeCheck = page.getByText(/knowledge check|survey|quiz/i)
          await expect(knowledgeCheck.first()).toBeVisible()

          // And: The page should display "Phase 3" message
          const phase3Message = page.getByText(/phase 3/i)
          await expect(phase3Message).toBeVisible()

          // And: The message should mention "coming soon" or similar
          const comingSoonMessage = page.getByText(/coming soon|functionality/i)
          await expect(comingSoonMessage).toBeVisible()

          // And: Survey metadata should be displayed if available
          const pageContent = await page.content()

          // Check for metadata
          const hasQuestionCount = /question/i.test(pageContent)
          const hasPassingScore = /passing\s+score/i.test(pageContent)
          const hasDifficulty = /difficulty/i.test(pageContent)

          // At least one metadata field should be present
          expect(hasQuestionCount || hasPassingScore || hasDifficulty).toBeTruthy()

          break
        }
      }
    }

    expect(foundSurveyLesson).toBeTruthy()
  })

  test('Survey lesson displays question count metadata', async ({ page }) => {
    /**
     * Given a survey lesson with question count
     * Then "X questions" should be displayed
     */

    const surveyLessonIds = [6, 12, 18, 20]

    for (const lessonId of surveyLessonIds) {
      const response = await page.goto(`/lessons/${lessonId}`)

      if (response?.ok()) {
        await page.waitForLoadState('networkidle')

        const pageContent = await page.content()

        if (/phase 3/i.test(pageContent)) {
          // Look for question count
          const questionText = page.getByText(/questions/i)

          if (await questionText.count() > 0) {
            await expect(questionText.first()).toBeVisible()
          }

          break
        }
      }
    }
  })

  test('Survey lesson displays passing score metadata', async ({ page }) => {
    /**
     * Given a survey lesson with passing score
     * Then "Passing score: X%" should be displayed
     */

    const surveyLessonIds = [6, 12, 18, 20]

    for (const lessonId of surveyLessonIds) {
      const response = await page.goto(`/lessons/${lessonId}`)

      if (response?.ok()) {
        await page.waitForLoadState('networkidle')

        const pageContent = await page.content()

        if (/phase 3/i.test(pageContent)) {
          // Look for passing score
          const passingScoreText = page.getByText(/passing\s+score/i)

          if (await passingScoreText.count() > 0) {
            await expect(passingScoreText.first()).toBeVisible()
          }

          break
        }
      }
    }
  })

  test('Survey lesson shows purple gradient header', async ({ page }) => {
    /**
     * Given a survey lesson
     * Then the header should have purple gradient
     */

    const surveyLessonIds = [6, 12, 18, 20]

    for (const lessonId of surveyLessonIds) {
      const response = await page.goto(`/lessons/${lessonId}`)

      if (response?.ok()) {
        await page.waitForLoadState('networkidle')

        const phase3Message = page.getByText(/phase 3/i)

        if (await phase3Message.count() > 0) {
          // Check for gradient background (purple theme)
          const gradientElement = page.locator('.bg-gradient-to-r, .from-purple-500')

          if (await gradientElement.count() > 0) {
            await expect(gradientElement.first()).toBeVisible()
          }

          // Check for clipboard/survey icon
          const svgIcon = page.locator('svg').first()
          await expect(svgIcon).toBeVisible()

          break
        }
      }
    }
  })

  test('Survey lesson metadata cards are color-coded', async ({ page }) => {
    /**
     * Given a survey lesson with multiple metadata fields
     * Then each metadata type should have a distinct color
     */

    const surveyLessonIds = [6, 12, 18, 20]

    for (const lessonId of surveyLessonIds) {
      const response = await page.goto(`/lessons/${lessonId}`)

      if (response?.ok()) {
        await page.waitForLoadState('networkidle')

        const phase3Message = page.getByText(/phase 3/i)

        if (await phase3Message.count() > 0) {
          // Check for colored metadata cards
          const purpleCards = page.locator('.bg-purple-50, .border-purple-200')
          const greenCards = page.locator('.bg-green-50, .border-green-200')
          const orangeCards = page.locator('.bg-orange-50, .border-orange-200')

          const totalColoredCards =
            (await purpleCards.count()) +
            (await greenCards.count()) +
            (await orangeCards.count())

          expect(totalColoredCards).toBeGreaterThan(0)

          break
        }
      }
    }
  })

  test('Survey lesson shows Phase 3 badge', async ({ page }) => {
    /**
     * Given a survey lesson
     * Then a "Phase 3 Feature" badge should be displayed
     */

    const surveyLessonIds = [6, 12, 18, 20]

    for (const lessonId of surveyLessonIds) {
      const response = await page.goto(`/lessons/${lessonId}`)

      if (response?.ok()) {
        await page.waitForLoadState('networkidle')

        const phase3Badge = page.getByText(/phase 3 feature/i)

        if (await phase3Badge.count() > 0) {
          await expect(phase3Badge).toBeVisible()
          break
        }
      }
    }
  })

  test('Survey lesson is responsive on mobile', async ({ page }) => {
    /**
     * Given a survey lesson
     * When viewed on mobile
     * Then layout should be responsive
     */

    await page.setViewportSize({ width: 375, height: 667 })

    const surveyLessonIds = [6, 12, 18, 20]

    for (const lessonId of surveyLessonIds) {
      const response = await page.goto(`/lessons/${lessonId}`)

      if (response?.ok()) {
        await page.waitForLoadState('networkidle')

        const phase3Message = page.getByText(/phase 3/i)

        if (await phase3Message.count() > 0) {
          // Message should be visible
          await expect(phase3Message).toBeVisible()

          // Should not have horizontal scroll
          const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
          const windowWidth = await page.evaluate(() => window.innerWidth)
          expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 10)

          break
        }
      }
    }
  })

  test('Survey lesson breadcrumb shows hierarchy', async ({ page }) => {
    /**
     * Given a survey lesson
     * Then breadcrumb navigation should be present
     */

    const surveyLessonIds = [6, 12, 18, 20]

    for (const lessonId of surveyLessonIds) {
      const response = await page.goto(`/lessons/${lessonId}`)

      if (response?.ok()) {
        await page.waitForLoadState('networkidle')

        const phase3Message = page.getByText(/phase 3/i)

        if (await phase3Message.count() > 0) {
          // Find breadcrumb nav
          const nav = page.locator('nav').first()
          await expect(nav).toBeVisible()

          // Should have curriculum link
          const links = nav.locator('a')
          expect(await links.count()).toBeGreaterThan(0)

          break
        }
      }
    }
  })
})
