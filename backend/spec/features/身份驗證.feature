Feature: 身份驗證 (Authentication)
  使用者需透過 Google OAuth 進行身份驗證，系統核發 JWT 用於 API 授權。

  Rule: 支援使用 Google OAuth 2.0 進行登入 (Mobile/Web 統一使用 id_token)
    Example: 首次使用 Google 登入 (新使用者註冊)
      Given 使用者持有有效的 Google ID Token "valid.google.token.newuser"
      And 該 Token 對應的 Email 為 "newuser@example.com"
      When 使用者透過 Google ID Token 請求登入
      Then 系統應建立新使用者帳號 "newuser@example.com"
      And 回傳有效的 Access Token 與 Refresh Token

    Example: 再次使用 Google 登入 (既有使用者)
      Given 使用者持有有效的 Google ID Token "valid.google.token.existing"
      And 該 Token 對應的 Email 為 "user@example.com"
      And 系統中已存在 Email 為 "user@example.com" 的使用者
      When 使用者透過 Google ID Token 請求登入
      Then 系統識別為現有使用者
      And 回傳有效的 Access Token 與 Refresh Token

    Example: 使用無效的 Google ID Token 登入失敗
      Given 使用者持有無效的 Google ID Token "invalid.token"
      When 使用者透過 Google ID Token 請求登入
      Then 系統拒絕登入請求
      And 回傳 "無效的憑證" 錯誤 (401 Unauthorized)

  Rule: 系統需驗證存取憑證 (Access Token) 的有效性
    Example: 使用有效的 Access Token 存取受保護資源
      Given 使用者持有有效的 Access Token
      When 使用者請求存取受保護的 API 資源
      Then 系統允許存取

    Example: 使用過期的 Access Token 存取失敗
      Given 使用者持有已過期的 Access Token
      When 使用者請求存取受保護的 API 資源
      Then 系統拒絕存取
      And 回傳 "Token 已過期" 錯誤 (401 Unauthorized)
      And 提示客戶端需進行 Token Refresh

    Example: 使用偽造或格式錯誤的 Access Token 存取失敗
      Given 使用者持有偽造的 Access Token "malformed.token"
      When 使用者請求存取受保護的 API 資源
      Then 系統拒絕存取
      And 回傳 "無效的 Token" 錯誤 (401 Unauthorized)

  Rule: Access Token 過期時可透過 Refresh Token 刷新 (需執行 Token Rotation)
    Example: 成功刷新 Token 並獲得新的 Refresh Token
      Given 使用者持有有效的 Refresh Token "RT-001"
      When 使用者請求刷新 Access Token
      Then 系統回傳新的 Access Token
      And 系統回傳新的 Refresh Token "RT-002"
      And 舊的 Refresh Token "RT-001" 立即失效

    Example: 嘗試使用已失效的 Refresh Token (Reuse Detection)
      Given Refresh Token "RT-001" 已被使用過並失效
      When 使用者嘗試使用 "RT-001" 刷新 Token
      Then 系統回傳 "Invalid Token" 錯誤
      And 系統可能會標記該使用者帳號有安全風險

  Rule: 登出時必須註銷 Refresh Token (加入黑名單)
    Example: 登出後 Refresh Token 失效
      Given 使用者持有有效的 Refresh Token "RT-001"
      When 使用者請求登出
      Then 系統將 "RT-001" 加入黑名單 (Blacklist)
      And 該 Refresh Token 再次使用時將被拒絕

  Rule: 取得當前使用者資訊 (Me)
    Example: 已登入使用者查詢自己的資訊
      Given 使用者已登入，Email 為 "student@example.com"
      And 顯示名稱為 "Student A"
      When 使用者請求 "我的資訊" (Me API)
      Then 回傳資料應包含:
        | email | student@example.com |
        | name  | Student A           |
