# Video Progress Tracking - Design Document v2

## Overview

This design document outlines the architecture and implementation strategy for the video progress tracking feature in the WaterBallSA learning platform. The system will automatically capture and persist user video playback progress, detect lesson completion, and provide visual feedback across the user interface.

### Design Goals

1. **Automatic Progress Recording**: Seamlessly track video playback without user intervention
2. **Persistent State**: Reliably store progress data that persists across sessions and devices
3. **Resume Capability**: Restore users to their last watched position when returning to a lesson
4. **Completion Detection**: Automatically mark lessons complete when 95% threshold is reached
5. **Performance**: Minimize database writes while ensuring data consistency
6. **User Experience**: Provide visual completion indicators and progress feedback

### Scope

This design covers:
- Database schema for `video_progress` table
- Backend API endpoints for progress tracking
- Frontend integration with YouTube IFrame Player API
- Component interaction patterns
- Error handling and retry mechanisms
- Performance optimization strategies

### Technical Context

- **Frontend**: Next.js 14 with TypeScript, existing VideoPlayer component using native YouTube iframe
- **Backend**: Spring Boot 3.2.0 with JPA/Hibernate, PostgreSQL database
- **Authentication**: JWT-based authentication (existing)
- **Database**: PostgreSQL 14+ with Flyway migrations

---

## Architecture Design

### System Architecture Diagram

```mermaid
graph TB
    subgraph "Frontend (Next.js)"
        A[VideoPlayer Component] --> B[YouTube IFrame Player API]
        A --> C[Progress Tracking Hook]
        C --> D[API Client]
        E[Lesson Sidebar] --> D
        F[useAuth Hook] --> C
    end

    subgraph "Backend (Spring Boot)"
        G[VideoProgressController] --> H[VideoProgressService]
        H --> I[VideoProgressRepository]
        H --> J[LessonRepository]
        H --> K[UserRepository]
        I --> L[(video_progress table)]
        J --> M[(lessons table)]
        K --> N[(users table)]
    end

    subgraph "Security Layer"
        O[JwtAuthenticationFilter] --> G
        P[SecurityConfig] --> O
    end

    D -->|HTTP POST/GET with JWT| G
    B -->|Player Events| C
    C -->|10s interval| D
    E -->|Fetch Chapter Progress| D

    style A fill:#4299e1
    style C fill:#4299e1
    style H fill:#48bb78
    style L fill:#ed8936
```

### Data Flow Diagram

```mermaid
graph LR
    A[User Plays Video] --> B{Authenticated?}
    B -->|No| C[No Tracking]
    B -->|Yes| D[Initialize Player]
    D --> E[Fetch Saved Progress]
    E --> F{Progress Exists?}
    F -->|Yes| G[Seek to Saved Position]
    F -->|No| H[Start from 0:00]

    G --> I[Video Playing]
    H --> I

    I --> J[10s Interval Timer]
    J --> K[Get currentTime & duration]
    K --> L[Calculate Completion %]
    L --> M{≥ 95%?}
    M -->|Yes| N[Mark as Completed]
    M -->|No| O[Save Progress]
    N --> P[Update video_progress]
    O --> P
    P --> Q{API Success?}
    Q -->|Yes| R[Update UI State]
    Q -->|No| S[Retry with Backoff]
    S --> Q

    style B fill:#f6ad55
    style M fill:#f6ad55
    style P fill:#48bb78
```

---

## Component Design

### Backend Components

#### 1. VideoProgress Entity

**Location**: `backend/src/main/java/com/waterballsa/backend/entity/VideoProgress.java`

**Responsibilities**:
- Represent video progress data model
- Define relationships with User and Lesson entities
- Provide business logic for completion calculation

**Interfaces**:
```java
@Entity
@Table(name = "video_progress")
public class VideoProgress {
    // Fields
    private Long id;
    private User user;
    private Lesson lesson;
    private Double currentTimeSeconds;
    private Double durationSeconds;
    private Integer completionPercentage;
    private Boolean isCompleted;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Methods
    public void updateProgress(Double currentTime, Double duration);
    public void markAsCompleted();
    public boolean shouldMarkComplete();
}
```

**Dependencies**:
- `User` entity (many-to-one)
- `Lesson` entity (many-to-one)
- JPA annotations
- Lombok

#### 2. VideoProgressRepository

**Location**: `backend/src/main/java/com/waterballsa/backend/repository/VideoProgressRepository.java`

**Responsibilities**:
- Database access layer for video progress
- Custom queries for upsert and bulk retrieval

**Interfaces**:
```java
@Repository
public interface VideoProgressRepository extends JpaRepository<VideoProgress, Long> {
    Optional<VideoProgress> findByUserIdAndLessonId(Long userId, Long lessonId);
    List<VideoProgress> findByUserIdAndLesson_ChapterId(Long userId, Long chapterId);

    @Modifying
    @Query(nativeQuery = true, value = "...")
    void upsertProgress(/* parameters */);
}
```

**Dependencies**:
- Spring Data JPA
- VideoProgress entity

#### 3. VideoProgressService

**Location**: `backend/src/main/java/com/waterballsa/backend/service/VideoProgressService.java`

**Responsibilities**:
- Business logic for progress tracking
- Validation and calculation
- Transaction management
- Upsert coordination

**Interfaces**:
```java
@Service
public class VideoProgressService {
    public VideoProgressDto saveProgress(Long userId, Long lessonId, SaveProgressRequest request);
    public VideoProgressDto getProgress(Long userId, Long lessonId);
    public List<VideoProgressDto> getChapterProgress(Long userId, Long chapterId);
    private void validateProgressData(SaveProgressRequest request);
    private Integer calculateCompletionPercentage(Double current, Double duration);
    private boolean shouldMarkComplete(Double current, Double duration);
}
```

**Dependencies**:
- VideoProgressRepository
- LessonRepository
- Validation utilities

#### 4. VideoProgressController

**Location**: `backend/src/main/java/com/waterballsa/backend/controller/VideoProgressController.java`

**Responsibilities**:
- REST API endpoint exposure
- Request/response mapping
- JWT user extraction
- OpenAPI documentation

**Interfaces**:
```java
@RestController
@RequestMapping("/api/lessons")
public class VideoProgressController {
    @PostMapping("/{lessonId}/progress")
    public ResponseEntity<VideoProgressDto> saveProgress(
        @PathVariable Long lessonId,
        @RequestBody @Valid SaveProgressRequest request,
        Authentication authentication
    );

    @GetMapping("/{lessonId}/progress")
    public ResponseEntity<VideoProgressDto> getProgress(
        @PathVariable Long lessonId,
        Authentication authentication
    );

    @GetMapping("/chapters/{chapterId}/progress")
    public ResponseEntity<List<VideoProgressDto>> getChapterProgress(
        @PathVariable Long chapterId,
        Authentication authentication
    );
}
```

**Dependencies**:
- VideoProgressService
- Spring Security Authentication

### Frontend Components

#### 5. useVideoProgress Hook

**Location**: `frontend/src/hooks/useVideoProgress.ts`

**Responsibilities**:
- Encapsulate progress tracking logic
- Manage YouTube IFrame Player API integration
- Handle progress saving with debouncing
- Implement retry logic with exponential backoff
- Emit events for UI updates

**Interfaces**:
```typescript
interface UseVideoProgressProps {
  lessonId: number;
  onProgressUpdate?: (progress: VideoProgressDto) => void;
  onComplete?: () => void;
}

interface UseVideoProgressReturn {
  progress: VideoProgressDto | null;
  isLoading: boolean;
  error: Error | null;
  initializePlayer: (player: YT.Player) => void;
  cleanup: () => void;
}

export function useVideoProgress(props: UseVideoProgressProps): UseVideoProgressReturn;
```

**Dependencies**:
- YouTube IFrame Player API types
- API client
- useAuth hook

#### 6. Enhanced VideoPlayer Component

**Location**: `frontend/src/components/VideoPlayer.tsx`

**Responsibilities**:
- Initialize YouTube IFrame Player with API
- Integrate useVideoProgress hook
- Display loading states
- Handle player events
- Restore saved playback position

**Interfaces**:
```typescript
interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  lessonId: number;
  duration?: number;
  onProgressUpdate?: (progress: VideoProgressDto) => void;
  onComplete?: () => void;
}

export default function VideoPlayer(props: VideoPlayerProps): JSX.Element;
```

**Dependencies**:
- useVideoProgress hook
- YouTube IFrame Player API
- Chakra UI components

#### 7. LessonProgressIndicator Component

**Location**: `frontend/src/components/LessonProgressIndicator.tsx`

**Responsibilities**:
- Display completion status visually
- Show progress percentage
- Provide tooltip with completion details

**Interfaces**:
```typescript
interface LessonProgressIndicatorProps {
  lessonId: number;
  progress?: VideoProgressDto;
  size?: 'sm' | 'md' | 'lg';
}

export default function LessonProgressIndicator(props: LessonProgressIndicatorProps): JSX.Element;
```

**Dependencies**:
- Chakra UI components
- Date formatting utilities

---

## Data Model

### Core Data Structures

#### VideoProgress Entity (Backend)

```typescript
// TypeScript representation for documentation
interface VideoProgress {
  id: number;
  userId: number;
  lessonId: number;
  currentTimeSeconds: number;
  durationSeconds: number;
  completionPercentage: number;  // 0-100
  isCompleted: boolean;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Database Schema

```mermaid
erDiagram
    users ||--o{ video_progress : "has many"
    lessons ||--o{ video_progress : "has many"

    users {
        bigserial id PK
        varchar google_id UK
        varchar email UK
        varchar name
        varchar profile_picture_url
        int total_exp
        int current_level
        int global_rank
        timestamp created_at
        timestamp updated_at
        timestamp last_login_at
    }

    lessons {
        bigserial id PK
        bigint chapter_id FK
        varchar title
        text description
        varchar lesson_type
        varchar content_url
        int order_index
        int duration_minutes
        boolean is_free_preview
        boolean is_published
        jsonb content_metadata
        timestamp created_at
        timestamp updated_at
    }

    video_progress {
        bigserial id PK
        bigint user_id FK
        bigint lesson_id FK
        double_precision current_time_seconds
        double_precision duration_seconds
        int completion_percentage
        boolean is_completed
        timestamp completed_at
        timestamp created_at
        timestamp updated_at
    }
```

### DTOs (Data Transfer Objects)

#### SaveProgressRequest

**Location**: `backend/src/main/java/com/waterballsa/backend/dto/SaveProgressRequest.java`

```java
public class SaveProgressRequest {
    @NotNull
    @PositiveOrZero
    private Double currentTimeSeconds;

    @NotNull
    @Positive
    private Double durationSeconds;

    @NotNull
    @Min(0)
    @Max(100)
    private Integer completionPercentage;

    @NotNull
    private Boolean isCompleted;
}
```

#### VideoProgressDto

**Location**: `backend/src/main/java/com/waterballsa/backend/dto/VideoProgressDto.java`

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoProgressDto {
    private Long id;
    private Long userId;
    private Long lessonId;
    private Double currentTimeSeconds;
    private Double durationSeconds;
    private Integer completionPercentage;
    private Boolean isCompleted;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static VideoProgressDto from(VideoProgress entity);
}
```

#### Frontend Types

**Location**: `frontend/src/types/video-progress.ts`

```typescript
export interface VideoProgressDto {
  id: number;
  userId: number;
  lessonId: number;
  currentTimeSeconds: number;
  durationSeconds: number;
  completionPercentage: number;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaveProgressRequest {
  currentTimeSeconds: number;
  durationSeconds: number;
  completionPercentage: number;
  isCompleted: boolean;
}
```

---

## Business Process

### Process 1: Video Playback Initialization

```mermaid
sequenceDiagram
    actor User
    participant UI as VideoPlayer Component
    participant Hook as useVideoProgress Hook
    participant API as API Client
    participant BE as VideoProgressController
    participant Service as VideoProgressService
    participant Repo as VideoProgressRepository
    participant DB as Database

    User->>UI: Open Lesson Page
    UI->>Hook: Initialize (lessonId)

    Note over Hook: Check if user authenticated
    Hook->>Hook: useAuth().isAuthenticated

    alt User Authenticated
        Hook->>API: GET /api/lessons/{lessonId}/progress
        API->>BE: HTTP GET with JWT
        BE->>BE: Extract userId from JWT
        BE->>Service: getProgress(userId, lessonId)
        Service->>Repo: findByUserIdAndLessonId(userId, lessonId)
        Repo->>DB: SELECT * FROM video_progress WHERE...

        alt Progress Found
            DB-->>Repo: Progress record
            Repo-->>Service: VideoProgress entity
            Service-->>BE: VideoProgressDto
            BE-->>API: 200 OK with progress
            API-->>Hook: progress data
            Hook->>UI: Seek player to currentTimeSeconds
            UI->>User: Video starts at saved position
        else No Progress Found
            DB-->>Repo: Empty result
            Repo-->>Service: Optional.empty()
            Service-->>BE: null
            BE-->>API: 404 Not Found
            API-->>Hook: null
            Hook->>UI: Start from 0:00
            UI->>User: Video starts from beginning
        end
    else User Not Authenticated
        Hook->>UI: Disable tracking, start from 0:00
        UI->>User: Video starts from beginning
    end
```

### Process 2: Progress Recording During Playback

```mermaid
sequenceDiagram
    participant Player as YouTube IFrame Player
    participant Hook as useVideoProgress Hook
    participant Timer as Interval Timer (10s)
    participant API as API Client
    participant BE as VideoProgressController
    participant Service as VideoProgressService
    participant Repo as VideoProgressRepository
    participant DB as Database

    Player->>Player: onStateChange(PLAYING)
    Player->>Hook: Notify playing state
    Hook->>Timer: Start 10-second interval

    loop Every 10 seconds
        Timer->>Hook: Tick
        Hook->>Player: getCurrentTime()
        Player-->>Hook: currentTime (seconds)
        Hook->>Player: getDuration()
        Player-->>Hook: duration (seconds)

        Hook->>Hook: Calculate completion %
        Note over Hook: completionPct = (currentTime / duration) * 100

        Hook->>Hook: Check completion threshold

        alt completionPct >= 95%
            Hook->>Hook: Set isCompleted = true
            Hook->>Hook: Trigger onComplete callback
        else completionPct < 95%
            Hook->>Hook: Set isCompleted = false
        end

        Hook->>API: POST /api/lessons/{lessonId}/progress
        Note over API: Request body: {<br/>  currentTimeSeconds,<br/>  durationSeconds,<br/>  completionPercentage,<br/>  isCompleted<br/>}

        API->>BE: HTTP POST with JWT + body
        BE->>BE: Extract userId from JWT
        BE->>BE: Validate request
        BE->>Service: saveProgress(userId, lessonId, request)
        Service->>Service: Validate data
        Service->>Service: Check completion logic
        Service->>Repo: upsertProgress(...)

        Repo->>DB: INSERT ... ON CONFLICT (user_id, lesson_id)<br/>DO UPDATE SET ...

        alt Success
            DB-->>Repo: 1 row affected
            Repo-->>Service: Success
            Service->>Repo: findByUserIdAndLessonId(...)
            Repo->>DB: SELECT * FROM video_progress WHERE...
            DB-->>Repo: Updated record
            Repo-->>Service: VideoProgress entity
            Service-->>BE: VideoProgressDto
            BE-->>API: 200 OK with updated progress
            API-->>Hook: Success
            Hook->>Hook: Update local state
        else Error (Network/DB)
            DB-->>Repo: Error
            Repo-->>Service: Exception
            Service-->>BE: Exception
            BE-->>API: 500 Internal Server Error
            API-->>Hook: Error
            Hook->>Hook: Retry with exponential backoff
            Note over Hook: Retry: wait 1s, 2s, 4s (max 3 retries)
        end
    end

    Player->>Player: onStateChange(PAUSED)
    Player->>Hook: Notify paused state
    Hook->>Timer: Stop interval
    Hook->>API: Immediate save (flush pending)
```

### Process 3: Bulk Progress Retrieval for Lesson List

```mermaid
sequenceDiagram
    actor User
    participant Sidebar as Lesson Sidebar
    participant Hook as useChapterProgress Hook
    participant API as API Client
    participant BE as VideoProgressController
    participant Service as VideoProgressService
    participant Repo as VideoProgressRepository
    participant DB as Database

    User->>Sidebar: Navigate to Chapter
    Sidebar->>Hook: Initialize (chapterId)
    Hook->>API: GET /api/lessons/chapters/{chapterId}/progress
    API->>BE: HTTP GET with JWT
    BE->>BE: Extract userId from JWT
    BE->>Service: getChapterProgress(userId, chapterId)
    Service->>Repo: findByUserIdAndLesson_ChapterId(userId, chapterId)
    Repo->>DB: SELECT vp.* FROM video_progress vp<br/>JOIN lessons l ON vp.lesson_id = l.id<br/>WHERE vp.user_id = ? AND l.chapter_id = ?

    DB-->>Repo: List of progress records
    Repo-->>Service: List<VideoProgress>
    Service->>Service: Map to DTOs
    Service-->>BE: List<VideoProgressDto>
    BE-->>API: 200 OK with progress array
    API-->>Hook: progress list
    Hook->>Sidebar: Update state

    loop For each lesson in list
        Sidebar->>Sidebar: Render LessonProgressIndicator

        alt Lesson has progress
            alt isCompleted = true
                Sidebar->>User: Show green checkmark ✓
            else 1% <= completionPct < 95%
                Sidebar->>User: Show blue progress indicator (e.g., "45%")
            else completionPct < 1%
                Sidebar->>User: Show gray empty circle ○
            end
        else No progress
            Sidebar->>User: Show gray empty circle ○
        end
    end
```

### Process 4: Error Handling and Retry Logic

```mermaid
flowchart TD
    A[Progress Save Triggered] --> B{User Authenticated?}
    B -->|No| C[Skip save, continue tracking]
    B -->|Yes| D[Prepare SaveProgressRequest]

    D --> E{Validate Request Data}
    E -->|Invalid| F[Log validation error]
    F --> C
    E -->|Valid| G[Send POST request to API]

    G --> H{Network Success?}
    H -->|No| I{Retry Count < 3?}
    I -->|Yes| J[Wait exponential backoff]
    J --> K[Increment retry count]
    K --> G
    I -->|No| L[Log error, continue locally]
    L --> C

    H -->|Yes| M{Response Status}
    M -->|200 OK| N[Update local state]
    M -->|400 Bad Request| O[Log validation error from server]
    M -->|401 Unauthorized| P{Token Expired?}
    M -->|404 Not Found| Q[Lesson not found, log error]
    M -->|500 Server Error| I

    P -->|Yes| R[Trigger token refresh]
    R --> S{Refresh Success?}
    S -->|Yes| G
    S -->|No| T[Redirect to login]
    P -->|No| T

    N --> U[Emit progress update event]
    O --> C
    Q --> C

    U --> V{Is Completed?}
    V -->|Yes| W[Emit completion event]
    V -->|No| X[Continue tracking]

    W --> Y[Update UI indicators]
    X --> Y
    Y --> Z[End]
    C --> Z
    T --> Z

    style H fill:#f6ad55
    style M fill:#f6ad55
    style V fill:#f6ad55
    style N fill:#48bb78
    style W fill:#48bb78
```

---

## Error Handling Strategy

### Backend Error Handling

#### 1. Validation Errors (400 Bad Request)

**Scenarios**:
- `currentTimeSeconds < 0`
- `durationSeconds <= 0`
- `completionPercentage < 0 or > 100`
- `currentTimeSeconds > durationSeconds`

**Response**:
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "errors": [
    {
      "field": "currentTimeSeconds",
      "message": "must be greater than or equal to 0"
    }
  ],
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Handling**:
- Use Spring `@Valid` annotation with custom validators
- Return structured error response via `@RestControllerAdvice`
- Log validation failures at DEBUG level

#### 2. Resource Not Found (404 Not Found)

**Scenarios**:
- Lesson ID does not exist
- User has no progress for the lesson (GET request)

**Response**:
```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Progress not found for user 123 and lesson 456",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Handling**:
- Throw `ResourceNotFoundException` in service layer
- Global exception handler maps to 404 response
- Frontend treats 404 on GET as "no progress, start from 0:00"

#### 3. Authentication Errors (401 Unauthorized)

**Scenarios**:
- JWT token missing
- JWT token expired
- JWT token invalid

**Response**:
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "JWT token has expired",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Handling**:
- `JwtAuthenticationEntryPoint` handles authentication failures
- Frontend triggers token refresh flow
- If refresh fails, redirect to login

#### 4. Database Errors (500 Internal Server Error)

**Scenarios**:
- Database connection failure
- Constraint violation (should not happen with proper validation)
- Transaction rollback

**Response**:
```json
{
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred. Please try again later.",
  "correlationId": "a7b3c9d2-4e5f-6g7h-8i9j-0k1l2m3n4o5p",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Handling**:
- Log full stack trace with correlation ID at ERROR level
- Return generic error message to client (don't expose internals)
- Service layer catches exceptions and wraps in custom exceptions
- Transaction is automatically rolled back by Spring

### Frontend Error Handling

#### 1. Network Errors

**Scenarios**:
- No internet connection
- API server unreachable
- Request timeout

**Handling**:
```typescript
const saveProgressWithRetry = async (
  request: SaveProgressRequest,
  retryCount = 0
): Promise<void> => {
  try {
    await apiClient.post(`/api/lessons/${lessonId}/progress`, request);
  } catch (error) {
    if (retryCount < 3 && isNetworkError(error)) {
      const backoffMs = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
      await sleep(backoffMs);
      return saveProgressWithRetry(request, retryCount + 1);
    }
    console.error('Failed to save progress after retries:', error);
    // Continue tracking locally without blocking playback
  }
};
```

#### 2. Validation Errors from Backend

**Handling**:
- Log error details to console
- Should not occur if frontend validation is correct
- Continue tracking locally

#### 3. Authentication Errors

**Handling**:
```typescript
if (error.response?.status === 401) {
  const refreshed = await authContext.refreshToken();
  if (refreshed) {
    // Retry the request with new token
    return saveProgressWithRetry(request, retryCount);
  } else {
    // Redirect to login
    router.push('/login');
  }
}
```

#### 4. YouTube Player Errors

**Scenarios**:
- Video unavailable
- Embed restrictions
- Invalid video ID

**Handling**:
- Display error UI with retry button (already implemented in VideoPlayer)
- Disable progress tracking if player fails to initialize
- Log player errors to console

---

## Performance Considerations

### Database Optimization

#### 1. Upsert with ON CONFLICT

**Implementation**:
```sql
INSERT INTO video_progress
  (user_id, lesson_id, current_time_seconds, duration_seconds,
   completion_percentage, is_completed, completed_at, created_at, updated_at)
VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
ON CONFLICT (user_id, lesson_id)
DO UPDATE SET
  current_time_seconds = EXCLUDED.current_time_seconds,
  duration_seconds = EXCLUDED.duration_seconds,
  completion_percentage = EXCLUDED.completion_percentage,
  is_completed = EXCLUDED.is_completed,
  completed_at = CASE
    WHEN EXCLUDED.is_completed = true AND video_progress.completed_at IS NULL
    THEN NOW()
    ELSE video_progress.completed_at
  END,
  updated_at = NOW()
WHERE
  video_progress.current_time_seconds < EXCLUDED.current_time_seconds
  OR video_progress.is_completed = false;
```

**Benefits**:
- Atomic operation (no race conditions)
- Single database round-trip
- Only updates if progress has advanced (reduces dead tuples)
- Preserves original `completed_at` timestamp

#### 2. Indexes

**Required Indexes**:
```sql
-- Composite unique index for constraint and lookup
CREATE UNIQUE INDEX idx_video_progress_user_lesson
  ON video_progress (user_id, lesson_id);

-- Index for bulk chapter progress queries
CREATE INDEX idx_video_progress_user_id
  ON video_progress (user_id);

-- Index for analytics queries (future)
CREATE INDEX idx_video_progress_lesson_id
  ON video_progress (lesson_id);

-- Index for completed lessons queries
CREATE INDEX idx_video_progress_completed
  ON video_progress (user_id, is_completed)
  WHERE is_completed = true;
```

**Performance Impact**:
- Single lesson lookup: ~10-20ms at p95
- Chapter bulk lookup (20 lessons): ~50-100ms at p95
- Upsert operation: ~20-50ms at p95

#### 3. Connection Pooling

**Configuration** (application.yml):
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
```

### Frontend Optimization

#### 1. Debouncing Progress Saves

**Strategy**:
- Use 10-second interval timer instead of continuous tracking
- Batch multiple updates if player state changes rapidly
- Only send most recent progress value

**Implementation**:
```typescript
const SAVE_INTERVAL_MS = 10000; // 10 seconds
let saveTimer: NodeJS.Timeout | null = null;
let pendingProgress: SaveProgressRequest | null = null;

const scheduleProgressSave = (progress: SaveProgressRequest) => {
  pendingProgress = progress; // Always keep latest

  if (!saveTimer) {
    saveTimer = setTimeout(async () => {
      if (pendingProgress) {
        await saveProgress(pendingProgress);
        pendingProgress = null;
      }
      saveTimer = null;
    }, SAVE_INTERVAL_MS);
  }
};
```

#### 2. Immediate Saves on Critical Events

**Events requiring immediate save**:
- Video paused
- User navigates away (beforeunload)
- Video completed (≥95% threshold)
- Player seeks to new position

**Implementation**:
```typescript
useEffect(() => {
  const handleBeforeUnload = () => {
    if (pendingProgress) {
      // Use sendBeacon for guaranteed delivery
      const blob = new Blob([JSON.stringify(pendingProgress)], {
        type: 'application/json'
      });
      navigator.sendBeacon(`/api/lessons/${lessonId}/progress`, blob);
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [pendingProgress, lessonId]);
```

#### 3. Local State Caching

**Strategy**:
- Cache progress state in React state
- Update UI immediately without waiting for API response
- Only sync to server periodically

**Implementation**:
```typescript
const [localProgress, setLocalProgress] = useState<VideoProgressDto | null>(null);

const updateProgress = (current: number, duration: number) => {
  const newProgress = {
    ...localProgress,
    currentTimeSeconds: current,
    durationSeconds: duration,
    completionPercentage: Math.round((current / duration) * 100)
  };

  setLocalProgress(newProgress); // Immediate UI update
  scheduleProgressSave(newProgress); // Async save
};
```

### API Response Times (Target SLAs)

| Endpoint | Target (p95) | Max Acceptable |
|----------|-------------|----------------|
| POST /api/lessons/{id}/progress | <200ms | 500ms |
| GET /api/lessons/{id}/progress | <100ms | 300ms |
| GET /api/lessons/chapters/{id}/progress | <300ms | 800ms |

### Scalability Considerations

#### Concurrent Users

**Capacity**:
- System should handle 100 concurrent video watchers
- Each user generates 6 requests/minute (10-second intervals)
- Total: 600 requests/minute = 10 requests/second
- Database can handle 1000+ simple upserts/second
- **Conclusion**: No bottleneck expected at current scale

#### Database Growth

**Projections**:
- 1000 users × 100 lessons = 100,000 progress records (worst case)
- Each record: ~200 bytes
- Total storage: ~20 MB
- With indexes: ~60 MB
- **Conclusion**: Negligible storage impact

**Maintenance**:
- Autovacuum will handle dead tuples from updates
- No archive/purge strategy needed for now
- Consider partitioning if table exceeds 10M records (unlikely)

---

## Security Considerations

### Authentication & Authorization

#### JWT Token Validation

**Flow**:
1. Frontend includes JWT in `Authorization: Bearer <token>` header
2. `JwtAuthenticationFilter` validates token signature and expiration
3. Filter extracts user ID from token claims
4. Sets Spring Security context with authenticated user
5. Controller receives `Authentication` object with user details

**Implementation**:
```java
@PostMapping("/{lessonId}/progress")
public ResponseEntity<VideoProgressDto> saveProgress(
    @PathVariable Long lessonId,
    @RequestBody @Valid SaveProgressRequest request,
    Authentication authentication
) {
    // Extract user ID from JWT claims
    Long userId = ((UserDetails) authentication.getPrincipal()).getUserId();

    VideoProgressDto progress = videoProgressService.saveProgress(
        userId, lessonId, request
    );

    return ResponseEntity.ok(progress);
}
```

### Data Privacy

#### User Isolation

**Guarantee**: Users can ONLY access their own progress data

**Enforcement**:
- Always filter queries by authenticated user ID
- Never accept user ID from request body (use JWT claims only)
- Repository methods always include `userId` in WHERE clause

```java
// ✓ CORRECT: User ID from authentication
public VideoProgressDto getProgress(Long userId, Long lessonId) {
    return videoProgressRepository
        .findByUserIdAndLessonId(userId, lessonId)
        .map(VideoProgressDto::from)
        .orElse(null);
}

// ✗ WRONG: Never accept user ID from request
public VideoProgressDto getProgress(SaveProgressRequest request) {
    // SECURITY VULNERABILITY - don't do this!
    return videoProgressRepository
        .findByUserIdAndLessonId(request.getUserId(), request.getLessonId());
}
```

### Input Validation

#### Server-Side Validation

**Rules**:
- `currentTimeSeconds` ≥ 0
- `durationSeconds` > 0
- `completionPercentage` between 0 and 100
- `currentTimeSeconds` ≤ `durationSeconds` (cap at duration if exceeded)

**Implementation**:
```java
@Data
public class SaveProgressRequest {
    @NotNull(message = "Current time is required")
    @PositiveOrZero(message = "Current time must be non-negative")
    private Double currentTimeSeconds;

    @NotNull(message = "Duration is required")
    @Positive(message = "Duration must be positive")
    private Double durationSeconds;

    @NotNull(message = "Completion percentage is required")
    @Min(value = 0, message = "Completion percentage must be at least 0")
    @Max(value = 100, message = "Completion percentage must be at most 100")
    private Integer completionPercentage;

    @NotNull(message = "Completion status is required")
    private Boolean isCompleted;

    @AssertTrue(message = "Current time cannot exceed duration")
    public boolean isCurrentTimeValid() {
        if (currentTimeSeconds == null || durationSeconds == null) {
            return true; // Let @NotNull handle null checks
        }
        return currentTimeSeconds <= durationSeconds;
    }
}
```

### CORS Configuration

**Existing Configuration** (already in SecurityConfig.java):
- Allowed origins: `http://localhost:3001`, `https://waterballsa.com`
- Allowed methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Allowed headers: All (*)
- Credentials: true

**No changes needed** - progress endpoints will inherit CORS settings.

---

## Testing Strategy

### Backend Testing

#### Unit Tests

**VideoProgressService Test**

**Location**: `backend/src/test/java/com/waterballsa/backend/service/VideoProgressServiceTest.java`

**Coverage**:
- `saveProgress_NewProgress_CreatesRecord`
- `saveProgress_ExistingProgress_UpdatesRecord`
- `saveProgress_CompletionThreshold_MarksAsCompleted`
- `saveProgress_InvalidData_ThrowsValidationException`
- `saveProgress_CurrentTimeExceedsDuration_CapsAtDuration`
- `getProgress_Exists_ReturnsDto`
- `getProgress_NotExists_ReturnsNull`
- `getChapterProgress_MultipleRecords_ReturnsList`

#### Integration Tests

**VideoProgressController Integration Test**

**Location**: `backend/src/test/java/com/waterballsa/backend/controller/VideoProgressControllerTest.java`

**Setup**:
- Use `@SpringBootTest` with TestContainers for real PostgreSQL
- Mock JWT authentication with `@WithMockUser`
- Use `MockMvc` for HTTP request testing

**Coverage**:
- `POST /api/lessons/{id}/progress` - success (200)
- `POST /api/lessons/{id}/progress` - validation error (400)
- `POST /api/lessons/{id}/progress` - unauthorized (401)
- `POST /api/lessons/{id}/progress` - lesson not found (404)
- `GET /api/lessons/{id}/progress` - success (200)
- `GET /api/lessons/{id}/progress` - no progress (404)
- `GET /api/lessons/chapters/{id}/progress` - success (200)

#### Repository Tests

**VideoProgressRepository Test**

**Coverage**:
- Test upsert SQL with conflict resolution
- Test composite unique constraint enforcement
- Test cascading deletes when user/lesson deleted
- Test bulk queries for chapter progress

### Frontend Testing

#### Unit Tests

**useVideoProgress Hook Test**

**Location**: `frontend/src/hooks/__tests__/useVideoProgress.test.tsx`

**Setup**:
- Use `@testing-library/react-hooks`
- Mock API client
- Mock YouTube IFrame Player API

**Coverage**:
- Initialize hook and fetch existing progress
- Start from 0:00 when no progress exists
- Save progress every 10 seconds during playback
- Mark as completed at 95% threshold
- Retry on network error with exponential backoff
- Skip tracking when user not authenticated

**VideoPlayer Component Test**

**Location**: `frontend/src/components/__tests__/VideoPlayer.test.tsx`

**Coverage**:
- Render player with valid YouTube URL
- Initialize progress tracking hook
- Seek to saved position on mount
- Display error state for invalid URL
- Emit progress updates during playback
- Emit completion event at 95% threshold

**LessonProgressIndicator Component Test**

**Coverage**:
- Display checkmark for completed lessons
- Display progress percentage for in-progress lessons
- Display empty indicator for not started lessons
- Show tooltip with completion date
- Update when progress changes

#### E2E Tests

**Video Progress Tracking Flow**

**Location**: `frontend/e2e/video-progress.spec.ts`

**Setup**:
- Use Playwright
- Seed database with test user and lessons
- Mock Google OAuth for login

**Scenarios**:
1. **First-time viewing**:
   - Given a logged-in user viewing a video for the first time
   - When the user plays the video for 30 seconds
   - Then progress should be saved to the backend
   - And the lesson list should show "in progress"

2. **Resume from saved position**:
   - Given a logged-in user with 45% progress on a video
   - When the user opens the lesson page
   - Then the video should seek to the saved position
   - And playback should resume from there

3. **Complete a lesson**:
   - Given a logged-in user watching a video
   - When the user reaches 95% of the video duration
   - Then the lesson should be marked as completed
   - And the lesson list should show a green checkmark
   - And the completion date should be displayed in the tooltip

4. **Bulk progress display**:
   - Given a logged-in user who has completed 3 lessons and partially watched 2 lessons in a chapter
   - When the user views the lesson list
   - Then 3 lessons should show checkmarks
   - And 2 lessons should show progress percentages
   - And 5 lessons should show "not started" indicators

5. **Unauthenticated user**:
   - Given a user who is not logged in
   - When the user plays a free video
   - Then no progress should be tracked
   - And the video should start from 0:00 on every page load

### Test Coverage Goals

| Component | Target Coverage | Critical Paths Coverage |
|-----------|----------------|------------------------|
| Backend Services | ≥80% | ≥95% |
| Backend Controllers | ≥80% | ≥95% |
| Backend Repositories | ≥70% | ≥90% |
| Frontend Hooks | ≥80% | ≥95% |
| Frontend Components | ≥75% | ≥90% |
| E2E Scenarios | N/A | 100% |

---

## Database Migration

### Migration Script

**File**: `backend/src/main/resources/db/migration/V15__create_video_progress_table.sql`

**Version**: V15 (next available after V14)

**Content**:
```sql
-- Create video_progress table for tracking user video playback
CREATE TABLE video_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    lesson_id BIGINT NOT NULL,
    current_time_seconds DOUBLE PRECISION NOT NULL DEFAULT 0,
    duration_seconds DOUBLE PRECISION NOT NULL,
    completion_percentage INTEGER NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Foreign keys
    CONSTRAINT fk_video_progress_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_video_progress_lesson
        FOREIGN KEY (lesson_id)
        REFERENCES lessons(id)
        ON DELETE CASCADE,

    -- Constraints
    CONSTRAINT video_progress_current_time_positive
        CHECK (current_time_seconds >= 0),

    CONSTRAINT video_progress_duration_positive
        CHECK (duration_seconds > 0),

    CONSTRAINT video_progress_completion_range
        CHECK (completion_percentage >= 0 AND completion_percentage <= 100),

    CONSTRAINT video_progress_current_lte_duration
        CHECK (current_time_seconds <= duration_seconds),

    -- Unique constraint: one progress record per user-lesson combination
    CONSTRAINT video_progress_unique_user_lesson
        UNIQUE (user_id, lesson_id)
);

-- Indexes for query performance
CREATE INDEX idx_video_progress_user_id
    ON video_progress (user_id);

CREATE INDEX idx_video_progress_lesson_id
    ON video_progress (lesson_id);

CREATE INDEX idx_video_progress_completed
    ON video_progress (user_id, is_completed)
    WHERE is_completed = true;

-- Trigger to auto-update updated_at timestamp
CREATE TRIGGER update_video_progress_updated_at
    BEFORE UPDATE ON video_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE video_progress IS
    'Tracks user video playback progress for resume functionality and completion tracking';

COMMENT ON COLUMN video_progress.current_time_seconds IS
    'Current playback position in seconds';

COMMENT ON COLUMN video_progress.duration_seconds IS
    'Total video duration in seconds';

COMMENT ON COLUMN video_progress.completion_percentage IS
    'Percentage of video watched (0-100)';

COMMENT ON COLUMN video_progress.is_completed IS
    'Whether user has completed the video (≥95% watched)';

COMMENT ON COLUMN video_progress.completed_at IS
    'Timestamp when video was first marked as completed (preserved on rewatch)';
```

### Migration Verification

**Rollback Script** (if needed):
```sql
-- V15__create_video_progress_table_rollback.sql
DROP TRIGGER IF EXISTS update_video_progress_updated_at ON video_progress;
DROP TABLE IF EXISTS video_progress CASCADE;
```

**Testing**:
1. Apply migration to clean database
2. Verify table structure: `\d video_progress`
3. Test unique constraint: Insert duplicate user-lesson combo (should fail)
4. Test foreign key cascades: Delete user, verify progress records deleted
5. Test check constraints: Insert invalid data (negative time, percentage > 100)

---

## Implementation Plan Summary

### Phase 1: Database & Backend (Priority 1)

1. Create database migration (V15)
2. Create VideoProgress entity
3. Create VideoProgressRepository with upsert query
4. Create SaveProgressRequest and VideoProgressDto
5. Create VideoProgressService with business logic
6. Create VideoProgressController with endpoints
7. Update SecurityConfig (if needed - likely no changes)
8. Write unit tests for service
9. Write integration tests for controller
10. Write repository tests

### Phase 2: Frontend Core (Priority 2)

1. Create types (VideoProgressDto, SaveProgressRequest)
2. Create API client functions
3. Create useVideoProgress hook
4. Add YouTube IFrame Player API script to layout
5. Enhance VideoPlayer component
6. Write unit tests for hook
7. Write unit tests for VideoPlayer

### Phase 3: Frontend UI (Priority 3)

1. Create LessonProgressIndicator component
2. Create useChapterProgress hook
3. Integrate indicators into lesson sidebar
4. Write unit tests for components
5. Write E2E tests

### Phase 4: Testing & Documentation (Priority 4)

1. Run full test suite
2. Verify test coverage ≥80%
3. Update OpenAPI/Swagger documentation
4. Update CLAUDE.md with new feature
5. Manual QA testing
6. Performance testing

---

## Open Questions & Decisions

### Decisions Made

| Question | Decision | Rationale |
|----------|----------|-----------|
| How to handle race conditions on concurrent updates? | Use PostgreSQL `INSERT ON CONFLICT UPDATE` (upsert) | Atomic operation, no application-level locking needed |
| When to mark lesson as completed? | ≥95% of duration, or 100% for videos <30s | Industry standard, allows for credits/outros |
| How often to save progress? | Every 10 seconds during playback | Balance between data freshness and API load |
| Should we track progress for unauthenticated users? | No | Requires persistent storage, adds complexity for minimal value |
| How to handle video seek events? | Save immediately within 2 seconds | Ensure progress reflects actual watched position |
| Should we preserve original completion timestamp? | Yes | Valuable for analytics, user history |
| How to handle token expiration during playback? | Attempt refresh, continue tracking locally if fails | Don't interrupt playback, sync later |

### Future Considerations

1. **Offline Support**: Could use Service Workers and Background Sync API for offline progress tracking
2. **Analytics**: Track watch patterns, drop-off points, rewatch behavior
3. **Speed Tracking**: Track playback speed (1.25x, 1.5x, 2x) for analytics
4. **Partial Credit**: Award XP for partial completion (future gamification)
5. **Cross-Device Sync Conflicts**: Currently last-write-wins; could implement more sophisticated conflict resolution

---

## Appendix

### YouTube IFrame Player API Integration

#### Loading the API

**Location**: `frontend/src/app/layout.tsx`

```typescript
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.youtube.com/iframe_api"
          strategy="beforeInteractive"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

#### Player Initialization

```typescript
const onYouTubeIframeAPIReady = () => {
  const player = new YT.Player('player-container-id', {
    height: '360',
    width: '640',
    videoId: extractVideoId(videoUrl),
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
};

const onPlayerReady = (event: YT.PlayerEvent) => {
  // Seek to saved position if exists
  if (savedProgress && savedProgress.currentTimeSeconds > 0) {
    const duration = event.target.getDuration();
    // Don't resume if within 10s of end
    if (savedProgress.currentTimeSeconds < duration - 10) {
      event.target.seekTo(savedProgress.currentTimeSeconds, true);
    }
  }
};

const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
  if (event.data === YT.PlayerState.PLAYING) {
    startProgressTracking(event.target);
  } else if (event.data === YT.PlayerState.PAUSED) {
    stopProgressTracking();
    saveProgressImmediately(event.target);
  } else if (event.data === YT.PlayerState.ENDED) {
    markAsCompleted();
  }
};
```

#### Progress Tracking Loop

```typescript
const startProgressTracking = (player: YT.Player) => {
  if (progressInterval) {
    clearInterval(progressInterval);
  }

  progressInterval = setInterval(() => {
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();

    if (duration && duration > 0) {
      const completionPct = Math.round((currentTime / duration) * 100);
      const isCompleted = completionPct >= 95;

      scheduleProgressSave({
        currentTimeSeconds: currentTime,
        durationSeconds: duration,
        completionPercentage: completionPct,
        isCompleted
      });

      if (isCompleted && !wasCompleted) {
        onComplete?.();
        wasCompleted = true;
      }
    }
  }, 10000); // 10 seconds
};
```

### API Request/Response Examples

#### Save Progress (POST /api/lessons/{lessonId}/progress)

**Request**:
```http
POST /api/lessons/123/progress HTTP/1.1
Host: localhost:8081
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "currentTimeSeconds": 135.5,
  "durationSeconds": 300.0,
  "completionPercentage": 45,
  "isCompleted": false
}
```

**Response (200 OK)**:
```json
{
  "id": 789,
  "userId": 456,
  "lessonId": 123,
  "currentTimeSeconds": 135.5,
  "durationSeconds": 300.0,
  "completionPercentage": 45,
  "isCompleted": false,
  "completedAt": null,
  "createdAt": "2025-01-15T10:25:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

#### Get Progress (GET /api/lessons/{lessonId}/progress)

**Request**:
```http
GET /api/lessons/123/progress HTTP/1.1
Host: localhost:8081
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK)**:
```json
{
  "id": 789,
  "userId": 456,
  "lessonId": 123,
  "currentTimeSeconds": 285.0,
  "durationSeconds": 300.0,
  "completionPercentage": 95,
  "isCompleted": true,
  "completedAt": "2025-01-15T10:35:00Z",
  "createdAt": "2025-01-15T10:25:00Z",
  "updatedAt": "2025-01-15T10:35:00Z"
}
```

**Response (404 Not Found)** - No progress exists:
```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Progress not found for user 456 and lesson 123",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

#### Get Chapter Progress (GET /api/lessons/chapters/{chapterId}/progress)

**Request**:
```http
GET /api/lessons/chapters/10/progress HTTP/1.1
Host: localhost:8081
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK)**:
```json
[
  {
    "id": 789,
    "userId": 456,
    "lessonId": 123,
    "currentTimeSeconds": 285.0,
    "durationSeconds": 300.0,
    "completionPercentage": 95,
    "isCompleted": true,
    "completedAt": "2025-01-15T10:35:00Z",
    "createdAt": "2025-01-15T10:25:00Z",
    "updatedAt": "2025-01-15T10:35:00Z"
  },
  {
    "id": 790,
    "userId": 456,
    "lessonId": 124,
    "currentTimeSeconds": 60.0,
    "durationSeconds": 240.0,
    "completionPercentage": 25,
    "isCompleted": false,
    "completedAt": null,
    "createdAt": "2025-01-15T10:40:00Z",
    "updatedAt": "2025-01-15T10:41:00Z"
  }
]
```

---

**Document Version**: 2.0
**Last Updated**: 2025-11-28
**Author**: Design Architect
**Status**: Draft - Awaiting Approval
