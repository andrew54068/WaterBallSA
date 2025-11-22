# Lesson Endpoints

> View lesson content and track progress

## Overview

Lessons are the atomic learning units within chapters. Each lesson has one type:
- **VIDEO**: Video content with optional assignments
- **ARTICLE**: Text-based content (Markdown)
- **SURVEY**: Questionnaire/feedback form

**Access Control**: Students can only access lessons from purchased curriculums.

---

## GET `/api/lessons/:id`

Get lesson details (requires curriculum purchase).

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Lesson ID |

### Request Headers

```
Authorization: Bearer <access_token>
```

### Response (200 OK) - VIDEO Lesson

```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "chapterId": "660e8400-e29b-41d4-a716-446655440000",
    "curriculumId": "550e8400-e29b-41d4-a716-446655440000",
    "title": "What is Spring Boot?",
    "type": "VIDEO",
    "orderIndex": 0,
    "videoUrl": "https://s3.amazonaws.com/waterballsa/videos/550e.../770e.../playlist.m3u8",
    "videoDuration": 600,
    "isCompleted": false,
    "assignments": [
      {
        "id": "990e8400-e29b-41d4-a716-446655440000",
        "title": "Spring Boot Quiz",
        "type": "QUIZ",
        "expReward": 25
      }
    ]
  }
}
```

### Response (200 OK) - ARTICLE Lesson

```json
{
  "success": true,
  "data": {
    "id": "771e8400-e29b-41d4-a716-446655440000",
    "chapterId": "660e8400-e29b-41d4-a716-446655440000",
    "curriculumId": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Spring Boot Architecture",
    "type": "ARTICLE",
    "orderIndex": 1,
    "articleContent": "# Spring Boot Architecture\n\nSpring Boot follows a layered architecture...",
    "isCompleted": true,
    "completedAt": "2025-11-20T14:30:00Z",
    "assignments": []
  }
}
```

### Response (200 OK) - SURVEY Lesson

```json
{
  "success": true,
  "data": {
    "id": "772e8400-e29b-41d4-a716-446655440000",
    "title": "Course Feedback Survey",
    "type": "SURVEY",
    "orderIndex": 2,
    "surveyConfig": {
      "questions": [
        {
          "id": "q1",
          "text": "How would you rate this lesson?",
          "type": "RATING",
          "required": true
        },
        {
          "id": "q2",
          "text": "What did you learn?",
          "type": "TEXT",
          "required": false
        }
      ]
    },
    "isCompleted": false,
    "assignments": []
  }
}
```

### Error Response (403 Forbidden)

Student attempting to access unpurchased lesson:

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You must purchase this curriculum to access its lessons",
    "details": {
      "curriculumId": "550e8400-e29b-41d4-a716-446655440000",
      "curriculumTitle": "Java Spring Boot Mastery",
      "price": 99.99
    }
  }
}
```

### Error Response (404 Not Found)

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Lesson not found"
  }
}
```

---

## POST `/api/lessons/:id/complete`

Mark lesson as completed.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Lesson ID |

### Request Headers

```
Authorization: Bearer <access_token>
```

### Request Body

None required.

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "lessonId": "770e8400-e29b-41d4-a716-446655440000",
    "completed": true,
    "completedAt": "2025-11-22T10:35:00Z"
  }
}
```

### Error Response (403 Forbidden)

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You must purchase this curriculum to complete its lessons"
  }
}
```

### Notes

- **Idempotent**: Calling this endpoint multiple times has no side effects
- **No Validation**: Backend doesn't verify if user actually watched/read the content
- **Progress Tracking**: Used for UI progress indicators (e.g., "3/10 lessons completed")
- **Independent of Assignments**: Completing a lesson doesn't require completing its assignments

---

## Lesson Completion Criteria

While the API allows manual completion, the frontend should enforce these criteria:

### VIDEO Lessons
- User watched at least **80%** of the video duration, OR
- User manually clicked "Mark as Complete"

### ARTICLE Lessons
- User scrolled to the bottom of the article, OR
- User manually clicked "Mark as Complete"

### SURVEY Lessons
- User submitted survey responses
- Automatically marked complete on submission

---

## Business Rules

### Access Control

1. **Students**:
   - Can only access lessons from purchased curriculums
   - Receive 403 Forbidden with purchase info for unpurchased lessons

### Lesson Types

Each lesson has exactly **one type**:

| Type | Content | Nullable Fields |
|------|---------|-----------------|
| VIDEO | `videoUrl`, `videoDuration` | `articleContent`, `surveyConfig` |
| ARTICLE | `articleContent` (Markdown) | `videoUrl`, `videoDuration`, `surveyConfig` |
| SURVEY | `surveyConfig` (JSON) | `videoUrl`, `videoDuration`, `articleContent` |

### Video URLs

- **Format**: HLS streaming (`.m3u8` playlist)
- **Storage**: AWS S3
- **Path Structure**: `https://s3.amazonaws.com/waterballsa/videos/{curriculumId}/{lessonId}/playlist.m3u8`
- **Adaptive Bitrate**: Multiple quality levels in HLS manifest

### Article Content

- **Format**: Markdown
- **Rendering**: Frontend converts Markdown to HTML (use marked.js or similar)
- **Sanitization**: Backend sanitizes HTML to prevent XSS

### Survey Config

JSON structure for survey questions:

```json
{
  "questions": [
    {
      "id": "q1",
      "text": "Question text?",
      "type": "TEXT" | "MULTIPLE_CHOICE" | "RATING",
      "required": true | false,
      "options": ["Option A", "Option B"] // Only for MULTIPLE_CHOICE
    }
  ]
}
```

---

## Example Flows

### Student Viewing Video Lesson

```
1. Student navigates to lesson page
2. Frontend calls: GET /api/lessons/:id
3. Backend checks if student purchased curriculum
4. If purchased → Return lesson with videoUrl
5. If not purchased → Return 403 with purchase info
6. Frontend renders video player (HLS.js)
7. Student watches video
8. Frontend tracks watch progress
9. When 80% watched → Frontend calls: POST /api/lessons/:id/complete
10. Backend marks lesson as completed
```

### Student Reading Article

```
1. Student opens article lesson
2. Frontend calls: GET /api/lessons/:id
3. Backend returns articleContent (Markdown)
4. Frontend converts Markdown to HTML
5. Frontend renders article
6. Student scrolls to bottom
7. Frontend calls: POST /api/lessons/:id/complete
8. Backend marks lesson as completed
```
