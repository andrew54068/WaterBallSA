# Design Document: Google OAuth Authentication

## Overview

The Google OAuth Authentication system provides secure user authentication for the WaterBallSA platform using Google OAuth 2.0 as the exclusive authentication method. The system handles the complete authentication lifecycle including OAuth callback processing, JWT token generation and management, token refresh, logout, and user profile synchronization.

The design follows a layered architecture with clear separation between authentication logic, token management, and user data persistence. Security is paramount, with JWT tokens signed using RS256, refresh token blacklisting via Redis, and comprehensive rate limiting.

## Architecture

### High-Level Architecture

```
┌────────────────────────────────────────────┐
│         Frontend (Next.js)                 │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │   NextAuth.js                        │ │
│  │   - Handles Google OAuth flow        │ │
│  │   - Manages session cookies          │ │
│  │   - Provides useSession() hook       │ │
│  └──────────┬───────────────────────────┘ │
│             │                              │
└─────────────┼──────────────────────────────┘
              │ HTTPS
              │
┌─────────────▼──────────────────────────────┐
│         Spring Boot Backend                │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │   AuthController                     │ │
│  │   - /api/auth/google/callback        │ │
│  │   - /api/auth/session (for NextAuth) │ │
│  │   - /api/auth/me                     │ │
│  └────────────┬─────────────────────────┘ │
│               │                            │
│  ┌────────────▼─────────────────────────┐ │
│  │   AuthService                        │ │
│  │   - authenticateWithGoogle()         │ │
│  │   - validateSession()                │ │
│  │   - getCurrentUser()                 │ │
│  └────────┬──────────────┬──────────────┘ │
│           │              │                 │
│  ┌────────▼────────┐  ┌──▼─────────────┐ │
│  │  TokenService   │  │  UserService   │ │
│  │  - generate()   │  │  - findBy...() │ │
│  │  - verify()     │  │  - create()    │ │
│  └────────┬────────┘  └──┬─────────────┘ │
│           │              │                 │
└───────────┼──────────────┼─────────────────┘
            │              │
     ┌──────▼──────┐  ┌───▼────────┐
     │    Redis    │  │ PostgreSQL │
     │  (Sessions) │  │   (Users)  │
     └─────────────┘  └────────────┘
            
     ┌─────────────────┐
     │   Google OAuth  │
     │      API        │
     └─────────────────┘
```

### Architecture Notes

**NextAuth.js Integration:**
- NextAuth.js handles the complete OAuth flow on the frontend
- Manages session tokens using secure httpOnly cookies
- Provides built-in CSRF protection
- Simplifies frontend authentication logic significantly

**Backend Responsibilities:**
- Validate Google tokens received from NextAuth
- Create/update user records in database
- Generate custom JWT tokens for API authentication (if needed)
- Provide user profile and session validation endpoints

**Session Management:**
- NextAuth.js stores session in httpOnly cookies (secure by default)
- Backend validates session tokens on protected API routes
- Redis used for session storage (optional, can use database)

### Component Responsibilities

**AuthController**
- Handles HTTP requests and responses
- Validates request parameters
- Enforces rate limiting
- Maps service responses to API responses

**AuthService**
- Orchestrates authentication workflows
- Coordinates between TokenService, UserService, and Google API
- Implements business logic for login, refresh, logout

**TokenService**
- Generates JWT access and refresh tokens
- Verifies token signatures and expiration
- Manages token blacklist in Redis
- Signs tokens using RS256 algorithm

**UserService**
- Manages user CRUD operations
- Synchronizes user data with Google profile
- Calculates user rank and level progression

**GoogleOAuthClient**
- Exchanges authorization codes for Google tokens
- Fetches user profile from Google API
- Handles Google API errors

## Components and Interfaces

### 1. Frontend: NextAuth.js Configuration

**File: `app/api/auth/[...nextauth]/route.ts`**

```typescript
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Call backend to create/update user
      const response = await fetch(`${process.env.BACKEND_URL}/api/auth/google/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googleId: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.image,
          googleAccessToken: account.access_token,
        }),
      });
      
      if (!response.ok) return false;
      
      const data = await response.json();
      user.backendUserId = data.userId;
      user.role = data.role;
      user.totalExp = data.totalExp;
      user.currentLevel = data.currentLevel;
      
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.backendUserId = user.backendUserId;
        token.role = user.role;
        token.totalExp = user.totalExp;
        token.currentLevel = user.currentLevel;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.backendUserId;
      session.user.role = token.role;
      session.user.totalExp = token.totalExp;
      session.user.currentLevel = token.currentLevel;
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### 2. Backend: AuthController

**Endpoints:**

```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @PostMapping("/google/callback")
    @RateLimited(maxAttempts = 5, windowMinutes = 15)
    public ResponseEntity<UserAuthResponse> handleGoogleCallback(
        @RequestBody @Valid GoogleAuthRequest request
    );
    
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser(
        @RequestHeader("Authorization") String sessionToken
    );
    
    @PostMapping("/validate-session")
    public ResponseEntity<SessionValidationResponse> validateSession(
        @RequestBody @Valid SessionValidationRequest request
    );
}
```

### 3. Backend: AuthService

**Interface:**

```java
public interface AuthService {
    UserAuthResponse authenticateWithGoogle(GoogleAuthRequest request);
    UserProfile getCurrentUser(UUID userId);
    boolean validateSession(String sessionToken);
}
```

**Implementation Details:**
- Receives Google user info from NextAuth callback
- Creates or updates user records in database
- Returns user data to be stored in NextAuth session
- Validates session tokens for protected API routes

### 4. Backend: SessionService (Optional)

**Interface:**

```java
public interface SessionService {
    boolean validateNextAuthToken(String token);
    SessionData decodeNextAuthToken(String token);
}
```

**Note:** NextAuth.js handles token generation and management. The backend only needs to validate tokens if implementing custom API authentication. For most cases, NextAuth session validation is sufficient.

**NextAuth Session Structure:**

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "image": "https://lh3.googleusercontent.com/...",
    "role": "STUDENT",
    "totalExp": 1250,
    "currentLevel": 4
  },
  "expires": "2025-11-29T10:00:00.000Z"
}
```

**Session Configuration:**
- Strategy: JWT (stored in httpOnly cookie)
- Session TTL: 7 days (configurable)
- Cookie Name: `next-auth.session-token` (production) or `__Secure-next-auth.session-token` (HTTPS)
- CSRF Protection: Built-in via NextAuth

### 5. Backend: UserService

**Interface:**

```java
public interface UserService {
    User findByEmail(String email);
    User findByGoogleId(String googleId);
    User createUser(GoogleUserInfo googleUserInfo);
    User updateUser(User user, GoogleUserInfo googleUserInfo);
    UserProfile getUserProfile(UUID userId);
}
```

### 6. Frontend: Authentication Hooks

**Custom Hook: `useAuth`**

```typescript
import { useSession, signIn, signOut } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();
  
  return {
    user: session?.user,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    signIn: () => signIn("google"),
    signOut: () => signOut(),
  };
}
```

**Usage in Components:**

```typescript
"use client";

import { useAuth } from "@/hooks/useAuth";

export function Dashboard() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please sign in</div>;
  
  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Level: {user.currentLevel}</p>
      <p>EXP: {user.totalExp}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

## Data Models

### User Entity

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(generator = "UUID")
    private UUID id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(name = "google_id", unique = true, nullable = false)
    private String googleId;
    
    @Column(nullable = false)
    private String name;
    
    @Column(name = "avatar_url")
    private String avatarUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role = UserRole.STUDENT;
    
    @Column(name = "total_exp", nullable = false)
    private Integer totalExp = 0;
    
    @Column(name = "current_level", nullable = false)
    private Integer currentLevel = 1;
    
    @Column(name = "user_rank")
    private Integer userRank;
    
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
```

### DTOs

**GoogleAuthRequest (from NextAuth):**
```java
public class GoogleAuthRequest {
    @NotBlank
    private String googleId;
    
    @NotBlank
    @Email
    private String email;
    
    @NotBlank
    private String name;
    
    private String avatarUrl;
    
    @NotBlank
    private String googleAccessToken;
}
```

**UserAuthResponse:**
```java
public class UserAuthResponse {
    private UUID userId;
    private String email;
    private String name;
    private String avatarUrl;
    private UserRole role;
    private Integer totalExp;
    private Integer currentLevel;
    private Integer userRank;
}
```

**SessionValidationRequest:**
```java
public class SessionValidationRequest {
    @NotBlank
    private String sessionToken;
}
```

**SessionValidationResponse:**
```java
public class SessionValidationResponse {
    private boolean valid;
    private UUID userId;
    private UserRole role;
}
```

**UserProfile:**
```java
public class UserProfile {
    private UUID id;
    private String email;
    private String name;
    private String avatarUrl;
    private UserRole role;
    private Integer totalExp;
    private Integer currentLevel;
    private Integer userRank;
    private Integer expToNextLevel;
    private Instant createdAt;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: NextAuth Session Expiration Consistency

*For any* successful authentication via NextAuth, the session SHALL have an expiration time of exactly 7 days from the time of issuance.

**Validates: Requirements 1.5, 2.2, 2.4**

### Property 2: Session Payload Completeness

*For any* NextAuth session, the session object SHALL contain user.id, user.email, user.name, user.role, user.totalExp, and user.currentLevel fields.

**Validates: Requirements 2.1, 3.3**

### Property 3: Session Cookie Security

*For any* NextAuth session cookie, the cookie SHALL be httpOnly, secure (in production), and sameSite=lax for CSRF protection.

**Validates: Requirements 2.5, 9.3**

### Property 6: New User Initialization

*For any* new user created through Google OAuth, the user record SHALL have totalExp = 0, currentLevel = 1, and role = STUDENT.

**Validates: Requirements 8.3, 8.4**

### Property 7: Existing User Data Preservation

*For any* existing user logging in, the user's totalExp, currentLevel, userRank, and role SHALL remain unchanged after authentication.

**Validates: Requirements 8.5**

### Property 8: User Profile Update from Google

*For any* user logging in (new or existing), the user's name and avatarUrl SHALL be updated to match the current values from Google's user profile.

**Validates: Requirements 1.4, 8.1, 8.2**

### Property 9: Authentication Response Completeness

*For any* successful authentication, the response SHALL include accessToken, refreshToken, expiresIn, and a complete user profile with all required fields (id, email, name, avatarUrl, role, totalExp, currentLevel, userRank).

**Validates: Requirements 3.1, 3.2, 3.3**

### Property 10: Invalid Authorization Code Rejection

*For any* invalid or expired Google authorization code, the authentication attempt SHALL fail with HTTP 400 status and a validation error.

**Validates: Requirements 3.5**

### Property 11: Session Refresh Automatic

*For any* active NextAuth session approaching expiration, NextAuth SHALL automatically refresh the session without user intervention.

**Validates: Requirements 4.1, 4.3**

### Property 12: Expired Session Rejection

*For any* expired NextAuth session, API requests SHALL be rejected and the user SHALL be redirected to sign in.

**Validates: Requirements 4.5, 7.5**

### Property 13: Logout Session Invalidation

*For any* successful logout operation via NextAuth signOut(), the session cookie SHALL be cleared and subsequent requests SHALL be unauthenticated.

**Validates: Requirements 5.2, 5.4**

### Property 15: Profile Retrieval Completeness

*For any* valid access token, the GET /api/auth/me endpoint SHALL return a complete user profile including id, email, name, avatarUrl, role, totalExp, currentLevel, userRank, expToNextLevel, and createdAt.

**Validates: Requirements 6.3, 6.4**

### Property 14: Invalid Session Rejection

*For any* invalid or tampered NextAuth session token, API requests SHALL be rejected with HTTP 401 status.

**Validates: Requirements 7.2, 7.4, 7.5**

### Property 15: Rate Limiting Enforcement

*For any* IP address, after 5 authentication callback requests within a 15-minute window, subsequent requests SHALL be rejected with HTTP 429 status until the window resets.

**Validates: Requirements 9.1, 9.2**

### Property 16: Error Response Format Consistency

*For any* authentication error (validation, unauthorized, rate limit, internal), the backend response SHALL follow the standard format with success=false, error.code, and error.message fields.

**Validates: Requirements 10.1, 10.2, 10.4**

### Property 17: EXP to Next Level Calculation

*For any* user profile response, the expToNextLevel field SHALL equal the EXP required for the next level minus the user's current totalExp.

**Validates: Requirements 6.4**

## Error Handling

### Error Response Format

All errors follow a standardized format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional, for validation errors
  },
  "timestamp": "2025-11-22T10:30:00Z"
}
```

### Error Codes

| Error Code | HTTP Status | Description | Example Scenario |
|------------|-------------|-------------|------------------|
| `VALIDATION_ERROR` | 400 | Invalid request parameters | Missing authorization code |
| `UNAUTHORIZED` | 401 | Invalid or expired token | Expired access token |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests | More than 5 login attempts in 15 min |
| `INTERNAL_ERROR` | 500 | Server error | Database connection failure |

### Error Handling Strategy

1. **Google OAuth Failures**: Catch Google API exceptions, log details, return generic error to client
2. **Token Validation Failures**: Return 401 with UNAUTHORIZED code
3. **Database Errors**: Log error, return 500 with INTERNAL_ERROR code
4. **Redis Errors**: Log error, allow operation to continue (fail open for blacklist checks)
5. **Validation Errors**: Return 400 with specific validation details

### Logging

- **INFO**: Successful authentication, logout, token refresh
- **WARN**: Rate limit exceeded, invalid tokens, Google OAuth failures
- **ERROR**: Database errors, Redis errors, unexpected exceptions

Log format should include:
- Timestamp
- Log level
- User ID (if available)
- IP address
- Action (login, refresh, logout)
- Error details (for errors)

## Testing Strategy

### Unit Testing

**Frontend Framework**: Jest, React Testing Library

**Frontend Test Coverage:**

1. **NextAuth Configuration Tests**
   - Callback functions execute correctly
   - User data properly mapped to session
   - Error handling in signIn callback

2. **useAuth Hook Tests**
   - Returns correct authentication state
   - signIn/signOut functions work correctly
   - Loading states handled properly

**Backend Framework**: JUnit 5, Mockito

**Backend Test Coverage:**

1. **AuthService Tests**
   - Google user info processing
   - User creation with default values
   - User update preserving EXP/level/role
   - Session validation logic

2. **UserService Tests**
   - User creation with default values
   - User update preserving EXP/level/role
   - Profile retrieval with expToNextLevel calculation

3. **AuthController Tests**
   - Request validation
   - Response formatting
   - Error handling

### Integration Testing

**Frontend Framework**: Playwright

**Frontend Test Coverage:**

1. **NextAuth Integration**
   - Mock Google OAuth provider
   - Test complete sign-in flow
   - Verify session cookie set correctly
   - Test sign-out flow

**Backend Framework**: Spring Boot Test, TestContainers

**Backend Test Coverage:**

1. **End-to-End Authentication Flow**
   - Mock NextAuth callback request
   - Verify user created in database with correct defaults
   - Verify response contains all required user data

2. **User Update Flow**
   - Create existing user
   - Send auth request with updated name/avatar
   - Verify user updated, EXP/level/role preserved

3. **Rate Limiting**
   - Make 6 requests from same IP
   - Verify 6th request is rate limited with HTTP 429

### Property-Based Testing

**Backend Framework**: jqwik (Java property-based testing library)

**Configuration**: Each property test should run a minimum of 100 iterations.

**Test Coverage:**

1. **Property Test: New User Initialization**
   - **Feature: google-oauth-authentication, Property 6: New User Initialization**
   - Generate random Google profiles, create users, verify totalExp=0, level=1, role=STUDENT

2. **Property Test: User Data Preservation**
   - **Feature: google-oauth-authentication, Property 7: Existing User Data Preservation**
   - Create users with random EXP/level/rank, authenticate, verify values unchanged

3. **Property Test: Profile Update**
   - **Feature: google-oauth-authentication, Property 8: User Profile Update from Google**
   - Create users, authenticate with different name/avatar, verify updated

4. **Property Test: Error Response Format**
   - **Feature: google-oauth-authentication, Property 16: Error Response Format Consistency**
   - Trigger various errors, verify all follow standard format

5. **Property Test: EXP Calculation**
   - **Feature: google-oauth-authentication, Property 17: EXP to Next Level Calculation**
   - Generate users with random EXP/level, verify expToNextLevel calculation

6. **Property Test: Rate Limiting**
   - **Feature: google-oauth-authentication, Property 15: Rate Limiting Enforcement**
   - Generate random IP addresses, make 6 requests each, verify 6th is rate limited

**Frontend Framework**: fast-check (TypeScript property-based testing)

**Test Coverage:**

1. **Property Test: Session Data Completeness**
   - **Feature: google-oauth-authentication, Property 2: Session Payload Completeness**
   - Generate random user data, verify session contains all required fields

### E2E Testing

**Framework**: Playwright

**Test Scenarios:**

1. **Complete User Journey**
   - User clicks "Sign in with Google"
   - Redirected to Google OAuth (mocked in test)
   - User grants permissions
   - Redirected back to app
   - Session cookie set
   - User redirected to dashboard
   - User profile displayed correctly with name, level, EXP

2. **Session Persistence**
   - User logs in
   - Navigate to different pages
   - Session persists across navigation
   - User data remains available

3. **Logout**
   - User logs in
   - User clicks logout
   - Session cookie cleared
   - User redirected to login page
   - Protected pages redirect to login

4. **Protected Route Access**
   - Unauthenticated user tries to access dashboard
   - Redirected to sign-in page
   - After sign-in, redirected back to dashboard

## Security Considerations

### NextAuth Security Features

1. **JWT Strategy**: Tokens signed and encrypted by NextAuth
2. **HttpOnly Cookies**: Session tokens stored in httpOnly cookies, preventing XSS attacks
3. **CSRF Protection**: Built-in CSRF token validation
4. **Secure Cookies**: Automatic secure flag in production (HTTPS)
5. **SameSite Cookies**: Lax mode prevents CSRF attacks

### Session Security

- **Session Lifetime**: 7 days (configurable)
- **Automatic Refresh**: NextAuth handles session refresh automatically
- **Secure Storage**: Session tokens never exposed to JavaScript
- **HTTPS Only**: Enforced in production via NextAuth configuration

### Rate Limiting

- **Implementation**: Spring Boot rate limiting filter with Redis backend
- **Scope**: Per IP address
- **Limits**: 5 requests per 15 minutes for /api/auth/google/callback
- **Response**: HTTP 429 with Retry-After header

### Data Protection

- **Password Storage**: N/A (Google OAuth only)
- **Session Storage**: 
  - Frontend: NextAuth session in httpOnly cookie
  - Backend: Optional Redis session store for scalability
- **User Data**: Email and Google ID are sensitive, protected by authentication
- **Google Tokens**: Never exposed to frontend, handled server-side by NextAuth

## Deployment Considerations

### Environment Variables

**Frontend (.env.local):**
```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-min-32-chars

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Backend API
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

**Backend (application.properties or .env):**
```bash
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/waterballsa
spring.datasource.username=postgres
spring.datasource.password=your-db-password

# Redis (for rate limiting and optional session storage)
spring.redis.host=localhost
spring.redis.port=6379
spring.redis.password=your-redis-password

# Rate Limiting
rate.limit.enabled=true
rate.limit.max.attempts=5
rate.limit.window.minutes=15

# CORS
cors.allowed.origins=http://localhost:3000
```

### Infrastructure Requirements

- **Redis**: For rate limiting and optional session storage
- **PostgreSQL**: For user data persistence
- **HTTPS**: Required in production for secure cookie transmission
- **Load Balancer**: Should support sticky sessions for optimal NextAuth performance

### Monitoring

**Metrics to Track:**
- Authentication success/failure rate
- Session creation rate
- Active sessions count
- Rate limit hit rate
- Google OAuth API latency
- Backend API latency
- Database query latency

**Alerts:**
- High authentication failure rate (> 10%)
- Google OAuth API errors
- Database connection failures
- Rate limit exceeded frequently (potential attack)
- Unusual spike in session creation (potential attack)

## Future Enhancements

1. **Multi-Factor Authentication**: Add optional 2FA via NextAuth
2. **Additional OAuth Providers**: Support GitHub, Facebook via NextAuth providers
3. **Session Management UI**: Allow users to view and revoke active sessions
4. **Audit Logging**: Detailed audit trail of all authentication events
5. **Database Session Adapter**: Use NextAuth database adapter for persistent sessions
6. **Email Verification**: Optional email verification for additional security
7. **Account Linking**: Allow users to link multiple OAuth providers to one account
