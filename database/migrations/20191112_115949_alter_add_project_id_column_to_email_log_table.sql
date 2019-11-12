ALTER TABLE email_log
ADD COLUMN project_id INT(10) UNSIGNED NULL AFTER id,
ADD FOREIGN KEY (project_id) REFERENCES projects (id);
