# WaterBallSA (Waterball Secret Agency)

> An online course platform built with specification-driven and behavior-driven development principles

## Overview

WaterBallSA is a modern online learning platform that enables users to access and engage with educational content through a structured curriculum system. The platform emphasizes test-driven quality assurance and leverages industry-standard technologies to deliver a robust learning experience.

## Vision

To provide a seamless, engaging online learning experience where users can:
- Authenticate securely via Google OAuth
- Access purchased course content organized in a clear curriculum structure
- Track their learning progress through gamified achievements
- Submit assignments and earn experience points
- Progress through skill levels based on their learning journey

## Core Features

### Phase 1: Foundation
- **Google OAuth Authentication**: Secure user login via Google accounts (exclusive authentication method)
- **Course Content Delivery**: 
  - Browse and select from available curriculums
  - Navigate through structured curriculum hierarchy
  - Access lesson content (videos, articles, surveys)
- **Content Structure**:
  - **Curriculum** → **Chapters** → **Lessons**
  - Each lesson can contain:
    - One video (optional)
    - Articles (text content)
    - Surveys/questionnaires
- **Infrastructure Setup**: Dockerized deployment architecture

### Phase 2: Access Control & Payment
- **Purchase System**: 
  - Users can only purchase entire curriculums (includes all chapters and lessons)
  - Payment integration for curriculum purchases
- **Permission Management**: Content access based on user purchase history
- **Purchase-Based Authorization**: Users can only view curriculums they've purchased
- **Admin Access**: Admin users can view all content without purchasing

### Phase 3: Engagement & Gamification
- **Assignment System**: 
  - Lesson-specific assignments with multiple submission types:
    - Code submissions
    - File uploads
    - Text answers
    - Quizzes
- **Experience & Progression**:
  - Earn experience points (EXP) upon assignment completion
  - Level progression system based on accumulated EXP
  - Platform-wide user ranking system
  - Leaderboard comparing all users' progress

## Technical Architecture

### Tech Stack

#### Frontend
- **Framework**: Next.js (React-based)
- **Language**: TypeScript (TSX)
- **Package Manager**: Yarn
- **Testing**: 
  - Unit Tests: Jest + React Testing Library
  - Integration Tests: Jest
  - E2E Tests: Playwright
- **Styling**: [TBD - Tailwind CSS / Material-UI / styled-components]

#### Backend
- **Framework**: Spring Boot
- **Language**: Java
- **API Design**: RESTful
- **Testing**:
  - Unit Tests: JUnit 5
  - Integration Tests: Spring Boot Test + TestContainers
  - E2E Tests: REST Assured
- **ORM**: Spring Data JPA (Hibernate)

#### Database
- **Primary Database**: PostgreSQL
- **Migration Tool**: Flyway / Liquibase

#### Infrastructure
- **Containerization**: Docker & Docker Compose

#### Authentication
- **OAuth Provider**: Google OAuth 2.0 (exclusive authentication method)
- **Session Management**: JWT (JSON Web Tokens)

#### Payment Integration
- **Payment Gateway**: [TBD - Stripe / PayPal / Braintree]

### System Architecture

```
┌─────────────────┐
│   Next.js App   │  (Frontend - Port 3000)
│   (TypeScript)  │
└────────┬────────┘
         │
         │ HTTP/REST
         │
┌────────▼────────┐
│  Spring Boot    │  (Backend API - Port 8080)
│     (Java)      │
└────────┬────────┘
         │
         │ JDBC
         │
┌────────▼────────┐
│   PostgreSQL    │  (Database - Port 5432)
└─────────────────┘
```

## Development Principles

### Specification-Driven Development (SDD)
- All features begin with clear, written specifications
- Specifications define expected behavior before implementation
- Living documentation that evolves with the project

### Behavior-Driven Development (BDD)
- Features described in business-readable language
- Given-When-Then scenario format
- Executable specifications that serve as tests

### Testing Strategy

We prioritize comprehensive testing at all levels:

1. **End-to-End (E2E) Tests** ⭐ Primary Focus
   - User journey validation from login to assignment submission
   - Cross-system integration verification
   - Purchase flow and payment integration testing
   - **Frontend**: Playwright
   - **Backend**: REST Assured

2. **Integration Tests**
   - API endpoint testing with real database (TestContainers)
   - OAuth flow integration
   - Payment gateway integration
   - Database transaction validation
   - **Frontend**: Jest with API mocking
   - **Backend**: Spring Boot Test + TestContainers

3. **Unit Tests**
   - React component testing
   - Business logic validation
   - Service layer testing
   - Utility function testing
   - **Frontend**: Jest + React Testing Library
   - **Backend**: JUnit 5 + Mockito

### Code Quality Standards
- Type safety enforced via TypeScript
- Code reviews required for all changes
- Automated linting (ESLint for frontend, Checkstyle for backend)
- Automated formatting (Prettier for frontend, Google Java Format for backend)
- Test coverage requirements: Minimum 80% for critical paths

## Project Structure

```
waterballsa/
├── frontend/              # Next.js application
│   ├── src/
│   │   ├── app/          # Next.js app directory
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities and helpers
│   │   └── types/        # TypeScript type definitions
│   ├── tests/
│   │   ├── e2e/          # End-to-end tests
│   │   ├── integration/  # Integration tests
│   │   └── unit/         # Unit tests
│   ├── Dockerfile
│   └── package.json
│
├── backend/              # Spring Boot application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   ├── Dockerfile
│   └── pom.xml / build.gradle
│
├── database/
│   ├── migrations/       # Database migration scripts
│   └── seeds/            # Seed data for development
│
├── docker-compose.yml    # Local development orchestration
├── docs/                 # Additional documentation
│   ├── specifications/   # Feature specifications
│   └── api/              # API documentation
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js**: v18+ (for frontend)
- **Java**: JDK 17+ (for backend)
- **Yarn**: v1.22+ (package manager)
- **Docker**: v20+ (containerization)
- **Docker Compose**: v2+ (orchestration)
- **PostgreSQL**: v14+ (if running locally without Docker)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/andrew54068/WaterBallSA.git
   cd waterballsa
   ```

2. **Set up environment variables**
   ```bash
   # Frontend
   cp frontend/.env.example frontend/.env.local
   
   # Backend
   cp backend/.env.example backend/.env
   ```

3. **Configure Google OAuth** (Required - exclusive authentication method)
   - Create a project in [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - Development: `http://localhost:3000/api/auth/callback/google`
     - Production: `https://yourdomain.com/api/auth/callback/google`
   - Update environment variables with Client ID and Secret

4. **Configure Payment Gateway** (Phase 2)
   - Set up payment provider account
   - Obtain API keys (test and production)
   - Configure webhook endpoints
   - Update environment variables with payment credentials

5. **Start the application with Docker**
   ```bash
   docker-compose up -d
   ```
   or 
   ```bash
   docker compose up -d
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - Database: localhost:5432

### Development Workflow

#### Running Frontend Locally
```bash
cd frontend
yarn install
yarn dev
```

#### Running Backend Locally
```bash
cd backend
./mvnw spring-boot:run
# or with Gradle
./gradlew bootRun
```

#### Running Tests

**Frontend Tests**
```bash
cd frontend
yarn test              # Unit tests (Jest + React Testing Library)
yarn test:integration  # Integration tests (Jest)
yarn test:e2e          # E2E tests (Playwright)
yarn test:coverage     # Generate coverage report
```

**Backend Tests**
```bash
cd backend
./mvnw test                              # All tests (JUnit 5)
./mvnw test -Dtest=*IntegrationTest      # Integration tests only (TestContainers)
./mvnw test -Dtest=*E2ETest              # E2E tests only (REST Assured)
./mvnw verify                            # Run all tests with coverage
```

## API Documentation

API documentation will be available at:
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI Spec**: http://localhost:8080/v3/api-docs

### API Specification

**Base URL**: `http://localhost:8080/api` (Development)

**Authentication**: All endpoints (except auth endpoints) require JWT token in `Authorization` header:
```
Authorization: Bearer <access_token>
```

**Standard Response Format**:
```typescript
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation successful" // Optional
}

// Error Response
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "INTERNAL_ERROR",
    "message": "Human-readable error message",
    "details": { ... } // Optional, validation errors, etc.
  },
  "timestamp": "2025-11-22T10:30:00Z"
}
```

**Pagination Format** (for list endpoints):
```typescript
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalItems": 156,
      "totalPages": 8,
      "hasNext": true,
      "hasPrevious": false
    }
  }
}
```

---

### Authentication Endpoints

#### POST `/api/auth/google/callback`
**Description**: Handle Google OAuth callback and issue JWT tokens

**Request**:
```json
{
  "code": "4/0AY0e-g7...", // Google OAuth authorization code
  "redirectUri": "http://localhost:3000/auth/callback"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900, // 15 minutes in seconds
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe",
      "avatarUrl": "https://lh3.googleusercontent.com/...",
      "role": "STUDENT",
      "totalExp": 1250,
      "currentLevel": 4,
      "userRank": 42
    }
  }
}
```

---

#### POST `/api/auth/refresh`
**Description**: Refresh access token using refresh token

**Request**:
```json
{
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

---

#### POST `/api/auth/logout`
**Description**: Invalidate refresh token (add to blacklist)

**Request Headers**:
```
Authorization: Bearer <access_token>
```

**Request**:
```json
{
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### GET `/api/auth/me`
**Description**: Get current user profile

**Request Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "avatarUrl": "https://lh3.googleusercontent.com/...",
    "role": "STUDENT",
    "totalExp": 1250,
    "currentLevel": 4,
    "userRank": 42,
    "expToNextLevel": 350, // 1600 - 1250
    "createdAt": "2025-01-15T08:30:00Z"
  }
}
```

---

### Curriculum Endpoints

#### GET `/api/curriculums`
**Description**: List all published curriculums (students) or all curriculums (admins)

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 20, max: 100)
- `purchased` (optional): Filter by purchase status (`true` | `false`) - Students only

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Java Spring Boot Mastery",
        "description": "Complete guide to building production-ready applications",
        "price": 99.99,
        "thumbnailUrl": "https://s3.amazonaws.com/waterballsa/thumbnails/java-spring.jpg",
        "isPublished": true,
        "chapterCount": 12,
        "lessonCount": 87,
        "isPurchased": false, // For current user
        "createdAt": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalItems": 15,
      "totalPages": 1,
      "hasNext": false,
      "hasPrevious": false
    }
  }
}
```

---

#### GET `/api/curriculums/:id`
**Description**: Get curriculum details with chapters and lessons

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Java Spring Boot Mastery",
    "description": "Complete guide to building production-ready applications",
    "price": 99.99,
    "thumbnailUrl": "https://s3.amazonaws.com/waterballsa/thumbnails/java-spring.jpg",
    "isPublished": true,
    "isPurchased": false,
    "chapters": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440000",
        "title": "Introduction to Spring Boot",
        "description": "Get started with Spring Boot basics",
        "orderIndex": 0,
        "lessonCount": 8,
        "lessons": [
          {
            "id": "770e8400-e29b-41d4-a716-446655440000",
            "title": "What is Spring Boot?",
            "type": "VIDEO",
            "orderIndex": 0,
            "videoDuration": 600, // 10 minutes in seconds
            "isCompleted": false // User progress
          }
        ]
      }
    ],
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

**Error Response** (403 Forbidden - unpurchased):
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You must purchase this curriculum to access its content",
    "details": {
      "curriculumId": "550e8400-e29b-41d4-a716-446655440000",
      "price": 99.99
    }
  }
}
```

---

#### POST `/api/curriculums/:id/purchase`
**Description**: Purchase a curriculum (mock payment)

**Request**:
```json
{
  "mockPaymentId": "mock_1732272000000_abc123", // Generated by frontend
  "cardLast4": "4242" // Mock card info for display
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "purchaseId": "880e8400-e29b-41d4-a716-446655440000",
    "curriculumId": "550e8400-e29b-41d4-a716-446655440000",
    "amount": 99.99,
    "paymentProvider": "MOCK",
    "paymentId": "mock_1732272000000_abc123",
    "status": "COMPLETED",
    "purchasedAt": "2025-11-22T10:30:00Z"
  },
  "message": "Curriculum purchased successfully!"
}
```

**Error Response** (409 Conflict - already purchased):
```json
{
  "success": false,
  "error": {
    "code": "ALREADY_PURCHASED",
    "message": "You have already purchased this curriculum",
    "details": {
      "purchaseId": "880e8400-e29b-41d4-a716-446655440000",
      "purchasedAt": "2025-11-20T15:22:00Z"
    }
  }
}
```

---

### Lesson Endpoints

#### GET `/api/lessons/:id`
**Description**: Get lesson details (requires purchase or admin role)

**Response** (200 OK - VIDEO lesson):
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

**Response** (200 OK - ARTICLE lesson):
```json
{
  "success": true,
  "data": {
    "id": "771e8400-e29b-41d4-a716-446655440000",
    "title": "Spring Boot Architecture",
    "type": "ARTICLE",
    "articleContent": "# Spring Boot Architecture\n\nSpring Boot follows a layered architecture...",
    "isCompleted": true,
    "completedAt": "2025-11-20T14:30:00Z"
  }
}
```

---

#### POST `/api/lessons/:id/complete`
**Description**: Mark lesson as completed

**Response** (200 OK):
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

---

### Assignment Endpoints

#### GET `/api/assignments/:id`
**Description**: Get assignment details

**Response** (200 OK - QUIZ):
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
      "timeLimit": 1800 // 30 minutes
    },
    "userSubmission": null // or submission object if exists
  }
}
```

---

#### POST `/api/assignments/:id/submit`
**Description**: Submit assignment solution

**Request** (QUIZ submission):
```json
{
  "type": "QUIZ",
  "answers": {
    "q1": "Building microservices",
    "q2": "True",
    "q3": "Dependency injection helps..."
  },
  "timeSpent": 1234
}
```

**Request** (CODE submission):
```json
{
  "type": "CODE",
  "code": "public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hello\");\n  }\n}",
  "language": "java"
}
```

**Response** (201 Created - auto-graded QUIZ):
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

**Response** (201 Created - manual grading):
```json
{
  "success": true,
  "data": {
    "submissionId": "ab0e8400-e29b-41d4-a716-446655440000",
    "status": "PENDING",
    "submittedAt": "2025-11-22T10:40:00Z"
  },
  "message": "Submission received. Your work will be graded soon."
}
```

---

#### GET `/api/assignments/:id/submissions`
**Description**: Get user's submissions for an assignment

**Response** (200 OK):
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

---

### User Endpoints

#### GET `/api/users/me/dashboard`
**Description**: Get user dashboard data (EXP, level, progress)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "avatarUrl": "https://lh3.googleusercontent.com/...",
      "totalExp": 1250,
      "currentLevel": 4,
      "userRank": 42,
      "expToNextLevel": 350
    },
    "stats": {
      "curriculumsPurchased": 3,
      "lessonsCompleted": 45,
      "assignmentsCompleted": 28,
      "totalStudents": 1234
    },
    "recentActivity": [
      {
        "type": "ASSIGNMENT_GRADED",
        "message": "Your quiz was graded: 80%",
        "timestamp": "2025-11-22T10:41:00Z"
      },
      {
        "type": "LEVEL_UP",
        "message": "You reached Level 4!",
        "timestamp": "2025-11-21T18:30:00Z"
      }
    ]
  }
}
```

---

#### GET `/api/users/leaderboard`
**Description**: Get global leaderboard

**Query Parameters**:
- `limit` (optional): Number of top users to return (default: 100, max: 100)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "top100": [
      {
        "rank": 1,
        "userId": "user1-uuid",
        "name": "Alice Chen",
        "avatarUrl": "https://...",
        "level": 12,
        "totalExp": 15000
      },
      {
        "rank": 2,
        "userId": "user2-uuid",
        "name": "Bob Lin",
        "level": 11,
        "totalExp": 13500
      }
    ],
    "currentUser": {
      "rank": 247,
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "name": "You",
      "level": 8,
      "totalExp": 6200
    },
    "nearbyUsers": [
      {
        "rank": 245,
        "name": "User A",
        "level": 8,
        "totalExp": 6220
      },
      {
        "rank": 246,
        "name": "User B",
        "level": 8,
        "totalExp": 6210
      },
      {
        "rank": 247,
        "name": "You",
        "level": 8,
        "totalExp": 6200,
        "isCurrentUser": true
      },
      {
        "rank": 248,
        "name": "User C",
        "level": 8,
        "totalExp": 6190
      }
    ]
  }
}
```

---

### Admin Endpoints

#### PATCH `/api/admin/submissions/:id/grade`
**Description**: Grade a submission manually (admin only)

**Request**:
```json
{
  "grade": 85.0,
  "feedback": "Excellent work! Your code is clean and follows best practices. Consider adding more edge case handling."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "submissionId": "ab0e8400-e29b-41d4-a716-446655440000",
    "status": "GRADED",
    "grade": 85.0,
    "feedback": "Excellent work!...",
    "expAwarded": 50,
    "gradedAt": "2025-11-22T11:00:00Z"
  }
}
```

**Error Response** (403 Forbidden - student attempting):
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Only admins can grade submissions"
  }
}
```

---

#### GET `/api/admin/submissions`
**Description**: Get all submissions (admin only)

**Query Parameters**:
- `status` (optional): Filter by status (PENDING | GRADED | REJECTED)
- `assignmentId` (optional): Filter by assignment
- `page`, `pageSize`: Pagination

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "ab0e8400-e29b-41d4-a716-446655440000",
        "user": {
          "id": "user-uuid",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "assignment": {
          "id": "assignment-uuid",
          "title": "Build a REST API"
        },
        "status": "PENDING",
        "submittedAt": "2025-11-22T10:40:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

### Error Codes Reference

| HTTP Status | Error Code | Description |
|------------|------------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid request body or parameters |
| 401 | `UNAUTHORIZED` | Missing or invalid JWT token |
| 403 | `FORBIDDEN` | Insufficient permissions (e.g., unpurchased content) |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Resource conflict (e.g., duplicate purchase) |
| 409 | `ALREADY_PURCHASED` | Curriculum already purchased |
| 500 | `INTERNAL_ERROR` | Server error |

---

### Rate Limiting

All API endpoints are rate-limited:
- **Unauthenticated requests**: 100 requests/hour per IP
- **Authenticated requests**: 1000 requests/hour per user
- **Login endpoint**: 5 attempts/15 minutes per IP

**Rate Limit Headers**:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1732275600 (Unix timestamp)
```

**Rate Limit Exceeded Response** (429 Too Many Requests):
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 15 minutes.",
    "details": {
      "retryAfter": 900 // Seconds
    }
  }
}
```

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐
│     Users       │
├─────────────────┤
│ id (UUID) PK    │
│ email           │
│ google_id       │◀────────────────┐
│ name            │                 │
│ avatar_url      │                 │
│ role (enum)     │                 │
│ total_exp       │                 │
│ current_level   │                 │
│ user_rank       │ (denormalized)  │
│ created_at      │                 │
│ updated_at      │                 │
└────────┬────────┘                 │
         │                          │
         │ 1:N                      │ N:1
         │                          │
┌────────▼────────┐        ┌────────┴────────┐
│   Purchases     │        │  Submissions    │
├─────────────────┤        ├─────────────────┤
│ id (UUID) PK    │        │ id (UUID) PK    │
│ user_id FK      │        │ user_id FK      │
│ curriculum_id FK│        │ assignment_id FK│
│ amount          │        │ content (JSON)  │
│ payment_provider│        │ status (enum)   │
│ payment_id      │        │ grade           │
│ status (enum)   │        │ feedback        │
│ purchased_at    │        │ submitted_at    │
└────────┬────────┘        │ graded_at       │
         │                 └─────────────────┘
         │ N:1                      │
         │                          │ N:1
┌────────▼────────┐                 │
│  Curriculums    │                 │
├─────────────────┤                 │
│ id (UUID) PK    │                 │
│ title           │                 │
│ description     │                 │
│ price           │                 │
│ thumbnail_url   │                 │
│ is_published    │                 │
│ created_at      │                 │
│ updated_at      │                 │
│ deleted_at      │                 │
└────────┬────────┘                 │
         │                          │
         │ 1:N                      │
         │                          │
┌────────▼────────┐                 │
│    Chapters     │                 │
├─────────────────┤                 │
│ id (UUID) PK    │                 │
│ curriculum_id FK│                 │
│ title           │                 │
│ description     │                 │
│ order_index     │                 │
│ created_at      │                 │
│ updated_at      │                 │
└────────┬────────┘                 │
         │                          │
         │ 1:N                      │
         │                          │
┌────────▼────────┐                 │
│    Lessons      │                 │
├─────────────────┤                 │
│ id (UUID) PK    │                 │
│ chapter_id FK   │                 │
│ title           │                 │
│ type (enum)     │ VIDEO/ARTICLE/  │
│ order_index     │ SURVEY          │
│ video_url       │ (nullable)      │
│ video_duration  │ (nullable)      │
│ article_content │ (nullable)      │
│ survey_config   │ (JSON)          │
│ created_at      │                 │
│ updated_at      │                 │
└────────┬────────┘                 │
         │                          │
         │ 1:N                      │
         │                          │
┌────────▼────────┐                 │
│  Assignments    │                 │
├─────────────────┤                 │
│ id (UUID) PK    │                 │
│ lesson_id FK    │                 │
│ title           │                 │
│ description     │                 │
│ type (enum)     │ CODE/FILE/      │
│ config (JSON)   │ TEXT/QUIZ       │
│ exp_reward      │                 │
│ created_at      │─────────────────┘
│ updated_at      │
└─────────────────┘

Additional Table:
┌─────────────────┐
│ User_Progress   │
├─────────────────┤
│ id (UUID) PK    │
│ user_id FK      │
│ lesson_id FK    │
│ completed       │
│ completed_at    │
│ UNIQUE(user_id, │
│  lesson_id)     │
└─────────────────┘
```

### Detailed Schema Definitions

#### Users Table

```sql
CREATE TYPE user_role AS ENUM ('STUDENT', 'ADMIN');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    google_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role user_role DEFAULT 'STUDENT' NOT NULL,
    total_exp INTEGER DEFAULT 0 NOT NULL CHECK (total_exp >= 0),
    current_level INTEGER DEFAULT 1 NOT NULL CHECK (current_level >= 1),
    user_rank INTEGER, -- Denormalized, updated by trigger/job
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_rank ON users(user_rank) WHERE user_rank IS NOT NULL;
```

**Business Rules**:
- `google_id` is immutable after creation (enforced in application layer)
- `email` must match Google account email
- Default role is `STUDENT` for all new users
- `user_rank` recalculated nightly via background job or trigger on exp changes
- Soft delete not applicable (users should never be deleted for audit trail)

---

#### Curriculums Table

```sql
CREATE TABLE curriculums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    thumbnail_url TEXT,
    is_published BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP -- Soft delete for audit trail
);

CREATE INDEX idx_curriculums_published ON curriculums(is_published) WHERE deleted_at IS NULL;
CREATE INDEX idx_curriculums_deleted ON curriculums(deleted_at);
```

**Business Rules**:
- Price is in USD (decimal precision for cents)
- Unpublished curriculums (`is_published = false`) are not visible to students
- Soft deletes preserve purchase history integrity
- `thumbnail_url` points to S3 object (e.g., `https://s3.amazonaws.com/waterballsa/thumbnails/...`)

---

#### Chapters Table

```sql
CREATE TABLE chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curriculum_id UUID NOT NULL REFERENCES curriculums(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL CHECK (order_index >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(curriculum_id, order_index)
);

CREATE INDEX idx_chapters_curriculum ON chapters(curriculum_id, order_index);
```

**Business Rules**:
- `order_index` determines chapter sequence (0-based)
- Unique constraint ensures no duplicate order within same curriculum
- Cascade delete: Deleting curriculum deletes all chapters
- Chapters cannot exist without a parent curriculum

---

#### Lessons Table

```sql
CREATE TYPE lesson_type AS ENUM ('VIDEO', 'ARTICLE', 'SURVEY');

CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type lesson_type NOT NULL,
    order_index INTEGER NOT NULL CHECK (order_index >= 0),
    video_url TEXT CHECK (
        (type = 'VIDEO' AND video_url IS NOT NULL) OR
        (type != 'VIDEO' AND video_url IS NULL)
    ),
    video_duration INTEGER, -- In seconds, nullable
    article_content TEXT CHECK (
        (type = 'ARTICLE' AND article_content IS NOT NULL) OR
        (type != 'ARTICLE' AND article_content IS NULL)
    ),
    survey_config JSONB CHECK (
        (type = 'SURVEY' AND survey_config IS NOT NULL) OR
        (type != 'SURVEY' AND survey_config IS NULL)
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(chapter_id, order_index)
);

CREATE INDEX idx_lessons_chapter ON lessons(chapter_id, order_index);
CREATE INDEX idx_lessons_type ON lessons(type);
```

**Business Rules**:
- Each lesson has exactly ONE type (VIDEO, ARTICLE, or SURVEY)
- CHECK constraints enforce type-specific fields:
  - VIDEO lessons MUST have `video_url`, MUST NOT have article/survey content
  - ARTICLE lessons MUST have `article_content`, MUST NOT have video/survey
  - SURVEY lessons MUST have `survey_config` (JSONB), MUST NOT have video/article
- `video_url` format: `https://s3.amazonaws.com/waterballsa/videos/{curriculumId}/{lessonId}/playlist.m3u8` (HLS)
- `survey_config` JSON structure:
  ```json
  {
    "questions": [
      {
        "id": "q1",
        "text": "What did you learn?",
        "type": "TEXT" | "MULTIPLE_CHOICE" | "RATING",
        "required": true,
        "options": ["Option A", "Option B"] // Only for MULTIPLE_CHOICE
      }
    ]
  }
  ```

---

#### Purchases Table

```sql
CREATE TYPE purchase_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    curriculum_id UUID NOT NULL REFERENCES curriculums(id) ON DELETE RESTRICT,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    payment_provider VARCHAR(50) NOT NULL DEFAULT 'MOCK', -- 'MOCK', 'STRIPE', 'PAYPAL'
    payment_id VARCHAR(255) NOT NULL, -- External payment provider ID
    status purchase_status DEFAULT 'PENDING' NOT NULL,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(user_id, curriculum_id) -- User cannot purchase same curriculum twice
);

CREATE INDEX idx_purchases_user ON purchases(user_id, status);
CREATE INDEX idx_purchases_curriculum ON purchases(curriculum_id);
CREATE INDEX idx_purchases_payment ON purchases(payment_id);
```

**Business Rules**:
- UNIQUE constraint: One user can purchase a curriculum only once
- `amount` should match curriculum price at time of purchase (denormalized for audit)
- `payment_provider` = 'MOCK' for all purchases in Phase 1-3
- `payment_id` format for mock: `mock_{timestamp}_{randomUUID}`
- RESTRICT delete: Cannot delete users/curriculums with purchase history
- Only `COMPLETED` purchases grant content access

---

#### Assignments Table

```sql
CREATE TYPE assignment_type AS ENUM ('CODE', 'FILE', 'TEXT', 'QUIZ');

CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type assignment_type NOT NULL,
    config JSONB NOT NULL, -- Type-specific configuration
    exp_reward INTEGER NOT NULL CHECK (exp_reward > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_assignments_lesson ON assignments(lesson_id);
```

**Business Rules**:
- One lesson can have multiple assignments
- `exp_reward` is fixed per assignment (defined by admin/content creator)
- `config` JSON structure varies by type:

  **CODE Assignment**:
  ```json
  {
    "language": "java" | "typescript" | "python",
    "allowedExtensions": [".java", ".ts", ".py"],
    "maxFileSize": 10485760, // 10MB in bytes
    "instructions": "Implement the function..."
  }
  ```

  **FILE Assignment**:
  ```json
  {
    "allowedFormats": [".pdf", ".docx", ".zip"],
    "maxFileSize": 104857600, // 100MB in bytes
    "instructions": "Upload your project report..."
  }
  ```

  **TEXT Assignment**:
  ```json
  {
    "minLength": 100,
    "maxLength": 5000,
    "placeholder": "Share your reflections..."
  }
  ```

  **QUIZ Assignment**:
  ```json
  {
    "questions": [
      {
        "id": "q1",
        "question": "What is polymorphism?",
        "type": "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER",
        "options": ["A", "B", "C", "D"], // For MULTIPLE_CHOICE
        "correctAnswer": "A", // For auto-grading
        "points": 10
      }
    ],
    "passingScore": 70, // Percentage
    "timeLimit": 3600 // Seconds, nullable
  }
  ```

---

#### Submissions Table

```sql
CREATE TYPE submission_status AS ENUM ('PENDING', 'GRADED', 'REJECTED');

CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    content JSONB NOT NULL, -- Submission data
    status submission_status DEFAULT 'PENDING' NOT NULL,
    grade NUMERIC(5, 2) CHECK (grade >= 0 AND grade <= 100), -- Percentage, nullable
    feedback TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    graded_at TIMESTAMP
);

CREATE INDEX idx_submissions_assignment_user ON submissions(assignment_id, user_id);
CREATE INDEX idx_submissions_user_status ON submissions(user_id, status);
```

**Business Rules**:
- Users can submit multiple times (latest submission is active)
- Only `GRADED` submissions with `grade >= passing_score` award EXP
- EXP awarded only once per assignment (even with multiple submissions)
- `content` JSON structure varies by assignment type:

  **CODE Submission**:
  ```json
  {
    "type": "CODE",
    "fileUrl": "/mock/user123/assignment456/Main.java", // Mock path
    "code": "public class Main { ... }", // Inline code
    "language": "java"
  }
  ```

  **FILE Submission**:
  ```json
  {
    "type": "FILE",
    "fileUrl": "/mock/user123/assignment456/report.pdf",
    "fileName": "report.pdf",
    "fileSize": 2048576
  }
  ```

  **TEXT Submission**:
  ```json
  {
    "type": "TEXT",
    "answer": "My reflection on this lesson is..."
  }
  ```

  **QUIZ Submission**:
  ```json
  {
    "type": "QUIZ",
    "answers": {
      "q1": "A",
      "q2": "True",
      "q3": "Short answer text..."
    },
    "timeSpent": 1234 // Seconds
  }
  ```

**Grading Rules** (Phase 3 consideration):
- QUIZ: Auto-graded by comparing `answers` with `correctAnswer` in assignment config
- CODE/FILE/TEXT: Manual grading (admin interface out of scope, can be done directly in DB for MVP)
- Trigger on status change to `GRADED` → Award EXP if grade >= passing score

---

#### User_Progress Table

```sql
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    completed_at TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_user_progress_user ON user_progress(user_id, completed);
CREATE INDEX idx_user_progress_lesson ON user_progress(lesson_id);
```

**Business Rules**:
- Tracks which lessons each user has completed
- Completion criteria (application logic):
  - VIDEO: Watched 80% or marked complete
  - ARTICLE: Scrolled to bottom or marked complete
  - SURVEY: Submitted survey response
- Used for progress tracking UI (e.g., "3/10 lessons completed")
- Independent of assignments (user can complete lesson without submitting assignment)

---

### Database Triggers & Functions

#### Auto-Update Timestamps

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_curriculums_updated_at BEFORE UPDATE ON curriculums
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ... apply to all tables
```

#### Auto-Calculate User Rank

```sql
CREATE OR REPLACE FUNCTION update_user_rank()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculate rank for all users (can be optimized with background job)
    WITH ranked_users AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY total_exp DESC, created_at ASC) AS rank
        FROM users
        WHERE role = 'STUDENT'
    )
    UPDATE users u
    SET user_rank = r.rank
    FROM ranked_users r
    WHERE u.id = r.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_rank AFTER UPDATE OF total_exp ON users
    FOR EACH ROW EXECUTE FUNCTION update_user_rank();
```

**Note**: For performance, rank recalculation should be moved to a nightly cron job in production. The trigger is suitable for MVP with <1000 users.

#### Award EXP on Graded Submission

```sql
CREATE OR REPLACE FUNCTION award_exp_on_graded_submission()
RETURNS TRIGGER AS $$
DECLARE
    assignment_exp INTEGER;
    passing_grade NUMERIC;
    already_awarded BOOLEAN;
BEGIN
    -- Only award EXP when status changes to GRADED
    IF NEW.status = 'GRADED' AND OLD.status != 'GRADED' THEN
        -- Get assignment EXP reward
        SELECT exp_reward INTO assignment_exp
        FROM assignments
        WHERE id = NEW.assignment_id;

        -- Check if user already received EXP for this assignment
        SELECT EXISTS(
            SELECT 1 FROM submissions
            WHERE assignment_id = NEW.assignment_id
              AND user_id = NEW.user_id
              AND status = 'GRADED'
              AND id != NEW.id
        ) INTO already_awarded;

        -- Award EXP if grade is passing and not already awarded
        IF NOT already_awarded AND NEW.grade >= 60 THEN -- 60% passing grade
            UPDATE users
            SET total_exp = total_exp + assignment_exp
            WHERE id = NEW.user_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_award_exp AFTER UPDATE ON submissions
    FOR EACH ROW EXECUTE FUNCTION award_exp_on_graded_submission();
```

---

### User Roles

#### Student Role

**Permissions**:
- ✅ View purchased curriculums, chapters, lessons
- ✅ Submit assignments for purchased lessons
- ✅ View own submissions and grades
- ✅ View own ranking and EXP
- ✅ View global leaderboard
- ❌ Access unpurchased content (403 Forbidden)
- ❌ View other users' submissions
- ❌ Modify grades or content

**Access Check Query**:
```sql
-- Check if student can access lesson
SELECT EXISTS(
    SELECT 1
    FROM purchases p
    JOIN curriculums c ON p.curriculum_id = c.id
    JOIN chapters ch ON ch.curriculum_id = c.id
    JOIN lessons l ON l.chapter_id = ch.id
    WHERE p.user_id = :userId
      AND p.status = 'COMPLETED'
      AND l.id = :lessonId
) AS has_access;
```

---

#### Admin Role

**Permissions**:
- ✅ View all curriculums, chapters, lessons (bypass purchase check)
- ✅ View all submissions (for support purposes)
- ✅ Grade submissions (manually set `grade` and `feedback`)
- ✅ View all user rankings and statistics
- ❌ Create/edit/delete content (backstage out of scope)
- ❌ Manage users (out of scope)
- ❌ Process refunds (out of scope)

**Implementation Note**: Admin access check simply verifies `role = 'ADMIN'` in JWT, bypasses purchase validation.

---

### Data Integrity Constraints Summary

| Constraint Type | Example | Purpose |
|----------------|---------|---------|
| **Primary Keys** | `id UUID PRIMARY KEY` | Unique row identification |
| **Foreign Keys** | `user_id REFERENCES users(id)` | Referential integrity |
| **Unique Constraints** | `UNIQUE(user_id, curriculum_id)` | Prevent duplicate purchases |
| **Check Constraints** | `CHECK (total_exp >= 0)` | Data validation |
| **Not Null** | `email VARCHAR(255) NOT NULL` | Required fields |
| **Indexes** | `idx_purchases_user` | Query performance |
| **Triggers** | `update_user_rank()` | Auto-calculations |
| **Enums** | `CREATE TYPE user_role AS ENUM` | Type safety |
| **Cascade Deletes** | `ON DELETE CASCADE` | Orphan prevention |
| **Restrict Deletes** | `ON DELETE RESTRICT` | Audit trail preservation |

---

## Gamification System

### Experience Points (EXP) & Leveling

**EXP Calculation**:
- EXP is awarded upon successful assignment completion (grade >= 60%)
- Each assignment has a fixed `exp_reward` value set by content creator
- EXP is awarded **only once** per assignment (even if resubmitted multiple times)
- Recommended EXP ranges by assignment type:
  - **QUIZ**: 10-50 EXP (based on difficulty)
  - **TEXT**: 25-75 EXP (based on length/complexity)
  - **CODE**: 50-150 EXP (based on complexity)
  - **FILE**: 25-100 EXP (based on deliverable scope)

**Level Progression Formula**:
```
Level = floor(sqrt(total_exp / 100)) + 1

Examples:
- 0-99 EXP → Level 1
- 100-399 EXP → Level 2
- 400-899 EXP → Level 3
- 900-1599 EXP → Level 4
- 1600-2499 EXP → Level 5
...
- 10000+ EXP → Level 11

EXP required for next level:
next_level_exp = (current_level^2) * 100

Examples:
- Level 1 → 2: Need 100 EXP total (100 more)
- Level 2 → 3: Need 400 EXP total (300 more)
- Level 3 → 4: Need 900 EXP total (500 more)
- Level 4 → 5: Need 1600 EXP total (700 more)
```

**Rationale for Square Root Formula**:
- **Early Progression**: New users level up quickly (encourages engagement)
- **Balanced Grind**: Mid-levels require reasonable effort
- **Long-term Goals**: High levels are aspirational (Level 10+ for dedicated learners)
- **Predictable**: Transparent formula, no hidden mechanics

**Implementation**:
```java
public static int calculateLevel(int totalExp) {
    return (int) Math.floor(Math.sqrt(totalExp / 100.0)) + 1;
}

public static int expRequiredForLevel(int level) {
    return (level - 1) * (level - 1) * 100;
}

public static int expRequiredForNextLevel(int currentExp) {
    int currentLevel = calculateLevel(currentExp);
    return expRequiredForLevel(currentLevel + 1) - currentExp;
}
```

**Level Storage**:
- `current_level` is **denormalized** in users table (calculated from `total_exp`)
- Automatically updated via database trigger or application logic on EXP change
- Why denormalized? Performance (avoid calculating on every query)

---

### Ranking System

**Ranking Calculation**:
```sql
-- Global ranking query (students only)
SELECT
    id,
    name,
    total_exp,
    current_level,
    ROW_NUMBER() OVER (ORDER BY total_exp DESC, created_at ASC) AS rank
FROM users
WHERE role = 'STUDENT'
ORDER BY rank;
```

**Ranking Rules**:
1. **Primary Sort**: Total EXP (descending) - Higher EXP = Higher rank
2. **Tiebreaker**: Account creation date (ascending) - Older account wins ties
3. **Exclusions**: Admin users are **not** included in rankings
4. **Rank #1**: User with highest EXP (or earliest account if tied)

**Rank Storage Strategy**:
- **Option 1 (MVP)**: Calculate on-demand (query above)
  - Pros: Always accurate, no sync issues
  - Cons: Expensive for large user base (full table scan)

- **Option 2 (Recommended)**: Denormalized `user_rank` column
  - Updated nightly via cron job (or trigger for real-time)
  - Cached in Redis with 1-hour TTL for leaderboard queries
  - Pros: Fast queries, scales to millions of users
  - Cons: Slightly stale data (acceptable for leaderboard)

**Leaderboard Display**:
- **Top 100**: Show top 100 users globally
- **User's Position**: Always show current user's rank (even if outside top 100)
- **Nearby Users**: Show ±5 users around current user's rank for context

**Example Leaderboard Response**:
```json
{
  "top100": [
    { "rank": 1, "name": "Alice Chen", "level": 12, "exp": 15000 },
    { "rank": 2, "name": "Bob Lin", "level": 11, "exp": 13500 },
    ...
  ],
  "currentUser": {
    "rank": 247,
    "name": "You",
    "level": 8,
    "exp": 6200
  },
  "nearbyUsers": [
    { "rank": 245, "name": "User A", "level": 8, "exp": 6220 },
    { "rank": 246, "name": "User B", "level": 8, "exp": 6210 },
    { "rank": 247, "name": "You", "level": 8, "exp": 6200 },
    { "rank": 248, "name": "User C", "level": 8, "exp": 6190 },
    { "rank": 249, "name": "User D", "level": 8, "exp": 6180 }
  ]
}
```

---

### Gamification UI Elements

**User Profile Display**:
```
┌─────────────────────────────────────┐
│  Level 5 Learner                    │
│  ████████████░░░░░░░░ 1823/2500 EXP │
│  Next level in 677 EXP              │
│  Rank: #42 out of 1,234 students    │
└─────────────────────────────────────┘
```

**Assignment Completion Notification**:
```
🎉 Assignment Complete!
+50 EXP earned
Progress: 1823/2500 EXP (677 to Level 6)
```

**Level Up Notification**:
```
⭐ LEVEL UP! ⭐
You reached Level 6!
Keep learning to climb the leaderboard!
Current Rank: #42
```

---

### Future Gamification Enhancements (Out of Scope for MVP)

- **Badges/Achievements**: "Complete 10 lessons", "Reach Level 10", "Top 10 Leaderboard"
- **Streaks**: Daily login streaks, assignment submission streaks
- **Bonus EXP**: 2x EXP weekends, first submission bonuses
- **Curriculum Mastery**: Bronze/Silver/Gold badges per curriculum completion
- **Certificates**: PDF certificate generation upon curriculum completion

---

## Business Rules

### Content Access Rules

1. **Curriculum Visibility**:
   - ✅ All **published** curriculums visible to all users (browse catalog)
   - ❌ **Unpublished** curriculums (`is_published = false`) hidden from students
   - ✅ Admins can see all curriculums regardless of publish status

2. **Lesson Access**:
   - **Students**: Can only access lessons from **purchased** curriculums (status = `COMPLETED`)
   - **Admins**: Can access all lessons without purchase
   - **Unpurchased content**: Show paywall modal with "Purchase Curriculum" button

3. **Assignment Submission**:
   - Students can only submit assignments for lessons they have access to
   - Multiple submissions allowed per assignment (latest submission is active)
   - Submissions graded manually (QUIZ can be auto-graded)

---

### Purchase Rules

1. **Purchase Unit**: Users can **only** purchase entire curriculums (not individual chapters/lessons)
2. **One-Time Purchase**: Each curriculum can be purchased **only once** per user (enforced by DB unique constraint)
3. **Instant Access**: Upon successful payment, immediate access to all chapters and lessons
4. **No Refunds**: All purchases are final (for MVP; refund policy out of scope)
5. **Price Lock**: Curriculum price at time of purchase is recorded (future price changes don't affect past purchases)
6. **Mock Payments**: All payments use mock provider (no real money transactions)

**Purchase Flow**:
```
1. User clicks "Purchase Curriculum" → Mock payment form appears
2. User fills mock card details → Clicks "Pay $99.99"
3. 2-second loading animation (simulates payment processing)
4. Backend creates purchase record with status = 'COMPLETED'
5. Redirect to curriculum page → All lessons now accessible
```

---

### Gamification Rules

1. **EXP Award Conditions**:
   - Assignment must be **graded** (status = `GRADED`)
   - Grade must be **>= 60%** (passing grade)
   - EXP awarded **only once** per assignment (even if resubmitted)

2. **Level Calculation**:
   - Based on `total_exp` using formula: `level = floor(sqrt(exp/100)) + 1`
   - Updated automatically when `total_exp` changes

3. **Ranking Rules**:
   - Sorted by `total_exp` DESC, then `created_at` ASC (tiebreaker)
   - Only **STUDENT** role included in rankings (admins excluded)
   - Rank #1 = highest EXP

4. **Grading Rules**:
   - **QUIZ**: Auto-graded by comparing answers with `correctAnswer` in config
   - **CODE/FILE/TEXT**: Manual grading (admin sets grade + feedback)
   - Passing grade: 60% or above

---

### Content Organization Rules

1. **Hierarchy**: Curriculum → Chapters → Lessons (strict 3-level hierarchy)
2. **Ordering**: Chapters and lessons have `order_index` (0-based, sequential)
3. **Lesson Types**: Each lesson is exactly one type (VIDEO, ARTICLE, or SURVEY)
4. **Video Constraint**: Each lesson can have **at most one video**
5. **Cascade Deletes**: Deleting curriculum deletes all child chapters/lessons
6. **Soft Deletes**: Curriculums use soft delete (`deleted_at`) to preserve purchase history

---

### User Roles & Permissions

#### Student (Default Role)
| Action | Allowed? | Notes |
|--------|----------|-------|
| Browse published curriculums | ✅ Yes | Can see catalog |
| Purchase curriculum | ✅ Yes | Mock payment |
| Access purchased lessons | ✅ Yes | Only if purchase status = COMPLETED |
| Access unpurchased lessons | ❌ No | 403 Forbidden or paywall modal |
| Submit assignments | ✅ Yes | Only for accessible lessons |
| View own submissions | ✅ Yes | Own submissions only |
| View own ranking/EXP | ✅ Yes | Dashboard |
| View global leaderboard | ✅ Yes | Top 100 + nearby users |
| Grade submissions | ❌ No | Admin only |
| Create/edit content | ❌ No | Out of scope |

#### Admin Role
| Action | Allowed? | Notes |
|--------|----------|-------|
| View all curriculums | ✅ Yes | Including unpublished |
| Access all lessons | ✅ Yes | No purchase required |
| Grade submissions | ✅ Yes | Set grade + feedback |
| View all submissions | ✅ Yes | For support purposes |
| View user statistics | ✅ Yes | Rankings, EXP, etc. |
| Purchase curriculums | N/A | Redundant (already has access) |
| Create/edit content | ❌ No | Backstage out of scope |
| Manage users | ❌ No | Out of scope |

---

## Authentication & Security

### Google OAuth Flow

```
┌─────────┐                                    ┌──────────────┐
│ Browser │                                    │ Google OAuth │
└────┬────┘                                    └──────┬───────┘
     │                                                │
     │ 1. Click "Sign in with Google"                │
     │────────────────────────────────────────────────▶
     │                                                │
     │ 2. Redirect to Google OAuth consent screen    │
     │◀────────────────────────────────────────────────
     │                                                │
     │ 3. User grants permissions                    │
     │────────────────────────────────────────────────▶
     │                                                │
     │ 4. Redirect to callback with auth code        │
     │◀────────────────────────────────────────────────
     │                                                │
┌────▼────┐            ┌──────────┐                  │
│Frontend │            │ Backend  │                  │
└────┬────┘            └────┬─────┘                  │
     │                      │                        │
     │ 5. POST /api/auth/google/callback             │
     │      { code, redirectUri }                     │
     │──────────────────────▶                        │
     │                      │                        │
     │                      │ 6. Exchange code for   │
     │                      │    Google tokens       │
     │                      │────────────────────────▶
     │                      │                        │
     │                      │ 7. Get user profile    │
     │                      │◀────────────────────────
     │                      │                        │
     │                      │ 8. Create/update user  │
     │                      │    in database         │
     │                      │                        │
     │                      │ 9. Generate JWT tokens │
     │                      │    (access + refresh)  │
     │                      │                        │
     │ 10. Return tokens + user data                 │
     │◀──────────────────────                        │
     │                      │                        │
     │ 11. Store tokens                              │
     │     - Access token: memory/localStorage       │
     │     - Refresh token: httpOnly cookie          │
     │                      │                        │
     │ 12. Redirect to dashboard                     │
     │                      │                        │
```

**Configuration Required**:
1. Create Google Cloud Project
2. Enable Google+ API
3. Create OAuth 2.0 Client ID
4. Configure authorized redirect URIs:
   - Dev: `http://localhost:3000/auth/callback`
   - Prod: `https://yourdomain.com/auth/callback`

**Environment Variables**:
```bash
# Backend (Spring Boot)
GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback

# Frontend (Next.js)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

---

### JWT Token Management

**Token Types**:
1. **Access Token**:
   - **Expiration**: 15 minutes
   - **Storage**: Memory or localStorage (frontend)
   - **Usage**: Sent in `Authorization: Bearer <token>` header for API requests
   - **Claims**: `userId`, `email`, `role`, `exp`, `iat`

2. **Refresh Token**:
   - **Expiration**: 7 days
   - **Storage**: httpOnly cookie (secure, SameSite=Strict)
   - **Usage**: Refresh access token when expired
   - **Revocation**: Stored in Redis blacklist on logout

**JWT Structure**:
```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "role": "STUDENT",
    "iat": 1732272000,
    "exp": 1732272900
  },
  "signature": "..."
}
```

**Token Refresh Flow**:
```
Frontend                      Backend                     Redis
   │                             │                           │
   │ API request with expired access token                   │
   │─────────────────────────────▶                          │
   │                             │                           │
   │◀─────────────────────────────                          │
   │ 401 Unauthorized            │                           │
   │                             │                           │
   │ POST /api/auth/refresh      │                           │
   │ { refreshToken }            │                           │
   │─────────────────────────────▶                          │
   │                             │                           │
   │                             │ Check blacklist           │
   │                             │───────────────────────────▶
   │                             │                           │
   │                             │◀───────────────────────────
   │                             │ Not blacklisted ✓         │
   │                             │                           │
   │                             │ Verify signature          │
   │                             │ Generate new access token │
   │                             │                           │
   │◀─────────────────────────────                          │
   │ { accessToken, expiresIn }  │                           │
   │                             │                           │
   │ Retry original request      │                           │
   │─────────────────────────────▶                          │
   │                             │                           │
```

---

### Access Control Implementation

**Authorization Middleware** (Spring Boot):
```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) {
        String token = extractToken(request);

        if (token != null && jwtService.validateToken(token)) {
            UserDetails userDetails = jwtService.getUserFromToken(token);
            UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities()
                );
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }
}
```

**Role-Based Access Control**:
```java
@RestController
@RequestMapping("/api/curriculums")
public class CurriculumController {

    @GetMapping("/{id}")
    public ResponseEntity<CurriculumResponse> getCurriculum(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails user) {

        // Students: Check purchase access
        if (user.getRole() == Role.STUDENT) {
            boolean hasPurchased = purchaseService.hasPurchased(user.getId(), id);
            if (!hasPurchased) {
                throw new ForbiddenException("Purchase required");
            }
        }
        // Admins: Always allowed

        return curriculumService.getCurriculum(id, user);
    }

    @PostMapping("/{id}/purchase")
    @PreAuthorize("hasRole('STUDENT')") // Only students can purchase
    public ResponseEntity<PurchaseResponse> purchase(@PathVariable UUID id) {
        // ...
    }
}
```

**Purchase Access Check** (cached in Redis):
```java
@Service
public class PurchaseService {

    @Cacheable(value = "purchases", key = "#userId + ':' + #curriculumId")
    public boolean hasPurchased(UUID userId, UUID curriculumId) {
        return purchaseRepository.existsByUserIdAndCurriculumIdAndStatus(
            userId, curriculumId, PurchaseStatus.COMPLETED
        );
    }
}
```

---

### Security Best Practices

**1. CORS Configuration**:
```java
@Configuration
public class SecurityConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
            "http://localhost:3000",  // Dev
            "https://waterballsa.com" // Prod
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true); // For cookies
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
```

**2. Security Headers**:
```java
http
    .headers(headers -> headers
        .contentSecurityPolicy("default-src 'self'; script-src 'self' 'unsafe-inline' https://accounts.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;")
        .xssProtection(xss -> xss.headerValue(XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK))
        .frameOptions(frame -> frame.deny())
        .httpStrictTransportSecurity(hsts -> hsts.maxAgeInSeconds(31536000).includeSubDomains(true))
    );
```

**3. Input Validation**:
```java
@PostMapping("/{id}/purchase")
public ResponseEntity<PurchaseResponse> purchase(
        @PathVariable @NotNull UUID id,
        @RequestBody @Valid PurchaseRequest request) {
    // Bean Validation automatically validates @Valid objects
}

public class PurchaseRequest {
    @NotBlank(message = "Payment ID is required")
    @Pattern(regexp = "^mock_\\d+_[a-zA-Z0-9]+$", message = "Invalid payment ID format")
    private String mockPaymentId;

    @Pattern(regexp = "^\\d{4}$", message = "Card last 4 digits must be 4 digits")
    private String cardLast4;
}
```

**4. SQL Injection Prevention**:
- Use JPA with parameterized queries (automatic protection)
- Never concatenate user input into JPQL/native queries

**5. XSS Prevention**:
- **Frontend**: React auto-escapes by default
- **Backend**: Sanitize HTML in `articleContent` if user-generated

**6. Rate Limiting** (using Bucket4j):
```java
@Component
public class RateLimitingFilter extends OncePerRequestFilter {
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) {
        String key = getClientKey(request); // IP or userId
        Bucket bucket = cache.computeIfAbsent(key, k -> createBucket());

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(429);
            response.getWriter().write("{\"error\": \"Rate limit exceeded\"}");
        }
    }

    private Bucket createBucket() {
        Bandwidth limit = Bandwidth.classic(1000, Refill.intervally(1000, Duration.ofHours(1)));
        return Bucket.builder().addLimit(limit).build();
    }
}
```

---

## Development Workflows & Examples

### BDD Example: Purchase Curriculum Feature

**Feature File** (`src/test/resources/features/purchase_curriculum.feature`):
```gherkin
Feature: Purchase Curriculum
  As a student
  I want to purchase a curriculum
  So that I can access all its lessons and assignments

  Background:
    Given the following curriculums exist:
      | id                                   | title               | price  | isPublished |
      | 550e8400-e29b-41d4-a716-446655440000 | Spring Boot Mastery | 99.99  | true        |
    And I am logged in as "john@example.com"

  Scenario: Successfully purchase a curriculum
    Given I have not purchased "Spring Boot Mastery"
    When I purchase the curriculum "Spring Boot Mastery" with mock payment
    Then I should see a success message "Curriculum purchased successfully!"
    And I should have access to all lessons in "Spring Boot Mastery"
    And my purchase history should include "Spring Boot Mastery"

  Scenario: Attempt to purchase already-purchased curriculum
    Given I have already purchased "Spring Boot Mastery"
    When I attempt to purchase "Spring Boot Mastery" again
    Then I should see an error "You have already purchased this curriculum"
    And I should receive a 409 Conflict response

  Scenario: Admin users bypass purchase requirement
    Given I am logged in as an admin
    And I have not purchased "Spring Boot Mastery"
    When I access a lesson from "Spring Boot Mastery"
    Then I should be able to view the lesson content
    And I should not see a paywall

  Scenario: Student cannot access unpurchased curriculum lessons
    Given I have not purchased "Spring Boot Mastery"
    When I try to access a lesson from "Spring Boot Mastery"
    Then I should see an error "You must purchase this curriculum to access its content"
    And I should receive a 403 Forbidden response
    And I should see the curriculum price: $99.99
```

**Step Definitions** (Java + Cucumber):
```java
@Given("I have not purchased {string}")
public void iHaveNotPurchased(String curriculumTitle) {
    Curriculum curriculum = curriculumRepository.findByTitle(curriculumTitle)
        .orElseThrow();

    boolean exists = purchaseRepository.existsByUserIdAndCurriculumId(
        testContext.getCurrentUser().getId(),
        curriculum.getId()
    );

    assertThat(exists).isFalse();
}

@When("I purchase the curriculum {string} with mock payment")
public void iPurchaseTheCurriculum(String curriculumTitle) {
    Curriculum curriculum = curriculumRepository.findByTitle(curriculumTitle)
        .orElseThrow();

    PurchaseRequest request = new PurchaseRequest(
        "mock_" + System.currentTimeMillis() + "_abc123",
        "4242"
    );

    testContext.setResponse(
        given()
            .contentType(ContentType.JSON)
            .header("Authorization", "Bearer " + testContext.getAccessToken())
            .body(request)
        .when()
            .post("/api/curriculums/" + curriculum.getId() + "/purchase")
        .then()
            .extract().response()
    );
}

@Then("I should see a success message {string}")
public void iShouldSeeSuccessMessage(String expectedMessage) {
    testContext.getResponse()
        .then()
        .statusCode(201)
        .body("success", equalTo(true))
        .body("message", containsString(expectedMessage));
}
```

---

### Environment Variables

#### Frontend (.env.local)
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com

# NextAuth (for session management)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-key-min-32-chars

# Feature Flags (optional)
NEXT_PUBLIC_ENABLE_LEADERBOARD=true
NEXT_PUBLIC_ENABLE_ASSIGNMENTS=true
```

#### Backend (.env or application.yml)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/waterballsa
    username: postgres
    password: postgres
    driver-class-name: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: validate # Use Flyway for migrations
    show-sql: false
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.PostgreSQLDialect

  data:
    redis:
      host: localhost
      port: 6379
      password: # Leave empty for local dev

# Google OAuth
google:
  oauth:
    client-id: ${GOOGLE_OAUTH_CLIENT_ID}
    client-secret: ${GOOGLE_OAUTH_CLIENT_SECRET}
    redirect-uri: ${GOOGLE_OAUTH_REDIRECT_URI}

# JWT Configuration
jwt:
  secret: ${JWT_SECRET} # Min 256-bit key for RS256
  access-token-expiration: 900000 # 15 minutes in ms
  refresh-token-expiration: 604800000 # 7 days in ms

# AWS S3 (for video storage)
aws:
  s3:
    bucket-name: waterballsa-videos
    region: us-east-1
    access-key: ${AWS_ACCESS_KEY_ID}
    secret-key: ${AWS_SECRET_ACCESS_KEY}

# CORS
cors:
  allowed-origins: http://localhost:3000,https://waterballsa.com

# Rate Limiting
rate-limit:
  enabled: true
  requests-per-hour: 1000
```

---

### Data Flow Diagrams

#### 1. User Login Flow
```
┌─────────┐     ┌──────────┐     ┌────────┐     ┌──────────┐     ┌───────┐
│ Browser │────▶│ Frontend │────▶│ Google │────▶│ Backend  │────▶│ Redis │
└─────────┘     └──────────┘     └────────┘     └────┬─────┘     └───────┘
                                                       │
                                                       ▼
                                                 ┌──────────┐
                                                 │PostgreSQL│
                                                 └──────────┘
Flow:
1. User clicks "Sign in with Google"
2. Frontend redirects to Google OAuth
3. User grants permissions
4. Google returns auth code
5. Frontend sends code to backend
6. Backend exchanges code for user profile
7. Backend creates/updates user in PostgreSQL
8. Backend generates JWT tokens
9. Backend stores refresh token hash in Redis
10. Frontend stores tokens and redirects to dashboard
```

#### 2. Lesson Access Flow (with Purchase Check)
```
┌─────────┐     ┌──────────┐     ┌────────┐     ┌───────┐
│ Browser │────▶│ Frontend │────▶│Backend │────▶│ Redis │
└─────────┘     └──────────┘     └────┬───┘     └───┬───┘
                                       │             │
                                       ▼             │
                                 ┌──────────┐        │
                                 │PostgreSQL│◀───────┘
                                 └──────────┘
                                 (if cache miss)

Flow:
1. User requests lesson GET /api/lessons/:id
2. Backend validates JWT token
3. Backend extracts userId and role from token
4. If role = ADMIN → Skip to step 9
5. If role = STUDENT → Check Redis cache for purchase
6. Cache HIT → Proceed to step 9
7. Cache MISS → Query PostgreSQL purchases table
8. Cache result in Redis (5 min TTL)
9. If purchased (or admin) → Return lesson content
10. Else → Return 403 Forbidden with purchase info
```

#### 3. Assignment Submission & EXP Award Flow
```
┌─────────┐     ┌──────────┐     ┌────────┐     ┌──────────┐
│ Browser │────▶│ Frontend │────▶│Backend │────▶│PostgreSQL│
└─────────┘     └──────────┘     └────┬───┘     └────┬─────┘
                                       │              │
                                       ▼              │
                                 ┌──────────┐         │
                                 │ Trigger  │◀────────┘
                                 │award_exp │
                                 └────┬─────┘
                                      │
                                      ▼
                                 Update user.total_exp
                                 Recalculate user.current_level
                                 Trigger update_user_rank

Flow:
1. User submits assignment POST /api/assignments/:id/submit
2. Backend validates request
3. Backend creates submission record (status = PENDING)
4. If QUIZ → Auto-grade immediately
   - Compare answers with correctAnswer in config
   - Calculate grade percentage
   - Update submission: status = GRADED, grade = X%
5. If CODE/FILE/TEXT → Leave as PENDING (manual grading)
6. Database trigger detects status = GRADED
7. Trigger checks: grade >= 60% AND not already awarded
8. Trigger updates users.total_exp += assignment.exp_reward
9. Application recalculates current_level
10. Trigger recalculates user_rank
11. Backend returns response with expAwarded
12. Frontend shows "🎉 +25 EXP earned!" notification
```

---

## Non-Functional Requirements

### Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| **API Response Time** | < 200ms (p95) | For GET requests |
| **API Response Time** | < 500ms (p95) | For POST/PUT requests |
| **Database Query Time** | < 50ms (p95) | Indexed queries |
| **Page Load Time** | < 2s (p95) | First Contentful Paint |
| **Video Buffer Time** | < 3s | HLS streaming start |
| **Leaderboard Query** | < 100ms | Cached in Redis |

**Performance Optimizations**:
- Database indexes on foreign keys and frequently queried columns
- Redis caching for:
  - User purchase status (5 min TTL)
  - Leaderboard data (1 hour TTL)
  - User session data (15 min TTL)
- Pagination for all list endpoints (max 100 items per page)
- Database connection pooling (HikariCP)
- CDN for video delivery (CloudFront)
- Gzip compression for API responses

---

### Scalability

**Horizontal Scaling Strategy**:
- **Frontend**: Stateless Next.js → Deploy multiple instances behind load balancer
- **Backend**: Stateless Spring Boot → Scale horizontally with load balancer
- **Database**: PostgreSQL read replicas for read-heavy operations
- **Cache**: Redis Cluster for distributed caching
- **Video Storage**: S3 auto-scales infinitely

**Capacity Planning** (MVP targets):
- **Concurrent Users**: 10,000
- **Total Users**: 100,000
- **Curriculums**: 100
- **Lessons**: 10,000
- **Video Storage**: 1 TB (expandable)
- **API Requests**: 1,000 req/sec

---

### Reliability & Availability

| Requirement | Target |
|-------------|--------|
| **Uptime** | 99.9% (8.76 hours downtime/year) |
| **Recovery Time Objective (RTO)** | < 1 hour |
| **Recovery Point Objective (RPO)** | < 15 minutes (DB backups) |
| **Data Durability** | 99.999999999% (S3) |

**High Availability Measures**:
- Database: Automated daily backups + point-in-time recovery
- Redis: Master-replica replication
- Health checks for all services (Spring Boot Actuator)
- Graceful degradation: If Redis fails → Query DB directly

---

### Security

| Requirement | Implementation |
|-------------|----------------|
| **Authentication** | Google OAuth 2.0 + JWT |
| **Authorization** | Role-based (STUDENT, ADMIN) |
| **Data Encryption** | HTTPS/TLS 1.3 in transit |
| **Password Storage** | N/A (OAuth only) |
| **Token Expiration** | 15 min (access), 7 days (refresh) |
| **Rate Limiting** | 1000 req/hour per user |
| **Input Validation** | Bean Validation (JSR-303) |
| **SQL Injection** | Parameterized queries (JPA) |
| **XSS Protection** | React auto-escaping + CSP headers |
| **CSRF Protection** | SameSite cookies |

---

### Monitoring & Observability (Future Enhancement)

**Logging**:
- Structured JSON logs (for Elasticsearch)
- Log levels: ERROR, WARN, INFO, DEBUG
- Include: requestId, userId, timestamp, endpoint

**Metrics** (via Micrometer + Prometheus):
- API request count, latency, error rate
- Database connection pool stats
- Cache hit/miss ratio
- JVM memory usage

**Alerts**:
- API error rate > 5%
- Database connections > 80%
- Disk usage > 90%
- Response time p95 > 500ms

---

## Out of Scope (Explicitly NOT Included)

### Phase 1-3 Exclusions

**Content Management**:
- ❌ Admin panel for creating/editing curriculums
- ❌ Bulk content upload tools
- ❌ Content versioning
- ❌ Draft/publish workflow
- **Workaround**: Seed data via SQL scripts or direct DB inserts

**User Management**:
- ❌ User registration (OAuth only)
- ❌ Email/password login
- ❌ Password reset
- ❌ Account deletion
- ❌ User profile editing (name, avatar)
- **Rationale**: Google OAuth provides identity; profile managed by Google

**Video Processing**:
- ❌ Video upload UI
- ❌ Automated transcoding pipeline (AWS MediaConvert)
- ❌ Video thumbnail generation
- ❌ Subtitle/caption support
- **Workaround**: Manually upload HLS videos to S3

**Payment Processing**:
- ❌ Real payment gateway integration (Stripe/PayPal)
- ❌ Invoice generation
- ❌ Refund processing
- ❌ Multiple currencies
- ❌ Payment webhooks (real)
- **Rationale**: Mock payments sufficient for MVP

**Advanced Gamification**:
- ❌ Badges/achievements
- ❌ Daily login streaks
- ❌ Bonus EXP events
- ❌ Curriculum completion certificates
- ❌ Skill trees
- **Rationale**: Basic EXP + levels + ranking sufficient

**Communication**:
- ❌ Discussion forums
- ❌ Direct messaging
- ❌ Email notifications (assignment graded, level up)
- ❌ Push notifications
- ❌ In-app announcements

**Analytics**:
- ❌ User behavior tracking
- ❌ Video watch analytics (drop-off points)
- ❌ Curriculum completion rates
- ❌ A/B testing framework

**Miscellaneous**:
- ❌ Mobile apps (iOS/Android)
- ❌ Internationalization (i18n)
- ❌ Dark mode
- ❌ Accessibility features (WCAG AAA)
- ❌ Social media sharing
- ❌ SEO optimization

---

### Future Enhancements (Post-MVP)

**Phase 4 Candidates**:
1. **Content Management System**:
   - Admin dashboard for CRUD operations on curriculums/chapters/lessons
   - Rich text editor for articles
   - Video upload + transcoding automation

2. **Real Payment Integration**:
   - Stripe integration for Taiwan market
   - Invoice generation (PDF)
   - Subscription model (monthly/yearly)

3. **Advanced Gamification**:
   - Achievement badges (e.g., "Complete 10 lessons", "Reach Level 10")
   - Curriculum completion certificates (PDF generation)
   - Daily login streaks + streak bonuses

4. **Communication Features**:
   - Lesson comments/Q&A
   - Email notifications (assignment graded, new lesson)
   - In-app messaging

5. **Mobile Applications**:
   - iOS app (Swift/SwiftUI)
   - Android app (Kotlin/Jetpack Compose)
   - Offline video download

6. **Enhanced Analytics**:
   - Admin dashboard with user statistics
   - Video engagement metrics (watch time, drop-off)
   - Curriculum popularity reports

7. **Accessibility & UX**:
   - WCAG 2.1 AA compliance
   - Dark mode
   - Keyboard navigation
   - Multi-language support (i18n)

---

## Contributing

### Workflow

1. Create a feature branch from `main`
2. Write specifications for the feature
3. Implement with TDD/BDD approach
4. Ensure all tests pass
5. Submit pull request for review

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add user authentication
fix: resolve video playback issue
docs: update API documentation
test: add e2e tests for curriculum navigation
```

## Deployment

### Docker Deployment

```bash
# Build all services
docker-compose build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

### Environment-Specific Configurations

- **Development**: `docker-compose.yml`
- **Staging**: `docker-compose.staging.yml`
- **Production**: `docker-compose.prod.yml`

## Roadmap

### Current Focus
- [ ] Phase 1: Foundation & Core Features
  - [ ] Google OAuth authentication
  - [ ] Curriculum/Chapter/Lesson structure
  - [ ] Video playback functionality
  - [ ] Article and survey display
  - [ ] Docker setup for all services

### Upcoming
- [ ] Phase 2: Access Control & Payment
  - [ ] Curriculum purchase system
  - [ ] Payment gateway integration
  - [ ] Permission-based content access
  - [ ] Admin role implementation

- [ ] Phase 3: Assignments & Gamification
  - [ ] Assignment creation and management
  - [ ] Multi-format submission system (code, files, text, quizzes)
  - [ ] EXP and level system
  - [ ] Platform-wide ranking and leaderboard

### Future Considerations
- [ ] Mobile applications (iOS/Android)
- [ ] Additional OAuth providers
- [ ] Certificate generation upon curriculum completion
- [ ] Social features (discussion forums, peer reviews)

## License

[TBD - MIT / Apache 2.0 / Proprietary]

## Team & Contact

[TBD - Team information and contact details]

---

**Built with ❤️ using Specification-Driven and Behavior-Driven Development**
