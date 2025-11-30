# Feature: Purchase Flow
#
# This feature file contains BDD scenarios for the complete purchase flow,
# from order confirmation to payment processing.
#
# Phase: Phase 2 - Access Control & Payment
# Created: 2025-12-01

@purchase-flow @phase-2
Feature: Purchase Flow
  As a student
  I want to purchase curriculums through a clear checkout flow
  So that I can access paid educational content

  Background:
    Given the following curriculums exist:
      | id | title           | price  | difficulty    | published |
      | 1  | React Mastery   | 49.99  | INTERMEDIATE  | true      |
      | 2  | Java Advanced   | 79.99  | ADVANCED      | true      |
      | 3  | Git Basics      | 0.00   | BEGINNER      | true      |
    And the following chapters exist for curriculum 1:
      | id | title              | orderIndex |
      | 1  | Getting Started    | 0          |
      | 2  | React Components   | 1          |
    And the following lessons exist for chapter 1:
      | id | title              | type    | duration | orderIndex | freePreview |
      | 1  | Welcome to React   | VIDEO   | 15       | 0          | true        |
      | 2  | Installing Node.js | ARTICLE | 10       | 1          | false       |

  @order-confirmation @happy-path
  Scenario: Student views order confirmation page
    Given a logged-in user "john@example.com"
    And the user does not own curriculum "React Mastery"
    When the user navigates to "/curriculums/1/orders"
    Then the page should display curriculum title "React Mastery"
    And the page should display curriculum description
    And the page should display "2 chapters"
    And the page should display a list of chapters with lessons
    And the pricing section should show:
      | Original Price | $49.99 |
      | Discount       | $0.00  |
      | Final Price    | $49.99 |
    And the page should display a "Confirm Purchase" button
    And the page should display a "Cancel" button

  @order-confirmation @access-control
  Scenario: Student cannot access order page for owned curriculum
    Given a logged-in user "jane@example.com"
    And the user owns curriculum "React Mastery" purchased on "2025-11-15"
    When the user navigates to "/curriculums/1/orders"
    Then the page should redirect to "/curriculums/1"
    And the curriculum page should display "Already Purchased"

  @order-confirmation @authentication
  Scenario: Unauthenticated user cannot access order page
    Given an unauthenticated user
    When the user navigates to "/curriculums/1/orders"
    Then the page should redirect to "/auth/login"
    And after successful login the user should redirect to "/curriculums/1/orders"

  @coupon @happy-path
  Scenario: Student applies valid percentage discount coupon
    Given a logged-in user on order confirmation page for curriculum 1
    And a coupon "REACT20" exists with:
      | Discount Type  | PERCENTAGE    |
      | Discount Value | 20            |
      | Valid From     | 2025-11-01    |
      | Valid Until    | 2025-12-31    |
      | Max Uses       | 100           |
      | Current Uses   | 45            |
      | Is Active      | true          |
    When the user enters "REACT20" in the coupon field
    And the user clicks "Apply Coupon"
    Then the coupon should be validated successfully
    And the pricing section should update to:
      | Original Price | $49.99  |
      | Discount (20%) | -$10.00 |
      | Final Price    | $39.99  |
    And the coupon field should display "Coupon applied: REACT20"

  @coupon @happy-path
  Scenario: Student applies valid fixed amount discount coupon
    Given a logged-in user on order confirmation page for curriculum 1
    And a coupon "SAVE15" exists with:
      | Discount Type  | FIXED_AMOUNT |
      | Discount Value | 15.00        |
      | Valid From     | 2025-11-01   |
      | Valid Until    | 2025-12-31   |
      | Is Active      | true         |
    When the user enters "SAVE15" in the coupon field
    And the user clicks "Apply Coupon"
    Then the pricing section should update to:
      | Original Price | $49.99 |
      | Discount       | -$15.00 |
      | Final Price    | $34.99 |

  @coupon @error
  Scenario: Student applies expired coupon
    Given a logged-in user on order confirmation page for curriculum 1
    And a coupon "EXPIRED10" exists with:
      | Valid From  | 2025-10-01 |
      | Valid Until | 2025-10-31 |
      | Is Active   | true       |
    And today's date is "2025-12-01"
    When the user enters "EXPIRED10" in the coupon field
    And the user clicks "Apply Coupon"
    Then the page should display error "Coupon has expired"
    And the pricing should remain unchanged

  @coupon @error
  Scenario: Student applies fully used coupon
    Given a logged-in user on order confirmation page for curriculum 1
    And a coupon "LIMITED" exists with:
      | Max Uses     | 100        |
      | Current Uses | 100        |
      | Valid Until  | 2025-12-31 |
      | Is Active    | true       |
    When the user enters "LIMITED" in the coupon field
    And the user clicks "Apply Coupon"
    Then the page should display error "Coupon has reached maximum uses"

  @coupon @error
  Scenario: Student applies invalid coupon code
    Given a logged-in user on order confirmation page for curriculum 1
    And no coupon "INVALID123" exists
    When the user enters "INVALID123" in the coupon field
    And the user clicks "Apply Coupon"
    Then the page should display error "Invalid coupon code"

  @coupon @happy-path
  Scenario: Student removes applied coupon
    Given a logged-in user on order confirmation page for curriculum 1
    And the user has applied coupon "REACT20" with 20% discount
    And the final price is "$39.99"
    When the user clicks "Remove Coupon"
    Then the pricing section should update to:
      | Original Price | $49.99 |
      | Discount       | $0.00  |
      | Final Price    | $49.99 |
    And the coupon field should be empty

  @order-creation @happy-path
  Scenario: Student creates order successfully
    Given a logged-in user on order confirmation page for curriculum 1
    And the final price is "$49.99"
    When the user clicks "Confirm Purchase"
    Then a new order should be created with:
      | status         | PENDING               |
      | original_price | 49.99                 |
      | final_price    | 49.99                 |
      | coupon_code    | null                  |
      | expires_at     | 3 days from creation  |
    And the user should redirect to "/orders/{orderNumber}/payment"

  @order-creation @happy-path
  Scenario: Student creates order with coupon
    Given a logged-in user on order confirmation page for curriculum 1
    And the user has applied coupon "REACT20"
    And the final price is "$39.99"
    When the user clicks "Confirm Purchase"
    Then a new order should be created with:
      | original_price | 49.99   |
      | final_price    | 39.99   |
      | coupon_code    | REACT20 |
    And the coupon's current_uses should increment by 1
    And the user should redirect to payment page

  @order-creation @validation
  Scenario: Order number is generated correctly
    Given the current date/time is "2025-12-01 14:46:35"
    When an order is created
    Then the order_number should match format "20251201144635XXX"
    And the order_number should be unique

  @order-creation @validation
  Scenario: Order expiration is set correctly
    Given the current timestamp is "2025-12-01 14:46:35"
    When an order is created
    Then the expires_at timestamp should be "2025-12-04 23:59:59"

  @payment-page @happy-path
  Scenario: Student views payment page
    Given a logged-in user "john@example.com"
    And an order "20251201144635001" exists with:
      | status      | PENDING             |
      | final_price | 49.99               |
      | expires_at  | 2025-12-04 23:59:59 |
    When the user navigates to "/orders/20251201144635001/payment"
    Then the page should display:
      | Order Number     | 20251201144635001         |
      | Course Name      | React Mastery             |
      | Total Amount     | $49.99                    |
      | Payment Deadline | December 4, 2025 11:59 PM |
    And the page should display 3 payment method options
    And the "Proceed to Payment" button should be disabled

  @payment-page @happy-path
  Scenario: Student selects payment method
    Given the user is on payment page for order "20251201144635001"
    When the user selects "Credit Card One-Time Payment"
    Then the selected payment method should be highlighted
    And the "Proceed to Payment" button should be enabled
    And the button text should be "Pay $49.99"

  @payment-page @access-control
  Scenario: Student cannot access expired order payment page
    Given a logged-in user "jane@example.com"
    And an order "20251128100000001" with:
      | status     | PENDING             |
      | expires_at | 2025-11-30 23:59:59 |
    And today's date is "2025-12-01"
    When the user navigates to "/orders/20251128100000001/payment"
    Then the page should display error "Order has expired"
    And the order status should be updated to "EXPIRED"

  @payment-page @access-control
  Scenario: Student cannot access already paid order
    Given a logged-in user "bob@example.com"
    And an order "20251201120000001" with status "PAID"
    When the user navigates to "/orders/20251201120000001/payment"
    Then the page should redirect to "/curriculums/{curriculumId}"

  @payment-processing @happy-path
  Scenario: Student completes credit card payment
    Given the user is on payment page for order "20251201144635001"
    And the user has selected "Credit Card One-Time Payment"
    And the order status is "PENDING"
    When the user clicks "Proceed to Payment"
    Then the page should display a processing indicator
    And after 1-2 seconds the payment should succeed
    And the order status should update to "PAID"
    And the purchased_at timestamp should be set
    And the user should redirect to "/curriculums/{curriculumId}"

  @payment-processing @happy-path
  Scenario: Student completes ATM transfer
    Given the user is on payment page for order "20251201144635001"
    And the user has selected "ATM Transfer"
    When the user clicks "Proceed to Payment"
    Then the mock payment should process
    And the order status should update to "PAID"
    And the user should gain immediate access to curriculum

  @payment-processing @happy-path
  Scenario: Student completes credit card installment
    Given the user is on payment page for order "20251201144635001"
    And the user has selected "Credit Card Installment"
    When the user clicks "Proceed to Payment"
    Then the mock payment should process
    And the order status should update to "PAID"

  @post-payment @access-control
  Scenario: Student accesses curriculum after payment
    Given a logged-in user "john@example.com"
    And the user completed payment for order "20251201144635001"
    And the order is for curriculum "React Mastery"
    And the order status is "PAID"
    When the user views curriculum page "/curriculums/1"
    Then the page should display "Purchase successful!"
    And the "Purchase" button should be replaced with "Start Learning"
    And all lessons should be accessible

  @post-payment @access-control
  Scenario: Student accesses lesson after payment
    Given a logged-in user "jane@example.com"
    And the user purchased curriculum 1
    And lesson 2 belongs to curriculum 1
    And lesson 2 is NOT a free preview lesson
    When the user navigates to "/lessons/2"
    Then the lesson content should load successfully
    And no "Purchase Required" message should appear

  @edge-case @coupon
  Scenario: Coupon discount exceeds curriculum price
    Given a curriculum with price "$29.99"
    And a coupon with fixed discount "$50.00"
    When the user applies the coupon
    Then the final price should be "$0.00"
    And the discount shown should be "$29.99"

  @edge-case @order
  Scenario: User refreshes payment page during processing
    Given the user clicks "Proceed to Payment"
    And payment processing is in progress
    When the user refreshes the page
    Then the page should check current order status
    And if status is "PAID" redirect to curriculum page
    And if status is "PENDING" allow retry payment

  @edge-case @free-curriculum
  Scenario: User cannot order free curriculum
    Given a logged-in user "john@example.com"
    And curriculum "Git Basics" has price "$0.00"
    When the user navigates to "/curriculums/3/orders"
    Then the page should redirect to "/curriculums/3"
    And no "Purchase" button should be displayed

  @error @network
  Scenario: Coupon validation API fails
    Given the user is on order confirmation page
    And the user enters coupon code "REACT20"
    When the user clicks "Apply Coupon"
    And the API request fails with network error
    Then the page should display "Unable to validate coupon. Please try again."
    And a "Retry" button should appear

  @error @server
  Scenario: Order creation fails
    Given the user is on order confirmation page
    When the user clicks "Confirm Purchase"
    And the POST /api/orders request fails with 500 error
    Then the page should display "Failed to create order. Please try again."
    And the user should remain on order confirmation page

  @error @authorization
  Scenario: User attempts to pay for another user's order
    Given a logged-in user "alice@example.com"
    And an order "20251201144635001" belongs to user "bob@example.com"
    When user "alice" navigates to "/orders/20251201144635001/payment"
    Then the page should return 403 Forbidden
    And the page should display "You cannot access this order"

  @order-history @happy-path
  Scenario: Student views order history
    Given a logged-in user "frank@example.com"
    And the user has made 3 purchases
    When the user navigates to "/orders/my-orders"
    Then the user should see a list of 3 orders
    And each order should display:
      - Curriculum title and thumbnail
      - Purchase date
      - Amount paid
      - Status
    And orders should be sorted by date newest first

  @order-history @edge-case
  Scenario: Student with no purchases views order history
    Given a logged-in user "grace@example.com"
    And the user has not made any purchases
    When the user navigates to "/orders/my-orders"
    Then the page should display "You haven't purchased any curriculums yet"
    And the page should display a "Browse Curriculums" link
