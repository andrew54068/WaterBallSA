# Purchase Flow Test Plan

## Document Information
- **Feature**: Purchase Flow Testing Strategy
- **Phase**: Phase 2 - Access Control & Payment
- **Created**: 2025-12-01
- **Updated**: 2025-12-01
- **Test Coverage Target**: >80%

## Table of Contents

1. [Overview](#overview)
2. [Test Pyramid](#test-pyramid)
3. [Backend Tests](#backend-tests)
4. [Frontend Tests](#frontend-tests)
5. [E2E Tests](#e2e-tests)
6. [Test Data Setup](#test-data-setup)
7. [Running Tests](#running-tests)

---

## Overview

This document outlines the comprehensive testing strategy for the Purchase Flow feature, following Test-Driven Development (TDD) and Behavior-Driven Development (BDD) principles.

### Testing Principles

1. **Write tests BEFORE implementation** (Red-Green-Refactor)
2. **Test behavior, not implementation** details
3. **Isolate tests** - each test should be independent
4. **Use realistic test data** from seed migrations
5. **Run all tests in Docker** for environment consistency

### Test Coverage Goals

- **Unit Tests**: >80% code coverage
- **Integration Tests**: All API endpoints covered
- **E2E Tests**: All critical user journeys covered
- **BDD Scenarios**: All Given-When-Then scenarios automated

---

## Test Pyramid

```
       /\
      /  \      E2E Tests (Playwright)
     /----\     - Complete purchase flows
    /      \    - Payment processing
   /--------\   - Access control verification
  /          \
 /  Integration\  Integration Tests (TestContainers)
/    Tests     \  - API endpoint tests
/              \  - Database integration
/--------------\
/              \
/  Unit Tests   \ Unit Tests (JUnit, Jest)
/                \ - Service layer logic
/                 \ - Component rendering
/                  \ - Utility functions
/-------------------\
```

---

## Backend Tests

### Location Structure

```
backend/src/test/java/com/waterballsa/backend/
├── service/
│   ├── OrderServiceTest.java
│   ├── CouponServiceTest.java
│   └── PaymentServiceTest.java
├── controller/
│   ├── OrderControllerIntegrationTest.java
│   └── CouponControllerIntegrationTest.java
├── repository/
│   ├── OrderRepositoryTest.java
│   └── CouponRepositoryTest.java
└── e2e/
    └── PurchaseFlowE2ETest.java
```

### Unit Tests

#### OrderServiceTest.java

**Test Class Setup**:
```java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CurriculumRepository curriculumRepository;

    @Mock
    private CouponService couponService;

    @InjectMocks
    private OrderService orderService;

    // Tests...
}
```

**Test Cases**:

1. **Order Creation - Happy Path**
```java
@Test
@DisplayName("Should create pending order with valid curriculum and user")
void createOrder_withValidData_shouldCreatePendingOrder() {
    // Given
    Long userId = 1L;
    Long curriculumId = 1L;
    Curriculum curriculum = createTestCurriculum(curriculumId, "React Mastery", 49.99);

    when(curriculumRepository.findById(curriculumId))
        .thenReturn(Optional.of(curriculum));
    when(orderRepository.existsByUserIdAndCurriculumId(userId, curriculumId))
        .thenReturn(false);
    when(orderRepository.save(any(Order.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    // When
    CreateOrderRequest request = new CreateOrderRequest(curriculumId, null);
    OrderDTO result = orderService.createOrder(userId, request);

    // Then
    assertNotNull(result);
    assertEquals("PENDING", result.getStatus());
    assertEquals(49.99, result.getOriginalPrice());
    assertEquals(49.99, result.getFinalPrice());
    assertEquals(0, result.getDiscountAmount());
    assertNull(result.getCouponCode());
    assertNotNull(result.getOrderNumber());
    assertTrue(result.getOrderNumber().matches("\\d{14}\\d{3}")); // YYYYMMDDHHMMSSXXX

    verify(orderRepository).save(any(Order.class));
}
```

2. **Order Creation - With Coupon**
```java
@Test
@DisplayName("Should apply coupon discount when creating order")
void createOrder_withValidCoupon_shouldApplyDiscount() {
    // Given
    Long userId = 1L;
    Long curriculumId = 1L;
    String couponCode = "REACT20";

    Curriculum curriculum = createTestCurriculum(curriculumId, "React Mastery", 49.99);
    CouponValidation couponValidation = new CouponValidation(
        true, "PERCENTAGE", 20.0, 10.0
    );

    when(curriculumRepository.findById(curriculumId))
        .thenReturn(Optional.of(curriculum));
    when(orderRepository.existsByUserIdAndCurriculumId(userId, curriculumId))
        .thenReturn(false);
    when(couponService.validateCoupon(curriculumId, couponCode))
        .thenReturn(couponValidation);
    when(orderRepository.save(any(Order.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    // When
    CreateOrderRequest request = new CreateOrderRequest(curriculumId, couponCode);
    OrderDTO result = orderService.createOrder(userId, request);

    // Then
    assertEquals(49.99, result.getOriginalPrice());
    assertEquals(10.0, result.getDiscountAmount());
    assertEquals(39.99, result.getFinalPrice());
    assertEquals(couponCode, result.getCouponCode());

    verify(couponService).applyCoupon(couponCode);
}
```

3. **Order Creation - Duplicate Purchase**
```java
@Test
@DisplayName("Should throw ConflictException when user already owns curriculum")
void createOrder_forOwnedCurriculum_shouldThrowConflictException() {
    // Given
    Long userId = 1L;
    Long curriculumId = 1L;

    when(curriculumRepository.findById(curriculumId))
        .thenReturn(Optional.of(createTestCurriculum(curriculumId, "React", 49.99)));
    when(orderRepository.existsByUserIdAndCurriculumId(userId, curriculumId))
        .thenReturn(true);

    // When & Then
    CreateOrderRequest request = new CreateOrderRequest(curriculumId, null);
    assertThrows(ConflictException.class, () -> {
        orderService.createOrder(userId, request);
    });

    verify(orderRepository, never()).save(any(Order.class));
}
```

4. **Get Order - Success**
```java
@Test
@DisplayName("Should return order when user owns it")
void getOrder_withValidOrderNumber_shouldReturnOrder() {
    // Given
    String orderNumber = "20251201144635001";
    Long userId = 1L;
    Order order = createTestOrder(orderNumber, userId);

    when(orderRepository.findByOrderNumber(orderNumber))
        .thenReturn(Optional.of(order));

    // When
    OrderDTO result = orderService.getOrder(orderNumber, userId);

    // Then
    assertNotNull(result);
    assertEquals(orderNumber, result.getOrderNumber());
    assertEquals(userId, result.getUserId());
}
```

5. **Get Order - Forbidden**
```java
@Test
@DisplayName("Should throw ForbiddenException when user tries to access another user's order")
void getOrder_byDifferentUser_shouldThrowForbiddenException() {
    // Given
    String orderNumber = "20251201144635001";
    Long ownerUserId = 1L;
    Long requestingUserId = 2L;
    Order order = createTestOrder(orderNumber, ownerUserId);

    when(orderRepository.findByOrderNumber(orderNumber))
        .thenReturn(Optional.of(order));

    // When & Then
    assertThrows(ForbiddenException.class, () -> {
        orderService.getOrder(orderNumber, requestingUserId);
    });
}
```

---

#### CouponServiceTest.java

**Test Cases**:

1. **Validate Coupon - Valid Percentage**
```java
@Test
@DisplayName("Should return discount info for valid percentage coupon")
void validateCoupon_withValidPercentageCoupon_shouldReturnDiscount() {
    // Given
    Long curriculumId = 1L;
    String couponCode = "REACT20";

    Coupon coupon = Coupon.builder()
        .code(couponCode)
        .discountType("PERCENTAGE")
        .discountValue(20.0)
        .validFrom(LocalDateTime.now().minusDays(1))
        .validUntil(LocalDateTime.now().plusDays(30))
        .maxUses(100)
        .currentUses(50)
        .isActive(true)
        .build();

    Curriculum curriculum = createTestCurriculum(curriculumId, "React", 49.99);

    when(couponRepository.findByCode(couponCode))
        .thenReturn(Optional.of(coupon));
    when(curriculumRepository.findById(curriculumId))
        .thenReturn(Optional.of(curriculum));

    // When
    CouponValidation result = couponService.validateCoupon(curriculumId, couponCode);

    // Then
    assertTrue(result.isValid());
    assertEquals("PERCENTAGE", result.getDiscountType());
    assertEquals(20.0, result.getDiscountValue());
    assertEquals(10.0, result.getDiscountAmount()); // 20% of 49.99
    assertEquals(39.99, result.getFinalPrice());
}
```

2. **Validate Coupon - Expired**
```java
@Test
@DisplayName("Should return invalid for expired coupon")
void validateCoupon_withExpiredCoupon_shouldReturnInvalid() {
    // Given
    String couponCode = "EXPIRED10";

    Coupon coupon = Coupon.builder()
        .code(couponCode)
        .validFrom(LocalDateTime.now().minusMonths(2))
        .validUntil(LocalDateTime.now().minusMonths(1))
        .isActive(true)
        .build();

    when(couponRepository.findByCode(couponCode))
        .thenReturn(Optional.of(coupon));

    // When
    CouponValidation result = couponService.validateCoupon(1L, couponCode);

    // Then
    assertFalse(result.isValid());
    assertEquals("COUPON_EXPIRED", result.getError());
}
```

3. **Validate Coupon - Max Uses Reached**
```java
@Test
@DisplayName("Should return invalid when coupon reached max uses")
void validateCoupon_withMaxUsesReached_shouldReturnInvalid() {
    // Given
    String couponCode = "LIMITED";

    Coupon coupon = Coupon.builder()
        .code(couponCode)
        .validFrom(LocalDateTime.now().minusDays(1))
        .validUntil(LocalDateTime.now().plusDays(30))
        .maxUses(100)
        .currentUses(100)
        .isActive(true)
        .build();

    when(couponRepository.findByCode(couponCode))
        .thenReturn(Optional.of(coupon));

    // When
    CouponValidation result = couponService.validateCoupon(1L, couponCode);

    // Then
    assertFalse(result.isValid());
    assertEquals("COUPON_MAX_USES", result.getError());
}
```

4. **Apply Coupon - Increment Uses**
```java
@Test
@DisplayName("Should increment current_uses when coupon is applied")
void applyCoupon_shouldIncrementCurrentUses() {
    // Given
    String couponCode = "REACT20";
    Coupon coupon = Coupon.builder()
        .code(couponCode)
        .currentUses(50)
        .maxUses(100)
        .build();

    when(couponRepository.findByCode(couponCode))
        .thenReturn(Optional.of(coupon));
    when(couponRepository.save(any(Coupon.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    // When
    couponService.applyCoupon(couponCode);

    // Then
    verify(couponRepository).save(argThat(c -> c.getCurrentUses() == 51));
}
```

---

#### PaymentServiceTest.java

**Test Cases**:

1. **Process Payment - Success**
```java
@Test
@DisplayName("Should mark order as PAID and set purchasedAt timestamp")
void processPayment_withValidOrder_shouldMarkAsPaid() {
    // Given
    String orderNumber = "20251201144635001";
    Long userId = 1L;
    String paymentMethod = "CREDIT_CARD";

    Order order = createTestOrder(orderNumber, userId);
    order.setStatus("PENDING");
    order.setExpiresAt(LocalDateTime.now().plusDays(3));

    when(orderRepository.findByOrderNumber(orderNumber))
        .thenReturn(Optional.of(order));
    when(orderRepository.save(any(Order.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    // When
    PaymentResult result = paymentService.processPayment(orderNumber, userId, paymentMethod);

    // Then
    assertTrue(result.isSuccess());
    assertEquals("PAID", result.getStatus());
    assertNotNull(result.getPurchasedAt());

    verify(orderRepository).save(argThat(o ->
        "PAID".equals(o.getStatus()) && o.getPurchasedAt() != null
    ));
}
```

2. **Process Payment - Order Expired**
```java
@Test
@DisplayName("Should throw BadRequestException for expired order")
void processPayment_onExpiredOrder_shouldThrowBadRequestException() {
    // Given
    String orderNumber = "20251128100000001";
    Long userId = 1L;

    Order order = createTestOrder(orderNumber, userId);
    order.setStatus("PENDING");
    order.setExpiresAt(LocalDateTime.now().minusDays(1)); // Expired

    when(orderRepository.findByOrderNumber(orderNumber))
        .thenReturn(Optional.of(order));

    // When & Then
    assertThrows(BadRequestException.class, () -> {
        paymentService.processPayment(orderNumber, userId, "CREDIT_CARD");
    });

    verify(orderRepository, never()).save(any(Order.class));
}
```

3. **Process Payment - Already Paid**
```java
@Test
@DisplayName("Should throw BadRequestException for already paid order")
void processPayment_onAlreadyPaidOrder_shouldThrowBadRequestException() {
    // Given
    String orderNumber = "20251201120000001";
    Long userId = 1L;

    Order order = createTestOrder(orderNumber, userId);
    order.setStatus("PAID");
    order.setPurchasedAt(LocalDateTime.now().minusHours(1));

    when(orderRepository.findByOrderNumber(orderNumber))
        .thenReturn(Optional.of(order));

    // When & Then
    assertThrows(BadRequestException.class, () -> {
        paymentService.processPayment(orderNumber, userId, "CREDIT_CARD");
    });
}
```

---

### Integration Tests

#### OrderControllerIntegrationTest.java

**Test Class Setup**:
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@AutoConfigureMockMvc
class OrderControllerIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:14")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtUtil jwtUtil;

    private String generateTestToken(Long userId) {
        return jwtUtil.generateAccessToken(userId, "test@example.com");
    }

    // Tests...
}
```

**Test Cases**:

1. **GET /api/curriculums/{id}/order-preview**
```java
@Test
@DisplayName("GET /api/curriculums/1/order-preview should return 200 with curriculum details")
void getOrderPreview_withAuth_shouldReturn200() throws Exception {
    // Given
    String token = generateTestToken(1L);

    // When & Then
    mockMvc.perform(get("/api/curriculums/1/order-preview")
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.curriculum.id").value(1))
        .andExpect(jsonPath("$.curriculum.title").exists())
        .andExpect(jsonPath("$.chapters").isArray())
        .andExpect(jsonPath("$.originalPrice").isNumber());
}
```

2. **POST /api/orders**
```java
@Test
@DisplayName("POST /api/orders should create order and return 201")
void createOrder_withValidData_shouldReturn201() throws Exception {
    // Given
    String token = generateTestToken(10L); // User without purchases
    CreateOrderRequest request = new CreateOrderRequest(1L, null);

    // When & Then
    mockMvc.perform(post("/api/orders")
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.orderNumber").exists())
        .andExpect(jsonPath("$.status").value("PENDING"))
        .andExpect(jsonPath("$.finalPrice").isNumber());
}
```

3. **POST /api/orders - Duplicate Purchase**
```java
@Test
@DisplayName("POST /api/orders should return 409 for duplicate purchase")
void createOrder_forOwnedCurriculum_shouldReturn409() throws Exception {
    // Given
    String token = generateTestToken(1L); // User who owns curriculum 1
    CreateOrderRequest request = new CreateOrderRequest(1L, null);

    // When & Then
    mockMvc.perform(post("/api/orders")
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.error").value("ALREADY_OWNED"));
}
```

4. **POST /api/orders/{orderNumber}/pay**
```java
@Test
@DisplayName("POST /api/orders/{orderNumber}/pay should return 200 and mark order as PAID")
void processPayment_withValidOrder_shouldReturn200AndMarkPaid() throws Exception {
    // Given - Create order first
    String token = generateTestToken(10L);
    String orderNumber = createTestOrder(10L, 2L); // Helper method

    PaymentRequest paymentRequest = new PaymentRequest("CREDIT_CARD");

    // When & Then
    mockMvc.perform(post("/api/orders/" + orderNumber + "/pay")
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(paymentRequest)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.status").value("PAID"))
        .andExpect(jsonPath("$.purchasedAt").exists());

    // Verify user now has access to curriculum
    mockMvc.perform(get("/api/curriculums/2")
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk());
}
```

5. **GET /api/orders/my-orders**
```java
@Test
@DisplayName("GET /api/orders/my-orders should return paginated order list")
void getMyOrders_shouldReturnPaginatedResults() throws Exception {
    // Given
    String token = generateTestToken(1L);

    // When & Then
    mockMvc.perform(get("/api/orders/my-orders")
            .header("Authorization", "Bearer " + token)
            .param("page", "0")
            .param("size", "10"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content").isArray())
        .andExpect(jsonPath("$.page").value(0))
        .andExpect(jsonPath("$.totalElements").isNumber());
}
```

---

## Frontend Tests

### Location Structure

```
frontend/src/
├── components/__tests__/
│   ├── OrderSummary.test.tsx
│   ├── CouponInput.test.tsx
│   ├── PaymentMethodSelector.test.tsx
│   ├── OrderDetails.test.tsx
│   └── MockPaymentProcessor.test.tsx
├── app/__tests__/
│   ├── curriculums/[id]/orders/page.test.tsx
│   └── orders/[orderNumber]/payment/page.test.tsx
└── lib/api/__tests__/
    └── orders.test.ts
```

### Component Tests (Jest + React Testing Library)

#### OrderSummary.test.tsx

```typescript
import { render, screen } from '@testing-library/react';
import OrderSummary from '@/components/OrderSummary';

describe('OrderSummary Component', () => {
  const mockCurriculum = {
    id: 1,
    title: 'React Mastery',
    description: 'Master React from basics to advanced',
    thumbnailUrl: 'https://example.com/thumb.jpg',
    price: 49.99,
  };

  const mockChapters = [
    {
      id: 1,
      title: 'Getting Started',
      lessons: [
        { id: 1, title: 'Welcome', lessonType: 'VIDEO', durationMinutes: 15 },
      ],
    },
  ];

  test('renders curriculum title and description', () => {
    render(
      <OrderSummary
        curriculum={mockCurriculum}
        chapters={mockChapters}
        originalPrice={49.99}
        discountAmount={0}
        finalPrice={49.99}
      />
    );

    expect(screen.getByText('React Mastery')).toBeInTheDocument();
    expect(screen.getByText(/Master React/)).toBeInTheDocument();
  });

  test('displays pricing breakdown correctly', () => {
    render(
      <OrderSummary
        curriculum={mockCurriculum}
        chapters={mockChapters}
        originalPrice={49.99}
        discountAmount={10.00}
        finalPrice={39.99}
      />
    );

    expect(screen.getByText('$49.99')).toBeInTheDocument();
    expect(screen.getByText('-$10.00')).toBeInTheDocument();
    expect(screen.getByText('$39.99')).toBeInTheDocument();
  });

  test('shows chapter and lesson list', () => {
    render(
      <OrderSummary
        curriculum={mockCurriculum}
        chapters={mockChapters}
        originalPrice={49.99}
        discountAmount={0}
        finalPrice={49.99}
      />
    );

    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText('Welcome')).toBeInTheDocument();
  });
});
```

#### CouponInput.test.tsx

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CouponInput from '@/components/CouponInput';
import * as ordersApi from '@/lib/api/orders';

jest.mock('@/lib/api/orders');

describe('CouponInput Component', () => {
  const mockOnCouponApplied = jest.fn();
  const mockOnCouponRemoved = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('validates coupon on apply click', async () => {
    const user = userEvent.setup();
    const mockValidation = {
      valid: true,
      code: 'REACT20',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      discountAmount: 10.00,
    };

    (ordersApi.validateCoupon as jest.Mock).mockResolvedValue(mockValidation);

    render(
      <CouponInput
        curriculumId={1}
        onCouponApplied={mockOnCouponApplied}
        onCouponRemoved={mockOnCouponRemoved}
      />
    );

    const input = screen.getByPlaceholderText(/enter coupon code/i);
    const applyButton = screen.getByRole('button', { name: /apply/i });

    await user.type(input, 'REACT20');
    await user.click(applyButton);

    await waitFor(() => {
      expect(ordersApi.validateCoupon).toHaveBeenCalledWith(1, 'REACT20');
      expect(mockOnCouponApplied).toHaveBeenCalledWith(mockValidation);
    });
  });

  test('displays error for invalid coupon', async () => {
    const user = userEvent.setup();
    const mockValidation = {
      valid: false,
      error: 'COUPON_EXPIRED',
      message: 'Coupon has expired',
    };

    (ordersApi.validateCoupon as jest.Mock).mockResolvedValue(mockValidation);

    render(
      <CouponInput
        curriculumId={1}
        onCouponApplied={mockOnCouponApplied}
        onCouponRemoved={mockOnCouponRemoved}
      />
    );

    const input = screen.getByPlaceholderText(/enter coupon code/i);
    await user.type(input, 'EXPIRED10');
    await user.click(screen.getByRole('button', { name: /apply/i }));

    await waitFor(() => {
      expect(screen.getByText('Coupon has expired')).toBeInTheDocument();
      expect(mockOnCouponApplied).not.toHaveBeenCalled();
    });
  });

  test('allows removing applied coupon', async () => {
    const user = userEvent.setup();

    render(
      <CouponInput
        curriculumId={1}
        onCouponApplied={mockOnCouponApplied}
        onCouponRemoved={mockOnCouponRemoved}
        appliedCoupon={{ code: 'REACT20', discountAmount: 10 }}
      />
    );

    const removeButton = screen.getByRole('button', { name: /remove/i });
    await user.click(removeButton);

    expect(mockOnCouponRemoved).toHaveBeenCalled();
  });
});
```

#### PaymentMethodSelector.test.tsx

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaymentMethodSelector from '@/components/PaymentMethodSelector';

describe('PaymentMethodSelector Component', () => {
  const mockMethods = [
    { id: 'ATM_TRANSFER', name: 'ATM Transfer', description: '虛擬帳號匯款' },
    { id: 'CREDIT_CARD', name: 'Credit Card', description: '信用卡一次付清' },
    { id: 'CREDIT_CARD_INSTALLMENT', name: 'Installment', description: '銀角零卡分期' },
  ];

  const mockOnMethodSelect = jest.fn();

  test('renders all payment methods', () => {
    render(
      <PaymentMethodSelector
        methods={mockMethods}
        onMethodSelect={mockOnMethodSelect}
      />
    );

    expect(screen.getByText('ATM Transfer')).toBeInTheDocument();
    expect(screen.getByText('Credit Card')).toBeInTheDocument();
    expect(screen.getByText('Installment')).toBeInTheDocument();
  });

  test('highlights selected method', async () => {
    const user = userEvent.setup();

    render(
      <PaymentMethodSelector
        methods={mockMethods}
        selectedMethod="CREDIT_CARD"
        onMethodSelect={mockOnMethodSelect}
      />
    );

    const creditCardOption = screen.getByLabelText(/credit card/i);
    expect(creditCardOption).toBeChecked();
  });

  test('allows switching methods', async () => {
    const user = userEvent.setup();

    render(
      <PaymentMethodSelector
        methods={mockMethods}
        onMethodSelect={mockOnMethodSelect}
      />
    );

    const atmOption = screen.getByLabelText(/atm transfer/i);
    await user.click(atmOption);

    expect(mockOnMethodSelect).toHaveBeenCalledWith('ATM_TRANSFER');
  });
});
```

---

## E2E Tests

### Location: `frontend/tests/e2e/purchase-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Purchase Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:3001/auth/login');
    // Perform login steps...
  });

  test('complete purchase with coupon', async ({ page }) => {
    // Step 1: Navigate to curriculum page
    await page.goto('http://localhost:3001/curriculums/1');

    // Step 2: Click Purchase button
    await page.click('button:has-text("Purchase")');

    // Step 3: Verify order confirmation page loaded
    await expect(page).toHaveURL(/\/curriculums\/1\/orders/);
    await expect(page.locator('h1')).toContainText('React Mastery');

    // Step 4: Apply coupon
    await page.fill('input[name="couponCode"]', 'REACT20');
    await page.click('button:has-text("Apply Coupon")');

    // Step 5: Verify discount applied
    await expect(page.locator('text=Discount')).toBeVisible();
    await expect(page.locator('text=$39.99')).toBeVisible();

    // Step 6: Confirm purchase
    await page.click('button:has-text("Confirm Purchase")');

    // Step 7: Verify payment page loaded
    await expect(page).toHaveURL(/\/orders\/\d+\/payment/);

    // Step 8: Select payment method
    await page.click('input[value="CREDIT_CARD"]');

    // Step 9: Process payment
    await page.click('button:has-text("Proceed to Payment")');

    // Step 10: Wait for processing
    await expect(page.locator('text=Processing payment')).toBeVisible();

    // Step 11: Verify redirect to curriculum page
    await expect(page).toHaveURL(/\/curriculums\/1/, { timeout: 5000 });

    // Step 12: Verify purchase success message
    await expect(page.locator('text=Purchase successful')).toBeVisible();

    // Step 13: Access a lesson
    await page.click('text=Welcome to React');

    // Step 14: Verify lesson content loads
    await expect(page).toHaveURL(/\/lessons\/1/);
    await expect(page.locator('video, iframe')).toBeVisible();
  });

  test('failed coupon application', async ({ page }) => {
    await page.goto('http://localhost:3001/curriculums/1/orders');

    await page.fill('input[name="couponCode"]', 'INVALID123');
    await page.click('button:has-text("Apply Coupon")');

    await expect(page.locator('text=Invalid coupon code')).toBeVisible();
    await expect(page.locator('text=$49.99')).toBeVisible(); // Price unchanged
  });

  test('duplicate purchase prevention', async ({ page }) => {
    // User already owns curriculum 1
    await page.goto('http://localhost:3001/curriculums/1');

    // Should not see Purchase button
    await expect(page.locator('button:has-text("Purchase")')).not.toBeVisible();

    // Should see Already Purchased
    await expect(page.locator('text=Already Purchased')).toBeVisible();

    // Attempt direct access to orders page
    await page.goto('http://localhost:3001/curriculums/1/orders');

    // Should redirect back to curriculum
    await expect(page).toHaveURL(/\/curriculums\/1/);
  });
});
```

---

## Test Data Setup

### Seed Data (Already Created)

The following seed data is available from migrations:

**V12_insert_purchase_seed_data.sql**:
- Sample orders with PENDING, PAID, EXPIRED statuses
- Orders for different users (user_id 1, 2, 3)
- Orders with and without coupons

**V14_insert_coupon_seed_data.sql**:
- Active valid coupons: `REACT20`, `SAVE15`
- Expired coupons: `EXPIRED10`
- Coupons near max uses: `LIMITED`
- Both PERCENTAGE and FIXED_AMOUNT types

### Test Helpers

**Backend** (`backend/src/test/java/com/waterballsa/backend/TestDataFactory.java`):
```java
public class TestDataFactory {

    public static Curriculum createTestCurriculum(Long id, String title, double price) {
        return Curriculum.builder()
            .id(id)
            .title(title)
            .price(BigDecimal.valueOf(price))
            .difficultyLevel("INTERMEDIATE")
            .isPublished(true)
            .build();
    }

    public static Order createTestOrder(String orderNumber, Long userId) {
        return Order.builder()
            .orderNumber(orderNumber)
            .userId(userId)
            .curriculumId(1L)
            .status("PENDING")
            .originalPrice(BigDecimal.valueOf(49.99))
            .finalPrice(BigDecimal.valueOf(49.99))
            .discountAmount(BigDecimal.ZERO)
            .expiresAt(LocalDateTime.now().plusDays(3))
            .build();
    }

    public static Coupon createTestCoupon(String code, String type, double value) {
        return Coupon.builder()
            .code(code)
            .discountType(type)
            .discountValue(BigDecimal.valueOf(value))
            .validFrom(LocalDateTime.now().minusDays(1))
            .validUntil(LocalDateTime.now().plusDays(30))
            .maxUses(100)
            .currentUses(0)
            .isActive(true)
            .build();
    }
}
```

---

## Running Tests

### Backend Tests (Inside Docker)

```bash
# Run all tests
docker-compose exec backend ./mvnw test

# Run specific test class
docker-compose exec backend ./mvnw test -Dtest=OrderServiceTest

# Run with coverage report
docker-compose exec backend ./mvnw verify

# View coverage report
open backend/target/site/jacoco/index.html
```

### Frontend Tests (Inside Docker)

```bash
# Run all unit tests
docker-compose exec frontend yarn test

# Run tests in watch mode
docker-compose exec frontend yarn test:watch

# Run E2E tests
docker-compose exec frontend yarn test:e2e

# Run tests with coverage
docker-compose exec frontend yarn test:coverage
```

### All Tests Together

```bash
# From project root
make test

# Or manually
docker-compose exec backend ./mvnw verify && \
docker-compose exec frontend yarn test && \
docker-compose exec frontend yarn test:e2e
```

---

## Test Reporting

### Coverage Reports

**Backend** (JaCoCo):
- Location: `backend/target/site/jacoco/index.html`
- Minimum: 80% line coverage
- Exclusions: DTOs, Entities (auto-generated code)

**Frontend** (Jest):
- Location: `frontend/coverage/lcov-report/index.html`
- Minimum: 80% statement coverage
- Exclusions: `*.config.js`, `next.config.js`

### CI/CD Integration

Tests should run automatically on:
- Every commit (pre-commit hook)
- Every pull request (GitHub Actions)
- Before deployment (staging/production)

---

## Definition of Done - Testing

A feature is considered complete when:

- [ ] All unit tests written and passing (>80% coverage)
- [ ] All integration tests written and passing
- [ ] All E2E tests written and passing
- [ ] All BDD scenarios automated
- [ ] Tests run successfully in Docker
- [ ] No flaky tests (all tests pass consistently)
- [ ] Test documentation updated
- [ ] Code review includes test review

---

## Revision History

| Version | Date       | Author | Changes                    |
|---------|------------|--------|----------------------------|
| 1.0     | 2025-12-01 | Claude | Initial test plan creation |
