# Video Progress Tracking - Requirements Document

## Introduction

This document defines the requirements for implementing a video progress tracking system in the WaterBallSA learning platform. The system will automatically record user video playback progress, mark lessons as complete upon full viewing, and provide visual indicators of completion status. This feature enhances user experience by allowing learners to resume videos from where they left off and track their learning progress through curriculums.

The system integrates with the existing lesson viewer infrastructure, including the YouTube iframe video player, lesson navigation, and curriculum structure (Curriculum → Chapters → Lessons). It requires new database entities, backend API endpoints, and frontend components to capture, store, and display progress data.

## Requirements

### Requirement 1: Video Progress Recording

**User Story:** As a learner, I want my video playback position to be automatically saved so that I can resume watching from where I left off when I return to the lesson.

#### Acceptance Criteria

1. WHEN a user plays a video lesson THEN the system SHALL record the initial playback start at 0 seconds
2. WHEN a video is playing AND 10 seconds have elapsed since the last progress save THEN the system SHALL send the current playback position to the backend API
3. WHEN the backend receives a progress update request THEN the system SHALL store the user ID, lesson ID, current timestamp, and video duration in the database
4. WHEN a user pauses a video THEN the system SHALL immediately save the current playback position
5. WHEN a user seeks to a different position in the video THEN the system SHALL save the new playback position within 2 seconds
6. WHEN a user navigates away from the lesson page THEN the system SHALL save the current playback position before unloading
7. IF a progress save request fails due to network error THEN the system SHALL retry the request up to 3 times with exponential backoff
8. WHEN multiple progress updates are pending AND the video is still playing THEN the system SHALL batch updates and send only the most recent position

### Requirement 2: Video Completion Detection

**User Story:** As a learner, I want my video lesson to be automatically marked as complete when I finish watching it so that I can track my progress through the curriculum.

#### Acceptance Criteria

1. WHEN a user's playback position reaches 95% or more of the total video duration THEN the system SHALL mark the lesson as completed
2. WHEN a lesson is marked as completed THEN the system SHALL set the completion timestamp to the current date and time
3. WHEN a lesson is marked as completed THEN the system SHALL set the completion percentage to 100%
4. IF a lesson was previously marked as completed THEN the system SHALL NOT change the original completion timestamp even if the user rewatches the video
5. WHEN the backend receives a completion status THEN the system SHALL persist the completed flag as TRUE in the database
6. WHEN a video is less than 30 seconds in total duration THEN the system SHALL require 100% playback to mark as complete
7. IF a user manually seeks to the end of the video without watching THEN the system SHALL still mark the lesson as complete based on the 95% threshold

### Requirement 3: Progress Data Storage

**User Story:** As a system administrator, I want video progress data to be reliably stored in the database so that user progress is preserved across sessions and devices.

#### Acceptance Criteria

1. WHEN the system initializes the database THEN it SHALL create a video_progress table with columns: id, user_id, lesson_id, current_time_seconds, duration_seconds, completion_percentage, is_completed, completed_at, created_at, updated_at
2. WHEN storing progress data THEN the system SHALL enforce a composite unique constraint on (user_id, lesson_id)
3. WHEN a progress update request arrives for an existing user-lesson combination THEN the system SHALL update the existing record rather than creating a duplicate
4. WHEN creating or updating a progress record THEN the system SHALL automatically update the updated_at timestamp
5. WHEN a new progress record is created THEN the system SHALL set is_completed to FALSE by default
6. WHEN storing progress data THEN the system SHALL enforce a foreign key relationship to the users table on user_id
7. WHEN storing progress data THEN the system SHALL enforce a foreign key relationship to the lessons table on lesson_id
8. WHEN a lesson is deleted THEN the system SHALL cascade delete all associated progress records
9. WHEN a user is deleted THEN the system SHALL cascade delete all associated progress records
10. IF the database connection fails during a save operation THEN the system SHALL return an appropriate error response with HTTP status 500

### Requirement 4: Progress Restoration on Page Load

**User Story:** As a learner, I want the video to automatically resume from my last watched position when I return to a lesson so that I don't have to manually seek to where I left off.

#### Acceptance Criteria

1. WHEN a user opens a video lesson page THEN the system SHALL fetch the user's progress data for that lesson from the backend API
2. IF progress data exists for the user-lesson combination THEN the system SHALL seek the video player to the saved current_time_seconds position
3. IF no progress data exists for the user-lesson combination THEN the system SHALL start the video from 0 seconds
4. WHEN the video player is ready AND progress data has been fetched THEN the system SHALL apply the saved position before autoplay begins
5. IF the saved position is within 10 seconds of the video end THEN the system SHALL start the video from 0 seconds instead
6. WHEN fetching progress data fails due to network error THEN the system SHALL retry up to 2 times before defaulting to 0 seconds
7. IF the user is not authenticated THEN the system SHALL NOT fetch or store progress data and SHALL start videos from 0 seconds

### Requirement 5: Completion Indicator Display

**User Story:** As a learner, I want to see which lessons I have completed in the lesson list so that I can easily track my progress through the curriculum.

#### Acceptance Criteria

1. WHEN displaying the lesson list in the left sidebar THEN the system SHALL show a visual completion indicator for each lesson
2. WHEN a lesson is marked as completed THEN the system SHALL display a checkmark icon next to the lesson title
3. WHEN a lesson is not completed THEN the system SHALL display no icon or an empty circle icon next to the lesson title
4. WHEN a lesson is in progress (1% to 94% complete) THEN the system SHALL display a progress indicator showing the completion percentage
5. WHEN hovering over a completion indicator THEN the system SHALL display a tooltip with completion details (e.g., "Completed on Jan 15, 2025" or "45% complete")
6. WHEN the lesson list loads THEN the system SHALL fetch completion status for all lessons in the current chapter
7. WHEN a video reaches completion during playback THEN the system SHALL immediately update the completion indicator without requiring a page refresh
8. WHEN displaying the completion indicator THEN the system SHALL use distinct colors: green for completed, gray for not started, blue for in progress

### Requirement 6: Backend API Endpoints

**User Story:** As a frontend developer, I want well-defined REST API endpoints for progress tracking so that I can integrate the feature into the user interface.

#### Acceptance Criteria

1. WHEN the backend starts THEN it SHALL expose a POST endpoint at `/api/lessons/{lessonId}/progress` for saving progress
2. WHEN the POST `/api/lessons/{lessonId}/progress` endpoint receives a request THEN it SHALL accept a JSON body with fields: currentTimeSeconds, durationSeconds, completionPercentage, isCompleted
3. WHEN the POST endpoint receives valid data THEN it SHALL return HTTP status 200 with the updated progress record
4. WHEN the POST endpoint receives invalid data THEN it SHALL return HTTP status 400 with validation error messages
5. WHEN the backend starts THEN it SHALL expose a GET endpoint at `/api/lessons/{lessonId}/progress` for retrieving progress
6. WHEN the GET `/api/lessons/{lessonId}/progress` endpoint receives a request THEN it SHALL return the user's progress for the specified lesson with HTTP status 200
7. IF no progress exists for the user-lesson combination THEN the GET endpoint SHALL return HTTP status 404
8. WHEN the backend starts THEN it SHALL expose a GET endpoint at `/api/chapters/{chapterId}/progress` for bulk progress retrieval
9. WHEN the GET `/api/chapters/{chapterId}/progress` endpoint receives a request THEN it SHALL return progress data for all lessons in the chapter with HTTP status 200
10. WHEN any progress endpoint is called by an unauthenticated user THEN the system SHALL return HTTP status 401
11. WHEN any progress endpoint is called THEN it SHALL require a valid JWT Bearer token in the Authorization header
12. WHEN the backend processes progress requests THEN it SHALL extract the user ID from the JWT token claims

### Requirement 7: Frontend Progress Tracking Integration

**User Story:** As a frontend developer, I want progress tracking integrated directly into the existing video player so that progress is automatically recorded without requiring additional components.

#### Acceptance Criteria

1. WHEN the video lesson page loads THEN the existing video player component SHALL fetch progress data from the API
2. WHEN the video player mounts AND progress data exists THEN it SHALL seek to the saved playback position
3. WHEN the video player's timeupdate event fires THEN it SHALL capture the current playback position
4. WHEN 10 seconds have elapsed since the last save THEN the video player SHALL call the API to save progress
5. WHEN the video player unmounts THEN it SHALL save the current progress before cleanup
6. WHEN the video player detects completion (≥95%) THEN it SHALL update the lesson's completion status
7. WHEN progress is saved THEN the lesson list SHALL be notified to update the completion indicators
8. IF the API request fails THEN the system SHALL log the error to the console and continue tracking locally
9. WHEN the user is not authenticated THEN the video player SHALL disable all progress tracking functionality

### Requirement 8: Database Migration

**User Story:** As a DevOps engineer, I want a versioned database migration script so that I can safely deploy the progress tracking schema to production.

#### Acceptance Criteria

1. WHEN the migration is created THEN it SHALL be named with the next sequential version number following the Flyway convention (e.g., V7__create_video_progress_table.sql)
2. WHEN the migration runs THEN it SHALL create the video_progress table with all required columns and constraints
3. WHEN the migration runs THEN it SHALL create an index on (user_id, lesson_id) for query performance
4. WHEN the migration runs THEN it SHALL create an index on user_id for bulk query performance
5. WHEN the migration runs THEN it SHALL create an index on lesson_id for analytics queries
6. WHEN the migration runs THEN it SHALL set up foreign key constraints with CASCADE delete behavior
7. WHEN the migration runs on an existing database THEN it SHALL complete successfully without data loss
8. WHEN the migration runs THEN it SHALL create an automatic trigger to update the updated_at timestamp on record modification

### Requirement 9: Performance and Scalability

**User Story:** As a system architect, I want the progress tracking system to perform efficiently under load so that it doesn't degrade user experience.

#### Acceptance Criteria

1. WHEN the system saves progress THEN it SHALL complete the database write operation in less than 200ms at the 95th percentile
2. WHEN the system retrieves progress for a single lesson THEN it SHALL respond in less than 100ms at the 95th percentile
3. WHEN the system retrieves progress for all lessons in a chapter THEN it SHALL respond in less than 300ms at the 95th percentile for chapters with up to 20 lessons
4. WHEN multiple users are watching videos simultaneously THEN the system SHALL handle at least 100 concurrent progress update requests per second
5. WHEN the database table grows beyond 1 million records THEN query performance SHALL NOT degrade by more than 20% compared to 100,000 records
6. WHEN saving progress THEN the system SHALL use an upsert operation (INSERT ... ON CONFLICT UPDATE) to avoid race conditions
7. WHEN batching progress updates THEN the frontend SHALL limit API calls to a maximum of 1 request per 10 seconds per video

### Requirement 10: Error Handling and Data Integrity

**User Story:** As a quality assurance engineer, I want comprehensive error handling so that the system gracefully handles failures without losing user progress.

#### Acceptance Criteria

1. WHEN a progress save request fails THEN the system SHALL retry with exponential backoff: 1s, 2s, 4s
2. IF all retry attempts fail THEN the system SHALL log the error and continue tracking locally without blocking video playback
3. WHEN the backend receives invalid progress data (e.g., negative timestamps) THEN it SHALL return HTTP status 400 with specific validation errors
4. WHEN the backend receives a progress update for a non-existent lesson THEN it SHALL return HTTP status 404
5. WHEN concurrent progress updates arrive for the same user-lesson THEN the database SHALL use row-level locking to prevent data corruption
6. WHEN the current_time_seconds exceeds duration_seconds THEN the backend SHALL cap the value at duration_seconds
7. WHEN the completion_percentage is outside the 0-100 range THEN the backend SHALL reject the request with HTTP status 400
8. IF the JWT token expires during video playback THEN the system SHALL continue tracking locally and attempt to save once the token is refreshed
9. WHEN the database connection is lost THEN the system SHALL queue progress updates in memory and flush them when the connection is restored
10. WHEN the user's browser crashes THEN the system SHALL have saved progress up to the last 10-second interval

### Requirement 11: Non-Functional Requirements

**User Story:** As a product manager, I want the progress tracking feature to meet quality standards so that it provides a reliable and seamless user experience.

#### Acceptance Criteria

1. WHEN the feature is deployed THEN it SHALL achieve at least 80% unit test coverage for backend services
2. WHEN the feature is deployed THEN it SHALL achieve at least 80% unit test coverage for frontend components
3. WHEN the feature is deployed THEN it SHALL include integration tests for all API endpoints using TestContainers
4. WHEN the feature is deployed THEN it SHALL include end-to-end tests for the complete progress tracking flow using Playwright
5. WHEN storing timestamps THEN the system SHALL use UTC timezone consistently across backend and database
6. WHEN returning timestamps to the frontend THEN the system SHALL use ISO 8601 format (e.g., "2025-01-15T10:30:00Z")
7. WHEN displaying completion dates THEN the frontend SHALL convert UTC timestamps to the user's local timezone
8. WHEN the feature is in use THEN it SHALL NOT cause the video player to stutter, lag, or buffer unnecessarily
9. WHEN the system logs errors THEN it SHALL include correlation IDs to trace requests across frontend and backend
10. WHEN the feature is documented THEN it SHALL include API documentation in Swagger/OpenAPI format
11. WHEN the feature is documented THEN it SHALL include Given-When-Then scenarios in the specification document

## Acceptance Testing Scenarios

### Scenario 1: First-time video viewing with progress tracking

```gherkin
Given a logged-in user viewing a video lesson for the first time
And no progress data exists for this user-lesson combination
When the user plays the video
Then the system should start tracking progress from 0 seconds
And the system should save progress every 10 seconds
And the lesson list should show the lesson as "in progress"
```

### Scenario 2: Resuming a partially watched video

```gherkin
Given a logged-in user who previously watched 45% of a video lesson
And progress data exists showing current_time_seconds = 135 out of duration_seconds = 300
When the user opens the lesson page
Then the video player should seek to 135 seconds
And the video should be ready to play from that position
And the lesson list should show "45% complete" indicator
```

### Scenario 3: Completing a video lesson

```gherkin
Given a logged-in user watching a video lesson
And the user has reached 95% of the video duration
When the playback position crosses the 95% threshold
Then the system should mark is_completed as TRUE
And the system should set completion_percentage to 100
And the system should record the completed_at timestamp
And the lesson list should display a green checkmark icon
And the tooltip should show "Completed on [date]"
```

### Scenario 4: Progress tracking with network interruption

```gherkin
Given a logged-in user watching a video lesson
And the network connection is lost
When the system attempts to save progress
Then the system should retry the request 3 times
And if all retries fail, the system should continue tracking locally
And the video playback should not be interrupted
And when the connection is restored, the system should flush pending updates
```

### Scenario 5: Unauthenticated user watching videos

```gherkin
Given a user who is not logged in
And the user opens a free video lesson
When the user plays the video
Then the system should NOT track progress
And the system should NOT make API calls to save progress
And the lesson list should NOT show completion indicators
And the video should start from 0 seconds on every page load
```

### Scenario 6: Bulk progress retrieval for chapter

```gherkin
Given a logged-in user viewing a chapter with 10 lessons
And the user has completed 3 lessons and partially watched 2 lessons
When the lesson list component loads
Then the system should fetch progress for all 10 lessons in one API call
And the lesson list should display checkmarks for the 3 completed lessons
And the lesson list should display progress percentages for the 2 in-progress lessons
And the lesson list should display "not started" indicators for the 5 unwatched lessons
```

## Success Metrics

1. **Progress Save Success Rate**: ≥99.5% of progress updates successfully saved to database
2. **API Response Time**: P95 latency <200ms for progress save, <100ms for progress retrieval
3. **User Engagement**: ≥70% of users resume videos from their last position (vs. restarting from 0%)
4. **Completion Rate**: Measurable increase in lesson completion rate after feature deployment
5. **Error Rate**: <0.1% of video playback sessions experience progress tracking errors
6. **Test Coverage**: ≥80% unit test coverage and ≥90% critical path E2E test coverage

## Out of Scope

The following items are explicitly out of scope for this feature:

1. Progress tracking for non-video lessons (ARTICLE, SURVEY types)
2. Offline progress tracking (requires service workers and sync API)
3. Progress analytics dashboard for instructors
4. Cross-device progress synchronization conflicts (last-write-wins strategy is acceptable)
5. Video playback speed adjustment tracking
6. Partial credit for incomplete videos (completion is binary: complete or incomplete)
7. Admin UI for manually adjusting user progress
8. Progress export/import functionality
9. Social sharing of completed lessons
10. Push notifications for milestone completions

---

**Document Version**: 1.0
**Last Updated**: 2025-11-28
**Author**: System Requirements Analyst
**Status**: Draft - Awaiting Approval
