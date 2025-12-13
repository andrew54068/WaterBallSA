# 釐清問題

影片觀看進度 (VideoProgress) 的更新頻率限制為何？是否允許進度超過影片總長度？

# 定位

Feature：瀏覽單元.feature
Rule：影片單元可儲存觀看進度

# 多選題

| 選項 | 描述 |
|--------|-------------|
| A | 前端自行控制，後端不設限（MVP） |
| B | 後端需驗證 `progress_seconds` <= `video_duration` |
| C | 後端需限制更新頻率（例如每 5 秒一次） |
| D | 選項 B + C |
| Short | Format: Short answer (<=5 words) |

# 影響範圍

- Table VideoProgress
- 瀏覽單元.feature
- API 效能與資料正確性

# 優先級

Low

---
# 解決記錄

- **回答**：D - 選項 B + C 都要，但每 10 秒記錄一次
- **更新的規格檔**：spec/features/瀏覽單元.feature
- **變更內容**：新增規則「影片單元可儲存觀看進度，但需符合驗證規則」，包含三個 Examples：成功正常更新、進度超過總長度失敗、更新頻率過快（小於 10 秒）失敗。
