# 釐清問題

關於「Refresh Token」的儲存方式，ERM 目前未定義相關 Table。考慮到需支援 "Revoke (登出)" 與 "Rotation (Reuse Detection)"，後端應如何儲存 Refresh Token 狀態？

# 定位

ERM & Authentication Implementation

# 多選題

| 選項 | 描述 |
|--------|-------------|
| A | RDBMS (Table RefreshToken)：新增資料表，具備 ACID 特性，適合關聯查詢 |
| B | NoSQL (Redis)：使用 Key-Value 儲存，設定 TTL，適合高頻讀寫與自動過期 |
| C | Stateless (JWT only)：不儲存，Revoke 依賴短時效或 Blacklist (Redis) |
| Short | Format: Short answer (<=5 words) |

# 影響範圍

- ERM (是否新增 Table)
- Backend Infrastructure (是否引入 Redis)

# 優先級

High

---
# 解決記錄

- **回答**：C - Stateless (JWT only)：不儲存，Revoke 依賴短時效或 Blacklist
- **更新的規格檔**：spec/features/身份驗證.feature
- **變更內容**：
  1. 不在 `erm.dbml` 新增 RefreshToken Table。
  2. 更新 `身份驗證.feature`，明確定義登出行為為「將 Refresh Token 加入黑名單 (Blacklist)」，而非刪除資料庫紀錄。
  3. 隱含架構需求：需要一個儲存黑名單的機制 (如 Redis 或 DB 簡單列表)。
