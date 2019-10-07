CREATE TABLE admins (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    organization_id INT(10) UNSIGNED NULL,
    user_id INT(10) UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (organization_id) REFERENCES organizations (id),
    UNIQUE INDEX user_id_organization_id_unique (user_id, organization_id)
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB;

-- if an entry doesn't have an organization_id then that means it's a super admin
-- if an entry has an organization_id then that means it's a organization admin
