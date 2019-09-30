CREATE TABLE tasks (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    project_id INT(10) UNSIGNED NOT NULL,
    date DATE NOT NULL,
    title VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
    task_type_id INT(10) UNSIGNED NOT NULL,
    task_status_id INT(10) UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (project_id) REFERENCES projects (id),
    FOREIGN KEY (task_type_id) REFERENCES task_types (id),
    FOREIGN KEY (task_status_id) REFERENCES task_statuses (id)
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB;
