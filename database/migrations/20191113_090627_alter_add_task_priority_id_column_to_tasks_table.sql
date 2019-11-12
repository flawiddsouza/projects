ALTER TABLE tasks
ADD COLUMN task_priority_id INT(10) UNSIGNED NULL AFTER project_category_id,
ADD FOREIGN KEY (task_priority_id) REFERENCES task_priorities (id);
