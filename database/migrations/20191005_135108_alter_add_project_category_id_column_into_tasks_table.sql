ALTER TABLE tasks
ADD project_category_id INT(10) UNSIGNED NULL
AFTER task_status_id;

ALTER TABLE tasks
ADD FOREIGN KEY (project_category_id) REFERENCES project_categories (id);
