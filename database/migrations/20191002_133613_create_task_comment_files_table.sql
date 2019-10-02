CREATE TABLE task_comment_files (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    task_comment_id INT(10) UNSIGNED NOT NULL,
    original_file_name VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
    saved_file_name VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
    file_size VARCHAR(10) NOT NULL COLLATE 'utf8mb4_unicode_ci',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (task_comment_id) REFERENCES task_comments (id)
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB;
