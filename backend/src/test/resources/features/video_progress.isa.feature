Feature: 影片進度追蹤

  Background:
    Given 準備一個User, with table:
      | >User.id | googleId              | email             | name     |
      | <userId  | 108123456789012345678 | user@test.com     | TestUser |
    And 準備一個Curriculum, with table:
      | >Curriculum.id | title                  |
      | <curriculumId  | 完整 Java 開發入門課程 |
    And 準備一個章節, with table:
      | >Chapter.id | curriculumId   | title |
      | <chapterId  | $Curriculum.id | Intro |
        # 準備課程單元
    And 準備一個Lesson, with table:
      | >Lesson1.id | chapterId   | title          | lessonType | durationMinutes |
      | <lessonId1  | $Chapter.id | 變數與資料型別 | VIDEO      | 10              |
    And 準備一個Lesson, with table:
      | >Lesson2.id | chapterId   | title          | lessonType | durationMinutes |
      | <lessonId2  | $Chapter.id | 流程控制       | VIDEO      | 20              |

  Rule: 使用者可以儲存影片進度
    Example: 儲存進度並確認更新
      Given (UID="$User.id") 已經登入
      When (UID="$User.id") 儲存或更新影片進度, call table:
        | P:lessonId    | currentTimeSeconds | durationSeconds | completionPercentage | isCompleted |
        | $Lesson1.id | 120.0              | 600.0           | 20.0                 | false       |
      Then 回應, with table:
        | lessonId    | currentTimeSeconds | completionPercentage | isCompleted |
        | $Lesson1.id | 120.0              | 20.0                 | false       |
      And 應該存在一個VideoProgress, with table:
        | userId   | lessonId    | currentTimeSeconds | isCompleted |
        | $User.id | $Lesson1.id | 120.0              | false       |

    Example: 進度超過 90% 應自動標記為完成
      Given (UID="$User.id") 已經登入
      When (UID="$User.id") 儲存或更新影片進度, call table:
        | P:lessonId    | currentTimeSeconds | durationSeconds | completionPercentage | isCompleted |
        | $Lesson1.id | 550.0              | 600.0           | 91.6                 | true        |
      Then 回應, with table:
        | isCompleted |
        | true        |

  Rule: 使用者可以查詢特定單元的進度
    Example: 查詢已存在的進度
      Given (UID="$User.id") 已經登入
      And 準備一個VideoProgress, with table:
        | userId   | lessonId    | currentTimeSeconds | isCompleted |
        | $User.id | $Lesson1.id | 300.0              | false       |
      When (UID="$User.id") 取得影片進度, call table:
        | P:lessonId    |
        | $Lesson1.id |
      Then 回應, with table:
        | lessonId    | currentTimeSeconds | isCompleted |
        | $Lesson1.id | 300.0              | false       |

  Rule: 使用者可以查詢章節的所有單元進度
    Example: 查詢章節進度應回傳該章節下所有單元的進度
      Given (UID="$User.id") 已經登入
      And 準備一個VideoProgress, with table:
        | userId   | lessonId    | currentTimeSeconds | isCompleted |
        | $User.id | $Lesson1.id | 600.0              | true        |
      And 準備一個VideoProgress, with table:
        | userId   | lessonId    | currentTimeSeconds | isCompleted |
        | $User.id | $Lesson2.id | 100.0              | false       |
      When (UID="$User.id") 取得章節所有課程的進度, call table:
        | chapterId   |
        | $Chapter.id |
      Then 回應列表包含進度, with table:
        | lessonId    | isCompleted |
        | $Lesson1.id | true        |
        | $Lesson2.id | false       |
