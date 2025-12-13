# 釐清問題

關於「Token 刷新 (Refresh Token)」機制，規格書僅提到 "Short-lived Access Token" 與 "Long-lived Refresh Token"。請問在執行刷新 API 時，是否需要執行 "Refresh Token Rotation" (即換發 Access Token 的同時，也換發一個新的 Refresh Token 並作廢舊的)？

# 定位

Feature：身份驗證.feature
Rule：Access Token 過期時可透過 Refresh Token 刷新

# 多選題

| 選項 | 描述 |
|--------|-------------|
| A | 是，執行 Rotation：每次刷新都換發新的 Refresh Token (安全性最高，防止重放) |
| B | 否，Reuse：Refresh Token 在 7 天效期內可重複使用，直到過期 |
| Short | Format: Short answer (<=5 words) |

# 影響範圍

- 身份驗證.feature
- 前端 Token 儲存更新邏輯

# 優先級

High

---
# 解決記錄

- **回答**：A - 是，執行 Rotation：每次刷新都換發新的 Refresh Token
- **更新的規格檔**：spec/features/身份驗證.feature
- **變更內容**：
  1. 明確定義 Refresh Token Rotation 策略。
  2. 新增 Example：成功刷新時必須回傳新的 Refresh Token 並作廢舊的。
  3. 新增 Example：使用舊 Token 會失敗 (Reuse Detection)。
