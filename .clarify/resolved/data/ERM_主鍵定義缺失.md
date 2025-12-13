# 釐清問題

關於「資料庫主鍵 (Primary Key)」，目前 ERM 中只有 `Coupon.code` 明確標記了 `[pk]`。其他主要實體 (User, Curriculum, Chapter, Lesson, Purchase, VideoProgress) 的 `id` 欄位是否皆應設為 Primary Key？

# 定位

ERM: All Tables

# 多選題

| 選項 | 描述 |
|--------|-------------|
| A | 是 (Yes)：所有實體的 `id` 欄位皆為 Primary Key (標準設計) |
| B | 否 (No)：某些實體使用複合主鍵或其他設計 |
| Short | Format: Short answer (<=5 words) |

# 影響範圍

- Database Schema
- ORM Mapping

# 優先級

Low

---
# 解決記錄

- **回答**：A - 是 (Yes)：所有實體的 `id` 欄位皆為 Primary Key，VideoProgress 使用複合主鍵 (user_id, lesson_id)
- **更新的規格檔**：spec/erm.dbml
- **變更內容**：
  1. 為 User, Curriculum, Chapter, Lesson, Purchase 的 `id` 欄位加上 `[pk]`。
  2. 為 VideoProgress 新增 `indexes { (user_id, lesson_id) [pk] }` 定義複合主鍵。
