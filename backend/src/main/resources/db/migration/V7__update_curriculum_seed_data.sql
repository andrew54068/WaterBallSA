-- Update curriculum seed data to match WaterBallSA branding
-- Replace generic courses with actual WaterBallSA courses

-- First, clear existing seed data
DELETE FROM lessons;
DELETE FROM chapters;
DELETE FROM curriculums;

-- Reset sequences
ALTER SEQUENCE curriculums_id_seq RESTART WITH 1;
ALTER SEQUENCE chapters_id_seq RESTART WITH 1;
ALTER SEQUENCE lessons_id_seq RESTART WITH 1;

-- Insert WaterBallSA curriculums
INSERT INTO curriculums (title, description, thumbnail_url, instructor_name, price, currency, is_published, difficulty_level, estimated_duration_hours, created_at, updated_at, published_at)
VALUES
    (
        '軟體設計模式精通之旅',
        '用一趟旅程的時間，成為硬核的 Coding 實戰高手。精進一套能延續的學習系統與思路。',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop',
        '水球潘',
        3000.00,
        'TWD',
        TRUE,
        'BEGINNER',
        40,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'AI x BDD：規格驅動全自動開發術',
        'AI Top 1% 工程師必修課，掌握規格驅動的全自動化開發',
        'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop',
        '水球潘',
        4500.00,
        'TWD',
        TRUE,
        'INTERMEDIATE',
        35,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'Java 從零開始',
        '從基礎到進階，完整掌握 Java 程式設計。學習物件導向程式設計、資料結構、演算法，並建立實務專案。適合初學者與中階程式設計師。',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop',
        '水球潘',
        2999.00,
        'TWD',
        TRUE,
        'BEGINNER',
        40,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'React & Next.js 現代網頁開發',
        '掌握 React 18 和 Next.js 14 的現代網頁開發技術。學習 TypeScript、伺服器元件、API 路由、身份驗證和部署策略。',
        'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop',
        '水球潘',
        3999.00,
        'TWD',
        TRUE,
        'INTERMEDIATE',
        35,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        '資料結構與演算法 (Python)',
        '完整涵蓋重要的資料結構與演算法。包含陣列、鏈結串列、樹、圖、排序、搜尋，以及使用 Python 實作動態規劃。',
        'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&h=400&fit=crop',
        '水球潘',
        2599.00,
        'TWD',
        TRUE,
        'ADVANCED',
        50,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        '機器學習入門',
        '使用 Python 開始機器學習之旅。學習監督式與非監督式學習、神經網路，以及使用 scikit-learn 和 TensorFlow 的實務應用。',
        'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=600&h=400&fit=crop',
        '水球潘',
        0.00,
        'TWD',
        TRUE,
        'INTERMEDIATE',
        30,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );

-- Insert chapters for 軟體設計模式精通之旅 (curriculum_id = 1)
INSERT INTO chapters (curriculum_id, title, description, order_index, is_published, estimated_duration_hours, created_at, updated_at)
VALUES
    (1, '設計模式基礎', '認識設計模式的基本概念與重要性', 0, TRUE, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1, '創建型模式', '學習 Singleton、Factory、Builder 等創建型模式', 1, TRUE, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1, '結構型模式', '掌握 Adapter、Decorator、Proxy 等結構型模式', 2, TRUE, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1, '行為型模式', '深入 Observer、Strategy、Command 等行為型模式', 3, TRUE, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1, '實戰專案', '將設計模式應用於實際專案開發', 4, TRUE, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert chapters for AI x BDD course (curriculum_id = 2)
INSERT INTO chapters (curriculum_id, title, description, order_index, is_published, estimated_duration_hours, created_at, updated_at)
VALUES
    (2, 'BDD 基礎概念', '了解行為驅動開發的核心思想', 0, TRUE, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 'Given-When-Then 規格撰寫', '學習如何撰寫清晰的 BDD 規格', 1, TRUE, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 'AI 輔助開發工具', '掌握 AI 工具來加速開發流程', 2, TRUE, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, '自動化測試整合', '整合 BDD 與自動化測試框架', 3, TRUE, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, '全自動開發實戰', '建立完整的 AI + BDD 開發流程', 4, TRUE, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert chapters for Java course (curriculum_id = 3)
INSERT INTO chapters (curriculum_id, title, description, order_index, is_published, estimated_duration_hours, created_at, updated_at)
VALUES
    (3, 'Java 入門', 'Java 程式語言介紹、環境設定與第一個程式', 0, TRUE, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, '物件導向程式設計', '學習類別、物件、繼承、多型與封裝', 1, TRUE, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, 'Java 資料結構', 'ArrayList、HashMap、LinkedList 等重要資料結構', 2, TRUE, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, '例外處理與檔案 I/O', '錯誤處理、try-catch 區塊與檔案操作', 3, TRUE, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, '實戰專案開發', '應用所學知識建立實務 Java 應用程式', 4, TRUE, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert sample lessons for 軟體設計模式精通之旅 - Chapter 1
INSERT INTO lessons (chapter_id, title, description, lesson_type, order_index, is_published, is_free_preview, content_metadata, duration_minutes, created_at, updated_at)
VALUES
    (1, '什麼是設計模式？', '了解設計模式的定義與歷史背景', 'VIDEO', 0, TRUE, TRUE, '{"videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "duration": 900}', 15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1, '為什麼需要設計模式', '探討設計模式解決的問題與價值', 'VIDEO', 1, TRUE, TRUE, '{"videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "duration": 1200}', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1, 'SOLID 原則', '學習物件導向設計的五大原則', 'VIDEO', 2, TRUE, FALSE, '{"videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "duration": 1800}', 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1, '設計模式分類', '認識創建型、結構型、行為型模式', 'ARTICLE', 3, TRUE, FALSE, '{"articleUrl": "https://refactoring.guru/design-patterns"}', 25, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert sample lessons for AI x BDD - Chapter 1
INSERT INTO lessons (chapter_id, title, description, lesson_type, order_index, is_published, is_free_preview, content_metadata, duration_minutes, created_at, updated_at)
VALUES
    (6, 'BDD 簡介', '認識行為驅動開發的基本概念', 'VIDEO', 0, TRUE, TRUE, '{"videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "duration": 900}', 15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (6, '傳統開發 vs BDD', '比較傳統開發方式與 BDD 的差異', 'VIDEO', 1, TRUE, TRUE, '{"videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "duration": 1200}', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (6, 'BDD 工具介紹', '了解 Cucumber、SpecFlow 等 BDD 工具', 'VIDEO', 2, TRUE, FALSE, '{"videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "duration": 1500}', 25, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert sample lessons for Java course - Chapter 1
INSERT INTO lessons (chapter_id, title, description, lesson_type, order_index, is_published, is_free_preview, content_metadata, duration_minutes, created_at, updated_at)
VALUES
    (11, 'Java 環境設定', '安裝 JDK 與設定開發環境', 'VIDEO', 0, TRUE, TRUE, '{"videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "duration": 1200}', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (11, '第一個 Java 程式', '撰寫並執行 Hello World', 'VIDEO', 1, TRUE, TRUE, '{"videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "duration": 900}', 15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (11, 'Java 基本語法', '學習變數、資料型別與運算子', 'VIDEO', 2, TRUE, FALSE, '{"videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "duration": 1800}', 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
