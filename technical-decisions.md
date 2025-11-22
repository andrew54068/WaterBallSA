# Technical Decisions & Architecture

> This document records all major technical decisions for WaterBallSA with rationale and analysis.

## Table of Contents
- [Tech Stack](#tech-stack)
- [Infrastructure](#infrastructure)
- [Media Handling](#media-handling)
- [Security & Authentication](#security--authentication)
- [Data Management](#data-management)
- [Testing Strategy](#testing-strategy)

---

## Tech Stack

### Backend: Spring Boot + Gradle

**Decision**: Use **Gradle** as the build tool (not Maven)

**Rationale**:
- **Better Performance**: Incremental builds and build caching significantly faster than Maven
- **Docker Optimization**: Gradle's dependency resolution works better with Docker layer caching
- **Modern Syntax**: Groovy/Kotlin DSL is more concise and readable than XML (pom.xml)
- **Flexibility**: More programmatic control over build process
- **Spring Boot Alignment**: Spring Boot's official documentation now favors Gradle in examples

**Trade-offs**:
- Slightly steeper learning curve than Maven
- Less XML-based tooling (but this is actually a benefit)

**Implementation**:
```gradle
// build.gradle
plugins {
    id 'org.springframework.boot' version '3.2.0'
    id 'io.spring.dependency-management' version '1.1.4'
    id 'java'
}

java {
    sourceCompatibility = '17'
}
```

---

### Frontend: Next.js + TypeScript + Tailwind CSS

**Decision**: Use **Tailwind CSS** for styling

**Rationale**:
- **Next.js Native Integration**: First-class support in Next.js with zero configuration
- **Performance**: Tiny bundle size due to purging unused styles (typically < 10KB in production)
- **Developer Experience**: Rapid prototyping with utility classes, no context switching between files
- **Consistency**: Design tokens built-in (spacing scale, color palette, typography)
- **Responsive Design**: Mobile-first breakpoint system is intuitive
- **Customization**: Easily extend with custom design tokens in `tailwind.config.ts`

**Alternatives Considered**:
- **Material-UI (MUI)**: Too opinionated, larger bundle size (~300KB), harder to customize
- **styled-components**: Runtime overhead, CSS-in-JS adds complexity, slower than Tailwind
- **shadcn/ui**: Good option but adds another layer; Tailwind alone is sufficient for MVP

**Implementation**:
```bash
# Installation
yarn add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## Infrastructure

### Database: PostgreSQL

**Decision**: **PostgreSQL 15+**

**Rationale**:
- **JSON Support**: Excellent JSONB support for flexible fields (assignment config, survey questions)
- **Full-Text Search**: Built-in text search for curriculum/lesson search functionality
- **ACID Compliance**: Critical for payment transactions and purchase records
- **Performance**: Superior query optimization compared to MySQL for complex joins
- **Array Support**: Can store tag arrays, user progress arrays efficiently
- **Spring Boot Integration**: Excellent JPA/Hibernate support

**Schema Design Decisions**:
- Use UUID for primary keys (better for distributed systems, harder to enumerate)
- Soft deletes with `deleted_at` column for audit trail
- Denormalized `user_rank` field for performance (updated via trigger/background job)

---

### Database Migrations: Flyway

**Decision**: **Flyway** over Liquibase

**Rationale**:
- **Simplicity**: Pure SQL migrations, no XML/YAML abstraction
- **Spring Boot Integration**: Auto-configuration with `spring-boot-starter-flyway`
- **Version Control Friendly**: Simple numbered SQL files easy to review in PRs
- **Rollback Strategy**: Clear rollback files (`V1__description.sql` + `U1__description.sql`)
- **Team Readability**: All developers understand SQL, not all understand XML/YAML

**Implementation**:
```
src/main/resources/db/migration/
├── V1__create_users_table.sql
├── V2__create_curriculums_table.sql
├── V3__create_chapters_table.sql
└── ...
```

---

### Containerization: Docker + Docker Compose

**Decision**: Multi-stage Docker builds with layer optimization

**Rationale**:
- **Smaller Images**: Multi-stage builds reduce final image size by 60-80%
- **Security**: Use slim/alpine base images to minimize attack surface
- **Cache Optimization**: Separate dependency installation from code copy for better caching
- **Development Parity**: Same containers for dev/staging/production

**Frontend Dockerfile Strategy**:
```dockerfile
# Build stage: node:18-alpine (smaller than node:18)
# Production stage: node:18-alpine + standalone output (Next.js optimization)
# Expected size: ~150MB vs ~1.2GB for non-optimized
```

**Backend Dockerfile Strategy**:
```dockerfile
# Build stage: gradle:8-jdk17 (build .jar)
# Production stage: eclipse-temurin:17-jre-alpine (runtime only)
# Expected size: ~200MB vs ~600MB with full JDK
```

---

## Media Handling

### Video Storage: AWS S3

**Decision**: **Amazon S3** for video storage

**Rationale**:
- **Scalability**: Virtually unlimited storage, no capacity planning needed
- **Durability**: 99.999999999% (11 9's) durability
- **Cost Effective**: $0.023/GB/month for standard storage, cheaper than EBS volumes
- **Integration**: Excellent SDK support for Spring Boot and Next.js
- **Lifecycle Policies**: Automatic archival to Glacier for old/unused videos
- **Security**: Fine-grained IAM permissions, pre-signed URLs for temporary access

**Alternative Considered**:
- **Local Filesystem**: Doesn't scale, hard to backup, single point of failure
- **Azure Blob Storage**: Comparable, but AWS has more mature ecosystem
- **Cloudinary**: More expensive for video, better suited for images

---

### Video Streaming: HLS (HTTP Live Streaming)

**Decision**: **HLS (HTTP Live Streaming)** protocol

**Rationale**:
- **Adaptive Bitrate**: Automatically adjusts quality based on user's bandwidth
- **Universal Support**: Works on all modern browsers and devices (Safari, Chrome, iOS, Android)
- **CDN Friendly**: Can serve .m3u8 playlists and .ts segments via CloudFront
- **Resumable**: Users can pause and resume without re-downloading
- **Security**: Can use AES-128 encryption for DRM if needed in future

**Alternatives Considered**:
- **Progressive Download (MP4)**: Simple but no adaptive bitrate, wastes bandwidth
- **DASH**: More complex, less browser support than HLS
- **WebRTC**: Overkill for VOD (video on demand), better for live streaming

**Implementation Flow**:
1. Admin uploads MP4 to S3 (out of scope for Phase 1, can be manual)
2. AWS MediaConvert transcodes to HLS (multiple quality levels: 1080p, 720p, 480p, 360p)
3. Output: `.m3u8` playlist + `.ts` segments stored in S3
4. Frontend uses `hls.js` or native HLS support to play video

---

### Video Formats & Encoding Standards

**Decision**:
- **Source Format**: MP4 (H.264 codec, AAC audio)
- **Streaming Format**: HLS with multiple bitrates
- **Encoding Profiles**:
  - 1080p: 5000 kbps (for high-quality courses)
  - 720p: 2500 kbps (default quality)
  - 480p: 1000 kbps (mobile/slow connections)
  - 360p: 600 kbps (fallback for very slow connections)

**Rationale**:
- **H.264**: Best compatibility across all devices (vs H.265 which has licensing issues)
- **AAC Audio**: Industry standard, good compression ratio
- **Multiple Bitrates**: Essential for good UX across varying network conditions
- **Frame Rate**: 30fps standard for educational content (60fps unnecessary, increases file size)

**Max Video File Size**:
- **Source Upload**: 2GB per file (covers 99% of educational videos)
- **Post-Transcoding**: No limit (HLS segments are small ~2-10MB each)

**Rationale**:
- 2GB = ~2 hours of 1080p video (most lessons are 10-30 minutes)
- Larger files can be split into multiple lessons
- CloudFront has no file size limits for streaming

---

### Video Transcoding: AWS MediaConvert (Future Consideration)

**Decision**: **Manual transcoding for Phase 1**, AWS MediaConvert for Phase 2+

**Rationale for Phase 1**:
- **Scope**: Content creation/upload is out of scope
- **Assumption**: Videos are pre-transcoded to HLS format before deployment
- **Cost**: Avoid AWS MediaConvert costs (~$0.015/min) during MVP development

**Rationale for Future (Phase 2+)**:
- **Automation**: Trigger Lambda on S3 upload → MediaConvert job → HLS output
- **Quality**: Professional-grade transcoding with consistent quality
- **Efficiency**: Handles all bitrate generation automatically

---

### File Storage for Assignments: S3 (Mocked for Phase 1)

**Decision**: **Mock file storage** for code/file submissions in Phase 1

**Rationale**:
- **Scope Focus**: Phase 3 feature, not needed for Phase 1-2
- **Implementation**: Store mock file paths in database (e.g., `/mock/user123/assignment456.zip`)
- **Testing**: Allows full E2E testing of submission flow without S3 complexity
- **Migration**: Easy to swap mock with real S3 in Phase 3

**Future Implementation (Phase 3)**:
```java
// Mocked service interface allows clean swap
interface FileStorageService {
    String uploadFile(MultipartFile file, String userId, String assignmentId);
    byte[] downloadFile(String fileKey);
}

// Phase 1: MockFileStorageService (returns fake paths)
// Phase 3: S3FileStorageService (actual S3 upload)
```

**Limits (for future reference)**:
- Max file upload: 100MB per submission
- Allowed types: `.zip`, `.tar.gz`, `.pdf`, `.docx`, `.txt`, `.java`, `.ts`, `.tsx`
- Virus scanning: AWS Lambda + ClamAV (out of scope for Phase 1)

---

## Security & Authentication

### Authentication: Google OAuth 2.0 + JWT

**Decision**: **Google OAuth** (exclusive) + **JWT** for session management

**Rationale for OAuth**:
- **User Convenience**: No password management, one-click login
- **Security**: Leverages Google's security infrastructure (2FA, breach detection)
- **Trust**: Users trust Google more than unknown platforms
- **Scope**: Requirement specifies Google-only authentication

**Rationale for JWT**:
- **Stateless**: No server-side session storage required, easier to scale
- **Microservices Ready**: JWT can be validated by any service without central auth server
- **Mobile Friendly**: Easier to integrate with future mobile apps than cookies
- **Performance**: No database lookup for every request

**JWT Configuration**:
```
Access Token Expiration: 15 minutes
Refresh Token Expiration: 7 days
Algorithm: RS256 (asymmetric keys, more secure than HS256)
Claims: userId, email, role, exp, iat
Storage: httpOnly cookies (XSS protection) + localStorage for access token
```

**Refresh Token Strategy**:
1. Access token stored in memory/localStorage (short-lived)
2. Refresh token in httpOnly cookie (CSRF protection via SameSite=Strict)
3. Frontend automatically requests new access token when expired
4. Refresh token rotation: Issue new refresh token on each refresh

**Security Benefits**:
- XSS attacks can't steal httpOnly cookies
- CSRF attacks prevented by SameSite cookie attribute
- Token revocation possible via refresh token blacklist (Redis)

---

### Authorization: Role-Based Access Control (RBAC)

**Decision**: Simple **2-role system** (Student, Admin)

**Rationale**:
- **Simplicity**: Only 2 roles needed per requirements
- **Performance**: Single `role` column in users table, no complex permission checks
- **Clear Boundaries**:
  - Students: Access purchased content only
  - Admins: Access all content (for QA/support)

**Authorization Flow**:
```
1. Request → JWT validation → Extract userId + role
2. If role = ADMIN → Allow access to all content
3. If role = STUDENT → Check purchases table for curriculumId
4. Cache purchase status in Redis (5 min TTL) for performance
```

**Database Design**:
```sql
CREATE TYPE user_role AS ENUM ('STUDENT', 'ADMIN');

ALTER TABLE users ADD COLUMN role user_role DEFAULT 'STUDENT' NOT NULL;
```

---

### Payment System: Mocked Payment Gateway

**Decision**: **Mock payment provider** for all phases (no real integration)

**Rationale**:
- **Scope Simplification**: Real payment integration adds significant complexity
- **Testing**: Easier to test all scenarios (success, failure, timeout) with mocks
- **Compliance**: Avoids PCI-DSS compliance requirements during development
- **Cost**: No transaction fees during development/testing
- **Flexibility**: Can swap in real provider (Stripe/PayPal) later without changing business logic

**Mock Implementation**:
```typescript
// Frontend: Mock payment form
async function purchaseCurriculum(curriculumId: string) {
  // Simulate payment delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Always succeed in mock
  return api.post(`/api/curriculums/${curriculumId}/purchase`, {
    mockPaymentId: `mock_${Date.now()}`,
    amount: curriculum.price,
  });
}

// Backend: Mock payment verification
@PostMapping("/curriculums/{id}/purchase")
public PurchaseResponse purchase(@PathVariable Long id, @RequestBody MockPaymentRequest request) {
    // No actual payment verification
    // Just create purchase record
    Purchase purchase = purchaseService.createPurchase(userId, id, request.amount);
    return new PurchaseResponse(purchase.getId(), "SUCCESS");
}
```

**Mock Payment Flow**:
1. User clicks "Purchase Curriculum" → Shows mock payment form (credit card UI)
2. User clicks "Pay" → 2-second loading animation
3. Backend creates purchase record with status `COMPLETED`
4. Frontend redirects to curriculum page

**Benefits**:
- Clean separation of concerns (payment logic isolated in service layer)
- Full E2E testing of purchase flow
- No webhook handling complexity
- No refund/failure handling needed
- Easy to demonstrate full user journey

**Future Real Integration (out of scope)**:
```java
// Interface allows clean swap
interface PaymentService {
    PaymentIntent createPaymentIntent(Long curriculumId, BigDecimal amount);
    boolean verifyPayment(String paymentId);
}

// Current: MockPaymentService
// Future: StripePaymentService or PayPalPaymentService
```

---

### API Security

**Decision**: Multi-layered security approach

**Implementation**:

1. **CORS Configuration**:
```java
@Configuration
public class SecurityConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000")); // Dev
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
        config.setAllowCredentials(true); // For cookies
        return source;
    }
}
```

2. **Rate Limiting**: Spring Boot + Bucket4j
   - Per IP: 100 requests/minute
   - Per User: 1000 requests/hour
   - Login endpoint: 5 attempts/15 minutes (brute force protection)

3. **Input Validation**: Bean Validation (JSR-303)
```java
public class CreateCurriculumRequest {
    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 200)
    private String title;

    @Positive
    private BigDecimal price;
}
```

4. **SQL Injection Prevention**: JPA with parameterized queries (automatic)

5. **XSS Prevention**:
   - Frontend: React auto-escapes by default
   - Backend: Content Security Policy headers

6. **Security Headers**:
```java
http
    .headers()
    .contentSecurityPolicy("default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';")
    .xssProtection()
    .frameOptions().deny()
    .httpStrictTransportSecurity();
```

---

## Data Management

### Caching Strategy: Redis

**Decision**: **Redis** for caching and session management

**Use Cases**:
1. **Purchase Cache**: Cache user's purchased curriculum IDs (5 min TTL)
   ```
   Key: purchases:user:{userId}
   Value: Set<curriculumId>
   Benefit: Avoid DB query on every lesson access check
   ```

2. **Leaderboard Cache**: Cache global ranking (1 hour TTL)
   ```
   Key: leaderboard:global
   Value: Sorted Set (score = totalExp)
   Benefit: Expensive query, updated frequently
   ```

3. **Refresh Token Blacklist**: Revoked tokens
   ```
   Key: revoked:refresh:{tokenId}
   Value: 1
   TTL: Same as refresh token expiration (7 days)
   ```

4. **User Session Data**: Store minimal user info
   ```
   Key: session:user:{userId}
   Value: {role, email, currentLevel}
   TTL: 15 minutes (same as JWT)
   ```

**Rationale**:
- **Performance**: 100x faster than PostgreSQL for hot data
- **Scalability**: Horizontal scaling with Redis Cluster
- **Atomic Operations**: INCR for view counts, ZADD for rankings
- **Pub/Sub**: Can trigger real-time updates (future feature)

**Cache Invalidation Strategy**:
- Write-through: Update cache + DB together
- TTL-based: Short expiration for frequently changing data
- Event-driven: Invalidate on purchase/submission events

---

### Database Connection Pooling: HikariCP

**Decision**: **HikariCP** (Spring Boot default)

**Configuration**:
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

**Rationale**:
- Fastest connection pool in Java (benchmarks show 2x faster than Apache DBCP)
- Zero-overhead design
- Spring Boot auto-configuration

---

## Testing Strategy

### Testing Pyramid

**Priority**: E2E Tests > Integration Tests > Unit Tests

**Rationale**:
- **Behavior-Driven**: E2E tests validate complete user journeys (matches BDD philosophy)
- **Confidence**: E2E tests catch most regressions (integration issues, API contracts)
- **ROI**: Integration tests have best effort/coverage ratio
- **Speed**: Unit tests fast but lower value for CRUD applications

**Coverage Targets**:
- E2E Tests: 100% of critical user flows
- Integration Tests: 90% of API endpoints
- Unit Tests: 80% of business logic

---

### Frontend Testing

**Tools**:
- **Unit**: Jest + React Testing Library
- **Integration**: Jest with MSW (Mock Service Worker)
- **E2E**: Playwright

**Playwright Configuration**:
```typescript
// playwright.config.ts
export default {
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry', // Debug failed tests
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium' },
    { name: 'webkit' }, // Safari
    { name: 'mobile-chrome' }, // Responsive testing
  ],
};
```

**Rationale**:
- **Playwright over Cypress**: Better cross-browser support, faster, more reliable
- **MSW**: Intercepts network requests at browser level (more realistic than mocking fetch)
- **React Testing Library**: Encourages accessible component design

---

### Backend Testing

**Tools**:
- **Unit**: JUnit 5 + Mockito
- **Integration**: Spring Boot Test + TestContainers
- **E2E**: REST Assured

**TestContainers Configuration**:
```java
@Testcontainers
@SpringBootTest(webEnvironment = RANDOM_PORT)
class CurriculumServiceIntegrationTest {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
        .withDatabaseName("test")
        .withUsername("test")
        .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
    }
}
```

**Rationale**:
- **TestContainers**: Real PostgreSQL in Docker (catches DB-specific issues)
- **REST Assured**: Fluent API for testing REST endpoints
- **JUnit 5**: Parameterized tests, better assertions than JUnit 4

---

### CI/CD Testing Strategy

**Pipeline**:
```yaml
1. Unit Tests (parallel)
   ├── Frontend: yarn test --coverage
   └── Backend: ./gradlew test

2. Integration Tests (parallel)
   ├── Frontend: yarn test:integration
   └── Backend: ./gradlew integrationTest

3. E2E Tests (sequential)
   ├── Start services: docker-compose up
   ├── Frontend E2E: yarn test:e2e
   ├── Backend E2E: ./gradlew e2eTest
   └── Cleanup: docker-compose down

4. Build (if tests pass)
   ├── Frontend: docker build frontend
   └── Backend: docker build backend
```

**Rationale**:
- Fail fast: Unit tests first (fastest feedback)
- Parallel execution: Save CI time
- E2E last: Most expensive, only run if integration passes

---

## Monitoring & Observability (Future Consideration)

**Decision**: Deferred to post-MVP, but designed for:

1. **Logging**: Structured JSON logs → ELK Stack (Elasticsearch, Logstash, Kibana)
2. **Metrics**: Micrometer + Prometheus + Grafana
3. **Tracing**: Spring Cloud Sleuth + Zipkin
4. **Alerting**: Prometheus Alertmanager

**Rationale**:
- Not critical for MVP development
- Easy to add later via Spring Boot Actuator
- Focus on feature delivery first

---

## Decision Summary Table

| Category | Decision | Alternative | Rationale |
|----------|----------|-------------|-----------|
| Build Tool | Gradle | Maven | Better Docker caching, modern syntax |
| Styling | Tailwind CSS | MUI, styled-components | Smaller bundle, better DX |
| DB Migration | Flyway | Liquibase | Simpler SQL-based migrations |
| Video Storage | AWS S3 | Local, Azure | Scalability, durability, cost |
| Video Streaming | HLS | Progressive, DASH | Universal support, adaptive bitrate |
| Video Encoding | H.264 + AAC | H.265 | Better compatibility |
| Auth | Google OAuth + JWT | Username/password | Security, user convenience |
| Payment | Mocked | Stripe, PayPal | Simplify scope, focus on core features |
| Caching | Redis | In-memory, Memcached | Rich data structures, pub/sub |
| Connection Pool | HikariCP | DBCP, C3P0 | Best performance |
| Frontend E2E | Playwright | Cypress, Selenium | Cross-browser, speed, reliability |
| Backend Testing | TestContainers | H2, Mocks | Real DB catches more bugs |

---

**Last Updated**: 2025-11-22
**Document Owner**: Development Team
**Review Cycle**: Update when major technical decisions are made
