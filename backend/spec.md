# Backend Specification

## 1. Overview

WaterBallSA is an online learning platform enabling users to access educational content through a structured curriculum system. The backend powers authentication, content delivery, and purchase management.

## 2. Functional Requirements

### 2.1 Authentication & User Management
*   **Google OAuth 2.0 Identity Provider**: Exclusive authentication method.
*   **JWT Session Management**:
    *   **Access Token**: Short-lived (1 day), stateless, used for API authorization.
    *   **Refresh Token**: Long-lived (7 days), stored in HTTP-only cookie, used to rotate access tokens.
    *   **Logout**: Revoke refresh token (blacklist).

### 2.2 Content Delivery
*   **Structure**: `Curriculum` -> `Chapter` -> `Lesson`.
*   **Curriculum Visibility**:
    *   Published curriculums are visible to all.
    *   Unpublished curriculums are hidden from users.
*   **Lesson Types**:
    *   `VIDEO`: Single video resource (HLS).
    *   `ARTICLE`: Markdown text content.
    *   `SURVEY`: Configurable questionnaires.
*   **Access Control**:
    *   Users must **purchase** a curriculum to access its chapters and lessons.
    *   Some lessons are public, allowing access without purchase.

### 2.3 Purchase System
*   **Purchase Unit**: Entire curriculum only.
*   **Provider**: Mock payment gateway for MVP.
*   **Constraint**: One-time purchase per curriculum per user.
*   **Flow**: Mock payment -> `COMPLETED` status -> Immediate content access.

## 3. API Specification

Base URL: `/api`

### 3.1 Authentication
*   `POST /auth/google`: Exchange Google ID token for JWTs.
*   `POST /auth/refresh`: Rotate access token using refresh token.
*   `GET /auth/me`: Get current user profile.

### 3.2 Curriculums
*   `GET /curriculums`: List curriculums (pagination, filter by published).
*   `GET /curriculums/:id`: Get curriculum details (chapters, lessons structure).
*   `GET /curriculums/search`: Search by query (params: q, page, size, sort).
*   `GET /curriculums/free`: Get free curriculums.
*   `GET /curriculums/:id/order-preview`: Get purchase preview details.

### 3.3 Lessons
*   `GET /lessons/:id`: Get lesson content (Requires Purchase or Public Access).
*   `GET /lessons/chapter/:chapterId`: Get lessons by chapter.
*   `GET /lessons/curriculum/:curriculumId/free-preview`: Get free preview lessons.
*   `POST /lessons/:lessonId/progress`: Save video watching progress.
*   `GET /lessons/:lessonId/progress`: Get video watching progress.
*   `GET /lessons/chapters/:chapterId/progress`: Get progress for all lessons in chapter.

### 3.4 Chapters
*   `GET /chapters/:id`: Get chapter details.
*   `GET /chapters/curriculum/:curriculumId`: Get chapters for a curriculum.
*   `GET /chapters/curriculum/:curriculumId/count`: Get total chapter count.

### 3.5 Purchases & Coupons
*   `POST /purchases`: Create a purchase (can include coupon).
*   `POST /purchases/:purchaseId/complete`: Complete a purchase (mock payment).
*   `GET /purchases/check-ownership/:curriculumId`: Check if user owns content.
*   `GET /purchases/my-purchases`: Get user's purchase history.
*   `GET /purchases/completed`: Get completed purchases.
*   `GET /purchases/:purchaseId`: Get purchase details.
*   `POST /coupons/validate`: Validate a coupon code.
