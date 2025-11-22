# API Documentation

> RESTful API for WaterBallSA online learning platform

## Overview

**Base URL**: `http://localhost:8080/api` (Development)

**API Version**: v1 (implicit in path structure)

**Documentation Format**: OpenAPI 3.0

**Interactive Documentation**:
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI Spec**: http://localhost:8080/v3/api-docs

---

## Authentication

All endpoints (except auth endpoints) require JWT token in `Authorization` header:

```
Authorization: Bearer <access_token>
```

See [Authentication Endpoints](./authentication.md) for login flow.

---

## Standard Response Format

### Success Response

```typescript
{
  "success": true,
  "data": { ... },
  "message": "Operation successful" // Optional
}
```

### Error Response

```typescript
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "INTERNAL_ERROR",
    "message": "Human-readable error message",
    "details": { ... } // Optional, validation errors, etc.
  },
  "timestamp": "2025-11-22T10:30:00Z"
}
```

### Pagination Format

For list endpoints:

```typescript
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalItems": 156,
      "totalPages": 8,
      "hasNext": true,
      "hasPrevious": false
    }
  }
}
```

---

## API Endpoints

### Authentication
- [Authentication Endpoints](./authentication.md) - Google OAuth login, token refresh, logout

### Curriculum Management
- [Curriculum Endpoints](./curriculums.md) - Browse, view, and purchase curriculums

### Lesson Access
- [Lesson Endpoints](./lessons.md) - View lesson content and track progress

### Assignments
- [Assignment Endpoints](./assignments.md) - View assignments and submit solutions

### User Management
- [User Endpoints](./users.md) - User profile, dashboard, and leaderboard

### Reference
- [Error Codes](./error-codes.md) - Complete error code reference and rate limiting

---

## Common Query Parameters

| Parameter | Type | Description | Default | Max |
|-----------|------|-------------|---------|-----|
| `page` | integer | Page number (1-indexed) | 1 | - |
| `pageSize` | integer | Items per page | 20 | 100 |

---

## HTTP Status Codes

| Status Code | Meaning | Usage |
|-------------|---------|-------|
| 200 | OK | Successful GET/PUT/PATCH request |
| 201 | Created | Successful POST request (resource created) |
| 400 | Bad Request | Invalid request body or parameters |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (e.g., duplicate purchase) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

## Content Types

**Request**: `Content-Type: application/json`
**Response**: `Content-Type: application/json`

All request and response bodies use JSON format.

---

## CORS

Allowed origins:
- Development: `http://localhost:3000`
- Production: `https://waterballsa.com`

Allowed methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`

Credentials: Enabled (for cookies)

---

## Versioning

Currently using **implicit versioning** (no version in URL path).

Future versions will use URL path versioning: `/api/v2/...`

---

## Quick Links

- 🔐 [Authentication](./authentication.md)
- 📚 [Curriculums](./curriculums.md)
- 📖 [Lessons](./lessons.md)
- 📝 [Assignments](./assignments.md)
- 👤 [Users](./users.md)
- ⚠️ [Error Codes](./error-codes.md)
