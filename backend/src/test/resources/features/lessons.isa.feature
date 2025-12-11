Feature: 單元內容與試看

  Background:
    Given 準備一個Curriculum, with table:
      | >Curriculum.id | title                  |
      | <curriculumId  | 完整 Java 開發入門課程 |
    And 準備一個章節, with table:
      | >Chapter.id | curriculumId   | title |
      | <chapterId  | $Curriculum.id | Intro |
    And 準備一個Lesson, with table:
      | >Lesson1.id | chapterId   | title          | lessonType | isFreePreview |
      | <lessonId1  | $Chapter.id | 課程介紹與學習路徑      | VIDEO      | true          |
    And 準備一個Lesson, with table:
      | >Lesson2.id | chapterId   | title          | lessonType | isFreePreview |
      | <lessonId2  | $Chapter.id | 設計模式的歷史與 GoF | VIDEO      | true          |

  Rule: 使用者可以查詢單元詳情
    Example: 查詢單元詳情由應回傳完整資訊
      When (No Actor) 取得單元詳情, call table:
        | id          |
        | $Lesson1.id |
      Then 回應, with table:
        | id          | title          | lessonType | isFreePreview |
        | $Lesson1.id | 課程介紹與學習路徑      | VIDEO      | true          |

  Rule: 使用者可以查詢免費試看單元
    Example: 查詢課程的免費試看單元
      When (No Actor) 取得課程的免費試看課程, call table:
        | curriculumId   |
        | $Curriculum.id |
      Then 回應列表包含Curriculum單元, with table:
        | id          | title          | isFreePreview |
        | $Lesson1.id | 課程介紹與學習路徑      | true          |
        | $Lesson2.id | 設計模式的歷史與 GoF | true          |
