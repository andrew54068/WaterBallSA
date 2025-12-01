-- V16: Create level_thresholds table for gamification leveling system
-- This table stores the predefined level progression thresholds for the gamification system
-- It defines 36 levels with specific EXP requirements

CREATE TABLE level_thresholds (
    level INTEGER PRIMARY KEY,
    cumulative_exp_required INTEGER NOT NULL,
    exp_for_next_level INTEGER NULL, -- NULL for max level (36)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for efficient level lookups by EXP amount
CREATE INDEX idx_level_thresholds_cumulative_exp
ON level_thresholds(cumulative_exp_required DESC);

-- Insert all 36 level thresholds
-- Level progression: 1-2 (200), 2-3 (300), 3-4 (1000), 4-5 (1500), 5-36 (2000 each)
INSERT INTO level_thresholds (level, cumulative_exp_required, exp_for_next_level) VALUES
(1, 0, 200),
(2, 200, 300),
(3, 500, 1000),
(4, 1500, 1500),
(5, 3000, 2000),
(6, 5000, 2000),
(7, 7000, 2000),
(8, 9000, 2000),
(9, 11000, 2000),
(10, 13000, 2000),
(11, 15000, 2000),
(12, 17000, 2000),
(13, 19000, 2000),
(14, 21000, 2000),
(15, 23000, 2000),
(16, 25000, 2000),
(17, 27000, 2000),
(18, 29000, 2000),
(19, 31000, 2000),
(20, 33000, 2000),
(21, 35000, 2000),
(22, 37000, 2000),
(23, 39000, 2000),
(24, 41000, 2000),
(25, 43000, 2000),
(26, 45000, 2000),
(27, 47000, 2000),
(28, 49000, 2000),
(29, 51000, 2000),
(30, 53000, 2000),
(31, 55000, 2000),
(32, 57000, 2000),
(33, 59000, 2000),
(34, 61000, 2000),
(35, 63000, 2000),
(36, 65000, NULL); -- Max level

-- Add comment to table
COMMENT ON TABLE level_thresholds IS 'Configuration table for gamification level progression. Contains 36 predefined levels.';

COMMENT ON COLUMN level_thresholds.level IS 'Level number (1-36)';
COMMENT ON COLUMN level_thresholds.cumulative_exp_required IS 'Total EXP required to reach this level';
COMMENT ON COLUMN level_thresholds.exp_for_next_level IS 'EXP needed to advance to next level (NULL for max level)';
