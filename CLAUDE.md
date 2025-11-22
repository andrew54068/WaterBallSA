# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WaterBallSA is an online learning platform built with **Specification-Driven Development (SDD)** and **Behavior-Driven Development (BDD)** principles. The system uses a microservices architecture with a Next.js frontend, Spring Boot backend, and PostgreSQL database.

**Current Status**: Phase 1 backend is complete. Frontend implementation is in progress.

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

### Local Development with Docker

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

### Backend Development

Run backend without Docker:
```bash
cd backend
./mvnw spring-boot:run
```

Run all tests:
```bash
cd backend
./mvnw test
```

Run specific test class:
```bash
cd backend
./mvnw test -Dtest=CurriculumServiceTest
```

Run tests with coverage:
```bash
cd backend
./mvnw verify
```

Run Flyway migrations:
```bash
cd backend
./mvnw flyway:migrate
```

### Frontend Development

Run frontend dev server:
```bash
cd frontend
yarn dev
```

Run unit tests:
```bash
cd frontend
yarn test
```

Run tests in watch mode:
```bash
cd frontend
yarn test:watch
```

Run E2E tests:
```bash
cd frontend
yarn test:e2e
```

Run E2E tests with UI:
```bash
cd frontend
yarn test:e2e:ui
```

Build for production:
```bash
cd frontend
yarn build
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

For each feature, follow this sequence:

1. **Specification Phase**: Write detailed specs with Given-When-Then scenarios in `docs/specifications/`
2. **Database Phase**: Design schema, create Flyway migrations in `backend/src/main/resources/db/migration/`
3. **API Phase**: Document endpoints in `docs/api/`
4. **Implementation Phase**: Implement with TDD (entities → repositories → services → controllers)
5. **Testing Phase**: Write unit tests, integration tests (TestContainers), E2E tests
6. **Documentation Phase**: Update technical docs, seed data

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

### Frontend Structure (To Be Implemented)
```
frontend/src/
├── app/             # Next.js app directory (pages, layouts)
├── components/      # React components
├── lib/             # Utilities and API client
├── hooks/           # Custom React hooks
└── types/           # TypeScript type definitions
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

### Phase 1: Foundation (Current - Backend Complete)
- ✅ Google OAuth authentication
- ✅ Curriculum/Chapter/Lesson structure
- ✅ REST API with OpenAPI docs
- ✅ Database schema with seed data
- ⏳ Frontend implementation (in progress)
- ⏳ Docker setup verification
- ⏳ Comprehensive testing

### Phase 2: Access Control & Payment (Future)
- Purchase system with mock payment gateway
- Permission-based content access
- `purchases` and `payment_transactions` tables

### Phase 3: Engagement & Gamification (Future)
- Assignment system (code, file, text, quiz)
- EXP and leveling system
- Global leaderboard
- `assignments` and `submissions` tables

## Important Notes

- **NEVER skip Flyway migrations** - always create new versioned migrations
- **Use Lombok** for entities (@Data, @Builder) to reduce boilerplate
- **Use DTOs** for API responses, never expose entities directly
- **JWT tokens are stateless** - no server-side session storage
- **JSONB fields** in PostgreSQL for flexible metadata (e.g., `lesson.content_metadata`)
- **Pagination** uses Spring Data's `Pageable` - default page size is 10
- **Sorting** defaults to `createdAt DESC` for list endpoints
- **CORS** is configured for localhost:3000 in development
- **TestContainers** provides real PostgreSQL for integration tests
- **Use TypeScript** for all frontend code (TSX for React components)
- **Use Yarn** for frontend package management (not npm)
