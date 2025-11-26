# WaterBallSA (Waterball Secret Agency)

> An online course platform built with specification-driven and behavior-driven development principles

## 📚 Quick Navigation

**New to the project?** Start here:
1. [Getting Started Guide](docs/development/getting-started.md) - Setup and installation
2. [API Documentation](docs/api/README.md) - Complete API reference
3. [Database Schema](docs/database/schema.md) - Database structure and relationships

## Overview

WaterBallSA is a modern online learning platform that enables users to access and engage with educational content through a structured curriculum system. The platform emphasizes test-driven quality assurance and leverages industry-standard technologies to deliver a robust learning experience.

### Vision

To provide a seamless, engaging online learning experience where users can:
- Authenticate securely via Google OAuth
- Access purchased course content organized in a clear curriculum structure
- Track their learning progress through gamified achievements
- Submit assignments and earn experience points
- Progress through skill levels based on their learning journey

## Core Features

### Phase 1: Foundation
- **Google OAuth Authentication**: Secure user login (exclusive authentication method)
- **Course Content Delivery**: Browse curriculums, navigate chapters, access lessons (videos, articles, surveys)
- **Content Structure**: Curriculum → Chapters → Lessons hierarchy
- **Infrastructure Setup**: Dockerized deployment

### Phase 2: Access Control & Payment
- **Purchase System**: Buy entire curriculums with mock payment
- **Permission Management**: Content access based on purchase history

### Phase 3: Engagement & Gamification
- **Assignment System**: Code, file, text, and quiz submissions
- **Experience & Progression**: Earn EXP, level up, compete on leaderboard
- **Platform-wide Ranking**: Compare progress with other learners

## Tech Stack

### Frontend
- **Framework**: Next.js (React-based)
- **Language**: TypeScript (TSX)
- **Package Manager**: Yarn
- **Testing**: Jest, React Testing Library, Playwright (E2E)

### Backend
- **Framework**: Spring Boot
- **Language**: Java
- **API Design**: RESTful
- **Testing**: JUnit 5, Spring Boot Test, TestContainers, REST Assured

### Database
- **Primary Database**: PostgreSQL 14+
- **Migration Tool**: Flyway / Liquibase
- **ORM**: Spring Data JPA (Hibernate)

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Authentication**: Google OAuth 2.0, JWT tokens
- **Payment**: Mock gateway (Phase 1-3)

## System Architecture

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

[View Detailed Architecture](docs/architecture/system-overview.md)

## Quick Start

### Prerequisites

- Node.js v18+
- Java JDK 17+
- Yarn v1.22+
- Docker v20+
- Docker Compose v2+
- PostgreSQL 14+ (if running without Docker)

### Installation

```bash
# Clone the repository
git clone https://github.com/andrew54068/WaterBallSA.git
cd waterballsa

# Set up environment variables
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# Start with Docker
docker-compose up -d
```

### Access the Application

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:8081
- **API Docs**: http://localhost:8081/swagger-ui.html
- **Database**: localhost:5433

### Running Tests

```bash
# Frontend tests
cd frontend
yarn test              # Unit tests
yarn test:e2e          # E2E tests

# Backend tests
cd backend
./mvnw test            # All tests
./mvnw verify          # With coverage
```

## Documentation

### For Developers

| Document | Description |
|----------|-------------|
| [Getting Started](docs/development/getting-started.md) | Detailed setup and development workflow |
| [Testing Guide](docs/development/testing-guide.md) | BDD examples and testing strategy |
| [Configuration Guide](docs/development/configuration.md) | Environment variables and setup |

### API Documentation

| Document | Description |
|----------|-------------|
| [API Overview](docs/api/README.md) | API standards and common patterns |
| [Authentication](docs/api/authentication.md) | OAuth login, JWT tokens, session management |
| [Curriculums](docs/api/curriculums.md) | Browse and purchase curriculums |
| [Lessons](docs/api/lessons.md) | Access lesson content |
| [Assignments](docs/api/assignments.md) | Submit assignments and view grades |
| [Users](docs/api/users.md) | User profile, dashboard, leaderboard |
| [Error Codes](docs/api/error-codes.md) | Complete error reference and rate limiting |

### Database

| Document | Description |
|----------|-------------|
| [Database Schema](docs/database/schema.md) | Complete table definitions and relationships |
| [Triggers & Functions](docs/database/triggers.md) | Auto-update logic for timestamps, ranks, EXP |
| [Migrations](docs/database/migrations/) | Database migration files |

### Architecture & Design

| Document | Description |
|----------|-------------|
| [System Architecture](docs/architecture/system-overview.md) | High-level architecture and design decisions |
| [Data Flow Diagrams](docs/architecture/data-flows.md) | Request flows and data pipelines |
| [Business Rules](docs/specifications/business-rules.md) | Complete business logic specification |
| [Gamification System](docs/specifications/gamification.md) | EXP formulas, leveling, and ranking |
| [User Roles](docs/specifications/user-roles.md) | Role permissions and access control |

### Security

| Document | Description |
|----------|-------------|
| [Authentication](docs/security/authentication.md) | OAuth flow, JWT implementation, security |
| [Authorization](docs/security/authorization.md) | Access control and permission checks |
| [Best Practices](docs/security/best-practices.md) | Security guidelines and hardening |

### Requirements

| Document | Description |
|----------|-------------|
| [Functional Requirements](docs/requirements/functional.md) | Feature specifications (Phase 1-3) |
| [Non-Functional Requirements](docs/requirements/non-functional.md) | Performance, scalability, reliability targets |
| [Out of Scope](docs/requirements/out-of-scope.md) | Explicitly excluded features |

## Development Principles

### Specification-Driven Development (SDD)
All features begin with clear, written specifications that define expected behavior before implementation.

### Behavior-Driven Development (BDD)
Features are described in business-readable language using Given-When-Then scenarios that serve as executable tests.

### Testing Strategy
We prioritize comprehensive testing at all levels:
- **E2E Tests** (Primary Focus): User journey validation with Playwright and REST Assured
- **Integration Tests**: API endpoints with real database using TestContainers
- **Unit Tests**: Component and business logic testing

[Read Full Testing Guide](docs/development/testing-guide.md)

## Project Structure

```
waterballsa/
├── frontend/              # Next.js application
│   ├── src/
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
├── backend/              # Spring Boot application
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml / build.gradle
├── database/
│   └── migrations/       # Database migration scripts
├── docs/                 # Complete documentation
│   ├── api/              # API documentation
│   ├── database/         # Database schema and triggers
│   ├── specifications/   # Business rules and gamification
│   ├── architecture/     # System design
│   ├── development/      # Developer guides
│   ├── security/         # Security documentation
│   └── requirements/     # Requirements and scope
├── docker-compose.yml    # Local development orchestration
└── README.md
```

## Contributing

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

## Roadmap

### Current: Phase 1 (Foundation)
- [ ] Google OAuth authentication
- [ ] Curriculum/Chapter/Lesson structure
- [ ] Video playback functionality
- [ ] Article and survey display
- [ ] Docker setup for all services

### Next: Phase 2 (Access Control & Payment)
- [ ] Curriculum purchase system
- [ ] Payment gateway integration (mock)
- [ ] Permission-based content access

### Future: Phase 3 (Assignments & Gamification)
- [ ] Assignment creation and management
- [ ] Multi-format submission system
- [ ] EXP and level system
- [ ] Platform-wide ranking and leaderboard

## License

MIT

---

**Built with ❤️ using Specification-Driven and Behavior-Driven Development**
