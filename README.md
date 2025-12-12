# WaterBallSA (Waterball Secret Agency)

> An online course platform built with specification-driven and behavior-driven development principles.

## 🛠 Tech Stack

- **Frontend**: Next.js (TypeScript), Jest, Playwright
- **Backend**: Spring Boot (Java), Spring Data JPA, JWT, JUnit 5
- **Database**: PostgreSQL 14+
- **Infrastructure**: Docker, Docker Compose, Google OAuth 2.0

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose

### Installation
```bash
git clone https://github.com/andrew54068/WaterBallSA.git
cd WaterBallsa

# Setup environment variables
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
# Note: meaningful values are needed for OAuth and DB

# Start Application
docker-compose up -d
```

### 🧪 Running Tests

We recommend using Docker to ensure environment consistency.

**Frontend**
```bash
docker-compose run --rm frontend yarn test              # Unit tests
docker-compose run --rm frontend yarn test:e2e          # E2E tests
```

**Backend**
```bash
docker-compose run --rm backend ./mvnw test            # All tests
docker-compose run --rm backend ./mvnw verify          # With coverage
```

> **Note**: Code generation tools should be run locally. See [Development Process](DEVELOP_PROCESS.md) for detailed instructions:
> - `backend/isa_codegen*`
> - `backend/assembler_codegen.sh`

## 📚 Documentation

| Category | Links |
|----------|-------|
| **API** | [API Overview](docs/api/README.md) • [Swagger UI](http://localhost:8080/swagger-ui.html) (Local) |
| **Specs** | [Business Rules](docs/specifications/business-rules.md) • [Gamification](docs/specifications/gamification.md) |
| **Database** | [Database Schema](docs/database/schema.md) |

## 🤝 Contributing
1. Create a feature branch.
2. Write specifications (SDD/BDD).
3. Implement and Test.
4. Submit PR.

## 📄 License
MIT
