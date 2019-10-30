CREATE TABLE email_log (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
    subject TEXT NOT NULL COLLATE 'utf8mb4_unicode_ci',
    body TEXT NOT NULL COLLATE 'utf8mb4_unicode_ci',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB;
