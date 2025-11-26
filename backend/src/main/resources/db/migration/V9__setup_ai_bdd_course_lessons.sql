-- Setup AI x BDD course with specific YouTube URLs for lesson viewer
-- This migration configures the course structure as shown in the screenshots

-- Update chapter titles for AI x BDD course (curriculum_id = 2)
UPDATE chapters SET title = '課程介紹 & 試聽', description = '課程總覽與免費試聽內容' WHERE curriculum_id = 2 AND order_index = 0;
UPDATE chapters SET title = '副本零：冒險者指引', description = '開始你的 BDD 之旅' WHERE curriculum_id = 2 AND order_index = 1;

-- Delete existing lessons for AI x BDD course
DELETE FROM lessons WHERE chapter_id IN (SELECT id FROM chapters WHERE curriculum_id = 2);

-- Insert Chapter 0 lesson (Free preview)
INSERT INTO lessons (
  chapter_id,
  title,
  description,
  lesson_type,
  content_url,
  order_index,
  is_published,
  is_free_preview,
  content_metadata,
  duration_minutes,
  created_at,
  updated_at
)
SELECT
  id,
  'AI x BDD：規格驅動全自動開發術 | 一次到位的 AI Coding',
  'Vibe Coding 最大的問題就是沒有規格，導致開發過程充滿不確定性。本課程教你如何使用 AI 結合 BDD 規格驅動開發，打造高品質的軟體。',
  'VIDEO',
  'https://www.youtube.com/watch?v=W09vydJH6jo',
  0,
  TRUE,
  TRUE,
  '{"resolution": "1080p", "hasSubtitles": true}'::jsonb,
  25,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM chapters
WHERE curriculum_id = 2 AND order_index = 0;

-- Insert Chapter 1 lessons (Paid content)
INSERT INTO lessons (
  chapter_id,
  title,
  description,
  lesson_type,
  content_url,
  order_index,
  is_published,
  is_free_preview,
  content_metadata,
  duration_minutes,
  created_at,
  updated_at
)
SELECT
  id,
  '戰略戰術設計模式到底追求的是什麼？',
  '上一集中，水球開啟了全新的大章節「戰略戰術設計模式」，在這個章節中我們將會學習如何使用設計模式來提升程式碼的可維護性與擴展性。',
  'VIDEO',
  'https://www.youtube.com/watch?v=mOJzH0U_3EU',
  0,
  TRUE,
  FALSE,
  '{"resolution": "1080p", "hasSubtitles": true}'::jsonb,
  30,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM chapters
WHERE curriculum_id = 2 AND order_index = 1

UNION ALL

SELECT
  id,
  '水球軟體學院 2023 跨年頒獎典禮',
  '今年一樣抽免費軟設培訓！回顧 2023 年水球軟體學院的精彩時刻，並展望新的一年。',
  'VIDEO',
  'https://www.youtube.com/watch?v=MtdiKYAwjJw',
  1,
  TRUE,
  FALSE,
  '{"resolution": "1080p", "hasSubtitles": true}'::jsonb,
  45,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM chapters
WHERE curriculum_id = 2 AND order_index = 1;
