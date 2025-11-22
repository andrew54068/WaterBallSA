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

## Database Schema

### Core Entities

- **Users**: User accounts, profiles, roles (student/admin), EXP, level, ranking
- **Curriculums**: Top-level course collections (purchasable units)
- **Chapters**: Curriculum subdivisions
- **Lessons**: Individual learning units containing:
  - Optional video (max one per lesson)
  - Articles (text content)
  - Surveys
- **Purchases**: User curriculum purchase history and payment records
- **Assignments**: Lesson-specific tasks supporting:
  - Code submissions
  - File uploads
  - Text answers
  - Quizzes
- **Submissions**: User assignment submissions with grading status
- **Experience**: User EXP tracking and level progression
- **Rankings**: Platform-wide user ranking system

### User Roles

- **Student**: Default role for all users
  - Can purchase curriculums
  - Access purchased content only
  - Submit assignments and earn EXP
  - View personal ranking
  
- **Admin**: Administrative access
  - View all content without purchasing
  - No backstage/content management features (out of scope)

[Detailed schema documentation to be added]

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
