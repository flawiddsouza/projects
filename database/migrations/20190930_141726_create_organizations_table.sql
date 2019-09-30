CREATE TABLE `organizations` (
    `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
    `slug` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `users_slug_unique` (`slug`)
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB;
