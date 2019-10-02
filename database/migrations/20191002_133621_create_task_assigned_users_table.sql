CREATE TABLE task_assigned_users (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    task_id INT(10) UNSIGNED NOT NULL,
    user_id INT(10) UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (task_id) REFERENCES tasks (id),
    FOREIGN KEY (user_id) REFERENCES users (id),
    UNIQUE INDEX task_id_user_id_unique (task_id, user_id)
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB;
