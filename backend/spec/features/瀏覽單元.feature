Feature: 瀏覽單元 (View Lessons)
  使用者可以觀看課程單元內容，系統需依據購買狀態或公開設定進行權限控管，並紀錄觀看進度。

  Rule: 若單元設為公開，則無需購買即可觀看
    Example: 已登入使用者觀看公開單元
      Given 使用者已登入
      And 課程 "Docker 基礎" 包含單元 "Docker 安裝" 且設為 "公開"
      When 使用者嘗試存取單元 "Docker 安裝"
      Then 使用者獲得單元內容

  Rule: 若單元未設為公開，使用者必須擁有該課程（已購買）才能觀看
    Example: 已購使用者觀看付費課程單元
      Given 使用者已購買課程 "Spring Boot 核心"
      And 課程 "Spring Boot 核心" 包含單元 "DI 原理" (非公開)
      When 使用者嘗試存取單元 "DI 原理"
      Then 使用者獲得單元內容

    Example: 未購使用者無法觀看付費課程單元
      Given 使用者未購買課程 "Spring Boot 核心"
      And 課程 "Spring Boot 核心" 包含單元 "DI 原理" (非公開)
      When 使用者嘗試存取單元 "DI 原理"
      Then 系統回傳 "需購買課程" 錯誤

  Rule: 使用者已登入即可觀看免費課程的單元 (無需購買)
    Example: 已登入使用者觀看免費課程單元
      Given 使用者已登入
      And 課程 "Git 入門" 為免費課程
      And 課程 "Git 入門" 包含單元 "Commit 基礎" (非公開)
      When 使用者嘗試存取單元 "Commit 基礎"
      Then 使用者獲得單元內容

    Example: 未登入使用者無法觀看免費課程單元
      Given 使用者未登入
      And 課程 "Git 入門" 為免費課程
      When 使用者嘗試存取單元 "Commit 基礎"
      Then 系統回傳 "請先登入" 錯誤

  Rule: 支援多種單元類型內容（Video, Article, Survey），內容統一存於 content 欄位
    Example: 取得 Video 類型單元
      Given 單元 "React Intro" 類型為 "VIDEO"
      And 內容欄位為 '{"url": "https://video.com/123.m3u8"}'
      When 使用者讀取單元 "React Intro"
      Then 回傳資料應包含 video_url

    Example: 取得 Article 類型單元
      Given 單元 "React Notes" 類型為 "ARTICLE"
      And 內容欄位為 "# React Notes..."
      When 使用者讀取單元 "React Notes"
      Then 回傳資料應包含 markdown content

    Example: 取得 Survey 類型單元
      Given 單元 "Course Feedback" 類型為 "SURVEY"
      And 內容欄位為 '{"questions": ["Q1", "Q2"]}'
      When 使用者讀取單元 "Course Feedback"
      Then 回傳資料應包含 survey config

  Rule: 影片單元可儲存觀看進度，但需符合驗證規則
    Example: 成功更新觀看進度
      Given 使用者正在觀看影片單元 "React Hooks"，影片長度為 600 秒
      And 上次更新時間為 15 秒前
      When 使用者回報觀看進度為 120 秒
      Then 系統更新該單元的觀看進度為 120 秒
      And 記錄本次更新時間

    Example: 進度超過影片長度導致更新失敗
      Given 使用者正在觀看影片單元 "React Hooks"，影片長度為 600 秒
      When 使用者回報觀看進度為 601 秒
      Then 系統拒絕更新
      And 回報錯誤 "進度不可超過影片總長度"

    Example: 更新過於頻繁導致失敗 (Rate Limiting)
      Given 使用者正在觀看影片單元 "React Hooks"
      And 上次更新時間為 5 秒前
      When 使用者嘗試更新觀看進度
      Then 系統拒絕更新
      And 回報錯誤 "更新過於頻繁，請稍後再試 (限制 10 秒)"

  Rule: 可查詢單一影片或整章節的觀看進度
    Example: 查詢單一影片單元的觀看進度
      Given 使用者對單元 "React Hooks" 的觀看進度為 120 秒
      When 使用者查詢單元 "React Hooks" 的進度
      Then 回傳進度 "120" 秒

    Example: 查詢特定章節下所有單元的觀看進度
      Given 章節 "Advanced Patterns" 包含單元 "HOC", "Render Props"
      And 使用者對 "HOC" 觀看進度為 300 秒
      And 使用者對 "Render Props" 無觀看紀錄
      When 使用者查詢章節 "Advanced Patterns" 的觀看進度
      Then 回傳清單包含:
        | 單元         | 進度 |
        | HOC          | 300  |
        | Render Props | 0    |
