# Authentication Endpoints

> Google OAuth 2.0 authentication and JWT token management

## Overview

WaterBallSA uses **Google OAuth 2.0** as the exclusive authentication method. No email/password login is supported.

**Token Types**:
- **Access Token**: 15-minute expiration, used for API requests
- **Refresh Token**: 7-day expiration, used to obtain new access tokens

---

## POST `/api/auth/google/callback`

Handle Google OAuth callback and issue JWT tokens.

### Request

```json
{
  "code": "4/0AY0e-g7...", // Google OAuth authorization code
  "redirectUri": "http://localhost:3000/auth/callback"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900, // 15 minutes in seconds
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe",
      "avatarUrl": "https://lh3.googleusercontent.com/...",
      "role": "STUDENT",
      "totalExp": 1250,
      "currentLevel": 4,
      "userRank": 42
    }
  }
}
```

### Error Response (400 Bad Request)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid authorization code"
  }
}
```

---

## POST `/api/auth/refresh`

Refresh access token using refresh token.

### Request

```json
{
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

### Error Response (401 Unauthorized)

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired refresh token"
  }
}
```

---

## POST `/api/auth/logout`

Invalidate refresh token (add to blacklist).

### Request Headers

```
Authorization: Bearer <access_token>
```

### Request Body

```json
{
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## GET `/api/auth/me`

Get current user profile.

### Request Headers

```
Authorization: Bearer <access_token>
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "avatarUrl": "https://lh3.googleusercontent.com/...",
    "role": "STUDENT",
    "totalExp": 1250,
    "currentLevel": 4,
    "userRank": 42,
    "expToNextLevel": 350, // 1600 - 1250
    "createdAt": "2025-01-15T08:30:00Z"
  }
}
```

### Error Response (401 Unauthorized)

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid access token"
  }
}
```

---

## Authentication Flow

```
┌─────────┐     ┌──────────┐     ┌────────┐     ┌────────┐
│ Browser │────▶│ Frontend │────▶│ Google │────▶│Backend │
└─────────┘     └──────────┘     └────────┘     └────────┘

1. User clicks "Sign in with Google"
2. Frontend redirects to Google OAuth consent screen
3. User grants permissions
4. Google redirects to callback with authorization code
5. Frontend sends code to POST /api/auth/google/callback
6. Backend exchanges code for Google tokens
7. Backend fetches user profile from Google
8. Backend creates/updates user in database
9. Backend generates JWT tokens (access + refresh)
10. Frontend stores tokens:
    - Access token: localStorage or memory
    - Refresh token: httpOnly cookie (recommended)
11. Frontend redirects to dashboard
```

---

## Token Refresh Flow

```
1. Frontend makes API request with access token
2. Backend returns 401 Unauthorized (token expired)
3. Frontend calls POST /api/auth/refresh with refresh token
4. Backend validates refresh token (not blacklisted, not expired)
5. Backend generates new access token
6. Frontend retries original request with new access token
```

---

## JWT Token Structure

### Access Token Payload

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "role": "STUDENT",
  "iat": 1732272000,
  "exp": 1732272900
}
```

### Refresh Token Payload

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "type": "refresh",
  "iat": 1732272000,
  "exp": 1732876800
}
```

---

## Security Notes

1. **Token Storage**:
   - Access tokens: Store in memory or localStorage
   - Refresh tokens: Store in httpOnly cookies (prevents XSS attacks)

2. **Token Expiration**:
   - Access tokens: 15 minutes (short-lived for security)
   - Refresh tokens: 7 days (longer for UX)

3. **Token Blacklist**:
   - Refresh tokens stored in Redis blacklist on logout
   - Access tokens cannot be revoked (short expiration mitigates risk)

4. **HTTPS Required**:
   - All authentication endpoints must use HTTPS in production
   - Prevents token interception

5. **Rate Limiting**:
   - Login endpoint: 5 attempts per 15 minutes per IP
   - Prevents brute force attacks

---

## Google OAuth Setup

See [Security Documentation](../security/authentication.md#google-oauth-setup) for:
- Creating Google Cloud project
- Configuring OAuth 2.0 credentials
- Setting authorized redirect URIs
