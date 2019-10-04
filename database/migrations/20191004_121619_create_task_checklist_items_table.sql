CREATE TABLE task_checklist_items (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    task_id INT(10) UNSIGNED NOT NULL,
    task_checklist_id INT(10) UNSIGNED NOT NULL,
    content VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
    sort_order INT(10) NOT NULL DEFAULT 1,
    checked TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (task_id) REFERENCES tasks (id),
    FOREIGN KEY (task_checklist_id) REFERENCES task_checklists (id)
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB;
