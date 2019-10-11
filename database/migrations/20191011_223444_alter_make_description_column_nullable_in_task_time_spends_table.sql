ALTER TABLE task_time_spends
CHANGE COLUMN description description TEXT NULL
COLLATE 'utf8mb4_unicode_ci'
AFTER user_id;
