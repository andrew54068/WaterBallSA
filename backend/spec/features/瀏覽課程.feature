Feature: 瀏覽課程 (Browse Curriculums)
  使用者可以瀏覽、搜尋課程列表，並查看課程詳細資訊。

  Rule: 已發布的課程對所有人可見
    Example: 未登入使用者可查看已發布課程
      Given 課程 "Python 入門" 狀態為 "已發布"
      When 使用者(未登入) 瀏覽課程列表
      Then 列表應包含 "Python 入門"
      When 使用者瀏覽課程 "Python 入門" 詳細頁面
      Then 顯示課程標題 "Python 入門" 與價格

  Rule: 未發布的課程對一般使用者隱藏 (即使已購買也無法存取)
    Example: 已購使用者嘗試存取未發布課程
      Given 使用者已購買課程 "Android 開發"
      And 課程 "Android 開發" 狀態變更為 "未發布"
      When 使用者嘗試瀏覽課程 "Android 開發" 的詳細頁面
      Then 系統回傳 "查無此課程" 或 "無權限存取" 錯誤
      And 該課程也不會出現在課程列表中

  Rule: 搜尋課程支援關鍵字、分頁與排序 (比對標題與說明)
    Example: 關鍵字比對標題與說明
      Given 課程 "Java 入門" 說明為 "學習 Java 基礎"
      And 課程 "Python 資料分析" 說明為 "使用 Python 處理數據"
      When 使用者搜尋關鍵字 "Java"
      Then 搜尋結果應包含 "Java 入門"
      But 搜尋結果不應包含 "Python 資料分析"

    Example: 關鍵字比對說明欄位
      Given 課程 "資料結構" 說明為 "包含 Java 實作範例"
      When 使用者搜尋關鍵字 "Java"
      Then 搜尋結果應包含 "資料結構" (因為說明包含關鍵字)

    Example: 分頁查詢
      Given 系統中有 50 筆符合 "Web" 的課程
      When 使用者搜尋 "Web" 並請求第 2 頁，每頁 10 筆
      Then 系統回傳第 11 到 第 20 筆課程

  Rule: 查詢免費課程列表
    Example: 篩選出價格為 0 的課程
      Given 課程 "Git 基礎" 價格為 0 元 (已發布)
      And 課程 "Linux 操作" 價格為 0 元 (已發布)
      And 課程 "Docker 進階" 價格為 2000 元 (已發布)
      When 使用者請求 "免費課程" 列表
      Then 列表應包含 "Git 基礎", "Linux 操作"
      But 列表不應包含 "Docker 進階"

  Rule: 查看課程詳細內容結構（章節與單元）
    Example: 顯示課程章節與單元結構
      Given 課程 "Web 全端" 包含章節 "前端基礎"
      And 章節 "前端基礎" 包含單元 "HTML", "CSS"
      When 使用者查看 "Web 全端" 的詳細內容
      Then 應顯示章節 "前端基礎"
      And 該章節下應列出單元 "HTML" 與 "CSS"
