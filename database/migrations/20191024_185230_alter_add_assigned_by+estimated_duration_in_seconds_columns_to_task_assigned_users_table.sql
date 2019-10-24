ALTER TABLE task_assigned_users
ADD COLUMN estimated_duration_in_seconds INT(10) UNSIGNED NULL AFTER user_id,
ADD COLUMN assigned_by INT(10) UNSIGNED NULL AFTER estimated_duration_in_seconds,
ADD FOREIGN KEY (assigned_by) REFERENCES users (id);
