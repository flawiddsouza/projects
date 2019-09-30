CREATE TABLE organization_roles (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    organization_id INT(10) UNSIGNED NOT NULL,
    role VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
    task VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (organization_id) REFERENCES organizations (id),
    UNIQUE INDEX organizations_organization_role_unique (organization_id, role)
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB;
