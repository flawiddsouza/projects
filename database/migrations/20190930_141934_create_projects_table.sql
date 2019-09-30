CREATE TABLE projects (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    organization_id INT(10) UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
    slug VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (organization_id) REFERENCES organizations (id),
    UNIQUE INDEX projects_slug_unique (organization_id, slug)
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB;
