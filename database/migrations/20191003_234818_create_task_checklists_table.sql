CREATE TABLE task_checklists (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    task_type_id INT(10) UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (task_type_id) REFERENCES task_types (id),
    UNIQUE INDEX task_type_id_name_unique (task_type_id, name)
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB;
