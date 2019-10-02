CREATE TABLE task_time_spends (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    task_id INT(10) UNSIGNED NOT NULL,
    user_id INT(10) UNSIGNED NOT NULL,
    description TEXT NOT NULL COLLATE 'utf8mb4_unicode_ci',
    start_date_time DATETIME NOT NULL,
    end_date_time DATETIME NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (task_id) REFERENCES tasks (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB;
