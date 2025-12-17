INSERT INTO curriculums (id, title, description, instructor_name, price, currency, difficulty_level, estimated_duration_hours, is_published, published_at, created_at, updated_at)
VALUES (1, 'E2E Curriculum', 'Curriculum for E2E testing', 'E2E Instructor', 0, 'TWD', 'BEGINNER', 10, true, NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO chapters (id, curriculum_id, title, description, order_index, created_at, updated_at)
VALUES (1, 1, 'E2E Chapter', 'Chapter for E2E testing', 1, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO lessons (id, chapter_id, title, description, lesson_type, content_url, content_metadata, order_index, duration_minutes, is_free_preview, created_at, updated_at)
VALUES 
(1, 1, 'E2E Video Lesson', 'A video lesson for E2E testing', 'VIDEO', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, 1, 5, true, NOW(), NOW()),
(100, 1, 'E2E Article Lesson', 'An article lesson for E2E testing', 'ARTICLE', 'https://example.com/article', '{"wordCount": 1200, "readingLevel": "beginner", "estimatedTime": 10}', 100, 10, true, NOW(), NOW()),
(101, 1, 'E2E Survey Lesson', 'A survey lesson for E2E testing', 'SURVEY', 'https://google.com', '{"questionCount": 10, "passingScore": 80, "difficulty": "Medium"}', 101, 15, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
title = EXCLUDED.title,
description = EXCLUDED.description,
lesson_type = EXCLUDED.lesson_type,
content_url = EXCLUDED.content_url,
content_metadata = EXCLUDED.content_metadata,
updated_at = NOW();

-- Ensure sequence is updated if needed (optional for explicit ID inserts)
SELECT setval('lessons_id_seq', (SELECT MAX(id) FROM lessons));
