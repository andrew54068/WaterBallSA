# 釐清問題

關於「觀看進度 (Video Progress)」，目前 Table 定義包含了 `progress_seconds`。請問進度紀錄是否需要「永久保存」？還是會有「保留期限」？(例如使用者很久沒看是否會清空？)

# 定位

ERM: Table VideoProgress
Feature: 瀏覽單元 (View Lessons)

# 多選題

| 選項 | 描述 |
|--------|-------------|
| A | 永久保存 (Simple)：除非使用者刪除帳號，否則進度永不消失 (MVP 推薦) |
| B | 自動過期 (Archive)：超過一定時間 (如 1 年) 未活動則封存或刪除 |
| Short | Format: Short answer (<=5 words) |

# 影響範圍

- Database Maintenance
- User Experience

# 優先級

Low

---
# 解決記錄

- **回答**：A - 永久保存 (Permanent)：除非使用者刪除帳號，否則進度永不消失
- **更新的規格檔**：spec/erm.dbml
- **變更內容**：
  1. 更新 `VideoProgress` 的 Note，標註 `(永久保存)`。
  2. 確認系統不需要開發定期清除進度的排程任務。
