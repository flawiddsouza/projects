ALTER TABLE task_checklist_items
CHANGE content content text
COLLATE 'utf8mb4_unicode_ci' NOT NULL
AFTER task_checklist_id;
