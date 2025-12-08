Feature: Curriculum瀏覽

  Background:
    Given 準備一個Curriculum, with table:
      | >JavaCourse.id | title                  | description                             | price   | currency | difficultyLevel | isPublished |
      | <courseId      | 完整 Java 開發入門Curriculum | 從零開始學習 Java 程式設計              | 1990.00 | TWD      | BEGINNER        | true        |
    And 準備一個Curriculum, with table:
      | >SpringCourse.id | title                    | description                             | price   | currency | difficultyLevel | isPublished |
      | <courseId2       | Spring Boot 實戰         | 深入淺出 Spring Boot                    | 2490.00 | TWD      | INTERMEDIATE    | true        |

  Rule: 使用者可以查詢Curriculum列表
    Example: 查詢所有Curriculum應包含分頁資訊
      When 取得課程列表（分頁）, call table:
        | page | size | sort           |
        | 0    | 10   | createdAt,desc |
      Then 回應, with table:
        | totalElements | totalPages | size | number |
        | 2             | 1          | 10   | 0      |
      And 回應列表包含Curriculum, with table:
        | id              | title                  | price   | difficultyLevel |
        | $JavaCourse.id  | 完整 Java 開發入門Curriculum | 1990.00 | BEGINNER        |
        | $SpringCourse.id| Spring Boot 實戰       | 2490.00 | INTERMEDIATE    |

  Rule: 使用者可以查詢Curriculum詳情
    Example: 查詢特定Curriculum應回傳完整資訊
      When 取得課程詳情, call table:
        | id              |
        | $JavaCourse.id  |
      Then 回應, with table:
        | id              | title                  | description                | price   | currency | difficultyLevel |
        | $JavaCourse.id  | 完整 Java 開發入門Curriculum | 從零開始學習 Java 程式設計 | 1990.00 | TWD      | BEGINNER        |

  Rule: 使用者可以根據難度篩選Curriculum
    Example: 篩選初級Curriculum
      When 根據難度篩選課程, call table:
        | level    | page | size |
        | BEGINNER | 0    | 10   |
      Then 回應列表包含Curriculum, with table:
        | id             | title                  |
        | $JavaCourse.id | 完整 Java 開發入門Curriculum |
      But 回應列表不包含Curriculum, with table:
        | id               |
        | $SpringCourse.id |

  Rule: 使用者可以查詢免費Curriculum
    Example: 查詢免費Curriculum應為空（如果沒有免費Curriculum）
      When 取得免費課程, call table:
        | page | size |
        | 0    | 10   |
      Then 回應, with table:
        | totalElements |
        | 0             |
