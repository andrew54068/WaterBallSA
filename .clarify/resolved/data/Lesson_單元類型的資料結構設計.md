# 釐清問題

關於「單元類型 (Lesson Types)」，spec 提到有 VIDEO, ARTICLE, SURVEY。請問後端是否需要針對不同類型回傳不同的資料結構？例如 VIDEO 需要 `video_url`，ARTICLE 需要 `content`，SURVEY 需要 `config`？

# 定位

Feature：瀏覽單元.feature
Rule：支援多種單元類型內容（Video, Article, Survey）
ERM：Table Lesson

# 多選題

| 選項 | 描述 |
|--------|-------------|
| A | 是，根據 Type 回傳對應欄位，其他欄位為 null (Single Table Inheritance) |
| B | 否，所有內容都塞在一個 `content` 欄位 (JSON or String) |
| C | 拆分不同 Table (LessonVideo, LessonArticle...) |
| Short | Format: Short answer (<=5 words) |

# 影響範圍

- Table Lesson 定義
- API Response Structure
- 前端處理邏輯

# 優先級

Medium

---
# 解決記錄

- **回答**：B - 否，所有內容都塞在一個 `content` 欄位 (JSON or String)
- **更新的規格檔**：spec/erm.dbml, spec/features/瀏覽單元.feature
- **變更內容**：
  1. `erm.dbml`: 更新 Lesson.content 的 note 為「JSON String or Text, 依 type 解析」。
  2. `瀏覽單元.feature`: 補充不同單元類型 (Video/Article/Survey) 的 Example，說明它們如何共用 content 欄位但包含不同的資料結構。
