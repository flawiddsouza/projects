CREATE TABLE project_members (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    project_id INT(10) UNSIGNED NOT NULL,
    organization_member_id INT(10) UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (project_id) REFERENCES projects (id),
    FOREIGN KEY (organization_member_id) REFERENCES organization_members (id),
    UNIQUE INDEX project_members_project_id_organization_member_id_unique (project_id, organization_member_id)
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB;
