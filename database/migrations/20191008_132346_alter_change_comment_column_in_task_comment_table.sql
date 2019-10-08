ALTER TABLE task_comments
CHANGE COLUMN comment comment TEXT NULL
COLLATE 'utf8mb4_unicode_ci'
AFTER user_id;
