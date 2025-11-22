# Implementation Plan: Google OAuth Authentication

## Task List

- [x] 1. Set up project infrastructure and dependencies
  - Install NextAuth.js in frontend (`next-auth` package)
  - Install Redis client in backend (Spring Data Redis)
  - Configure PostgreSQL connection in backend
  - Set up environment variables for both frontend and backend
  - _Requirements: All_

- [x] 2. Implement database schema and user model
- [x] 2.1 Create User entity and repository
  - Create `User` JPA entity with all fields (id, email, googleId, name, avatarUrl, role, totalExp, currentLevel, userRank, timestamps)
  - Create `UserRepository` interface extending JpaRepository
  - Add database indexes for email, googleId, and userRank
  - _Requirements: 8.3, 8.4_

- [x] 2.2 Write property test for user initialization
  - **Property 6: New User Initialization**
  - **Validates: Requirements 8.3, 8.4**

- [x] 2.3 Update database migration script
  - Update Flyway migration for users table to match User entity
  - Include UUID type, all fields (avatarUrl, role, totalExp, currentLevel, userRank)
  - Include all constraints, indexes, and default values
  - _Requirements: 8.3, 8.4_

- [x] 3. Implement backend user service
- [x] 3.1 Create UserService interface and implementation
  - Implement `findByEmail()` method
  - Implement `findByGoogleId()` method
  - Implement `createUser()` method with default values (totalExp=0, level=1, role=STUDENT)
  - Implement `updateUser()` method preserving EXP/level/rank/role
  - Implement `getUserProfile()` method with expToNextLevel calculation
  - _Requirements: 1.3, 1.4, 6.3, 6.4, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 3.2 Write property test for user data preservation
  - **Property 7: Existing User Data Preservation**
  - **Validates: Requirements 8.5**

- [x] 3.3 Write property test for profile update
  - **Property 8: User Profile Update from Google**
  - **Validates: Requirements 1.4, 8.1, 8.2**

- [x] 3.4 Write property test for EXP calculation
  - **Property 17: EXP to Next Level Calculation**
  - **Validates: Requirements 6.4**

- [x] 4. Implement backend authentication service
- [x] 4.1 Create AuthService interface and implementation
  - Implement `authenticateWithGoogle()` method
  - Handle new user creation vs existing user update logic
  - Return complete user data for NextAuth session
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 3.2, 3.3_

- [x] 4.2 Write unit tests for AuthService
  - Test new user creation flow
  - Test existing user update flow
  - Test error handling for invalid Google data
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 5. Implement backend authentication controller and error handling
- [x] 5.1 Create error response DTOs and exception handler
  - Create `ErrorResponse` DTO with success, error code, message, and timestamp
  - Create custom exception classes (ValidationException, UnauthorizedException, RateLimitException)
  - Create `@ControllerAdvice` global exception handler
  - Handle validation errors, unauthorized errors, rate limit errors, and internal errors
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 5.2 Create AuthController with endpoints
  - Implement `POST /api/auth/google/callback` endpoint
  - Implement `GET /api/auth/me` endpoint
  - Add request validation using @Valid annotations
  - Add proper error handling and response formatting
  - Configure CORS to allow frontend origin
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 5.3 Write property test for error response format
  - **Property 16: Error Response Format Consistency**
  - **Validates: Requirements 10.1, 10.2, 10.4**

- [ ] 6. Implement rate limiting
- [ ] 6.1 Create rate limiting filter
  - Implement Redis-based rate limiter using Spring Data Redis
  - Configure 5 requests per 15 minutes per IP
  - Return HTTP 429 when limit exceeded with Retry-After header
  - Apply rate limiting to `/api/auth/google/callback` endpoint
  - _Requirements: 9.1, 9.2_

- [ ]* 6.2 Write property test for rate limiting
  - **Property 15: Rate Limiting Enforcement**
  - **Validates: Requirements 9.1, 9.2**

- [ ]* 6.3 Write integration test for rate limiting
  - Test rate limit enforcement with multiple requests
  - Verify 6th request returns 429
  - Verify rate limit resets after window
  - _Requirements: 9.1, 9.2_

- [ ] 7. Checkpoint - Ensure backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement NextAuth.js configuration
- [ ] 8.1 Create NextAuth API route and configuration
  - Create `app/api/auth/[...nextauth]/route.ts`
  - Configure Google OAuth provider with GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
  - Implement signIn callback to call backend `POST /api/auth/google/callback`
  - Implement jwt callback to add custom user data (userId, role, totalExp, currentLevel)
  - Implement session callback to expose user data to client
  - Configure session strategy as JWT with 7-day maxAge
  - Add TypeScript types for extended session and user objects
  - _Requirements: 1.1, 1.2, 1.5, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3_

- [ ]* 8.2 Write unit tests for NextAuth callbacks
  - Test signIn callback with mocked backend
  - Test jwt callback data mapping
  - Test session callback data exposure
  - _Requirements: 1.1, 1.2, 3.1, 3.2, 3.3_

- [ ] 9. Create authentication UI components
- [ ] 9.1 Create sign-in page
  - Create `app/auth/signin/page.tsx` with "Sign in with Google" button
  - Use NextAuth `signIn("google")` function
  - Add loading state during authentication
  - Handle authentication errors with error display
  - Style with clean, minimal design
  - _Requirements: 1.1, 3.4, 3.5_

- [ ] 9.2 Create authentication provider
  - Wrap app in `app/layout.tsx` with NextAuth SessionProvider
  - Configure session refresh behavior
  - _Requirements: 4.1, 4.3_

- [ ] 10. Create useAuth custom hook
- [ ] 10.1 Implement useAuth hook
  - Create `src/hooks/useAuth.ts` wrapping NextAuth useSession hook
  - Provide user, isAuthenticated, isLoading states
  - Provide signIn and signOut functions
  - Add TypeScript types for user data
  - _Requirements: 5.1, 5.4, 6.1_

- [ ]* 10.2 Write unit tests for useAuth hook
  - Test hook returns correct states
  - Test signIn/signOut functions
  - Test loading states
  - _Requirements: 5.1, 5.4, 6.1_

- [ ] 11. Implement protected route middleware
- [ ] 11.1 Create authentication middleware
  - Create `middleware.ts` in frontend root directory
  - Use NextAuth `withAuth` middleware
  - Protect routes matching `/dashboard/*`, `/profile/*`, `/curriculum/*`
  - Redirect unauthenticated users to `/auth/signin`
  - Allow access for authenticated users
  - _Requirements: 6.5, 7.1, 7.2, 7.4, 7.5_

- [ ]* 11.2 Write integration tests for protected routes
  - Test unauthenticated access redirects to sign-in
  - Test authenticated access allows through
  - Test expired session redirects to sign-in
  - _Requirements: 6.5, 7.5_

- [ ] 12. Create user profile components
- [ ] 12.1 Create user profile display component
  - Create `src/components/UserProfile.tsx`
  - Display user name, avatar, level, EXP
  - Display EXP progress bar to next level
  - Show user rank (if available)
  - Fetch user profile from backend `/api/auth/me` endpoint
  - _Requirements: 6.3, 6.4_

- [ ] 12.2 Create navigation with user menu
  - Create `src/components/Navigation.tsx`
  - Show user avatar in navigation
  - Add dropdown menu with profile and sign-out options
  - Implement sign-out functionality using NextAuth signOut()
  - _Requirements: 5.4, 6.3_

- [ ] 13. Implement integration tests
- [ ]* 13.1 Write backend integration tests
  - Test complete authentication flow with TestContainers
  - Test user creation in database
  - Test user update flow
  - Test rate limiting with Redis
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 9.1, 9.2_

- [ ]* 13.2 Write property test for session payload
  - **Property 2: Session Payload Completeness**
  - **Validates: Requirements 2.1, 3.3**

- [ ] 14. Implement E2E tests
- [ ]* 14.1 Write E2E test for complete authentication flow
  - Mock Google OAuth provider using Playwright
  - Test sign-in flow from start to finish
  - Verify user redirected to dashboard
  - Verify user profile displayed correctly
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 3.2, 3.3, 6.3_

- [ ]* 14.2 Write E2E test for session persistence
  - Test session persists across page navigation
  - Test session data remains available
  - _Requirements: 4.1, 4.3_

- [ ]* 14.3 Write E2E test for logout flow
  - Test sign-out clears session
  - Test redirect to sign-in page
  - Test protected routes redirect after logout
  - _Requirements: 5.2, 5.4_

- [ ]* 14.4 Write E2E test for protected routes
  - Test unauthenticated access redirects
  - Test authenticated access succeeds
  - Test redirect back to original page after sign-in
  - _Requirements: 6.5, 7.1, 7.2_

- [ ] 15. Configure production environment
- [ ] 15.1 Update environment configuration files
  - Update `.env.example` files for frontend and backend with all required variables
  - Document NEXTAUTH_SECRET generation (openssl rand -base64 32)
  - Document Google OAuth client ID and secret setup
  - Document backend URL configuration
  - Document Redis and PostgreSQL connection strings
  - _Requirements: 9.3_

- [ ] 15.2 Configure security settings
  - Configure NextAuth to enforce HTTPS in production (via NEXTAUTH_URL)
  - Configure secure cookie settings (automatic in NextAuth for HTTPS)
  - Add security headers in Next.js config (HSTS, CSP, X-Frame-Options)
  - Configure CORS in Spring Boot for frontend origin
  - _Requirements: 9.3_

- [ ]* 15.3 Set up monitoring and logging
  - Add structured logging for authentication events in backend
  - Configure metrics for authentication success/failure rates
  - Set up alerts for high failure rates
  - Add logging for rate limit hits
  - _Requirements: 10.5_

- [ ] 16. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
