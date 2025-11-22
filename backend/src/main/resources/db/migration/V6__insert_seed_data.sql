-- Seed Data for Development
-- This migration creates sample curriculums, chapters, and lessons for testing

-- Insert sample users
INSERT INTO users (google_id, email, name, profile_picture_url, total_exp, current_level, created_at, updated_at)
VALUES
    ('google123', 'john.doe@example.com', 'John Doe', 'https://ui-avatars.com/api/?name=John+Doe', 500, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('google456', 'jane.smith@example.com', 'Jane Smith', 'https://ui-avatars.com/api/?name=Jane+Smith', 1200, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('google789', 'bob.wilson@example.com', 'Bob Wilson', 'https://ui-avatars.com/api/?name=Bob+Wilson', 250, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert sample curriculums
INSERT INTO curriculums (title, description, thumbnail_url, instructor_name, price, currency, is_published, difficulty_level, estimated_duration_hours, created_at, updated_at, published_at)
VALUES
    (
        'Complete Java Programming Masterclass',
        'Learn Java from scratch to advanced concepts. Master object-oriented programming, data structures, algorithms, and build real-world applications. Perfect for beginners and intermediate programmers.',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
        'Dr. Alan Turing',
        99.99,
        'USD',
        TRUE,
        'BEGINNER',
        40,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'Modern Web Development with React & Next.js',
        'Master modern web development using React 18 and Next.js 14. Learn TypeScript, server components, API routes, authentication, and deployment strategies.',
        'https://images.unsplash.com/photo-1633356122544-f134324a6cee',
        'Sarah Chen',
        149.99,
        'USD',
        TRUE,
        'INTERMEDIATE',
        35,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'Data Structures & Algorithms in Python',
        'Comprehensive course covering essential data structures and algorithms. Includes arrays, linked lists, trees, graphs, sorting, searching, and dynamic programming with Python implementations.',
        'https://images.unsplash.com/photo-1526379095098-d400fd0bf935',
        'Prof. Donald Knuth',
        79.99,
        'USD',
        TRUE,
        'ADVANCED',
        50,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'Introduction to Machine Learning',
        'Get started with machine learning using Python. Learn supervised and unsupervised learning, neural networks, and practical ML applications using scikit-learn and TensorFlow.',
        'https://images.unsplash.com/photo-1555255707-c07966088b7b',
        'Dr. Andrew Ng',
        0.00,
        'USD',
        TRUE,
        'INTERMEDIATE',
        30,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'Database Design & SQL Mastery',
        'Master relational database design and SQL. Learn normalization, indexing, query optimization, transactions, and work with PostgreSQL and MySQL.',
        'https://images.unsplash.com/photo-1544383835-bda2bc66a55d',
        'Michael Johnson',
        89.99,
        'USD',
        TRUE,
        'BEGINNER',
        25,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );

-- Insert chapters for Java Programming course (curriculum_id = 1)
INSERT INTO chapters (curriculum_id, title, description, order_index, is_published, estimated_duration_hours, created_at, updated_at)
VALUES
    (1, 'Getting Started with Java', 'Introduction to Java programming language, setup, and first programs', 0, TRUE, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1, 'Object-Oriented Programming', 'Learn classes, objects, inheritance, polymorphism, and encapsulation', 1, TRUE, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1, 'Data Structures in Java', 'ArrayList, HashMap, LinkedList, and other essential data structures', 2, TRUE, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1, 'Exception Handling & File I/O', 'Error handling, try-catch blocks, and working with files', 3, TRUE, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1, 'Building Real Projects', 'Apply your knowledge to build practical Java applications', 4, TRUE, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert chapters for React/Next.js course (curriculum_id = 2)
INSERT INTO chapters (curriculum_id, title, description, order_index, is_published, estimated_duration_hours, created_at, updated_at)
VALUES
    (2, 'React Fundamentals', 'Components, props, state, and hooks', 0, TRUE, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 'Next.js Essentials', 'Pages, routing, layouts, and server components', 1, TRUE, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 'TypeScript Integration', 'Type safety and TypeScript best practices', 2, TRUE, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 'API Development', 'Building REST APIs with Next.js API routes', 3, TRUE, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 'Deployment & Production', 'Deploying to Vercel and production optimization', 4, TRUE, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert chapters for Data Structures course (curriculum_id = 3)
INSERT INTO chapters (curriculum_id, title, description, order_index, is_published, estimated_duration_hours, created_at, updated_at)
VALUES
    (3, 'Arrays & Linked Lists', 'Foundation data structures and operations', 0, TRUE, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, 'Stacks, Queues & Hash Tables', 'Essential data structures for problem solving', 1, TRUE, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, 'Trees & Binary Search Trees', 'Hierarchical data structures and tree traversal', 2, TRUE, 12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, 'Graphs & Graph Algorithms', 'Graph representations, BFS, DFS, and shortest paths', 3, TRUE, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, 'Sorting & Dynamic Programming', 'Advanced algorithms and optimization techniques', 4, TRUE, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert lessons for "Getting Started with Java" chapter (chapter_id = 1)
INSERT INTO lessons (chapter_id, title, description, lesson_type, content_url, order_index, duration_minutes, is_free_preview, is_published, created_at, updated_at, content_metadata)
VALUES
    (1, 'Welcome to Java Programming', 'Course introduction and what you will learn', 'VIDEO', 'https://www.youtube.com/watch?v=eIrMbAQSU34', 0, 15, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"resolution": "1080p", "hasSubtitles": true}'::jsonb),
    (1, 'Installing Java JDK', 'Step-by-step guide to install Java Development Kit', 'VIDEO', 'https://www.youtube.com/watch?v=WRISYpKhIrc', 1, 20, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"resolution": "1080p", "hasSubtitles": true}'::jsonb),
    (1, 'Setting up IntelliJ IDEA', 'Configure your development environment', 'ARTICLE', 'https://www.jetbrains.com/help/idea/getting-started.html', 2, 15, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"wordCount": 1200, "readingLevel": "beginner"}'::jsonb),
    (1, 'Your First Java Program', 'Write and run your first Hello World program', 'VIDEO', 'https://www.youtube.com/watch?v=GoXwIVyNvX0', 3, 25, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"resolution": "1080p", "hasSubtitles": true}'::jsonb),
    (1, 'Variables and Data Types', 'Understanding primitive types and variables', 'VIDEO', 'https://www.youtube.com/watch?v=so1iUWaLmKA', 4, 30, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"resolution": "1080p", "hasSubtitles": true}'::jsonb),
    (1, 'Knowledge Check: Java Basics', 'Test your understanding of Java fundamentals', 'SURVEY', '/surveys/java-basics', 5, 10, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"questionCount": 10, "passingScore": 70}'::jsonb);

-- Insert lessons for "React Fundamentals" chapter (chapter_id = 6)
INSERT INTO lessons (chapter_id, title, description, lesson_type, content_url, order_index, duration_minutes, is_free_preview, is_published, created_at, updated_at, content_metadata)
VALUES
    (6, 'Introduction to React', 'What is React and why use it?', 'VIDEO', 'https://www.youtube.com/watch?v=Tn6-PIqc4UM', 0, 20, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"resolution": "1080p", "hasSubtitles": true}'::jsonb),
    (6, 'Components & JSX', 'Building blocks of React applications', 'VIDEO', 'https://www.youtube.com/watch?v=N3AkSS5hXMA', 1, 35, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"resolution": "1080p", "hasSubtitles": true}'::jsonb),
    (6, 'Props and Component Communication', 'Passing data between components', 'VIDEO', 'https://www.youtube.com/watch?v=m7OWXtbiXX8', 2, 30, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"resolution": "1080p", "hasSubtitles": true}'::jsonb),
    (6, 'State Management with useState', 'Managing component state effectively', 'VIDEO', 'https://www.youtube.com/watch?v=-bEQt8mvOrY', 3, 40, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"resolution": "1080p", "hasSubtitles": true}'::jsonb),
    (6, 'React Hooks Deep Dive', 'useEffect, useMemo, useCallback explained', 'ARTICLE', 'https://react.dev/reference/react', 4, 45, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"wordCount": 3500, "readingLevel": "intermediate"}'::jsonb);

-- Insert lessons for "Arrays & Linked Lists" chapter (chapter_id = 11)
INSERT INTO lessons (chapter_id, title, description, lesson_type, content_url, order_index, duration_minutes, is_free_preview, is_published, created_at, updated_at, content_metadata)
VALUES
    (11, 'Array Fundamentals', 'Understanding arrays and array operations', 'VIDEO', 'https://www.youtube.com/watch?v=55l-aZ7_F24', 0, 25, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"resolution": "1080p", "hasSubtitles": true}'::jsonb),
    (11, 'Two Pointer Technique', 'Solving array problems efficiently', 'VIDEO', 'https://www.youtube.com/watch?v=On03HWe2tZM', 1, 35, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"resolution": "1080p", "hasSubtitles": true}'::jsonb),
    (11, 'Introduction to Linked Lists', 'Singly and doubly linked lists explained', 'VIDEO', 'https://www.youtube.com/watch?v=WwfhLC16bis', 2, 40, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"resolution": "1080p", "hasSubtitles": true}'::jsonb),
    (11, 'Linked List Implementation in Python', 'Code walkthrough and best practices', 'ARTICLE', 'https://realpython.com/linked-lists-python/', 3, 30, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"wordCount": 2800, "codeExamples": 15}'::jsonb),
    (11, 'Practice Problems', 'Solve common array and linked list problems', 'SURVEY', '/surveys/array-problems', 4, 20, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"questionCount": 8, "difficulty": "medium"}'::jsonb);

-- Insert some lessons for the free Machine Learning course
INSERT INTO chapters (curriculum_id, title, description, order_index, is_published, estimated_duration_hours, created_at, updated_at)
VALUES
    (4, 'Introduction to Machine Learning', 'ML fundamentals and types of learning', 0, TRUE, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (4, 'Supervised Learning', 'Regression and classification algorithms', 1, TRUE, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (4, 'Unsupervised Learning', 'Clustering and dimensionality reduction', 2, TRUE, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO lessons (chapter_id, title, description, lesson_type, content_url, order_index, duration_minutes, is_free_preview, is_published, created_at, updated_at, content_metadata)
VALUES
    (16, 'What is Machine Learning?', 'Introduction to ML concepts', 'VIDEO', 'https://www.youtube.com/watch?v=ukzFI9rgwfU', 0, 30, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"resolution": "1080p", "hasSubtitles": true}'::jsonb),
    (16, 'Types of Machine Learning', 'Supervised, unsupervised, and reinforcement learning', 'ARTICLE', 'https://www.ibm.com/cloud/learn/machine-learning', 1, 20, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"wordCount": 1500}'::jsonb),
    (17, 'Linear Regression', 'Understanding and implementing linear regression', 'VIDEO', 'https://www.youtube.com/watch?v=nk2CQITm_eo', 0, 45, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"resolution": "1080p", "hasSubtitles": true}'::jsonb);
