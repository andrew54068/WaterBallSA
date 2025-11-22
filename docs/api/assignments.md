# Assignment Endpoints

> View assignments and submit solutions

## Overview

Assignments are learning activities attached to lessons. Students submit solutions to earn EXP and progress through levels.

**Assignment Types**:
- **QUIZ**: Multiple-choice, true/false, short answer (auto-graded)
- **CODE**: Code submission (manual or auto-graded)
- **FILE**: File upload (manual grading)
- **TEXT**: Text response (manual grading)

---

## GET `/api/assignments/:id`

Get assignment details.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Assignment ID |

### Request Headers

```
Authorization: Bearer <access_token>
```

### Response (200 OK) - QUIZ Assignment

```json
{
  "success": true,
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440000",
    "lessonId": "770e8400-e29b-41d4-a716-446655440000",
    "title": "Spring Boot Quiz",
    "description": "Test your knowledge of Spring Boot basics",
    "type": "QUIZ",
    "expReward": 25,
    "config": {
      "questions": [
        {
          "id": "q1",
          "question": "What is Spring Boot primarily used for?",
          "type": "MULTIPLE_CHOICE",
          "options": [
            "Building microservices",
            "Database management",
            "Frontend development",
            "Mobile apps"
          ],
          "points": 10
          // Note: correctAnswer is NOT returned to client
        }
      ],
      "passingScore": 70,
      "timeLimit": 1800 // 30 minutes in seconds
    },
    "userSubmission": null // or submission object if exists
  }
}
```

### Response (200 OK) - CODE Assignment

```json
{
  "success": true,
  "data": {
    "id": "991e8400-e29b-41d4-a716-446655440000",
    "lessonId": "770e8400-e29b-41d4-a716-446655440000",
    "title": "Implement REST Controller",
    "description": "Create a REST controller with CRUD operations",
    "type": "CODE",
    "expReward": 100,
    "config": {
      "language": "java",
      "allowedExtensions": [".java"],
      "maxFileSize": 10485760, // 10MB in bytes
      "instructions": "Implement a REST controller with the following endpoints:\n- GET /api/users\n- POST /api/users\n- PUT /api/users/:id\n- DELETE /api/users/:id"
    },
    "userSubmission": {
      "id": "aa0e8400-e29b-41d4-a716-446655440000",
      "status": "GRADED",
      "grade": 85.0,
      "submittedAt": "2025-11-20T10:00:00Z"
    }
  }
}
```

### Error Response (403 Forbidden)

Student attempting to access assignment from unpurchased curriculum:

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You must purchase this curriculum to access its assignments"
  }
}
```

---

## POST `/api/assignments/:id/submit`

Submit assignment solution.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Assignment ID |

### Request Headers

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request Body - QUIZ Submission

```json
{
  "type": "QUIZ",
  "answers": {
    "q1": "Building microservices",
    "q2": "True",
    "q3": "Dependency injection helps manage object lifecycles..."
  },
  "timeSpent": 1234 // seconds
}
```

### Request Body - CODE Submission

```json
{
  "type": "CODE",
  "code": "public class UserController {\n  @GetMapping(\"/api/users\")\n  public List<User> getUsers() {\n    return userService.findAll();\n  }\n}",
  "language": "java"
}
```

### Request Body - FILE Submission

```json
{
  "type": "FILE",
  "fileUrl": "/mock/user123/assignment456/report.pdf", // Mock file path
  "fileName": "project-report.pdf",
  "fileSize": 2048576 // bytes
}
```

### Request Body - TEXT Submission

```json
{
  "type": "TEXT",
  "answer": "My reflection on this lesson:\n\nI learned that Spring Boot simplifies Java development by providing auto-configuration..."
}
```

### Response (201 Created) - Auto-Graded QUIZ

```json
{
  "success": true,
  "data": {
    "submissionId": "aa0e8400-e29b-41d4-a716-446655440000",
    "assignmentId": "990e8400-e29b-41d4-a716-446655440000",
    "status": "GRADED",
    "grade": 80.0,
    "feedback": "Great job! You answered 8 out of 10 questions correctly.",
    "expAwarded": 25,
    "submittedAt": "2025-11-22T10:40:00Z",
    "gradedAt": "2025-11-22T10:40:00Z"
  },
  "message": "🎉 +25 EXP earned!"
}
```

### Response (201 Created) - Manual Grading Required

```json
{
  "success": true,
  "data": {
    "submissionId": "ab0e8400-e29b-41d4-a716-446655440000",
    "assignmentId": "991e8400-e29b-41d4-a716-446655440000",
    "status": "PENDING",
    "submittedAt": "2025-11-22T10:40:00Z"
  },
  "message": "Submission received. Your work will be graded soon."
}
```

### Error Response (400 Bad Request)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid submission format",
    "details": {
      "code": "Code exceeds maximum file size (10MB)"
    }
  }
}
```

---

## GET `/api/assignments/:id/submissions`

Get user's submissions for an assignment.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Assignment ID |

### Request Headers

```
Authorization: Bearer <access_token>
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "submissions": [
      {
        "id": "aa0e8400-e29b-41d4-a716-446655440000",
        "status": "GRADED",
        "grade": 80.0,
        "feedback": "Great job!",
        "submittedAt": "2025-11-22T10:40:00Z",
        "gradedAt": "2025-11-22T10:41:00Z"
      },
      {
        "id": "ac0e8400-e29b-41d4-a716-446655440000",
        "status": "GRADED",
        "grade": 60.0,
        "feedback": "Good effort, but review Chapter 2",
        "submittedAt": "2025-11-21T14:20:00Z",
        "gradedAt": "2025-11-21T16:30:00Z"
      }
    ],
    "latestSubmission": {
      "id": "aa0e8400-e29b-41d4-a716-446655440000",
      "grade": 80.0,
      "status": "GRADED"
    }
  }
}
```

### Notes

- Returns all submissions for the assignment by the current user
- Sorted by `submittedAt` descending (newest first)
- `latestSubmission` is the most recent submission

---

## Assignment Types & Grading

### QUIZ Assignments

**Auto-Graded**:
- Backend compares submitted answers with `correctAnswer` in config
- Calculates grade as percentage of total points
- Immediately returns grade and EXP (if passing)

**Passing Score**: 60% or higher (configurable per quiz)

**Example Grading Logic**:
```
Total Points: 100
Correct Answers: 8/10 questions worth 80 points
Grade: 80%
Status: GRADED
EXP Awarded: 25 (if >= 60%)
```

### CODE Assignments

**Manual Grading**:
- Status: PENDING after submission
- Instructor reviews code and assigns grade
- Instructor provides feedback
- EXP awarded when graded (if >= 60%)

**File Size Limit**: 10MB (configurable)

**Allowed Languages**: java, typescript, python (configurable per assignment)

### FILE Assignments

**Manual Grading**:
- Status: PENDING after submission
- Instructor downloads and reviews file
- Instructor assigns grade and feedback
- EXP awarded when graded (if >= 60%)

**File Size Limit**: 100MB (configurable)

**Allowed Formats**: .pdf, .docx, .zip, .tar.gz (configurable per assignment)

### TEXT Assignments

**Manual Grading**:
- Status: PENDING after submission
- Instructor reviews text response
- Instructor assigns grade and feedback
- EXP awarded when graded (if >= 60%)

**Character Limits**: 100-5000 characters (configurable per assignment)

---

## Business Rules

### Submission Rules

1. **Multiple Submissions Allowed**:
   - Users can resubmit assignments
   - Latest submission is considered active
   - All submissions are stored for history

2. **EXP Award Rules**:
   - EXP awarded only once per assignment
   - Even with multiple submissions, only first passing grade awards EXP
   - Passing grade: >= 60%

3. **Grading Timeline**:
   - QUIZ: Instant (auto-graded)
   - CODE/FILE/TEXT: 1-3 business days (manual grading, SLA out of scope for MVP)

### Access Control

- **Students**: Can submit assignments for purchased lessons only

### Validation

1. **QUIZ**:
   - Must answer all required questions
   - Answers must match question IDs
   - Time limit enforced (if specified)

2. **CODE**:
   - Code must not exceed max file size
   - Language must match assignment config
   - Must be valid syntax (optional validation)

3. **FILE**:
   - File extension must be in allowed list
   - File size must not exceed limit
   - Virus scan (future enhancement)

4. **TEXT**:
   - Must meet minimum character count
   - Must not exceed maximum character count
   - XSS sanitization applied

---

## Example Flows

### Student Submitting Quiz

```
1. Student opens quiz assignment
2. Frontend calls: GET /api/assignments/:id
3. Student answers questions (frontend timer if timeLimit)
4. Student clicks "Submit"
5. Frontend calls: POST /api/assignments/:id/submit
6. Backend auto-grades quiz
7. Backend calculates grade (e.g., 80%)
8. Backend checks if passing (>= 60%) → Yes
9. Backend awards EXP (first submission only)
10. Backend updates user.total_exp and user.current_level
11. Backend returns grade, feedback, expAwarded
12. Frontend shows: "🎉 +25 EXP earned! Grade: 80%"
```

### Student Submitting Code

```
1. Student writes code in editor
2. Student clicks "Submit"
3. Frontend calls: POST /api/assignments/:id/submit
4. Backend validates code size and language
5. Backend creates submission (status = PENDING)
6. Backend returns submissionId
7. Frontend shows: "Submission received. Grading in progress..."
8. (Later) Instructor grades submission manually
9. Backend updates submission (status = GRADED, grade = 85)
10. Backend awards EXP if passing
11. Student sees grade next time they check
```

### Student Checking Submission History

```
1. Student navigates to assignment page
2. Frontend calls: GET /api/assignments/:id/submissions
3. Backend returns all submissions for this user
4. Frontend displays:
   - Latest submission: Grade 80% (Nov 22)
   - Previous submission: Grade 60% (Nov 21)
5. Student can see progress over time
```

---

## Future Enhancements

- **Auto-Grading for CODE**: Run test suites against submitted code
- **Plagiarism Detection**: Check for copied code/text
- **Partial Credit**: Award partial EXP for submissions between 40-60%
- **Submission Comments**: Allow instructors to leave inline comments on code
- **Peer Review**: Students review each other's submissions
