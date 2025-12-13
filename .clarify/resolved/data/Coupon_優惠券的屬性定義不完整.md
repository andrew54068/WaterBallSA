# 釐清問題

優惠券實體 (Coupon) 目前僅定義了 `code` 和 `discount_amount`，是否需要定義有效期限、使用次數限制或百分比折扣？

# 定位

ERM：Table Coupon

# 多選題

| 選項 | 描述 |
|--------|-------------|
| A | 僅需固定金額折抵，無期限與次數限制（MVP） |
| B | 需增加 `valid_from`, `valid_until` 有效期限 |
| C | 需增加 `max_usage` 次數限制 |
| D | 需支援百分比折扣 (`discount_type`, `discount_value`) |
| Short | Format: Short answer (<=5 words) |

# 影響範圍

- Table Coupon
- 購買課程.feature (驗證優惠碼有效性)
- 計算結帳金額的邏輯

# 優先級

Medium

---
# 解決記錄

- **回答**：E - 選項 B + C + D 全部都要 (有效期限 + 次數限制 + 百分比折扣)
- **更新的規格檔**：spec/erm.dbml
- **變更內容**：在 Coupon 實體中新增 `valid_from`, `valid_until`, `max_usage`, `discount_type`, `discount_value` 等屬性，以支援完整的優惠券功能。
