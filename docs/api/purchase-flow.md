# Purchase Flow API Documentation

## Document Information
- **Feature**: Purchase Flow API Endpoints
- **Phase**: Phase 2 - Access Control & Payment
- **Version**: 1.0
- **Created**: 2025-12-01
- **Updated**: 2025-12-01

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [Endpoints](#endpoints)
5. [Data Models](#data-models)
6. [Error Codes](#error-codes)
7. [Examples](#examples)

---

## Overview

The Purchase Flow API provides endpoints for:
- Viewing order previews before purchase
- Validating and applying discount coupons
- Creating pending orders
- Processing mock payments
- Retrieving order history

All endpoints require authentication unless otherwise specified.

---

## Authentication

All endpoints require a valid JWT access token.

**Header Format**:
```
Authorization: Bearer <access_token>
```

**Token Acquisition**:
- Obtain tokens via `POST /api/auth/google` endpoint
- Access token expires after 15 minutes
- Refresh token expires after 7 days

**Error Response (401 Unauthorized)**:
```json
{
  "error": "UNAUTHORIZED",
  "message": "Missing or invalid authentication token",
  "timestamp": "2025-12-01T14:46:35Z",
  "path": "/api/orders"
}
```

---

## Base URL

**Development**:
```
http://localhost:8081/api
```

**Production**:
```
https://api.waterballsa.com/api
```

---

## Endpoints

### 1. Get Order Preview

**Endpoint**: `GET /api/curriculums/{id}/order-preview`

**Description**: Retrieves complete curriculum details for order confirmation page, including all chapters and lessons.

**Authentication**: Required

**Path Parameters**:
| Parameter | Type    | Required | Description      |
|-----------|---------|----------|------------------|
| `id`      | integer | Yes      | Curriculum ID    |

**Success Response (200 OK)**:
```json
{
  "curriculum": {
    "id": 1,
    "title": "React Mastery",
    "description": "Master React from basics to advanced topics",
    "thumbnailUrl": "https://example.com/react-mastery.jpg",
    "price": 49.99,
    "difficultyLevel": "INTERMEDIATE",
    "isPublished": true,
    "estimatedDurationHours": 40
  },
  "chapters": [
    {
      "id": 1,
      "title": "Getting Started with React",
      "description": "Learn the fundamentals of React",
      "orderIndex": 0,
      "lessons": [
        {
          "id": 1,
          "title": "Welcome to React",
          "description": "Introduction to React library",
          "lessonType": "VIDEO",
          "durationMinutes": 15,
          "orderIndex": 0,
          "isFreePreview": true
        },
        {
          "id": 2,
          "title": "Installing Node.js and npm",
          "lessonType": "ARTICLE",
          "durationMinutes": 10,
          "orderIndex": 1,
          "isFreePreview": false
        }
      ]
    },
    {
      "id": 2,
      "title": "React Components",
      "orderIndex": 1,
      "lessons": [
        {
          "id": 3,
          "title": "Functional Components",
          "lessonType": "VIDEO",
          "durationMinutes": 25,
          "orderIndex": 0,
          "isFreePreview": false
        }
      ]
    }
  ],
  "originalPrice": 49.99,
  "totalChapters": 2,
  "totalLessons": 3
}
```

**Error Responses**:

**401 Unauthorized**:
```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication required to view order preview",
  "timestamp": "2025-12-01T14:46:35Z",
  "path": "/api/curriculums/1/order-preview"
}
```

**404 Not Found**:
```json
{
  "error": "CURRICULUM_NOT_FOUND",
  "message": "Curriculum with ID 999 does not exist",
  "timestamp": "2025-12-01T14:46:35Z",
  "path": "/api/curriculums/999/order-preview"
}
```

**409 Conflict** (User already owns curriculum):
```json
{
  "error": "ALREADY_OWNED",
  "message": "You already own this curriculum",
  "purchaseDate": "2025-11-15T10:30:00Z",
  "orderNumber": "20251115103000001",
  "timestamp": "2025-12-01T14:46:35Z",
  "path": "/api/curriculums/1/order-preview"
}
```

---

### 2. Validate Coupon

**Endpoint**: `POST /api/coupons/validate`

**Description**: Validates a coupon code for a specific curriculum and returns discount information.

**Authentication**: Required

**Request Body**:
```json
{
  "curriculumId": 1,
  "couponCode": "REACT20"
}
```

**Request Body Schema**:
| Field          | Type    | Required | Description                |
|----------------|---------|----------|----------------------------|
| `curriculumId` | integer | Yes      | Curriculum ID to purchase  |
| `couponCode`   | string  | Yes      | Coupon code to validate    |

**Success Response (200 OK)** - Valid Coupon:
```json
{
  "valid": true,
  "code": "REACT20",
  "discountType": "PERCENTAGE",
  "discountValue": 20,
  "discountAmount": 10.00,
  "finalPrice": 39.99,
  "originalPrice": 49.99
}
```

**Success Response (200 OK)** - Invalid Coupon:
```json
{
  "valid": false,
  "error": "COUPON_EXPIRED",
  "message": "Coupon has expired on 2025-10-31",
  "originalPrice": 49.99
}
```

**Validation Errors**:

| Error Code              | Message                          | Reason                           |
|-------------------------|----------------------------------|----------------------------------|
| `COUPON_NOT_FOUND`      | Invalid coupon code              | Coupon does not exist            |
| `COUPON_EXPIRED`        | Coupon has expired               | Current date > `valid_until`     |
| `COUPON_NOT_STARTED`    | Coupon is not yet valid          | Current date < `valid_from`      |
| `COUPON_MAX_USES`       | Coupon has reached maximum uses  | `current_uses >= max_uses`       |
| `COUPON_INACTIVE`       | Coupon is not active             | `is_active = false`              |

**Example Response** - Fixed Amount Coupon:
```json
{
  "valid": true,
  "code": "SAVE15",
  "discountType": "FIXED_AMOUNT",
  "discountValue": 15.00,
  "discountAmount": 15.00,
  "finalPrice": 34.99,
  "originalPrice": 49.99
}
```

**Error Responses**:

**400 Bad Request**:
```json
{
  "error": "INVALID_REQUEST",
  "message": "curriculumId and couponCode are required",
  "timestamp": "2025-12-01T14:46:35Z",
  "path": "/api/coupons/validate"
}
```

---

### 3. Create Order

**Endpoint**: `POST /api/orders`

**Description**: Creates a pending order for a curriculum. Optionally applies a coupon code.

**Authentication**: Required

**Request Body**:
```json
{
  "curriculumId": 1,
  "couponCode": "REACT20"
}
```

**Request Body Schema**:
| Field          | Type    | Required | Description                       |
|----------------|---------|----------|-----------------------------------|
| `curriculumId` | integer | Yes      | Curriculum ID to purchase         |
| `couponCode`   | string  | No       | Optional coupon code to apply     |

**Success Response (201 Created)**:
```json
{
  "id": 42,
  "orderNumber": "20251201144635001",
  "userId": 5,
  "curriculumId": 1,
  "curriculumTitle": "React Mastery",
  "curriculumThumbnailUrl": "https://example.com/react-mastery.jpg",
  "status": "PENDING",
  "originalPrice": 49.99,
  "discountAmount": 10.00,
  "finalPrice": 39.99,
  "couponCode": "REACT20",
  "expiresAt": "2025-12-04T23:59:59Z",
  "createdAt": "2025-12-01T14:46:35Z",
  "updatedAt": "2025-12-01T14:46:35Z",
  "purchasedAt": null
}
```

**Order Number Format**:
- Format: `YYYYMMDDHHMMSSXXX`
- Example: `20251201144635001`
  - `20251201` - Date (December 1, 2025)
  - `144635` - Time (14:46:35)
  - `001` - Random 3-digit number
- Guaranteed unique via database constraint

**Expiration Logic**:
- `expiresAt` is set to 3 days after `createdAt`
- Order automatically expires if not paid before deadline
- Expiration time is always 23:59:59 on the expiration date

**Error Responses**:

**400 Bad Request** - Invalid Curriculum:
```json
{
  "error": "CURRICULUM_NOT_FOUND",
  "message": "Curriculum with ID 999 does not exist",
  "timestamp": "2025-12-01T14:46:35Z",
  "path": "/api/orders"
}
```

**400 Bad Request** - Invalid Coupon:
```json
{
  "error": "INVALID_COUPON",
  "message": "Coupon has expired",
  "timestamp": "2025-12-01T14:46:35Z",
  "path": "/api/orders"
}
```

**409 Conflict** - Duplicate Purchase:
```json
{
  "error": "ALREADY_OWNED",
  "message": "You already own this curriculum",
  "existingPurchaseDate": "2025-11-15T10:30:00Z",
  "existingOrderNumber": "20251115103000001",
  "timestamp": "2025-12-01T14:46:35Z",
  "path": "/api/orders"
}
```

**409 Conflict** - Free Curriculum:
```json
{
  "error": "FREE_CURRICULUM",
  "message": "Cannot create order for free curriculum",
  "curriculumId": 5,
  "timestamp": "2025-12-01T14:46:35Z",
  "path": "/api/orders"
}
```

---

### 4. Get Order by Order Number

**Endpoint**: `GET /api/orders/{orderNumber}`

**Description**: Retrieves order details by unique order number. Only the order owner can access.

**Authentication**: Required

**Path Parameters**:
| Parameter     | Type   | Required | Description           |
|---------------|--------|----------|-----------------------|
| `orderNumber` | string | Yes      | Unique order number   |

**Success Response (200 OK)**:
```json
{
  "id": 42,
  "orderNumber": "20251201144635001",
  "userId": 5,
  "curriculumId": 1,
  "curriculumTitle": "React Mastery",
  "curriculumThumbnailUrl": "https://example.com/react-mastery.jpg",
  "status": "PENDING",
  "originalPrice": 49.99,
  "discountAmount": 10.00,
  "finalPrice": 39.99,
  "couponCode": "REACT20",
  "expiresAt": "2025-12-04T23:59:59Z",
  "createdAt": "2025-12-01T14:46:35Z",
  "updatedAt": "2025-12-01T14:46:35Z",
  "purchasedAt": null
}
```

**Order Status Values**:
| Status      | Description                                 |
|-------------|---------------------------------------------|
| `PENDING`   | Order created, awaiting payment             |
| `PAID`      | Payment completed, user has access          |
| `CANCELLED` | Order cancelled by user or system           |
| `EXPIRED`   | Order expired (payment deadline passed)     |

**Error Responses**:

**403 Forbidden** - Wrong User:
```json
{
  "error": "FORBIDDEN",
  "message": "You cannot access this order",
  "timestamp": "2025-12-01T14:46:35Z",
  "path": "/api/orders/20251201144635001"
}
```

**404 Not Found**:
```json
{
  "error": "ORDER_NOT_FOUND",
  "message": "Order with number 20251201144635999 does not exist",
  "timestamp": "2025-12-01T14:46:35Z",
  "path": "/api/orders/20251201144635999"
}
```

---

### 5. Process Payment (Mock)

**Endpoint**: `POST /api/orders/{orderNumber}/pay`

**Description**: Processes mock payment for a pending order. Updates order status to PAID and grants curriculum access.

**Authentication**: Required

**Path Parameters**:
| Parameter     | Type   | Required | Description           |
|---------------|--------|----------|-----------------------|
| `orderNumber` | string | Yes      | Order number to pay   |

**Request Body**:
```json
{
  "paymentMethod": "CREDIT_CARD"
}
```

**Request Body Schema**:
| Field           | Type   | Required | Description                    |
|-----------------|--------|----------|--------------------------------|
| `paymentMethod` | string | Yes      | Payment method to use          |

**Supported Payment Methods**:
| Value                    | Description                        |
|--------------------------|------------------------------------|
| `ATM_TRANSFER`           | ATM Transfer (虛擬帳號匯款)         |
| `CREDIT_CARD`            | Credit Card One-Time Payment       |
| `CREDIT_CARD_INSTALLMENT`| Credit Card Installment            |

**Success Response (200 OK)**:
```json
{
  "success": true,
  "orderNumber": "20251201144635001",
  "status": "PAID",
  "purchasedAt": "2025-12-01T14:50:00Z",
  "curriculumId": 1,
  "curriculumTitle": "React Mastery",
  "finalPrice": 39.99,
  "message": "Payment successful! You now have access to the curriculum."
}
```

**Mock Payment Behavior**:
- Simulates 1-2 second processing delay
- Always succeeds in Phase 2 (no failure scenarios)
- Updates order status from `PENDING` to `PAID`
- Sets `purchasedAt` timestamp to current time
- Grants immediate curriculum access

**Error Responses**:

**400 Bad Request** - Invalid Payment Method:
```json
{
  "error": "INVALID_PAYMENT_METHOD",
  "message": "Payment method must be one of: ATM_TRANSFER, CREDIT_CARD, CREDIT_CARD_INSTALLMENT",
  "timestamp": "2025-12-01T14:50:00Z",
  "path": "/api/orders/20251201144635001/pay"
}
```

**400 Bad Request** - Order Already Paid:
```json
{
  "error": "ORDER_ALREADY_PAID",
  "message": "Order has already been paid",
  "purchasedAt": "2025-12-01T12:00:00Z",
  "timestamp": "2025-12-01T14:50:00Z",
  "path": "/api/orders/20251201144635001/pay"
}
```

**400 Bad Request** - Order Expired:
```json
{
  "error": "ORDER_EXPIRED",
  "message": "Order has expired. Payment deadline was 2025-11-30 23:59:59",
  "expiresAt": "2025-11-30T23:59:59Z",
  "timestamp": "2025-12-01T14:50:00Z",
  "path": "/api/orders/20251128100000001/pay"
}
```

**403 Forbidden** - Wrong User:
```json
{
  "error": "FORBIDDEN",
  "message": "You cannot pay for this order",
  "timestamp": "2025-12-01T14:50:00Z",
  "path": "/api/orders/20251201144635001/pay"
}
```

**404 Not Found**:
```json
{
  "error": "ORDER_NOT_FOUND",
  "message": "Order not found",
  "timestamp": "2025-12-01T14:50:00Z",
  "path": "/api/orders/20251201144635999/pay"
}
```

---

### 6. Get My Orders

**Endpoint**: `GET /api/orders/my-orders`

**Description**: Retrieves authenticated user's order history with pagination.

**Authentication**: Required

**Query Parameters**:
| Parameter | Type    | Required | Default           | Description                 |
|-----------|---------|----------|-------------------|-----------------------------|
| `page`    | integer | No       | 0                 | Page number (0-indexed)     |
| `size`    | integer | No       | 10                | Page size (max 100)         |
| `sort`    | string  | No       | `createdAt,desc`  | Sort field and direction    |

**Sort Options**:
- `createdAt,desc` - Newest orders first (default)
- `createdAt,asc` - Oldest orders first
- `finalPrice,desc` - Highest price first
- `finalPrice,asc` - Lowest price first
- `status,asc` - Sort by status alphabetically

**Success Response (200 OK)**:
```json
{
  "content": [
    {
      "orderNumber": "20251201144635001",
      "curriculum": {
        "id": 1,
        "title": "React Mastery",
        "thumbnailUrl": "https://example.com/react-mastery.jpg"
      },
      "status": "PAID",
      "originalPrice": 49.99,
      "discountAmount": 10.00,
      "finalPrice": 39.99,
      "couponCode": "REACT20",
      "createdAt": "2025-12-01T14:46:35Z",
      "purchasedAt": "2025-12-01T14:50:00Z"
    },
    {
      "orderNumber": "20251115103000001",
      "curriculum": {
        "id": 3,
        "title": "Node.js Advanced",
        "thumbnailUrl": "https://example.com/nodejs-advanced.jpg"
      },
      "status": "PAID",
      "originalPrice": 79.99,
      "discountAmount": 0,
      "finalPrice": 79.99,
      "couponCode": null,
      "createdAt": "2025-11-15T10:30:00Z",
      "purchasedAt": "2025-11-15T10:35:00Z"
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 2,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

**Empty Response** (No Orders):
```json
{
  "content": [],
  "page": 0,
  "size": 10,
  "totalElements": 0,
  "totalPages": 0,
  "first": true,
  "last": true
}
```

**Error Responses**:

**400 Bad Request** - Invalid Pagination:
```json
{
  "error": "INVALID_REQUEST",
  "message": "Page size must not exceed 100",
  "timestamp": "2025-12-01T14:50:00Z",
  "path": "/api/orders/my-orders"
}
```

---

## Data Models

### Order
```typescript
interface Order {
  id: number;
  orderNumber: string;          // Format: YYYYMMDDHHMMSSXXX
  userId: number;
  curriculumId: number;
  curriculumTitle: string;
  curriculumThumbnailUrl?: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED';
  originalPrice: number;        // Decimal(10,2)
  discountAmount: number;       // Decimal(10,2)
  finalPrice: number;           // Decimal(10,2)
  couponCode?: string | null;
  createdAt: string;            // ISO 8601 timestamp
  updatedAt: string;            // ISO 8601 timestamp
  expiresAt: string;            // ISO 8601 timestamp
  purchasedAt?: string | null;  // ISO 8601 timestamp
}
```

### Curriculum
```typescript
interface Curriculum {
  id: number;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  price: number;
  difficultyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  isPublished: boolean;
  estimatedDurationHours?: number;
}
```

### Chapter
```typescript
interface Chapter {
  id: number;
  curriculumId: number;
  title: string;
  description?: string;
  orderIndex: number;
  lessons: Lesson[];
}
```

### Lesson
```typescript
interface Lesson {
  id: number;
  chapterId: number;
  title: string;
  description?: string;
  lessonType: 'VIDEO' | 'ARTICLE' | 'SURVEY';
  contentUrl: string;
  durationMinutes?: number;
  orderIndex: number;
  isFreePreview: boolean;
}
```

### Coupon Validation Result
```typescript
interface CouponValidation {
  valid: boolean;
  code?: string;
  discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue?: number;
  discountAmount?: number;
  finalPrice?: number;
  originalPrice: number;
  error?: string;
  message?: string;
}
```

### Payment Result
```typescript
interface PaymentResult {
  success: boolean;
  orderNumber: string;
  status: string;
  purchasedAt?: string;
  curriculumId: number;
  curriculumTitle: string;
  finalPrice: number;
  message?: string;
  error?: string;
}
```

---

## Error Codes

### Client Errors (4xx)

| HTTP Status | Error Code                | Description                          |
|-------------|---------------------------|--------------------------------------|
| 400         | `INVALID_REQUEST`         | Malformed request body or params     |
| 400         | `CURRICULUM_NOT_FOUND`    | Curriculum ID does not exist         |
| 400         | `INVALID_COUPON`          | Coupon validation failed             |
| 400         | `INVALID_PAYMENT_METHOD`  | Unsupported payment method           |
| 400         | `ORDER_ALREADY_PAID`      | Order status is already PAID         |
| 400         | `ORDER_EXPIRED`           | Order payment deadline passed        |
| 401         | `UNAUTHORIZED`            | Missing or invalid auth token        |
| 403         | `FORBIDDEN`               | User cannot access resource          |
| 404         | `ORDER_NOT_FOUND`         | Order number does not exist          |
| 409         | `ALREADY_OWNED`           | User already owns curriculum         |
| 409         | `FREE_CURRICULUM`         | Cannot purchase free curriculum      |

### Coupon Validation Errors

| Error Code           | Description                        |
|----------------------|------------------------------------|
| `COUPON_NOT_FOUND`   | Coupon code does not exist         |
| `COUPON_EXPIRED`     | Coupon expired                     |
| `COUPON_NOT_STARTED` | Coupon not yet valid               |
| `COUPON_MAX_USES`    | Coupon reached maximum uses        |
| `COUPON_INACTIVE`    | Coupon is deactivated              |

### Server Errors (5xx)

| HTTP Status | Error Code           | Description                    |
|-------------|----------------------|--------------------------------|
| 500         | `INTERNAL_ERROR`     | Unexpected server error        |
| 503         | `SERVICE_UNAVAILABLE`| Payment gateway unreachable    |

---

## Examples

### Example 1: Complete Purchase Flow

**Step 1: Get Order Preview**
```bash
GET /api/curriculums/1/order-preview
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Step 2: Validate Coupon**
```bash
POST /api/coupons/validate
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "curriculumId": 1,
  "couponCode": "REACT20"
}
```

**Step 3: Create Order**
```bash
POST /api/orders
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "curriculumId": 1,
  "couponCode": "REACT20"
}
```

**Step 4: Process Payment**
```bash
POST /api/orders/20251201144635001/pay
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "paymentMethod": "CREDIT_CARD"
}
```

**Step 5: View Order History**
```bash
GET /api/orders/my-orders?page=0&size=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Example 2: Create Order Without Coupon

```bash
POST /api/orders
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "curriculumId": 1
}
```

**Response**:
```json
{
  "orderNumber": "20251201144635001",
  "status": "PENDING",
  "originalPrice": 49.99,
  "discountAmount": 0,
  "finalPrice": 49.99,
  "couponCode": null
}
```

---

### Example 3: Validate Expired Coupon

```bash
POST /api/coupons/validate
Content-Type: application/json

{
  "curriculumId": 1,
  "couponCode": "EXPIRED10"
}
```

**Response (200 OK)**:
```json
{
  "valid": false,
  "error": "COUPON_EXPIRED",
  "message": "Coupon has expired on 2025-10-31",
  "originalPrice": 49.99
}
```

---

### Example 4: Attempt Duplicate Purchase

```bash
POST /api/orders
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "curriculumId": 1
}
```

**Response (409 Conflict)**:
```json
{
  "error": "ALREADY_OWNED",
  "message": "You already own this curriculum",
  "existingPurchaseDate": "2025-11-15T10:30:00Z",
  "existingOrderNumber": "20251115103000001",
  "timestamp": "2025-12-01T14:46:35Z",
  "path": "/api/orders"
}
```

---

## Rate Limiting

**Not Implemented in Phase 2**

Future phases may implement rate limiting to prevent abuse.

---

## Versioning

**Current Version**: v1

All endpoints use `/api/` prefix. Future breaking changes will use `/api/v2/` prefix.

---

## Support

For API issues or questions:
- **Email**: support@waterballsa.com
- **Documentation**: https://docs.waterballsa.com
- **Status Page**: https://status.waterballsa.com

---

## Revision History

| Version | Date       | Author | Changes                      |
|---------|------------|--------|------------------------------|
| 1.0     | 2025-12-01 | Claude | Initial API documentation    |
