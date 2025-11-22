# Requirements Document: Google OAuth Authentication

## Introduction

The Google OAuth Authentication system enables users to securely log into the WaterBallSA platform using their Google accounts. This is the exclusive authentication method for the platform, providing a seamless and secure login experience. The system manages JWT tokens for session management and maintains user profiles synchronized with Google account information.

## Glossary

- **Authentication System**: The software component responsible for user login, token management, and session handling
- **User**: An individual who accesses the WaterBallSA platform with a Google account
- **Google OAuth 2.0**: The authentication protocol used to verify user identity through Google
- **Authorization Code**: A temporary code provided by Google after user consent, exchanged for tokens
- **Access Token**: A JWT token with 15-minute expiration used to authenticate API requests
- **Refresh Token**: A JWT token with 7-day expiration used to obtain new access tokens
- **JWT (JSON Web Token)**: A secure token format containing user identity and claims
- **Token Blacklist**: A Redis-based storage of invalidated refresh tokens
- **Student Role**: The default user role assigned to new users upon registration
- **User Profile**: User information including email, name, avatar, role, EXP, level, and rank

## Requirements

### Requirement 1: Google OAuth Callback Handling

**User Story:** As a user, I want to log in with my Google account, so that I can access the platform securely without creating a separate password.

#### Acceptance Criteria

1. WHEN a user completes Google OAuth consent and the system receives an authorization code, THE Authentication System SHALL exchange the code for Google access tokens
2. WHEN the Authentication System receives Google tokens, THE Authentication System SHALL fetch the user's profile information from Google
3. IF the user's email does not exist in the database, THEN THE Authentication System SHALL create a new user record with role STUDENT
4. IF the user's email already exists in the database, THEN THE Authentication System SHALL update the user's name and avatar URL from Google
5. WHEN user authentication succeeds, THE Authentication System SHALL generate a JWT access token with 15-minute expiration

### Requirement 2: JWT Token Generation

**User Story:** As a system, I want to issue secure JWT tokens, so that users can make authenticated API requests.

#### Acceptance Criteria

1. WHEN generating an access token, THE Authentication System SHALL include user ID, email, and role in the token payload
2. WHEN generating an access token, THE Authentication System SHALL set the expiration time to 15 minutes from issuance
3. WHEN generating a refresh token, THE Authentication System SHALL include user ID and token type in the payload
4. WHEN generating a refresh token, THE Authentication System SHALL set the expiration time to 7 days from issuance
5. WHEN tokens are generated, THE Authentication System SHALL sign them using RS256 algorithm with the configured private key

### Requirement 3: Authentication Response

**User Story:** As a frontend application, I want to receive tokens and user information after successful login, so that I can store tokens and display user details.

#### Acceptance Criteria

1. WHEN authentication succeeds, THE Authentication System SHALL return both access token and refresh token
2. WHEN authentication succeeds, THE Authentication System SHALL return the access token expiration time in seconds
3. WHEN authentication succeeds, THE Authentication System SHALL return complete user profile including ID, email, name, avatar URL, role, total EXP, current level, and user rank
4. WHEN authentication succeeds, THE Authentication System SHALL return a success status with HTTP 200
5. IF the authorization code is invalid or expired, THEN THE Authentication System SHALL return a validation error with HTTP 400

### Requirement 4: Token Refresh

**User Story:** As a user, I want my session to continue seamlessly, so that I don't have to log in repeatedly while actively using the platform.

#### Acceptance Criteria

1. WHEN a valid refresh token is provided, THE Authentication System SHALL verify the token signature and expiration
2. WHEN a refresh token is verified, THE Authentication System SHALL check that the token is not in the blacklist
3. WHEN a valid refresh token is confirmed, THE Authentication System SHALL generate a new access token with 15-minute expiration
4. WHEN a new access token is generated, THE Authentication System SHALL return the token and expiration time
5. IF the refresh token is invalid, expired, or blacklisted, THEN THE Authentication System SHALL return an unauthorized error with HTTP 401

### Requirement 5: User Logout

**User Story:** As a user, I want to log out securely, so that my session is terminated and my account is protected.

#### Acceptance Criteria

1. WHEN a user initiates logout with a valid access token and refresh token, THE Authentication System SHALL verify the access token
2. WHEN logout is verified, THE Authentication System SHALL add the refresh token to the blacklist
3. WHEN a refresh token is blacklisted, THE Authentication System SHALL store it in Redis with expiration matching the token's original expiration
4. WHEN logout completes successfully, THE Authentication System SHALL return a success message with HTTP 200
5. IF the access token is invalid during logout, THEN THE Authentication System SHALL return an unauthorized error with HTTP 401

### Requirement 6: Current User Profile Retrieval

**User Story:** As a user, I want to view my current profile information, so that I can see my progress and account details.

#### Acceptance Criteria

1. WHEN a user requests their profile with a valid access token, THE Authentication System SHALL extract the user ID from the token
2. WHEN the user ID is extracted, THE Authentication System SHALL retrieve the complete user record from the database
3. WHEN returning the user profile, THE Authentication System SHALL include ID, email, name, avatar URL, role, total EXP, current level, user rank, and account creation date
4. WHEN returning the user profile, THE Authentication System SHALL calculate and include EXP required to reach the next level
5. IF the access token is missing or invalid, THEN THE Authentication System SHALL return an unauthorized error with HTTP 401

### Requirement 7: Token Validation

**User Story:** As an API endpoint, I want to validate access tokens, so that I can ensure only authenticated users access protected resources.

#### Acceptance Criteria

1. WHEN an API request includes an access token in the Authorization header, THE Authentication System SHALL verify the token signature using the public key
2. WHEN validating a token, THE Authentication System SHALL check that the token has not expired
3. WHEN a token is valid, THE Authentication System SHALL extract and provide the user ID, email, and role to the requesting service
4. IF a token signature is invalid, THEN THE Authentication System SHALL reject the request with HTTP 401
5. IF a token has expired, THEN THE Authentication System SHALL reject the request with HTTP 401

### Requirement 8: User Profile Synchronization

**User Story:** As a system administrator, I want user profiles to stay synchronized with Google, so that user information remains accurate and up-to-date.

#### Acceptance Criteria

1. WHEN a user logs in, THE Authentication System SHALL fetch the latest name and avatar URL from Google
2. WHEN user information is fetched from Google, THE Authentication System SHALL update the user record in the database
3. WHEN creating a new user, THE Authentication System SHALL initialize total EXP to 0 and current level to 1
4. WHEN creating a new user, THE Authentication System SHALL assign the role STUDENT by default
5. WHEN updating an existing user, THE Authentication System SHALL preserve the user's EXP, level, rank, and role

### Requirement 9: Security and Rate Limiting

**User Story:** As a system administrator, I want to protect authentication endpoints from abuse, so that the platform remains secure and available.

#### Acceptance Criteria

1. WHEN the authentication callback endpoint receives requests, THE Authentication System SHALL enforce a rate limit of 5 attempts per 15 minutes per IP address
2. IF the rate limit is exceeded, THEN THE Authentication System SHALL return a rate limit error with HTTP 429
3. WHEN tokens are transmitted, THE Authentication System SHALL require HTTPS in production environments
4. WHEN storing refresh tokens in the blacklist, THE Authentication System SHALL use Redis for fast lookup and automatic expiration
5. WHEN generating tokens, THE Authentication System SHALL use cryptographically secure random values for token IDs

### Requirement 10: Error Handling

**User Story:** As a frontend developer, I want clear error messages, so that I can handle authentication failures appropriately and inform users.

#### Acceptance Criteria

1. WHEN an authentication error occurs, THE Authentication System SHALL return a standardized error response with success false, error code, and message
2. WHEN a validation error occurs, THE Authentication System SHALL include specific details about what validation failed
3. WHEN Google OAuth fails, THE Authentication System SHALL return an appropriate error message without exposing internal details
4. WHEN a token is invalid or expired, THE Authentication System SHALL return an UNAUTHORIZED error code
5. WHEN a server error occurs, THE Authentication System SHALL log the error details and return a generic INTERNAL_ERROR to the client
