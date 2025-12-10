Feature: Curriculum瀏覽

  Background:
    Given 準備一個Curriculum, with table:
      | >JavaCourse.id | title                  | instructorName | description                             | thumbnailUrl                     | price   | currency | difficultyLevel | estimatedDurationHours | isPublished | publishedAt         |
      | <courseId      | 完整 Java 開發入門Curriculum | WaterBall      | 從零開始學習 Java 程式設計              | https://example.com/java.png     | 1990.00 | TWD      | BEGINNER        | 20                     | true        | 2023-01-01T00:00:00 |
    And 準備一個Curriculum, with table:
      | >SpringCourse.id | title                    | instructorName | description                             | thumbnailUrl                     | price   | currency | difficultyLevel | estimatedDurationHours | isPublished | publishedAt         |
      | <courseId2       | Spring Boot 實戰         | WaterBall      | 深入淺出 Spring Boot                    | https://example.com/spring.png   | 2490.00 | TWD      | INTERMEDIATE    | 30                     | true        | 2023-02-01T00:00:00 |
    And 準備一個Chapter, for curriculum $JavaCourse.id, with table:
      | title          | description                 | orderIndex |
      | 物件導向基礎   | 類別、物件、封裝、繼承、多型 | 0          |
      | 設計模式概論   | GoF Design Patterns         | 1          |
    And 準備一個Lesson, for chapter 0 of curriculum $JavaCourse.id, with table:
      | title          | lessonType |
      | 什麼是物件導向 | VIDEO      |
      | 封裝的藝術     | VIDEO      |

  Rule: 使用者可以查詢Curriculum列表
    Example: 查詢所有Curriculum應包含分頁資訊
      When (No Actor) 取得課程列表（分頁）, call table:
        | page | size | sort           |
        | 0    | 10   | createdAt,desc |
      Then 回應, with table:
        | totalElements | totalPages | size | number |
        | 2             | 1          | 10   | 0      |
      And 回應列表包含Curriculum, with table:
        | id              | title                  | price   | difficultyLevel |
        | $JavaCourse.id  | 完整 Java 開發入門Curriculum | 1990.00 | BEGINNER        |
        | $SpringCourse.id| Spring Boot 實戰       | 2490.00 | INTERMEDIATE    |
      And 回應列表包含Curriculum, with table:
        | id              | chapters[0].title | chapters[1].title |
        | $JavaCourse.id  | 物件導向基礎        | 設計模式概論        |

  Rule: 使用者可以查詢Curriculum詳情
    Example: 查詢特定Curriculum應回傳完整資訊
      When (No Actor) 取得課程詳情, call table:
        | id              |
        | $JavaCourse.id  |
      Then 回應, with table:
        | id              | title                  | instructorName | description                | thumbnailUrl                 | price   | currency | difficultyLevel | estimatedDurationHours | isPublished | publishedAt         |
        | $JavaCourse.id  | 完整 Java 開發入門Curriculum | WaterBall      | 從零開始學習 Java 程式設計 | https://example.com/java.png | 1990.00 | TWD      | BEGINNER        | 20                     | true        | 2023-01-01T00:00:00 |
      And 回應列表包含Curriculum, with table:
        | id              | chapters[0].lessons[0].title | chapters[0].lessons[1].title |
        | $JavaCourse.id  | 什麼是物件導向               | 封裝的藝術                   |


  Rule: 使用者可以查詢免費Curriculum
    Example: 查詢免費Curriculum應為空（如果沒有免費Curriculum）
      When (No Actor) 取得免費課程, call table:
        | page | size |
        | 0    | 10   |
      Then 回應, with table:
        | totalElements |
        | 0             |
