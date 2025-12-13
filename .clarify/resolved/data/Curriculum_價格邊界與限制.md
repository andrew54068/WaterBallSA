# 釐清問題

關於「課程價格 (Price)」，目前為 `int`。請問是否有「價格上限」或「價格下限」的業務規則？(例如不能超過 10 萬，或付費課程至少 10 元？)

# 定位

ERM: Table Curriculum.price
Feature: 購買課程

# 多選題

| 選項 | 描述 |
|--------|-------------|
| A | 無特定限制 (Open)：僅需 >= 0，無強制上限 (由營運方控制) |
| B | 設定上下限 (Bounded)：明確定義 (e.g. 10 ~ 1,000,000) 免費課程除外 |
| Short | Format: Short answer (<=5 words) |

# 影響範圍

- Data Validation
- Admin Input

# 優先級

Low

---
# 解決記錄

- **回答**：A - 無特定限制 (Open)：僅需 >= 0，無強制上限 (由營運方控制)
- **更新的規格檔**：spec/erm.dbml
- **變更內容**：
  1. 更新 `Curriculum.price` 的 Note，標註 `(>= 0, 無強制上限)`。
