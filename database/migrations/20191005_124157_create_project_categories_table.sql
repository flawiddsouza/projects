CREATE TABLE project_categories (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    project_id INT(10) UNSIGNED NOT NULL,
    category VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (project_id) REFERENCES projects (id),
    UNIQUE INDEX project_id_category_unique (project_id, category)
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB;
