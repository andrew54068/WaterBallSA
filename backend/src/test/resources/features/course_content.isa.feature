Feature: 課程內容瀏覽

  Background:
    Given 準備一個Curriculum, with table:
      | >Curriculum.id | title                  | published |
      | <curriculumId  | 完整 Java 開發入門課程 | true      |
    And 準備一個章節, with table:
      | >Chapter.id | curriculumId   | title         | orderIndex |
      | <chapterId  | $Curriculum.id | Java 基礎語法 | 1          |
    And 準備一個Lesson, with table:
      | >Lesson.id | chapterId   | title          | lessonType | orderIndex |
      | <lessonId  | $Chapter.id | 變數與資料型別 | VIDEO      | 1          |

  Rule: 使用者可以查看課程章節列表
    Example: 查詢特定課程的章節列表應包含單元
      When (No Actor) 取得課程的所有章節, call table:
        | curriculumId   |
        | $Curriculum.id |
      Then 回應列表包含章節, with table:
        | id          | title         | orderIndex |
        | $Chapter.id | Java 基礎語法 | 1          |

  Rule: 使用者可以查看章節詳情
    Example: 查詢章節詳情應包含所有單元
      When (No Actor) 取得章節詳情, call table:
        | id          |
        | $Chapter.id |
      Then 回應, with table:
        | id          | title         | curriculumId   |
        | $Chapter.id | Java 基礎語法 | $Curriculum.id |
      And 回應列表包含Curriculum單元, with table:
        | id         | title          |
        | $Lesson.id | 變數與資料型別 |

  Rule: 使用者可以查詢課程章節數量
    Example: 查詢特定課程的章節數量
      When (No Actor) 取得課程的章節數量, call table:
        | curriculumId   |
        | $Curriculum.id |
      Then 回應, with table:
        | integer |
        | 1       |
