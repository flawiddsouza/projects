CREATE TABLE task_priorities (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    organization_id INT(10) UNSIGNED NOT NULL,
    priority VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
    `default` BOOLEAN NOT NULL DEFAULT 0,
    sort_order INT(10) NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (organization_id) REFERENCES organizations (id),
    UNIQUE INDEX organization_id_priority_unique (organization_id, priority)
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB;

INSERT INTO task_priorities(organization_id, priority, `default`, sort_order)
SELECT
    id, 'High', 0, 1
FROM organizations;

INSERT INTO task_priorities(organization_id, priority, `default`, sort_order)
SELECT
    id, 'Normal', 1, 2
FROM organizations;

INSERT INTO task_priorities(organization_id, priority, `default`, sort_order)
SELECT
    id, 'Low', 0, 3
FROM organizations;
