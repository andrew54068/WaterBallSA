# Error Codes & Rate Limiting

> Complete error code reference and API rate limiting

## Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... } // Optional, context-specific details
  },
  "timestamp": "2025-11-22T10:30:00Z"
}
```

---

## HTTP Status Codes

| Status Code | Meaning | When Used |
|-------------|---------|-----------|
| 200 | OK | Successful GET/PUT/PATCH request |
| 201 | Created | Successful POST request (resource created) |
| 400 | Bad Request | Invalid request body or parameters |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (e.g., duplicate) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |

---

## Error Codes

### Authentication Errors (401)

#### `UNAUTHORIZED`

**Description**: Missing or invalid access token.

**Example**:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid access token"
  },
  "timestamp": "2025-11-22T10:30:00Z"
}
```

**Common Causes**:
- No `Authorization` header
- Malformed JWT token
- Expired access token
- Invalid token signature

**Resolution**:
1. Check if access token is expired
2. If expired, call `/api/auth/refresh` to get new token
3. If refresh fails, redirect to login

---

#### `INVALID_REFRESH_TOKEN`

**Description**: Refresh token is invalid or expired.

**Example**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REFRESH_TOKEN",
    "message": "Invalid or expired refresh token"
  }
}
```

**Common Causes**:
- Refresh token expired (7 days)
- Refresh token in blacklist (after logout)
- Invalid token format

**Resolution**:
- Redirect user to login page
- Clear stored tokens

---

### Authorization Errors (403)

#### `FORBIDDEN`

**Description**: User lacks permissions for this action.

**Example** (Unpurchased Content):
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You must purchase this curriculum to access its content",
    "details": {
      "curriculumId": "550e8400-e29b-41d4-a716-446655440000",
      "price": 99.99
    }
  }
}
```

**Example** (Admin-Only Endpoint):
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Only admins can grade submissions"
  }
}
```

**Common Causes**:
- Student accessing unpurchased curriculum
- Student attempting admin action
- Accessing restricted resource

**Resolution**:
- For unpurchased content: Show purchase modal
- For admin actions: Display "Admin only" message

---

### Validation Errors (400)

#### `VALIDATION_ERROR`

**Description**: Invalid request body or parameters.

**Example** (Multiple Field Errors):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "mockPaymentId": "Invalid format (must be mock_*)",
      "cardLast4": "Must be exactly 4 digits"
    }
  }
}
```

**Example** (Single Field Error):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid grade value",
    "details": {
      "grade": "Must be between 0 and 100"
    }
  }
}
```

**Common Causes**:
- Missing required fields
- Invalid field format
- Value out of allowed range
- Type mismatch

**Resolution**:
- Display field-specific errors to user
- Highlight invalid form fields
- Show validation hints

---

#### `INVALID_AUTHORIZATION_CODE`

**Description**: Google OAuth authorization code is invalid.

**Example**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_AUTHORIZATION_CODE",
    "message": "Invalid or expired authorization code"
  }
}
```

**Common Causes**:
- Authorization code already used
- Authorization code expired (10 minutes)
- Authorization code from different redirect URI

**Resolution**:
- Restart OAuth flow
- Redirect user back to Google login

---

### Resource Errors (404)

#### `NOT_FOUND`

**Description**: Requested resource does not exist.

**Example**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Curriculum not found"
  }
}
```

**Common Causes**:
- Invalid UUID in path parameter
- Resource was deleted
- Typo in URL

**Resolution**:
- Show "Resource not found" page
- Redirect to parent resource (e.g., curriculum list)

---

### Conflict Errors (409)

#### `ALREADY_PURCHASED`

**Description**: User has already purchased this curriculum.

**Example**:
```json
{
  "success": false,
  "error": {
    "code": "ALREADY_PURCHASED",
    "message": "You have already purchased this curriculum",
    "details": {
      "purchaseId": "880e8400-e29b-41d4-a716-446655440000",
      "purchasedAt": "2025-11-20T15:22:00Z"
    }
  }
}
```

**Common Causes**:
- Duplicate purchase attempt
- User refreshed payment confirmation page

**Resolution**:
- Show "Already Owned" message
- Redirect to curriculum content

---

#### `CONFLICT`

**Description**: Generic resource conflict.

**Example** (Submission Already Graded):
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Submission has already been graded",
    "details": {
      "gradedAt": "2025-11-20T10:00:00Z",
      "grade": 75.0
    }
  }
}
```

**Common Causes**:
- Attempting to modify immutable resource
- Resource state conflict

**Resolution**:
- Refresh page to get latest state
- Display current state to user

---

### Server Errors (500)

#### `INTERNAL_ERROR`

**Description**: Unexpected server error.

**Example**:
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred. Please try again later."
  }
}
```

**Common Causes**:
- Database connection failure
- Unhandled exception
- Third-party service outage

**Resolution**:
- Show generic error message
- Retry after delay
- Contact support if persists

---

## Rate Limiting

### Rate Limit Rules

| Endpoint Type | Limit | Window | Per |
|--------------|-------|--------|-----|
| **Unauthenticated** | 100 requests | 1 hour | IP address |
| **Authenticated** | 1000 requests | 1 hour | User ID |
| **Login Endpoint** | 5 attempts | 15 minutes | IP address |

### Rate Limit Headers

Every API response includes rate limit information:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1732275600
```

**Header Meanings**:
- `X-RateLimit-Limit`: Total requests allowed in window
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Unix timestamp when limit resets

### Rate Limit Exceeded Response (429)

#### `RATE_LIMIT_EXCEEDED`

**Description**: Too many requests from this IP/user.

**Example**:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 15 minutes.",
    "details": {
      "retryAfter": 900 // Seconds until reset
    }
  }
}
```

**Response Headers**:
```
HTTP/1.1 429 Too Many Requests
Retry-After: 900
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1732275600
```

**Common Causes**:
- Automated scripts/bots
- Accidental infinite loops in frontend
- DDoS attack

**Resolution**:
- Wait for `retryAfter` seconds
- Display countdown timer to user
- Contact support if legitimate use case

---

## Error Handling Best Practices

### Frontend Error Handling

```typescript
async function fetchCurriculum(id: string) {
  try {
    const response = await fetch(`/api/curriculums/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      switch (data.error.code) {
        case 'UNAUTHORIZED':
          // Token expired, try refresh
          await refreshAccessToken();
          return fetchCurriculum(id); // Retry

        case 'FORBIDDEN':
          // Show purchase modal
          showPurchaseModal(data.error.details);
          break;

        case 'NOT_FOUND':
          // Show 404 page
          navigate('/404');
          break;

        case 'RATE_LIMIT_EXCEEDED':
          // Show rate limit message
          const retryAfter = data.error.details.retryAfter;
          showRateLimitMessage(retryAfter);
          break;

        default:
          // Generic error
          showErrorToast(data.error.message);
      }
      return null;
    }

    return data.data;
  } catch (error) {
    // Network error
    showErrorToast('Network error. Please check your connection.');
    return null;
  }
}
```

### Backend Error Responses

**Consistent Error Structure**:
```java
@ExceptionHandler(ForbiddenException.class)
public ResponseEntity<ErrorResponse> handleForbidden(ForbiddenException ex) {
    ErrorResponse error = new ErrorResponse(
        false,
        new ErrorDetail(
            "FORBIDDEN",
            ex.getMessage(),
            ex.getDetails()
        ),
        Instant.now()
    );
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
}
```

---

## Monitoring & Alerts

### Error Rate Monitoring

**Alert Thresholds**:
- Error rate > 5% → Warning alert
- Error rate > 10% → Critical alert
- 500 errors > 1% → Immediate investigation

### Common Error Patterns

**High 401 Errors**:
- Possible cause: Token expiration issues
- Check: JWT expiration configuration

**High 403 Errors**:
- Possible cause: Users attempting to access unpurchased content
- Check: Normal behavior or UI issue?

**High 429 Errors**:
- Possible cause: Bot attack or frontend bug
- Action: Investigate IP patterns, check for loops

**High 500 Errors**:
- Possible cause: Database issues, third-party outage
- Action: Check logs, database health, external services

---

## Testing Error Scenarios

### Manual Testing

```bash
# Test 401 - No token
curl http://localhost:8080/api/curriculums

# Test 401 - Invalid token
curl -H "Authorization: Bearer invalid_token" \
  http://localhost:8080/api/curriculums

# Test 403 - Unpurchased content
curl -H "Authorization: Bearer $STUDENT_TOKEN" \
  http://localhost:8080/api/curriculums/unpurchased-id

# Test 404 - Invalid ID
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/curriculums/invalid-uuid

# Test 409 - Duplicate purchase
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -d '{"mockPaymentId":"mock_123"}' \
  http://localhost:8080/api/curriculums/already-purchased-id/purchase

# Test 429 - Rate limit (send 1001 requests quickly)
for i in {1..1001}; do
  curl -H "Authorization: Bearer $TOKEN" \
    http://localhost:8080/api/curriculums &
done
```

### Integration Tests

```java
@Test
void testUnauthorized_NoToken() {
    given()
        .when()
        .get("/api/curriculums")
        .then()
        .statusCode(401)
        .body("success", equalTo(false))
        .body("error.code", equalTo("UNAUTHORIZED"));
}

@Test
void testForbidden_UnpurchasedContent() {
    given()
        .header("Authorization", "Bearer " + studentToken)
        .when()
        .get("/api/curriculums/" + unpurchasedCurriculumId)
        .then()
        .statusCode(403)
        .body("error.code", equalTo("FORBIDDEN"))
        .body("error.details.price", notNullValue());
}
```

---

## Appendix: Complete Error Code List

| Error Code | HTTP Status | Description |
|-----------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid access token |
| `INVALID_REFRESH_TOKEN` | 401 | Refresh token invalid/expired |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `INVALID_AUTHORIZATION_CODE` | 400 | OAuth code invalid |
| `NOT_FOUND` | 404 | Resource not found |
| `ALREADY_PURCHASED` | 409 | Curriculum already purchased |
| `CONFLICT` | 409 | Resource state conflict |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
