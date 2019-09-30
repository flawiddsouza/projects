CREATE TABLE organization_members (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    organization_id INT(10) UNSIGNED NOT NULL,
    user_id INT(10) UNSIGNED NOT NULL,
    organization_role_id INT(10) UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (organization_id) REFERENCES organizations (id),
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (organization_role_id) REFERENCES organization_roles (id),
    UNIQUE INDEX organization_members_organization_id_user_id_unique (organization_id, user_id)
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB;
