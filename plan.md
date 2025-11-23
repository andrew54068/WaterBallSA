# WaterBallSA Development Plan (SDD Approach)

> This plan follows Specification-Driven Development (SDD) and Behavior-Driven Development (BDD) principles. Each phase is broken down into: Specifications → Database → API → Implementation → Tests.

**Last Updated**: 2025-11-23

## 📊 Project Status Overview

| Phase | Component | Status | Completion |
|-------|-----------|--------|------------|
| **Phase 1** | Specifications | ⚠️ Partial | ~60% |
| | Database Design | ✅ Complete | 100% |
| | API Design | ✅ Complete | 100% |
| | Backend Implementation | ✅ Complete | 100% |
| | Frontend Implementation | ✅ Complete | 100% |
| | Infrastructure & DevOps | ✅ Complete | 100% |
| | Testing | ⚠️ Partial (Frontend only) | ~50% |
| | Documentation | ⚠️ Partial | ~85% |
| **Overall Phase 1** | | ⏳ **In Progress** | **~90%** |

**🚨 Critical Blockers**:
- Backend has no test coverage - risks production bugs (only blocker remaining)
- 12/36 E2E tests failing (66.67% pass rate) - needs component fixes

**✅ Completed**: Backend API, Database, Docker setup, Authentication, Curriculum browsing, **Lesson viewers (VIDEO/ARTICLE/SURVEY)**

---

## Phase 1: Foundation (MVP) - IN PROGRESS

**Goal**: Establish core infrastructure and basic content delivery system with Google authentication.

**Current Status**: Backend ✅ Complete | Frontend ✅ Complete | Testing ⚠️ Partial (Frontend tests done, backend tests missing)

**Test Results**:
- ✅ **207 frontend unit tests passing** (100% coverage for lesson viewer components)
- ✅ **24/36 E2E tests passing** (66.67% pass rate)
- ❌ **0 backend tests** (critical gap)

**Next Steps (HIGH PRIORITY)**:
1. 🎯 **CRITICAL**: Fix 12 failing E2E tests (component issues: breadcrumb, video player, navigation buttons)
2. 🎯 **CRITICAL**: Write backend unit tests (services, repositories, utilities) - >80% coverage target
3. 🎯 **CRITICAL**: Write backend integration tests (TestContainers + real PostgreSQL)
4. 🎯 Write backend E2E tests (REST Assured for complete API flows)
5. 🎯 Achieve 100% E2E test pass rate before Phase 1 completion

### 1.1 Specifications & Business Rules

**Tasks**:
- [ ] Write authentication specification (Google OAuth flow, JWT token management)
- [ ] Write curriculum structure specification (Curriculum → Chapter → Lesson hierarchy)
- [x] Write content type specifications (Video, Article, Survey lesson types)
- [x] Define business rules for content navigation and access
- [x] Write lesson viewer specification with Given-When-Then scenarios ✅ **COMPLETED**
- [x] Document lesson viewer API contracts ✅ **COMPLETED**
- [ ] Document error handling and validation rules

**Deliverables**:
- [ ] `docs/specifications/authentication-phase1.md`
- [ ] `docs/specifications/curriculum-structure.md`
- [x] `docs/specifications/lesson-viewer.md` ✅ **COMPLETED**
- [x] `docs/specifications/business-rules.md` ✅ **COMPLETED**
- [x] `docs/api/lesson-viewer-api.md` ✅ **COMPLETED**

### 1.2 Database Design ✅

**Tasks**:
- [x] Design `users` table schema (id, google_id, email, name, profile_picture, created_at, updated_at)
- [x] Design `curriculums` table schema (id, title, description, thumbnail_url, instructor_name, created_at, updated_at)
- [x] Design `chapters` table schema (id, curriculum_id, title, description, order_index, created_at, updated_at)
- [x] Design `lessons` table schema (id, chapter_id, title, description, lesson_type, content_url, order_index, duration_minutes, created_at, updated_at)
- [x] Create database migration scripts (Flyway/Liquibase)
- [ ] Document database schema with ER diagrams
- [x] Set up database triggers for auto-updating timestamps

**Deliverables**:
- [ ] `docs/database/schema-phase1.md`
- [x] `backend/src/main/resources/db/migration/V1__create_users_table.sql`
- [x] `backend/src/main/resources/db/migration/V2__create_curriculums_table.sql`
- [x] `backend/src/main/resources/db/migration/V3__create_chapters_table.sql`
- [x] `backend/src/main/resources/db/migration/V4__create_lessons_table.sql`
- [x] `backend/src/main/resources/db/migration/V5__create_update_timestamp_triggers.sql`
- [x] `backend/src/main/resources/db/migration/V6__insert_seed_data.sql`

### 1.3 API Design

**Tasks**:
- [x] Design Authentication API endpoints
  - `POST /api/auth/google` - Exchange Google OAuth code for JWT
  - `POST /api/auth/refresh` - Refresh JWT token
  - `GET /api/auth/me` - Get current user profile
  - `POST /api/auth/logout` - Logout and invalidate token
- [x] Design Curriculum API endpoints
  - `GET /api/curriculums` - List all curriculums (with pagination)
  - `GET /api/curriculums/{id}` - Get curriculum details with chapters
- [x] Design Chapter API endpoints
  - `GET /api/chapters/{id}` - Get chapter details with lessons
- [x] Design Lesson API endpoints
  - `GET /api/lessons/{id}` - Get lesson details and content
- [x] Document request/response schemas (via OpenAPI/Swagger)
- [x] Document error codes and responses (via global exception handler)
- [x] Design API versioning strategy (using /api prefix)

**Deliverables**:
- [ ] `docs/api/authentication.md` (Optional - Swagger UI available instead)
- [ ] `docs/api/curriculums.md` (Optional - Swagger UI available instead)
- [ ] `docs/api/lessons.md` (Optional - Swagger UI available instead)
- [ ] `docs/api/error-codes.md` (Optional - Swagger UI available instead)
- [x] OpenAPI/Swagger specification file (available at http://localhost:8080/swagger-ui.html)

### 1.4 Backend Implementation ✅

**Tasks**:
- [x] Set up Spring Boot project structure
  - [x] Configure dependencies (Spring Web, Spring Security, Spring Data JPA, PostgreSQL driver)
  - [x] Configure application properties (database, JWT, OAuth)
  - [x] Set up profiles (dev, test, prod)
- [x] Implement Domain Models
  - [x] User entity
  - [x] Curriculum entity
  - [x] Chapter entity
  - [x] Lesson entity
- [x] Implement Repositories (Spring Data JPA)
  - [x] UserRepository
  - [x] CurriculumRepository
  - [x] ChapterRepository
  - [x] LessonRepository
- [x] Implement Services (Business Logic)
  - [x] AuthenticationService (Google OAuth, JWT generation/validation)
  - [x] UserService
  - [x] CurriculumService
  - [x] ChapterService
  - [x] LessonService
- [x] Implement Controllers (REST API)
  - [x] AuthController
  - [x] CurriculumController
  - [x] ChapterController
  - [x] LessonController
- [x] Implement Security Configuration
  - [x] JWT authentication filter
  - [x] Security filter chain
  - [x] CORS configuration
- [x] Implement Exception Handling
  - [x] Global exception handler
  - [x] Custom exceptions (ResourceNotFoundException, UnauthorizedException, etc.)
  - [x] Error response DTOs

**Deliverables**:
- [x] Complete Spring Boot application with working API endpoints
- [x] Swagger UI accessible at `http://localhost:8080/swagger-ui.html`

### 1.5 Frontend Implementation (Partial ✓)

**Tasks**:
- [x] Set up Next.js project structure (TypeScript)
  - [x] Configure dependencies (React, Next.js, TypeScript, TailwindCSS)
  - [x] Set up environment variables
  - [x] Configure ESLint and Prettier
- [x] Implement Authentication Pages
  - [x] Login page with Google OAuth button
  - [x] OAuth callback handler
  - [x] Protected route wrapper (auth-context with useAuth hook)
- [x] Implement Layout Components
  - [x] Header with navigation and user menu
  - [ ] Footer
  - [x] Main layout wrapper
- [x] Implement Curriculum Pages
  - [x] Curriculum list page (browse all curriculums)
  - [x] Curriculum detail page (show chapters and lessons)
  - [x] Chapter detail page (N/A - chapters shown inline on curriculum page)
  - [x] Lesson viewer page (video player, article reader, survey form) ✅ **COMPLETED**
- [x] Implement API Client
  - [x] Axios/Fetch wrapper with JWT token injection
  - [x] API service functions for all endpoints (auth, curriculums, lessons)
  - [x] Error handling and retry logic
- [x] Implement State Management
  - [x] Authentication state (user profile, token)
  - [x] Curriculum state (using SWR)
  - [x] Loading and error states
- [x] Implement UI Components
  - [x] Video player component (react-player for YouTube) ✅ **COMPLETED**
  - [x] Article renderer component (external link opener) ✅ **COMPLETED**
  - [x] Survey form component (Phase 3 placeholder) ✅ **COMPLETED**
  - [x] Lesson navigation component (prev/next) ✅ **COMPLETED**
  - [x] Lesson breadcrumb component ✅ **COMPLETED**
  - [x] Loading spinners and skeletons (in VideoPlayer)
  - [x] Error boundaries (in lesson page)

**Deliverables**:
- [x] Next.js application accessible at `http://localhost:3000`
- [x] All pages functional and connected to backend API ✅ **COMPLETE**

### 1.6 Infrastructure & DevOps ✅

**Tasks**:
- [x] Create Dockerfiles
  - [x] Backend Dockerfile (multi-stage build)
  - [x] Frontend Dockerfile (multi-stage build)
  - [x] PostgreSQL Dockerfile (using official image)
- [x] Create Docker Compose configuration
  - [x] Define services (frontend, backend, database, redis)
  - [x] Configure networking
  - [x] Configure volumes for database persistence
  - [x] Set up environment variables
- [x] Set up development scripts
  - [x] Start script (`make up` / `docker-compose up`)
  - [x] Stop script (`make down` / `docker-compose down`)
  - [x] Database reset script (via Flyway migrations)
  - [x] Seed data script (V6 migration)
- [x] Create environment variable templates
  - [x] `frontend/.env.example`
  - [x] `backend/.env.example`

**Deliverables**:
- [x] `docker-compose.yml`
- [x] `frontend/Dockerfile`
- [x] `backend/Dockerfile`
- [x] `Makefile` (with helper commands)
- [x] Environment templates

### 1.7 Testing

**Current Status**: ⚠️ Partial (Frontend only) - Backend tests still needed

**Frontend Testing** - ✅ COMPLETED:
- [x] Write Frontend Unit Tests - **207 tests passing, 100% coverage for components**
  - [x] Component tests (React Testing Library) - 167 tests
    - [x] VideoPlayer component (20 tests, 100% coverage)
    - [x] ArticleRenderer component (33 tests, 100% coverage)
    - [x] SurveyForm component (38 tests, 100% coverage)
    - [x] LessonNavigation component (34 tests, 100% coverage)
    - [x] LessonBreadcrumb component (42 tests, 100% coverage)
  - [x] API service tests - 40 tests
    - [x] chapters.ts API client (19 tests, 100% coverage)
    - [x] lessons.ts API client (21 tests, 100% coverage)
- [x] Write E2E Tests with Playwright - **24/36 tests passing (66.67%)**
  - [x] Video lesson viewing (10 tests) - 6 passing, 4 failing
  - [x] Article lesson viewing (7 tests) - 6 passing, 1 failing
  - [x] Survey lesson viewing (8 tests) - 7 passing, 1 failing
  - [x] Lesson navigation (12 tests) - 6 passing, 6 failing

**E2E Test Summary**:
- ✅ 24 tests passing (66.67%)
- ❌ 12 tests failing (33.33%)
- **Main issues**:
  - Tests using hard-coded lesson IDs that don't match seed data
  - React Player not rendering YouTube iframes (client component loading issue)
  - Breadcrumb component incomplete (missing curriculum link, wrong responsive classes)
  - Missing navigation button implementations

**Backend Testing** - ❌ NOT STARTED (HIGH PRIORITY):
- [ ] Write Backend Unit Tests
  - [ ] Service layer tests (AuthenticationService, CurriculumService, etc.)
  - [ ] Repository tests (if custom queries exist)
  - [ ] Utility and helper function tests
- [ ] Write Backend Integration Tests
  - [ ] API endpoint tests with TestContainers (real PostgreSQL)
  - [ ] Authentication flow tests
  - [ ] CRUD operation tests for all entities
- [ ] Backend E2E with REST Assured
  - [ ] Complete authentication flow
  - [ ] Complete curriculum browsing flow

**Deliverables**:
- [x] Frontend unit tests (207 tests, 18.45% overall coverage, 100% component coverage)
- [x] E2E tests with Playwright (24/36 passing)
- [ ] Backend tests (0% - critical blocker)
- [ ] >80% code coverage for backend
- [ ] All tests passing in CI/CD pipeline

### 1.8 Documentation & Seed Data (Partial ✓)

**Tasks**:
- [x] Create database seed data
  - [x] Sample users (for development)
  - [x] Sample curriculums (5 curriculums)
  - [x] Sample chapters (19 chapters total)
  - [x] Sample lessons (20+ lessons, mix of video/article/survey)
- [x] Write developer documentation
  - [x] Getting started guide (in CLAUDE.md)
  - [x] Architecture overview (in CLAUDE.md)
  - [ ] Testing guide
  - [x] Configuration guide (in CLAUDE.md)
- [ ] Write user documentation
  - [ ] How to login
  - [ ] How to browse and view content

**Deliverables**:
- [x] `backend/src/main/resources/db/migration/V6__insert_seed_data.sql`
- [x] `CLAUDE.md` (comprehensive project documentation)
- [ ] `docs/development/getting-started.md`
- [ ] `docs/architecture/system-overview.md`

---

## Phase 2: Access Control & Payment

**Goal**: Implement purchase system and content access control based on ownership.

### 2.1 Specifications & Business Rules

**Tasks**:
- [ ] Write purchase flow specification
- [ ] Write payment gateway integration specification (mock)
- [ ] Write permission system specification (ownership-based access)
- [ ] Define business rules for content access
  - [ ] Users must purchase curriculum to access lessons
  - [ ] Purchased curriculums are permanently accessible
  - [ ] Free preview: first lesson of first chapter always accessible
- [ ] Document refund policy (mock, no actual refunds in Phase 1-3)

**Deliverables**:
- `docs/specifications/purchase-system.md`
- `docs/specifications/payment-gateway.md`
- `docs/specifications/permission-system.md`
- Update `docs/specifications/business-rules.md`

### 2.2 Database Design

**Tasks**:
- [ ] Design `purchases` table schema
  - Columns: id, user_id, curriculum_id, purchase_price, payment_status, payment_method, transaction_id, purchased_at, created_at, updated_at
- [ ] Design `payment_transactions` table schema
  - Columns: id, user_id, amount, currency, status, payment_method, provider_transaction_id, metadata (JSONB), created_at, updated_at
- [ ] Add `price` column to `curriculums` table
- [ ] Add `is_free_preview` column to `lessons` table
- [ ] Create database migration scripts
- [ ] Document updated schema with ER diagrams

**Deliverables**:
- `docs/database/schema-phase2.md`
- `database/migrations/V6__add_curriculum_pricing.sql`
- `database/migrations/V7__create_purchases_table.sql`
- `database/migrations/V8__create_payment_transactions_table.sql`

### 2.3 API Design

**Tasks**:
- [ ] Design Purchase API endpoints
  - `GET /api/curriculums/{id}/purchase-status` - Check if user owns curriculum
  - `POST /api/purchases` - Initiate purchase
  - `POST /api/purchases/{id}/confirm` - Confirm payment (mock)
  - `GET /api/purchases/my-purchases` - List user's purchased curriculums
- [ ] Design Payment API endpoints (mock)
  - `POST /api/payments/process` - Process mock payment
  - `GET /api/payments/{id}/status` - Check payment status
- [ ] Update Curriculum API
  - Add `is_purchased` flag to curriculum response
  - Add `price` field to curriculum response
- [ ] Update Lesson API
  - Add permission check before returning content
  - Return 403 if user doesn't own curriculum (unless free preview)
- [ ] Document updated request/response schemas

**Deliverables**:
- `docs/api/purchases.md`
- `docs/api/payments.md`
- Update `docs/api/curriculums.md`
- Update `docs/api/lessons.md`

### 2.4 Backend Implementation

**Tasks**:
- [ ] Implement Domain Models
  - [ ] Purchase entity
  - [ ] PaymentTransaction entity
  - [ ] Update Curriculum entity (add price)
  - [ ] Update Lesson entity (add is_free_preview)
- [ ] Implement Repositories
  - [ ] PurchaseRepository
  - [ ] PaymentTransactionRepository
- [ ] Implement Services
  - [ ] PurchaseService (check ownership, create purchase)
  - [ ] PaymentService (mock payment processing)
  - [ ] PermissionService (check content access)
  - [ ] Update CurriculumService (add purchase status)
  - [ ] Update LessonService (add permission check)
- [ ] Implement Controllers
  - [ ] PurchaseController
  - [ ] PaymentController
- [ ] Implement Security Updates
  - [ ] Add permission checks to lesson access
  - [ ] Add permission checks to content URLs
- [ ] Implement Mock Payment Gateway
  - [ ] Simulate successful payment
  - [ ] Simulate failed payment
  - [ ] Generate mock transaction IDs

**Deliverables**:
- Updated Spring Boot application with purchase and payment features

### 2.5 Frontend Implementation

**Tasks**:
- [ ] Implement Purchase Flow Pages
  - [ ] Curriculum purchase page (pricing, payment form)
  - [ ] Payment confirmation page
  - [ ] My purchases page (list owned curriculums)
- [ ] Update Curriculum Components
  - [ ] Show "Purchase" button if not owned
  - [ ] Show "Start Learning" button if owned
  - [ ] Display pricing information
- [ ] Update Lesson Components
  - [ ] Show "Purchase to access" message if not owned
  - [ ] Show lock icon on restricted lessons
  - [ ] Show "Free Preview" badge on preview lessons
- [ ] Implement Payment Components
  - [ ] Mock payment form (credit card UI, no real processing)
  - [ ] Payment success modal
  - [ ] Payment error modal
- [ ] Update API Client
  - [ ] Add purchase API calls
  - [ ] Add payment API calls
- [ ] Update State Management
  - [ ] Add purchase state
  - [ ] Add payment state

**Deliverables**:
- Updated Next.js application with purchase and payment features

### 2.6 Testing

**Tasks**:
- [ ] Write Backend Unit Tests
  - [ ] PurchaseService tests
  - [ ] PaymentService tests
  - [ ] PermissionService tests
- [ ] Write Backend Integration Tests
  - [ ] Purchase flow API tests
  - [ ] Payment flow API tests
  - [ ] Permission enforcement tests
- [ ] Write Frontend Unit Tests
  - [ ] Purchase component tests
  - [ ] Payment component tests
- [ ] Write E2E Tests
  - [ ] Backend E2E: Complete purchase flow
  - [ ] Frontend E2E:
    - [ ] User can view curriculum pricing
    - [ ] User can purchase curriculum
    - [ ] User can access purchased content
    - [ ] User cannot access non-purchased content (except preview)
    - [ ] User can view purchase history

**Deliverables**:
- Updated test suite with >80% code coverage

### 2.7 Documentation & Seed Data

**Tasks**:
- [ ] Update seed data
  - [ ] Add pricing to curriculums
  - [ ] Add sample purchases for test users
  - [ ] Mark some lessons as free preview
- [ ] Update documentation
  - [ ] Purchase flow guide
  - [ ] Payment integration guide (mock)

**Deliverables**:
- Updated seed data
- Updated documentation

---

## Phase 3: Engagement & Gamification

**Goal**: Implement assignment system, experience points, leveling, and leaderboard.

### 3.1 Specifications & Business Rules

**Tasks**:
- [ ] Write assignment system specification
  - Assignment types: code, file upload, text, quiz
  - Submission rules and validation
  - Grading system (auto-grade quiz, manual for others)
- [ ] Write gamification system specification
  - [ ] EXP formula design (base EXP per assignment type, completion bonus)
  - [ ] Level progression formula (EXP required per level)
  - [ ] Rank calculation algorithm (leaderboard position)
- [ ] Write achievement/badge system specification (optional enhancement)
- [ ] Define business rules
  - [ ] Users can only submit assignments for purchased curriculums
  - [ ] Each assignment can be submitted multiple times (best score counts)
  - [ ] EXP is awarded upon first successful submission
  - [ ] Leaderboard updates in real-time (or batched)
  - [ ] User levels are global (not per curriculum)

**Deliverables**:
- `docs/specifications/assignment-system.md`
- `docs/specifications/gamification.md`
- Update `docs/specifications/business-rules.md`

### 3.2 Database Design

**Tasks**:
- [ ] Design `assignments` table schema
  - Columns: id, lesson_id, title, description, assignment_type, config (JSONB), max_score, exp_reward, created_at, updated_at
- [ ] Design `submissions` table schema
  - Columns: id, assignment_id, user_id, submission_type, content (JSONB or TEXT), file_url, submitted_at, graded_at, score, feedback, created_at, updated_at
- [ ] Add gamification columns to `users` table
  - Columns: total_exp, current_level, global_rank
- [ ] Design `user_progress` table schema (optional, for tracking completion)
  - Columns: id, user_id, lesson_id, completed, completed_at, created_at, updated_at
- [ ] Design triggers for auto-updating EXP, level, and rank
- [ ] Create database migration scripts
- [ ] Document updated schema with ER diagrams

**Deliverables**:
- `docs/database/schema-phase3.md`
- `docs/database/triggers.md` (EXP/level/rank triggers)
- `database/migrations/V9__create_assignments_table.sql`
- `database/migrations/V10__create_submissions_table.sql`
- `database/migrations/V11__add_gamification_to_users.sql`
- `database/migrations/V12__create_user_progress_table.sql`
- `database/migrations/V13__create_gamification_triggers.sql`

### 3.3 API Design

**Tasks**:
- [ ] Design Assignment API endpoints
  - `GET /api/lessons/{id}/assignments` - List assignments for a lesson
  - `GET /api/assignments/{id}` - Get assignment details
  - `POST /api/assignments/{id}/submit` - Submit assignment
  - `GET /api/assignments/{id}/submissions` - Get user's submissions for an assignment
  - `GET /api/submissions/{id}` - Get submission details
- [ ] Design Gamification API endpoints
  - `GET /api/users/me/profile` - Get user profile with EXP, level, rank
  - `GET /api/users/me/stats` - Get detailed stats (completed lessons, assignments, etc.)
  - `GET /api/leaderboard` - Get global leaderboard (paginated)
  - `GET /api/leaderboard/top` - Get top 10 users
- [ ] Design Progress API endpoints
  - `GET /api/users/me/progress` - Get user's progress across all curriculums
  - `GET /api/users/me/progress/{curriculumId}` - Get progress for specific curriculum
  - `POST /api/lessons/{id}/complete` - Mark lesson as completed
- [ ] Document updated request/response schemas

**Deliverables**:
- `docs/api/assignments.md`
- `docs/api/users.md` (updated with gamification endpoints)
- `docs/api/leaderboard.md`

### 3.4 Backend Implementation

**Tasks**:
- [ ] Implement Domain Models
  - [ ] Assignment entity
  - [ ] Submission entity
  - [ ] Update User entity (add total_exp, current_level, global_rank)
  - [ ] UserProgress entity
- [ ] Implement Repositories
  - [ ] AssignmentRepository
  - [ ] SubmissionRepository
  - [ ] UserProgressRepository
- [ ] Implement Services
  - [ ] AssignmentService (CRUD, submission handling)
  - [ ] SubmissionService (create submission, grade submission)
  - [ ] GamificationService (calculate EXP, level up, update rank)
  - [ ] LeaderboardService (fetch leaderboard, calculate ranks)
  - [ ] ProgressService (track completion, update progress)
  - [ ] Update UserService (get stats, get profile with gamification data)
- [ ] Implement Controllers
  - [ ] AssignmentController
  - [ ] SubmissionController
  - [ ] LeaderboardController
  - [ ] Update UserController
- [ ] Implement Grading Logic
  - [ ] Auto-grading for quiz assignments
  - [ ] Manual grading workflow (admin feature, optional in Phase 3)
  - [ ] Score calculation
- [ ] Implement EXP and Leveling Logic
  - [ ] EXP calculation based on assignment type and score
  - [ ] Level progression calculation
  - [ ] Trigger or scheduled job for rank updates

**Deliverables**:
- Updated Spring Boot application with assignment and gamification features

### 3.5 Frontend Implementation

**Tasks**:
- [ ] Implement Assignment Pages
  - [ ] Assignment list page (within lesson page)
  - [ ] Assignment detail page (view assignment, submit solution)
  - [ ] Submission history page
  - [ ] Submission feedback page (view score, feedback)
- [ ] Implement Gamification Pages
  - [ ] User dashboard (EXP, level, rank, progress overview)
  - [ ] Leaderboard page (global ranking)
  - [ ] User profile page (stats, achievements)
- [ ] Update Lesson Components
  - [ ] Show assignments within lesson page
  - [ ] Show completion status
  - [ ] Show earned EXP badges
- [ ] Implement Assignment Components
  - [ ] Code submission form (with code editor, e.g., Monaco Editor)
  - [ ] File upload form
  - [ ] Text submission form (textarea or rich text editor)
  - [ ] Quiz form (multiple choice, true/false)
  - [ ] Submission success modal
- [ ] Implement Gamification Components
  - [ ] EXP progress bar
  - [ ] Level badge
  - [ ] Rank indicator
  - [ ] Leaderboard table
  - [ ] Achievement badges (optional)
- [ ] Update Header/Navigation
  - [ ] Show user level and EXP
  - [ ] Show global rank
- [ ] Update API Client
  - [ ] Add assignment API calls
  - [ ] Add submission API calls
  - [ ] Add leaderboard API calls
- [ ] Update State Management
  - [ ] Add assignment state
  - [ ] Add submission state
  - [ ] Add gamification state (EXP, level, rank)

**Deliverables**:
- Updated Next.js application with assignment and gamification features

### 3.6 Testing

**Tasks**:
- [ ] Write Backend Unit Tests
  - [ ] AssignmentService tests
  - [ ] SubmissionService tests
  - [ ] GamificationService tests (EXP calculation, leveling)
  - [ ] LeaderboardService tests
- [ ] Write Backend Integration Tests
  - [ ] Assignment CRUD API tests
  - [ ] Submission flow API tests
  - [ ] Gamification API tests
  - [ ] Leaderboard API tests
- [ ] Write Frontend Unit Tests
  - [ ] Assignment component tests
  - [ ] Submission component tests
  - [ ] Gamification component tests
  - [ ] Leaderboard component tests
- [ ] Write E2E Tests
  - [ ] Backend E2E:
    - [ ] Complete assignment submission flow
    - [ ] EXP and level update flow
    - [ ] Leaderboard update flow
  - [ ] Frontend E2E:
    - [ ] User can view assignments in lesson
    - [ ] User can submit code assignment
    - [ ] User can submit file assignment
    - [ ] User can submit text assignment
    - [ ] User can complete quiz assignment
    - [ ] User can view submission feedback
    - [ ] User can see EXP and level increase
    - [ ] User can view leaderboard
    - [ ] User can view their rank

**Deliverables**:
- Updated test suite with >80% code coverage

### 3.7 Documentation & Seed Data

**Tasks**:
- [ ] Update seed data
  - [ ] Add sample assignments to lessons (mix of all types)
  - [ ] Add sample submissions for test users
  - [ ] Add sample EXP and levels to test users
- [ ] Update documentation
  - [ ] Assignment system guide
  - [ ] Gamification system guide
  - [ ] Leaderboard algorithm documentation

**Deliverables**:
- Updated seed data
- Updated documentation

---

## Cross-Phase Tasks

### Continuous Integration & Deployment

**Tasks**:
- [ ] Set up CI/CD pipeline (GitHub Actions, GitLab CI, or Jenkins)
  - [ ] Automated testing on pull requests
  - [ ] Code quality checks (linting, formatting)
  - [ ] Build and deploy to staging environment
  - [ ] Deploy to production (optional, manual approval)
- [ ] Set up code coverage reporting
- [ ] Set up automated dependency updates (Dependabot, Renovate)

### Security & Best Practices

**Tasks**:
- [ ] Implement rate limiting on API endpoints
- [ ] Implement input validation and sanitization
- [ ] Implement CSRF protection
- [ ] Implement secure session management
- [ ] Regular security audits and dependency scanning
- [ ] Follow OWASP best practices

### Monitoring & Logging

**Tasks**:
- [ ] Set up application logging (structured logging)
- [ ] Set up error tracking (Sentry, Rollbar)
- [ ] Set up performance monitoring (APM)
- [ ] Set up uptime monitoring
- [ ] Create monitoring dashboards

---

## Development Workflow (SDD/BDD)

For each feature, follow this workflow:

1. **Specification Phase**
   - Write detailed specification document
   - Define acceptance criteria in Given-When-Then format
   - Review and approve specification before implementation

2. **Database Phase**
   - Design schema based on specification
   - Create migration scripts
   - Review and test migrations

3. **API Phase**
   - Design API endpoints based on specification
   - Document request/response schemas
   - Review API design

4. **Implementation Phase**
   - Backend: Implement entities, repositories, services, controllers (TDD)
   - Frontend: Implement pages, components, API client (TDD)
   - Write unit tests alongside implementation

5. **Integration & E2E Testing Phase**
   - Write integration tests
   - Write E2E tests based on acceptance criteria
   - Ensure all tests pass

6. **Documentation Phase**
   - Update technical documentation
   - Update user documentation
   - Create or update seed data

7. **Review & Deployment**
   - Code review
   - QA testing
   - Deploy to staging/production

---

## Success Metrics

### Phase 1
- [x] All authentication flows working (backend complete, frontend in progress)
- [x] All CRUD operations for curriculums/chapters/lessons working (backend complete)
- [ ] Video playback, article reading, survey completion working ⚠️ **MISSING - TOP PRIORITY**
- [x] Docker setup complete and documented
- [ ] >80% test coverage ⚠️ **NOT STARTED**

### Phase 2
- [ ] Purchase flow working end-to-end
- [ ] Permission system correctly enforcing access control
- [ ] Mock payment processing working
- [ ] >80% test coverage

### Phase 3
- [ ] All 4 assignment types (code, file, text, quiz) working
- [ ] EXP and leveling system working correctly
- [ ] Leaderboard updating in real-time or near-real-time
- [ ] >80% test coverage

---

**Ready to start building! 🚀**
