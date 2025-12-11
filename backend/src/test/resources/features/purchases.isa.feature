Feature: 課程購買

  Background:
    Given 準備一個User, with table:
      | >User.id | googleId              | email             | name     |
      | <userId  | 108123456789012345678 | user@test.com     | TestUser |
    And 準備一個Curriculum, with table:
      | >Curriculum.id | title            | price   | isPublished |
      | <curriculumId  | Spring Boot 實戰 | 2490.0 | true        |

  Rule: 使用者可以取得訂單預覽資訊
    Example: 購買前取得訂單預覽資訊應顯示課程與價格資訊
      Given (UID="$User.id") 已經登入
      When (UID="$User.id") 取得訂單預覽資訊, call table:
        | curriculumId   |
        | $Curriculum.id |
      Then 回應, with table:
        | >Order.originalPrice | curriculum.id  | curriculum.title | originalPrice |
        | <originalPrice       | $Curriculum.id | Spring Boot 實戰 | 2490.0       |

  Rule: 使用者可以建立購買訂單
    Example: 建立訂單應產生 PENDING 狀態的交易
      Given (UID="$User.id") 已經登入
      When (UID="$User.id") 建立購買訂單, call table:
        | curriculumId   |
        | $Curriculum.id |
      Then 回應, with table:
        | >Purchase.id | status  | originalPrice | finalPrice |
        | <purchaseId  | PENDING | 2490.0       | 2490.0    |
      And 應該存在一個Purchase, with table:
        | id          | userId   | curriculumId   | status  |
        | $Purchase.id| $User.id | $Curriculum.id | PENDING |

  Rule: 使用者可以完成購買付款 (Mock)
    Example: 完成付款應將訂單狀態更新為 COMPLETED
      Given (UID="$User.id") 已經登入
      And 準備一個Purchase, with table:
        | >PendingPurchase.id | userId   | curriculumId   | status  |
        | <pendingPurchaseId  | $User.id | $Curriculum.id | PENDING |
      When (UID="$User.id") 完成購買付款, call table:
        | purchaseId          |
        | $PendingPurchase.id |
      Then 回應, with table:
        | id                  | status    |
        | $PendingPurchase.id | COMPLETED |
      And 應該存在一個Purchase, with table:
        | id                  | status    |
        | $PendingPurchase.id | COMPLETED |

  Rule: 使用者可以檢查使用者是否擁有課程
    Example: 已購買的課程應顯示已擁有
      Given (UID="$User.id") 已經登入
      And 準備一個Purchase, with table:
        | userId   | curriculumId   | status    |
        | $User.id | $Curriculum.id | COMPLETED |
      When (UID="$User.id") 檢查使用者是否擁有課程, call table:
        | curriculumId   |
        | $Curriculum.id |
      Then 回應, with table:
        | owns |
        | true |

  Rule: 使用者可以查看購買歷史
    Example: 取得使用者的購買歷史應包含已購買的課程
      Given (UID="$User.id") 已經登入
      And 準備一個Purchase, with table:
        | userId   | curriculumId   | status    |
        | $User.id | $Curriculum.id | COMPLETED |
      When (UID="$User.id") 取得使用者的購買歷史, call table:
        | page | size |
        | 0    | 10   |
      Then 回應列表包含Purchase, with table:
        | curriculumId   | status    |
        | $Curriculum.id | COMPLETED |

  Rule: 使用者可以查詢購買訂單詳情
    Example: 查詢已存在的訂單詳情
      Given (UID="$User.id") 已經登入
      And 準備一個Purchase, with table:
        | >PurchaseDetail.id | userId   | curriculumId   | status    |
        | <purchaseDetailId  | $User.id | $Curriculum.id | COMPLETED |
      When (UID="$User.id") 取得購買訂單詳情, call table:
        | purchaseId          |
        | $PurchaseDetail.id  |
      Then 回應, with table:
        | id                 | userId   | curriculumId   | status    |
        | $PurchaseDetail.id | $User.id | $Curriculum.id | COMPLETED |

  Rule: 使用者可以查詢已完成的購買記錄
    Example: 查詢已完成的購買記錄應過濾未完成訂單
      Given (UID="$User.id") 已經登入
      And 準備一個Purchase, with table:
        | userId   | curriculumId   | status  |
        | $User.id | $Curriculum.id | PENDING |
      And 準備一個Purchase, with table:
        | userId   | curriculumId   | status    |
        | $User.id | $Curriculum.id | COMPLETED |
      When (UID="$User.id") 取得已完成的購買記錄, call table:
        | page | size |
        | 0    | 10   |
      Then 回應列表包含Purchase, with table:
        | status    |
        | COMPLETED |
      And 回應列表不包含Purchase, with table:
        | status  |
        | PENDING |

  Rule: 購買失敗處理
    Example: 購買不存在的課程應回傳 404
      Given (UID="$User.id") 已經登入
      When (UID="$User.id") 建立購買訂單, call table:
        | curriculumId |
        | 9999         |
      Then 回應, with table:
        | status | error     |
        | 404    | Not Found |

    Example: 完成不存在的訂單付款應回傳 404
      Given (UID="$User.id") 已經登入
      When (UID="$User.id") 完成購買付款, call table:
        | purchaseId |
        | 9999       |
      Then 回應, with table:
        | status | error     |
        | 404    | Not Found |
