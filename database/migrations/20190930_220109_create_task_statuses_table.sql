CREATE TABLE task_statuses (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    organization_id INT(10) UNSIGNED NOT NULL,
    status VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
    sort_order INT(10) NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (organization_id) REFERENCES organizations (id),
    UNIQUE INDEX organizations_task_status_unique (organization_id, status)
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB;
