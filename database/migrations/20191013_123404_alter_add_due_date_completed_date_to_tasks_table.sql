ALTER TABLE tasks
ADD COLUMN due_date DATE NULL AFTER project_category_id,
ADD COLUMN completed_date DATE NULL AFTER due_date;
