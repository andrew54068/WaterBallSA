# Implementation Prompt

## Context
WaterBallSA is a modern online learning platform that enables users to access and engage with educational content through a structured curriculum system.
**Core Features**:
- Google OAuth Authentication
- Course Content Delivery (Curriculums, Chapters, Lessons)
- Mock Payment System
- Assignments and Gamification

## Instructions
I have already written a substantial amount of "test code" in this project (powered by Cucumber Feature Files).
Please carefully read these Cucumber feature files (located in the `backend/src/test/resources/features` or similar directory)
and then read the corresponding StepDef code (located in the `backend/src/test/java` directory).

Then, strictly and efficiently implement the corresponding Java code.
The code must adhere to **Clean Architecture**, **Clean Code**, and **SOLID principles**.
Use **Spring Boot** as the Framework, **Spring Data JPA** as the ORM, and **H2/PostgreSQL** as the database.

### Suggested Project Structure
```
backend/src/test/java/tw/waterballsa/
├── api/             # API layer (Controllers, DTOs)
├── domain/          # Domain layer (Entities, Aggregates, Value Objects, Domain Services)
├── application/     # Application layer (Use Cases, Application Services)
└── infrastructure/  # Infrastructure layer (Repositories, External Services)
```

**The most important requirement is that you must pass all test codes.**
After every implementation iteration, you must actively run `docker compose exec waterballsa-backend ./mvnw test` or specific test commands to check if all tests pass.
If any test fails, you must check the error from the test report and plan the next implementation fix. You must self-test and self-fix until all tests are passed.

**Do not ask for my permission to use tools before all tests are passed.** Please develop independently until the goal is achieved.

## Technical Points
1. Use **Spring Boot** to build RESTful APIs.
2. Use **Spring Data JPA** for data access.
3. **Domain Layer** should be pure and independent of frameworks if possible (following Clean Architecture).
4. **Application Layer** orchestrates the business logic.
5. **Infrastructure Layer** implements interfaces defined in the domain/application layers.
6. Error handling must be complete, and HTTP status codes must be correct (use ControllerAdvice/ExceptionHandlers).
7. Use **Lombok** to reduce boilerplate code if available in the project.
8. Validate inputs using **Bean Validation (Hibernate Validator)**.

## Test Execution
```bash
# Run all tests (using Docker)
docker compose exec waterballsa-backend ./mvnw test

# Run specific integration tests
docker compose exec waterballsa-backend ./mvnw test -Dtest=*IntegrationTest

# Run end-to-end tests
docker compose exec waterballsa-backend ./mvnw test -Dtest=*E2ETest
```
