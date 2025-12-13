Feature: 購買課程 (Purchase Curriculums)
  使用者可以購買課程，支援優惠碼折抵，付款完成後即可取得課程內容存取權。

  Rule: 課程為購買最小單位，不可單獨購買章節或單元
    Example: 嘗試單獨購買單元失敗
      Given 課程 "Python 進階" 包含單元 "Decorator"
      When 使用者嘗試單獨購買單元 "Decorator"
      Then 系統拒絕建立訂單
      And 回傳 "不可單獨購買單元" 錯誤
      And 提示需購買完整課程 "Python 進階"

  Rule: 每位使用者對同一課程僅限購買一次 (不可重複購買)
    Example: 使用者嘗試購買已經擁有的課程
      Given 使用者已購買課程 "Kotlin 進階"
      When 使用者嘗試再次購買 "Kotlin 進階"
      Then 系統拒絕建立訂單
      And 回傳 "已擁有此課程" 錯誤 (409 Conflict)

  Rule: 建立訂單時可使用優惠碼，驗證有效後進行金額折抵
    Example: 成功使用優惠碼折抵
      Given 課程 "React 實戰" 價格為 3000 元
      And 優惠碼 "SAVE500" 可折抵 500 元
      When 使用者購買 "React 實戰" 並套用優惠碼 "SAVE500"
      Then 訂單原始金額為 3000 元
      And 折抵金額為 500 元
      And 結帳金額為 2500 元

  Rule: 優惠券折抵金額不可大於課程價格
    Example: 折抵金額過大導致驗證失敗
      Given 課程 "HTML 基礎" 價格為 300 元
      And 優惠碼 "BIGDEAL" 可折抵 500 元
      When 使用者嘗試購買 "HTML 基礎" 並套用優惠碼 "BIGDEAL"
      Then 系統拒絕建立訂單
      And 顯示錯誤訊息 "優惠券折抵金額不可大於課程價格"

  Rule: 訂單建立初始狀態為 PENDING，付款完成後轉為 COMPLETED 並立即開通
    Example: 成功建立訂單並完成付款
      Given 使用者購買 "Go 語言實戰" 價格 1500 元
      When 使用者建立訂單
      Then 訂單狀態應為 "PENDING"
      When 使用者完成付款 (Mock)
      Then 訂單狀態轉為 "COMPLETED"
      And 使用者取得 "Go 語言實戰" 的存取權

  Rule: 使用者可查詢已購買的課程與歷史訂單
    Example: 查詢已購課程列表
      Given 使用者已購買課程 "Kotlin 入門", "Spring Boot 實戰"
      When 使用者查詢 "我的課程" 列表
      Then 列表應包含 "Kotlin 入門", "Spring Boot 實戰"

    Example: 查詢歷史訂單記錄
      Given 使用者於 "2023-10-01" 購買 "Kotlin 入門" (訂單 A)
      And 使用者於 "2023-11-15" 購買 "Spring Boot 實戰" (訂單 B)
      When 使用者查詢歷史訂單
      Then 列表應包含訂單 A 與 訂單 B
      And 訂單 A 的狀態為 "COMPLETED"

  Rule: 驗證優惠碼有效性 (回應具體錯誤原因)
    Example: 優惠券已過期
      Given 優惠碼 "EXPIRED2023" 有效期限至 "2023-12-31"
      And System Time 為 "2024-01-01"
      When 使用者嘗試使用優惠碼 "EXPIRED2023"
      Then 系統回傳錯誤 "優惠券已過期"

    Example: 優惠券已達使用上限
      Given 優惠碼 "LIMITED10" 最大使用次數為 10
      And 該優惠碼已被使用 10 次
      When 使用者嘗試使用優惠碼 "LIMITED10"
      Then 系統回傳錯誤 "優惠券已達使用上限"
