# Requirements Document: Lesson Access Control

## Introduction

This document defines the requirements for implementing lesson access control in the WaterBallSA learning platform. The feature ensures that users can only view lessons they are authorized to access based on their authentication status and course ownership. This protects premium content while allowing free preview lessons to be accessible to all authenticated users.

The system will display blocking panels with clear calls-to-action when users attempt to access restricted content, guiding them through the appropriate next steps (login or purchase).

## Requirements

### Requirement 1: Unauthenticated User Access Control

**User Story:** As an unauthenticated visitor, I want to be informed that I need to login when trying to view a lesson, so that I understand how to gain access to the content.

#### Acceptance Criteria

1. WHEN an unauthenticated user navigates to any lesson page THEN the system SHALL display a blocking panel that prevents content viewing
2. WHEN the blocking panel is displayed to an unauthenticated user THEN the system SHALL show a message indicating login is required
3. WHEN the blocking panel is displayed to an unauthenticated user THEN the system SHALL provide a "Login" button that triggers the authentication flow
4. WHEN an unauthenticated user clicks the "Login" button THEN the system SHALL redirect them to the Google OAuth login flow
5. WHEN an unauthenticated user attempts to view lesson content directly THEN the system SHALL hide or disable the video player, article content, and survey forms
6. WHEN an unauthenticated user views the lesson page THEN the system SHALL still display the lesson breadcrumb and title for context

### Requirement 2: Preview Lesson Access for Authenticated Users

**User Story:** As an authenticated user who hasn't purchased a course, I want to view free preview lessons, so that I can evaluate the course content before making a purchase decision.

#### Acceptance Criteria

1. WHEN an authenticated user navigates to a lesson marked as free preview AND the user does not own the course THEN the system SHALL display the full lesson content without restrictions
2. WHEN an authenticated user views a preview lesson THEN the system SHALL display the video player, article renderer, or survey form based on the lesson type
3. WHEN an authenticated user views a preview lesson THEN the system SHALL allow navigation to other preview lessons in the same course
4. WHEN an authenticated user views a preview lesson THEN the system SHALL display a visual indicator (e.g., badge or label) that the lesson is a "Free Preview"
5. WHEN an authenticated user is viewing a preview lesson THEN the system SHALL provide clear information about purchasing the full course
6. IF a lesson's metadata contains `isFreePreview: true` THEN the system SHALL treat it as a preview lesson
7. IF a lesson's metadata does not contain `isFreePreview` or it is set to `false` THEN the system SHALL treat it as a locked lesson for non-owners

### Requirement 3: Locked Lesson Access Control for Authenticated Non-Owners

**User Story:** As an authenticated user who hasn't purchased a course, I want to be informed when I try to access a locked lesson, so that I understand I need to purchase the course to view it.

#### Acceptance Criteria

1. WHEN an authenticated user navigates to a locked lesson AND the user does not own the course THEN the system SHALL display a blocking panel that prevents content viewing
2. WHEN the blocking panel is displayed for a locked lesson THEN the system SHALL show a message indicating course purchase is required
3. WHEN the blocking panel is displayed for a locked lesson THEN the system SHALL provide a "Purchase Course" button that redirects to the course purchase flow
4. WHEN an authenticated user attempts to view locked lesson content THEN the system SHALL hide or disable the video player, article content, and survey forms
5. WHEN an authenticated user views a locked lesson page THEN the system SHALL still display the lesson breadcrumb and title for context
6. WHEN an authenticated user views a locked lesson THEN the system SHALL display a lock icon or visual indicator on the lesson
7. WHEN the blocking panel is displayed for a locked lesson THEN the system SHALL show the course price and any available purchase options

### Requirement 4: Course Owner Full Access

**User Story:** As a user who has purchased a course, I want to access all lessons in that course without restrictions, so that I can complete my learning journey.

#### Acceptance Criteria

1. WHEN an authenticated user who owns the course navigates to any lesson in that course THEN the system SHALL display the full lesson content without blocking panels
2. WHEN a course owner views any lesson THEN the system SHALL enable the video player, article renderer, or survey form based on the lesson type
3. WHEN a course owner navigates between lessons THEN the system SHALL allow unrestricted navigation to all lessons in the owned course
4. WHEN a course owner views a lesson THEN the system SHALL NOT display any purchase prompts or lock indicators
5. WHEN a course owner completes a lesson THEN the system SHALL allow progression to the next lesson regardless of preview status
6. IF a user's purchase record exists for a curriculum THEN the system SHALL grant access to all chapters and lessons within that curriculum

### Requirement 5: Post-Login Navigation Behavior

**User Story:** As a user who just logged in from a lesson page, I want to be redirected back to that lesson, so that I can continue from where I left off.

#### Acceptance Criteria

1. WHEN an unauthenticated user clicks "Login" from a lesson page THEN the system SHALL store the current lesson URL as the return destination
2. WHEN a user completes the Google OAuth login flow THEN the system SHALL redirect them to the stored lesson URL
3. WHEN a user is redirected back to a lesson after login AND the lesson is a preview lesson THEN the system SHALL display the lesson content
4. WHEN a user is redirected back to a lesson after login AND the lesson is locked AND the user does not own the course THEN the system SHALL display the purchase blocking panel
5. WHEN a user is redirected back to a lesson after login AND the user owns the course THEN the system SHALL display the full lesson content
6. IF no return URL is stored THEN the system SHALL redirect to the home page or user dashboard after login

### Requirement 6: Post-Purchase Navigation Behavior

**User Story:** As a user who just purchased a course from a lesson page, I want to be redirected back to that lesson with full access, so that I can immediately start viewing the content I paid for.

#### Acceptance Criteria

1. WHEN an authenticated user clicks "Purchase Course" from a blocked lesson page THEN the system SHALL store the current lesson URL as the return destination
2. WHEN a user completes the course purchase flow successfully THEN the system SHALL redirect them to the stored lesson URL
3. WHEN a user is redirected back to a lesson after purchase THEN the system SHALL display the full lesson content without blocking panels
4. WHEN a user is redirected back after purchase THEN the system SHALL update the user's ownership status immediately without requiring a page refresh
5. IF the purchase fails or is cancelled THEN the system SHALL redirect back to the lesson page and continue displaying the purchase blocking panel
6. IF no return URL is stored after purchase THEN the system SHALL redirect to the purchased course's curriculum page

### Requirement 7: Access Control Data Fetching

**User Story:** As a developer, I want the system to efficiently fetch and validate user access permissions, so that the access control system performs well and is secure.

#### Acceptance Criteria

1. WHEN a lesson page loads THEN the system SHALL fetch the user's authentication status from the auth context
2. WHEN a lesson page loads for an authenticated user THEN the system SHALL fetch the user's ownership status for the current course
3. WHEN fetching ownership status THEN the system SHALL call the backend API endpoint that returns the user's purchased courses
4. WHEN the API call for ownership status fails THEN the system SHALL default to treating the user as a non-owner and display appropriate blocking panels
5. WHEN the lesson metadata is fetched THEN the system SHALL check for the `isFreePreview` flag in the lesson's content metadata
6. WHEN determining access permissions THEN the system SHALL evaluate in this order: authentication status, course ownership, preview status
7. WHILE a lesson page is loading access control data THEN the system SHALL display a loading state to prevent content flashing

### Requirement 8: Error Handling and Edge Cases

**User Story:** As a user, I want the system to handle errors gracefully when checking my access permissions, so that I have a smooth experience even when issues occur.

#### Acceptance Criteria

1. WHEN the backend API is unavailable or returns an error THEN the system SHALL display an error message and default to restricted access
2. WHEN the user's session token expires while viewing a lesson THEN the system SHALL prompt the user to login again
3. WHEN a lesson's metadata is missing or malformed THEN the system SHALL default to treating it as a locked lesson
4. WHEN a user's ownership data cannot be fetched THEN the system SHALL display a retry option
5. IF the system cannot determine the lesson's course/curriculum relationship THEN the system SHALL display an error message and prevent access
6. WHEN network connectivity is lost THEN the system SHALL cache the user's last known access permissions for the current session
7. WHEN multiple access control checks are running simultaneously THEN the system SHALL prevent race conditions and use the most recent result

### Requirement 9: Visual Feedback and User Experience

**User Story:** As a user, I want clear visual indicators of my access status, so that I understand which content I can view and what actions I need to take.

#### Acceptance Criteria

1. WHEN a blocking panel is displayed THEN the system SHALL use a semi-transparent overlay to dim the content behind it
2. WHEN a blocking panel is displayed THEN the system SHALL center the panel on the screen and make it visually prominent
3. WHEN a lesson is a free preview THEN the system SHALL display a "Free Preview" badge or label near the lesson title
4. WHEN a lesson is locked THEN the system SHALL display a lock icon on the lesson card and navigation elements
5. WHEN a blocking panel contains action buttons THEN the system SHALL use clear, action-oriented text (e.g., "Login to Continue", "Purchase to Unlock")
6. WHEN the user hovers over action buttons THEN the system SHALL provide visual feedback (e.g., color change, shadow)
7. WHILE access control is being checked THEN the system SHALL display a loading spinner or skeleton screen to indicate processing

### Requirement 10: Accessibility and Internationalization

**User Story:** As a user with accessibility needs or using a different language, I want the access control features to be accessible and localized, so that I can understand and use the platform effectively.

#### Acceptance Criteria

1. WHEN a blocking panel is displayed THEN the system SHALL ensure keyboard navigation is supported (Tab, Enter, Escape)
2. WHEN a user presses Escape on a blocking panel THEN the system SHALL close the panel or navigate back to the course page
3. WHEN screen reader users encounter a blocking panel THEN the system SHALL announce the restriction and available actions
4. WHEN visual indicators are used (lock icons, badges) THEN the system SHALL provide alternative text descriptions
5. WHEN action buttons are displayed THEN the system SHALL have sufficient color contrast (WCAG AA compliance)
6. IF internationalization is enabled THEN the system SHALL display all blocking panel messages in the user's selected language
7. WHEN displaying course prices in blocking panels THEN the system SHALL format currency according to the user's locale

## Non-Functional Requirements

### Performance

1. WHEN checking user access permissions THEN the system SHALL complete the check within 500ms under normal network conditions
2. WHEN rendering a blocking panel THEN the system SHALL display it within 100ms of determining restricted access
3. WHEN caching user ownership data THEN the system SHALL refresh the cache every 5 minutes or after a purchase event

### Security

1. WHEN validating user access THEN the system SHALL perform authorization checks on the backend API, not rely solely on frontend checks
2. WHEN storing return URLs THEN the system SHALL validate and sanitize URLs to prevent open redirect vulnerabilities
3. WHEN transmitting user authentication tokens THEN the system SHALL use secure HTTP-only cookies or Authorization headers
4. WHEN a user attempts to bypass frontend restrictions THEN the backend SHALL reject unauthorized API requests with 401 or 403 status codes

### Maintainability

1. WHEN implementing access control logic THEN the system SHALL use reusable React hooks (e.g., `useAccessControl`, `useOwnership`)
2. WHEN defining access rules THEN the system SHALL centralize the logic in a single service or utility module
3. WHEN adding new access control scenarios THEN the system SHALL require minimal changes to existing components

### Compatibility

1. WHEN running on supported browsers (Chrome, Firefox, Safari, Edge) THEN the system SHALL display blocking panels correctly
2. WHEN viewed on mobile devices THEN the system SHALL render blocking panels responsively and maintain usability
3. WHEN using the platform with JavaScript disabled THEN the system SHALL prevent access to lesson content through server-side rendering restrictions

## Assumptions and Dependencies

### Assumptions

1. The backend API provides an endpoint to check user ownership for a given course/curriculum (e.g., `GET /api/purchases/my-purchases` or `GET /api/curriculums/{id}/ownership`)
2. Lesson metadata in the database includes an `isFreePreview` boolean flag in the `content_metadata` JSONB field
3. The authentication system (Google OAuth with JWT) is already implemented and functional
4. The purchase system API is available (Phase 2) or will be mocked for testing purposes

### Dependencies

1. Backend API endpoint: `GET /api/purchases/my-purchases` - returns list of purchased curriculum IDs
2. Backend API endpoint: `GET /api/lessons/{id}` - returns lesson details including `content_metadata.isFreePreview`
3. Authentication context (`useAuth` hook) - provides current user authentication status
4. Existing components: `VideoPlayer`, `ArticleRenderer`, `SurveyForm`, `LessonBreadcrumb`, `LessonNavigation`
5. Google OAuth login flow - handles user authentication
6. Purchase flow UI - handles course purchase process (Phase 2)

## Out of Scope

The following items are explicitly out of scope for this feature:

1. Implementation of the actual purchase system (Phase 2 - separate feature)
2. Payment gateway integration
3. Subscription-based access models (only one-time purchases)
4. Content DRM or video encryption
5. Offline access control
6. Admin panel for managing lesson preview status
7. A/B testing different blocking panel designs
8. Analytics tracking for blocked access attempts (may be added later)

## Success Metrics

1. Zero unauthorized access to locked lessons (verified through backend API logs)
2. >90% of users who see blocking panels take the suggested action (login or purchase)
3. <2% error rate on access control checks
4. Average page load time increase <200ms with access control checks
5. 100% test coverage for access control logic
6. Zero open redirect vulnerabilities in return URL handling
