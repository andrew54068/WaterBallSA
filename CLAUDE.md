# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ CRITICAL DEVELOPMENT PRINCIPLES

### 1. 🐳 ALWAYS Use Docker Compose
- **NEVER run services directly** on the host machine unless explicitly instructed
- **ALWAYS use Docker Compose** for development, testing, and running the application
- Use `make up` or `docker-compose up` to start all services
- Use `docker-compose exec` to run commands inside containers
- This ensures consistency across all environments and prevents "works on my machine" issues

### 2. 📋 ALWAYS Follow SDD/BDD Workflow
- **NEVER write implementation code before writing specifications**
- **ALWAYS start with specifications** in `docs/specifications/` using Given-When-Then format
- **ALWAYS create database migrations** before implementing entities
- **ALWAYS document API endpoints** before implementing controllers
- **ALWAYS write tests** alongside or before implementation (TDD)
- See "Development Workflow (SDD/BDD)" section below for detailed steps

## Project Overview

WaterBallSA is an online learning platform built with **Specification-Driven Development (SDD)** and **Behavior-Driven Development (BDD)** principles. The system uses a microservices architecture with a Next.js frontend, Spring Boot backend, and PostgreSQL database.

**Current Status**: Phase 1 backend is complete. Frontend implementation is in progress.

**Development Environment**: All development is done using Docker Compose to ensure consistency.

## Architecture

### Tech Stack
- **Frontend**: Next.js 14 (TypeScript/TSX), Yarn package manager
- **Backend**: Spring Boot 3.2.0 (Java 17), Maven build system
- **Database**: PostgreSQL 14+ with Flyway migrations
- **Infrastructure**: Docker Compose for local development
- **Authentication**: Google OAuth 2.0 with JWT tokens (access: 15min, refresh: 7 days)
- **Testing**: JUnit 5 + TestContainers (backend), Jest + Playwright (frontend)

### Core Hierarchy
```
Curriculum → Chapters → Lessons
```
- Lessons can be VIDEO, ARTICLE, or SURVEY types
- Lessons have JSONB `content_metadata` for flexible metadata storage
- All entities use `order_index` for sequencing

### Authentication Flow
1. Frontend receives Google ID token from Google OAuth
2. Frontend sends ID token to `POST /api/auth/google`
3. Backend verifies token with Google API (using `GoogleIdTokenVerifier`)
4. Backend returns JWT access + refresh tokens
5. Frontend uses JWT Bearer token for subsequent requests
6. JWT filter (`JwtAuthenticationFilter`) validates tokens and sets Spring Security context

### Key Backend Components

**Entity Layer** (`backend/src/main/java/com/waterballsa/backend/entity/`)
- Uses JPA with Hibernate ORM
- Entities: `User`, `Curriculum`, `Chapter`, `Lesson`
- All entities have `@CreatedDate` and `@LastModifiedDate` with auto-update triggers
- Relationships use cascade strategies and orphan removal

**Repository Layer** (`backend/src/main/java/com/waterballsa/backend/repository/`)
- Spring Data JPA repositories with custom `@Query` methods
- Uses `LEFT JOIN FETCH` for eager loading to avoid N+1 queries
- Example: `CurriculumRepository.findPublishedByIdWithChapters()`

**Service Layer** (`backend/src/main/java/com/waterballsa/backend/service/`)
- Business logic and transaction management
- `AuthenticationService`: Google OAuth verification, JWT generation
- `CurriculumService`, `ChapterService`, `LessonService`: CRUD operations
- Uses DTOs for API responses

**Controller Layer** (`backend/src/main/java/com/waterballsa/backend/controller/`)
- RESTful endpoints with OpenAPI/Swagger annotations
- Public endpoints: `GET /api/curriculums/**`, `POST /api/auth/**`
- Protected endpoints require JWT Bearer token
- Uses `@RestControllerAdvice` for global exception handling

**Security Configuration** (`backend/src/main/java/com/waterballsa/backend/config/SecurityConfig.java`)
- Stateless session management (JWT-based)
- CORS configured for `http://localhost:3000`
- `JwtAuthenticationFilter` runs before `UsernamePasswordAuthenticationFilter`

## Common Commands

### 🐳 Docker Compose Commands (PRIMARY - USE THESE)

**⚠️ IMPORTANT**: Always use Docker Compose for development. Only run commands outside Docker when explicitly needed.

Start all services:
```bash
make up
# or: docker-compose up -d
```

Stop all services:
```bash
make down
# or: docker-compose down
```

Build containers:
```bash
make build
# or: docker-compose build
```

View logs:
```bash
make logs
# or: docker-compose logs -f
```

Clean everything (including volumes):
```bash
make clean
```

### 🐳 Running Commands Inside Docker Containers

**Backend commands** (inside Docker):
```bash
# Run backend tests inside container
docker-compose exec backend ./mvnw test

# Run specific test class inside container
docker-compose exec backend ./mvnw test -Dtest=CurriculumServiceTest

# Run tests with coverage inside container
docker-compose exec backend ./mvnw verify

# Access backend shell
docker-compose exec backend bash

# Run Flyway migrations inside container
docker-compose exec backend ./mvnw flyway:migrate
```

**Frontend commands** (inside Docker):
```bash
# Run frontend tests inside container
docker-compose exec frontend yarn test

# Run tests in watch mode inside container
docker-compose exec frontend yarn test:watch

# Run E2E tests inside container
docker-compose exec frontend yarn test:e2e

# Access frontend shell
docker-compose exec frontend sh

# Build for production inside container
docker-compose exec frontend yarn build
```

**Database commands** (inside Docker):
```bash
# Access PostgreSQL shell
docker-compose exec db psql -U postgres -d waterballsa

# Run SQL file inside container
docker-compose exec db psql -U postgres -d waterballsa -f /path/to/file.sql
```

## Database Schema

### Key Tables
- **users**: Google OAuth users with EXP/level system (Phase 3)
- **curriculums**: Course metadata with pricing (Phase 2), difficulty levels
- **chapters**: Curriculum subdivisions with `order_index`
- **lessons**: Content items (VIDEO/ARTICLE/SURVEY) with JSONB metadata

### Migrations
Located in `backend/src/main/resources/db/migration/`:
- `V1__create_users_table.sql`
- `V2__create_curriculums_table.sql`
- `V3__create_chapters_table.sql`
- `V4__create_lessons_table.sql`
- `V5__create_update_timestamp_triggers.sql`
- `V6__insert_seed_data.sql` - Development seed data (5 curriculums, 19 chapters, 20+ lessons)

### Seed Data
- 5 sample curriculums (Java, React/Next.js, Data Structures, Machine Learning-FREE, SQL)
- Mix of difficulty levels (BEGINNER, INTERMEDIATE, ADVANCED)
- Real YouTube URLs for video lessons
- JSONB metadata examples for each lesson type

## API Documentation

When backend is running, access:
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/v3/api-docs

### Key Endpoints

**Authentication**
- `POST /api/auth/google` - Exchange Google ID token for JWT
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - Logout (client-side token discard)

**Curriculums**
- `GET /api/curriculums` - List all (paginated, sortable)
- `GET /api/curriculums/{id}` - Get with chapters
- `GET /api/curriculums/search?q=term` - Search
- `GET /api/curriculums/difficulty/{level}` - Filter by difficulty
- `GET /api/curriculums/free` - Free courses only

**Chapters**
- `GET /api/chapters/{id}` - Get with lessons
- `GET /api/chapters/curriculum/{id}` - List by curriculum

**Lessons**
- `GET /api/lessons/{id}` - Get lesson
- `GET /api/lessons/chapter/{id}` - List by chapter
- `GET /api/lessons/curriculum/{id}/free-preview` - Free preview lessons

## Development Workflow (SDD/BDD)

**⚠️ CRITICAL**: This workflow is MANDATORY for all feature development. NEVER skip to implementation without completing prior phases.

### The Golden Rule: Specification First, Implementation Last

```
📋 Specification → 🗄️ Database → 🔌 API → 💻 Implementation → ✅ Testing → 📚 Documentation
```

### Detailed Workflow for Each Feature

#### Phase 1: Specification Phase (ALWAYS START HERE)
**Goal**: Define WHAT we're building and WHY, with clear acceptance criteria.

**Steps**:
1. Create specification document in `docs/specifications/[feature-name].md`
2. Write business context and user stories
3. Define acceptance criteria using Given-When-Then format (BDD):
   ```gherkin
   Scenario: User purchases a curriculum
     Given a logged-in user viewing a curriculum
     And the user does not own the curriculum
     When the user clicks "Purchase" and completes payment
     Then the user should own the curriculum
     And the user should be able to access all lessons
   ```
4. Document business rules and constraints
5. Define error scenarios and edge cases
6. **Get approval** before proceeding to implementation

**Deliverables**:
- `docs/specifications/[feature-name].md` with Given-When-Then scenarios
- Clear acceptance criteria that will guide testing

#### Phase 2: Database Phase
**Goal**: Design the data model based on specifications.

**Steps**:
1. Design database schema (tables, columns, relationships, constraints)
2. Create ER diagram (optional but recommended)
3. Write Flyway migration script in `backend/src/main/resources/db/migration/V[N]__[description].sql`
4. Add indexes for performance
5. Add database triggers if needed (e.g., for auto-updating timestamps)
6. Test migration on clean database using Docker:
   ```bash
   docker-compose exec backend ./mvnw flyway:migrate
   ```

**Deliverables**:
- Flyway migration scripts (versioned, never modified after commit)
- Optional: `docs/database/schema-phase[N].md` with ER diagrams

**⚠️ IMPORTANT**: NEVER modify existing migrations. Always create new migrations for changes.

#### Phase 3: API Phase
**Goal**: Define the contract between frontend and backend.

**Steps**:
1. Design API endpoints (HTTP methods, paths, query params)
2. Document request schemas (headers, body, validation rules)
3. Document response schemas (success, error codes)
4. Document authentication/authorization requirements
5. Add OpenAPI/Swagger annotations to controller stubs (if using code-first approach)
6. **Review API design** before implementation

**Deliverables**:
- `docs/api/[feature-name].md` with endpoint documentation
- OR OpenAPI/Swagger annotations in code

**Best Practice**: Design APIs to be RESTful, version-aware, and consistent with existing patterns.

#### Phase 4: Implementation Phase (TDD)
**Goal**: Implement the feature using Test-Driven Development.

**Steps** (in this order):
1. **Write failing tests first** based on specifications
2. **Implement Domain Models** (JPA entities):
   - Backend: `backend/src/main/java/com/waterballsa/backend/entity/`
   - Use Lombok (@Data, @Builder) for boilerplate reduction
3. **Implement Repositories** (Spring Data JPA):
   - Backend: `backend/src/main/java/com/waterballsa/backend/repository/`
   - Write custom queries with `@Query` if needed
4. **Implement Services** (Business logic):
   - Backend: `backend/src/main/java/com/waterballsa/backend/service/`
   - Use DTOs for responses
   - Write unit tests for services
5. **Implement Controllers** (REST API):
   - Backend: `backend/src/main/java/com/waterballsa/backend/controller/`
   - Add OpenAPI annotations
   - Write integration tests for controllers
6. **Implement Frontend** (if applicable):
   - Create pages in `frontend/src/app/`
   - Create components in `frontend/src/components/`
   - Create API client functions in `frontend/src/lib/api/`
   - Write unit tests for components
7. **Run all tests** to ensure they pass:
   ```bash
   # Backend tests inside Docker
   docker-compose exec backend ./mvnw test

   # Frontend tests inside Docker
   docker-compose exec frontend yarn test
   ```

**TDD Cycle** (Red-Green-Refactor):
- 🔴 **Red**: Write a failing test
- 🟢 **Green**: Write minimal code to make it pass
- 🔵 **Refactor**: Clean up code while keeping tests green

**Deliverables**:
- Working implementation with >80% test coverage
- All acceptance criteria from specifications met

#### Phase 5: Integration & E2E Testing Phase
**Goal**: Verify the feature works end-to-end.

**Steps**:
1. Write integration tests (backend):
   - Use `@SpringBootTest` with TestContainers
   - Test actual database operations
   - Test API endpoints with real HTTP calls
2. Write E2E tests (backend):
   - Use REST Assured for complete API flows
   - Test authentication and authorization
3. Write E2E tests (frontend):
   - Use Playwright for user journeys
   - Test complete workflows (login → browse → purchase → view content)
4. Run all tests inside Docker:
   ```bash
   docker-compose exec backend ./mvnw verify
   docker-compose exec frontend yarn test:e2e
   ```
5. Ensure all acceptance criteria from specifications are tested

**Deliverables**:
- Comprehensive test suite with >80% coverage
- All tests passing in Docker environment

#### Phase 6: Documentation Phase
**Goal**: Update documentation and seed data.

**Steps**:
1. Update `CLAUDE.md` with new features, commands, or patterns
2. Update `README.md` if user-facing changes
3. Add or update seed data in migration scripts
4. Document configuration changes (environment variables, etc.)
5. Update API documentation (if not using Swagger)

**Deliverables**:
- Updated documentation
- Updated seed data for testing

### Verification Checklist

Before considering a feature "done", verify:
- [ ] Specification document exists with Given-When-Then scenarios
- [ ] Database migrations are versioned and tested
- [ ] API endpoints are documented (Swagger or markdown)
- [ ] Implementation follows existing code patterns
- [ ] Unit tests exist and pass (>80% coverage)
- [ ] Integration tests exist and pass
- [ ] E2E tests exist and pass
- [ ] All tests run successfully inside Docker
- [ ] Documentation is updated
- [ ] Seed data is updated (if applicable)
- [ ] Code review completed (if working in team)

### Example: Adding Purchase System (Phase 2)

1. **Specification**: Write `docs/specifications/purchase-system.md` with scenarios like:
   - User can purchase curriculum
   - User cannot access paid content without purchase
   - User can view purchase history
2. **Database**: Create migrations for `purchases` and `payment_transactions` tables
3. **API**: Document `POST /api/purchases`, `GET /api/purchases/my-purchases`
4. **Implementation**:
   - Create `Purchase` entity
   - Create `PurchaseRepository`
   - Create `PurchaseService` with tests
   - Create `PurchaseController` with integration tests
   - Create frontend purchase page
5. **Testing**: Write E2E tests for complete purchase flow
6. **Documentation**: Update CLAUDE.md, add purchase seed data

## Environment Variables

### Backend (`backend/.env`)
```bash
DATABASE_URL=jdbc:postgresql://localhost:5432/waterballsa
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=<your-secret-key>
JWT_ACCESS_TOKEN_EXPIRATION=900000
JWT_REFRESH_TOKEN_EXPIRATION=604800000
GOOGLE_CLIENT_ID=<your-google-client-id>
SPRING_PROFILES_ACTIVE=dev
```

### Frontend (`frontend/.env`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<your-secret>
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-google-client-id>
```

## Google OAuth Setup

**Authorized JavaScript origins**:
- Development: `http://localhost:3000`
- Production: `https://waterballsa.com`, `https://www.waterballsa.com`

**Authorized redirect URIs**:
- Development: `http://localhost:3000/auth/callback`
- Production: `https://waterballsa.com/auth/callback`, `https://www.waterballsa.com/auth/callback`

If using NextAuth.js, use: `http://localhost:3000/api/auth/callback/google`

## Project Structure Notes

### Backend Package Structure
```
com.waterballsa.backend/
├── config/          # Spring configuration (Security, OpenAPI, etc.)
├── controller/      # REST controllers
├── dto/             # Data Transfer Objects
├── entity/          # JPA entities
├── exception/       # Custom exceptions and global handler
├── repository/      # Spring Data JPA repositories
├── security/        # JWT filter, authentication entry point
├── service/         # Business logic layer
└── util/            # Utility classes (JwtUtil)
```

### Frontend Structure (Implemented)
```
frontend/src/
├── app/                          # Next.js 14 app directory (pages, layouts)
│   ├── page.tsx                  # Home page (curriculum list)
│   ├── layout.tsx                # Root layout with providers
│   ├── curriculums/
│   │   └── [id]/page.tsx         # Curriculum detail page
│   └── lessons/
│       └── [id]/page.tsx         # Lesson viewer page (VIDEO/ARTICLE/SURVEY)
├── components/                   # React components
│   ├── Header.tsx                # Navigation header with auth
│   ├── CurriculumCard.tsx        # Curriculum display card
│   ├── VideoPlayer.tsx           # YouTube video player (react-player)
│   ├── ArticleRenderer.tsx       # External article link opener
│   ├── SurveyForm.tsx            # Survey/quiz placeholder (Phase 3)
│   ├── LessonNavigation.tsx      # Previous/Next lesson navigation
│   ├── LessonBreadcrumb.tsx      # Curriculum → Chapter → Lesson breadcrumb
│   ├── GoogleLoginButton.tsx     # Google OAuth login button
│   └── Providers.tsx             # Context providers wrapper
├── lib/                          # Utilities and API client
│   ├── api-client.ts             # Axios wrapper with JWT injection
│   ├── auth-context.tsx          # Authentication context and hooks
│   └── api/
│       ├── auth.ts               # Authentication API calls
│       ├── curriculums.ts        # Curriculum API calls
│       ├── chapters.ts           # Chapter API calls
│       └── lessons.ts            # Lesson API calls
└── types/                        # TypeScript type definitions
    └── index.ts                  # All API response types
```

## Testing Strategy

### Backend Testing
- **Unit Tests**: Test services and utilities in isolation
- **Integration Tests**: Use `@SpringBootTest` with TestContainers for real PostgreSQL
- **E2E Tests**: REST Assured for full API flow validation
- **Target**: >80% code coverage

### Frontend Testing
- **Unit Tests**: Jest + React Testing Library for components
- **E2E Tests**: Playwright for user journey validation
- **Target**: >80% code coverage

## Phase Roadmap

### Phase 1: Foundation (Current - ~85% Complete)
**Status**: Backend ✅ | Frontend ✅ | Testing ❌

**Completed**:
- ✅ Google OAuth authentication (backend + frontend)
- ✅ Curriculum/Chapter/Lesson structure (backend + frontend)
- ✅ REST API with OpenAPI docs (Swagger UI available)
- ✅ Database schema with seed data (5 curriculums, 19 chapters, 20+ lessons)
- ✅ Docker Compose setup (all services containerized)
- ✅ Frontend authentication and curriculum browsing
- ✅ **Lesson viewer pages** (VIDEO/ARTICLE/SURVEY) with all components:
  - ✅ VideoPlayer component (react-player for YouTube)
  - ✅ ArticleRenderer component (external link opener)
  - ✅ SurveyForm component (Phase 3 placeholder)
  - ✅ LessonNavigation component (prev/next navigation)
  - ✅ LessonBreadcrumb component (context display)
- ✅ Lesson viewer specification with Given-When-Then scenarios
- ✅ Lesson viewer API documentation

**Not Started**:
- ❌ Comprehensive test suite (0% coverage) ⚠️ **CRITICAL - ONLY BLOCKER REMAINING**
- ❌ Some specifications documentation (auth, curriculum structure)

**Next Steps** (HIGH PRIORITY):
1. 🎯 **CRITICAL**: Write comprehensive test suite (backend unit + integration + E2E)
2. 🎯 **CRITICAL**: Write frontend unit tests for lesson viewer components
3. 🎯 **CRITICAL**: Write E2E tests with Playwright for lesson viewing flows
4. ✅ Test all Given-When-Then scenarios from specs/lesson-viewer.md
5. 🎯 Ensure >80% code coverage before Phase 1 completion

### Phase 2: Access Control & Payment (Future - Not Started)
**Goal**: Implement purchase system and content access control.

**Must follow SDD/BDD workflow**:
1. 📋 Write specifications for purchase system, payment gateway, permissions
2. 🗄️ Design and create database migrations for `purchases` and `payment_transactions` tables
3. 🔌 Document purchase and payment API endpoints
4. 💻 Implement entities, services, controllers, frontend (with TDD)
5. ✅ Write comprehensive tests
6. 📚 Update documentation

**Key Features**:
- Purchase system with mock payment gateway
- Permission-based content access (ownership required)
- Purchase history and transaction records

### Phase 3: Engagement & Gamification (Future - Not Started)
**Goal**: Implement assignment system and gamification features.

**Must follow SDD/BDD workflow**:
1. 📋 Write specifications for assignments, EXP system, leaderboard
2. 🗄️ Design and create database migrations for `assignments` and `submissions` tables
3. 🔌 Document assignment, submission, and gamification API endpoints
4. 💻 Implement entities, services, controllers, frontend (with TDD)
5. ✅ Write comprehensive tests
6. 📚 Update documentation

**Key Features**:
- Assignment system (code, file upload, text, quiz)
- EXP and leveling system
- Global leaderboard
- Achievement/badge system

## Important Notes

### 🐳 Docker Compose Rules
- **ALWAYS use Docker Compose** for development - never run services on host machine
- **ALWAYS run tests inside Docker containers** to ensure environment consistency
- **ALWAYS use `docker-compose exec`** to run commands inside containers
- Use `make up` to start services, `make down` to stop, `make clean` to reset

### 📋 SDD/BDD Rules
- **NEVER write implementation before specifications** - always start with specs
- **ALWAYS write tests before or alongside implementation** - follow TDD/BDD
- **ALWAYS use Given-When-Then format** for acceptance criteria
- **ALWAYS verify all acceptance criteria** with automated tests
- Follow the workflow: Specification → Database → API → Implementation → Testing → Documentation

### Database Rules
- **NEVER skip Flyway migrations** - always create new versioned migrations
- **NEVER modify existing migrations** - create new ones for changes
- Test migrations inside Docker: `docker-compose exec backend ./mvnw flyway:migrate`
- **JSONB fields** in PostgreSQL for flexible metadata (e.g., `lesson.content_metadata`)

### Backend Rules
- **Use Lombok** for entities (@Data, @Builder) to reduce boilerplate
- **Use DTOs** for API responses, never expose entities directly
- **JWT tokens are stateless** - no server-side session storage
- **Pagination** uses Spring Data's `Pageable` - default page size is 10
- **Sorting** defaults to `createdAt DESC` for list endpoints
- **CORS** is configured for localhost:3000 in development
- **TestContainers** provides real PostgreSQL for integration tests

### Frontend Rules
- **Use TypeScript** for all frontend code (TSX for React components)
- **Use Yarn** for frontend package management (not npm)
- Run frontend commands inside Docker: `docker-compose exec frontend yarn [command]`
- Test E2E flows with Playwright inside Docker

### Testing Rules
- **>80% code coverage** is mandatory for all features
- Write unit tests, integration tests, AND E2E tests
- Run all tests inside Docker containers before committing
- Backend: `docker-compose exec backend ./mvnw verify`
- Frontend: `docker-compose exec frontend yarn test`

---

## Quick Reference Card

### 🚀 Starting Development

```bash
# 1. Start all services with Docker Compose
make up

# 2. View logs
make logs

# 3. Access services:
#    - Frontend: http://localhost:3000
#    - Backend API: http://localhost:8080/api
#    - Swagger UI: http://localhost:8080/swagger-ui.html
```

### 📋 Before Implementing Any Feature

**Ask yourself**: Have I completed the SDD/BDD workflow?

1. ✅ Written specification with Given-When-Then scenarios?
2. ✅ Created database migrations (if needed)?
3. ✅ Documented API endpoints (if needed)?
4. ✅ Written tests BEFORE implementation?

**If NO to any**, STOP and complete those steps first.

### 🐳 Running Commands

**ALWAYS use Docker Compose**:

```bash
# Backend tests
docker-compose exec backend ./mvnw test

# Frontend tests
docker-compose exec frontend yarn test

# Database access
docker-compose exec db psql -U postgres -d waterballsa

# Backend shell
docker-compose exec backend bash

# Frontend shell
docker-compose exec frontend sh
```

### 🔄 Development Cycle (TDD)

```
1. 🔴 Write failing test
2. 🟢 Write minimal code to pass
3. 🔵 Refactor while keeping tests green
4. ♻️  Repeat
```

### ✅ Definition of Done

- [ ] Specification exists with Given-When-Then scenarios
- [ ] Database migrations are versioned and tested
- [ ] API is documented
- [ ] Tests pass with >80% coverage
- [ ] All tests run successfully inside Docker
- [ ] Documentation is updated
- [ ] Code follows existing patterns

**Remember**: Specification First, Implementation Last!
