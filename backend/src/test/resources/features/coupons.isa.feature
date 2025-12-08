Feature: Coupon驗證

  Background:
    Given 準備一個User, with table:
      | >User.id | googleId              | email             | name     |
      | <userId  | 108123456789012345678 | user@test.com     | TestUser |
    And 準備一個Curriculum, with table:
      | >Curriculum.id | title            | price   |
      | <curriculumId  | Spring Boot 實戰 | 2490.00 |

  Rule: 使用者可以驗證Coupon
    Example: 驗證有效的百分比折抵Coupon
      Given 準備一張Coupon, with table:
        | code        | discountType | discountValue | validFrom            | validTo              | usageLimit |
        | WELCOME2025 | PERCENTAGE   | 20.0          | @time("2025-01-01")  | @time("2025-12-31")  | 100        |
      And (UID="$User.id") 已經登入
      When (UID="$User.id") 驗證優惠券, call table:
        | curriculumId   | couponCode  |
        | $Curriculum.id | WELCOME2025 |
      Then 回應, with table:
        | valid | code        | discountType | discountValue |
        | true  | WELCOME2025 | PERCENTAGE   | 20.0          |

    Example: 驗證過期的Coupon應回傳失敗
      Given 準備一張Coupon, with table:
        | code        | discountType | discountValue | validFrom            | validTo              | usageLimit |
        | EXPIRED2024 | PERCENTAGE   | 10.0          | @time("2024-01-01")  | @time("2024-12-31")  | 100        |
      And 現在的時間是 "@time(\"2025-01-01\")"
      And (UID="$User.id") 已經登入
      When (UID="$User.id") 驗證優惠券, call table:
        | curriculumId   | couponCode  |
        | $Curriculum.id | EXPIRED2024 |
      Then 回應, with table:
        | valid | errorCode      | errorMessage |
        | false | COUPON_EXPIRED | Coupon已過期 |
