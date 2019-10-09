CREATE TABLE task_sub_tasks (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    task_id INT(10) UNSIGNED NOT NULL,
    sub_task_id INT(10) UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (task_id) REFERENCES tasks (id),
    FOREIGN KEY (sub_task_id) REFERENCES tasks (id),
    UNIQUE INDEX task_id_sub_task_id_unique (task_id, sub_task_id)
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB;
