UPDATE tasks,
(
    SELECT tasks.*, task_priorities.id as task_priority_id_to_update
    FROM tasks
    JOIN projects ON projects.id = tasks.project_id
    JOIN task_priorities ON task_priorities.organization_id = projects.organization_id
    AND task_priorities.default IS true
    WHERE tasks.task_priority_id IS NULL
) sub
SET tasks.task_priority_id = sub.task_priority_id_to_update
WHERE tasks.id = sub.id
