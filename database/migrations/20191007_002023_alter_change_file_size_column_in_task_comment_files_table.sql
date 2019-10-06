ALTER TABLE `task_comment_files`
ALTER `file_size`
DROP DEFAULT;

ALTER TABLE `task_comment_files`
CHANGE COLUMN `file_size` `file_size` BIGINT NOT NULL
COLLATE 'utf8mb4_unicode_ci'
AFTER `saved_file_name`;
