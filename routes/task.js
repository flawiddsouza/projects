const express = require('express')
const router = express.Router()
const { dbQuery } =  require('../libs/cjs/db')

router.get('/', async(req, res) => {
    const task = await dbQuery(`
        SELECT
            tasks.id,
            tasks.date,
            tasks.title,
            task_types.type,
            task_statuses.status,
            project_categories.category as project_category,
            tasks.task_type_id,
            tasks.task_status_id,
            tasks.project_category_id,
            organizations.name as organization_name,
            organizations.slug as organization_slug,
            projects.name as project_name,
            projects.slug as project_slug
        FROM tasks
        JOIN task_types ON task_types.id = tasks.task_type_id
        JOIN task_statuses ON task_statuses.id = tasks.task_status_id
        LEFT JOIN project_categories ON project_categories.id = tasks.project_category_id
        JOIN projects ON projects.id = tasks.project_id
        JOIN organizations ON organizations.id = projects.organization_id
        WHERE tasks.id = ?
    `, [req.taskId])

    const taskTypes = await dbQuery(`
        SELECT task_types.id, task_types.type FROM task_types
        JOIN organizations ON organizations.id = task_types.organization_id
        JOIN projects ON projects.organization_id = organizations.id
        WHERE projects.id = ?
        ORDER BY task_types.sort_order
    `, [req.projectId])

    const taskStatuses = await dbQuery(`
        SELECT task_statuses.id, task_statuses.status FROM task_statuses
        JOIN organizations ON organizations.id = task_statuses.organization_id
        JOIN projects ON projects.organization_id = organizations.id
        WHERE projects.id = ?
        ORDER BY task_statuses.sort_order
    `, [req.projectId])

    const projectCategories = await dbQuery(`
        SELECT id, category
        FROM project_categories
        WHERE project_categories.project_id = ?
        ORDER BY category
    `, [req.projectId])

    res.json({ task: task[0], taskTypes, taskStatuses, projectCategories })
})

router.get('/counts', async(req, res) => {
    let duration = (await dbQuery(`
        SELECT
            SUM(TIMESTAMPDIFF(SECOND, task_time_spends.start_date_time, task_time_spends.end_date_time)) as duration
        FROM task_time_spends
        WHERE task_id = ?
    `, [req.taskId]))[0].duration

    res.json({
        comments: (await dbQuery('SELECT COUNT(*) as count FROM task_comments WHERE task_id = ?', [req.taskId]))[0].count,
        files: (await dbQuery(`
            SELECT COUNT(*) as count FROM task_comment_files
            JOIN task_comments ON task_comments.id = task_comment_files.task_comment_id
            WHERE task_comments.task_id = ?
        `, [req.taskId]))[0].count,
        assigned: (await dbQuery('SELECT COUNT(*) as count FROM task_assigned_users WHERE task_id = ?', [req.taskId]))[0].count,
        timeSpends: {
            count: (await dbQuery('SELECT COUNT(*) as count FROM task_time_spends WHERE task_id = ?', [req.taskId]))[0].count,
            duration: duration ? duration : 0
        }
    })
})

router.get('/comments', async(req, res) => {
    let comments = await dbQuery(`
        SELECT
            task_comments.id,
            CONCAT(
                users.name,
                (CASE WHEN users.id = ? THEN ' (you)' ELSE '' END)
            ) as user,
            task_comments.comment,
            task_comments.created_at,
            task_comments.updated_at,
            (CASE WHEN users.id = ? THEN true ELSE false END) as you
        FROM task_comments
        JOIN users ON users.id = task_comments.user_id
        WHERE task_comments.task_id = ?
        ORDER BY task_comments.created_at
    `, [req.authUserId, req.authUserId, req.taskId])
    res.json(comments)
})

router.post('/comment', async(req, res) => {
    let insertedRecord = await dbQuery(`
        INSERT INTO task_comments(task_id, user_id, comment) VALUES(?, ?, ?)
    `, [req.taskId, req.authUserId, req.body.comment])
    res.json({ status: 'success', data: { insertedId: insertedRecord } })
})

router.put('/comment/:id', async(req, res) => {
    await dbQuery(`
        UPDATE task_comments
        SET comment = ?, updated_at=CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
    `, [req.body.comment, req.params.id, req.authUserId])
    res.json({ status: 'success' })
})

router.delete('/comment/:id', async(req, res) => {
    await dbQuery(`
        DELETE FROM task_comments
        WHERE id = ? AND user_id = ?
    `, [req.params.id, req.authUserId])
    res.json({ status: 'success' })
})

router.get('/files', async(req, res) => {
    let comments = await dbQuery(`
        SELECT task_comment_files.id, task_comment_files.created_at, task_comment_files.original_file_name, task_comment_files.saved_file_name, task_comment_files.file_size
        FROM task_comment_files
        JOIN task_comments ON task_comments.id = task_comment_files.task_comment_id
        WHERE task_comments.task_id = ?
        ORDER BY task_comment_files.created_at
    `, [req.taskId])
    res.json(comments)
})

router.get('/time-spends', async(req, res) => {
    let timeSpends = await dbQuery(`
        SELECT
            task_time_spends.id,
            task_time_spends.description,
            task_time_spends.start_date_time,
            task_time_spends.end_date_time,
            CONCAT(
                users.name,
                (CASE WHEN users.id = ? THEN ' (you)' ELSE '' END)
            ) as user,
            (CASE
                WHEN task_time_spends.end_date_time IS NOT NULL THEN
                    TIMESTAMPDIFF(SECOND, task_time_spends.start_date_time, task_time_spends.end_date_time)
                ELSE
                    ''
                END
            ) as duration
        FROM task_time_spends
        JOIN users ON users.id = task_time_spends.user_id
        WHERE task_time_spends.task_id = ?
        ORDER BY task_time_spends.start_date_time
    `, [req.authUserId, req.taskId])
    res.json(timeSpends)
})

router.get('/assigned-users', async(req, res) => {
    let assignedUsers = await dbQuery(`
        SELECT
            task_assigned_users.id,
            CONCAT(
                users.name,
                (CASE WHEN users.id = ? THEN ' (you)' ELSE '' END)
            ) as user
        FROM task_assigned_users
        JOIN users ON users.id = task_assigned_users.user_id
        WHERE task_assigned_users.task_id = ?
    `, [req.authUserId, req.taskId])
    let assignableUsers = await dbQuery(`
        SELECT
            users.id,
            CONCAT(
                users.name,
                (CASE WHEN users.id = ? THEN ' (you)' ELSE '' END)
            ) as user
        FROM project_members
        JOIN organization_members ON organization_members.id = project_members.organization_member_id
        JOIN users ON users.id = organization_members.user_id
        JOIN tasks ON tasks.project_id = project_members.project_id
        LEFT JOIN task_assigned_users ON task_assigned_users.user_id = users.id
        AND task_assigned_users.task_id = tasks.id
        WHERE tasks.id = ?
        AND task_assigned_users.id IS NULL
    `, [req.authUserId, req.taskId])
    res.json({
        assignableUsers,
        assignedUsers
    })
})

router.post('/assigned-user', async(req, res) => {
    let insertedRecord = await dbQuery(`
        INSERT INTO task_assigned_users(task_id, user_id) VALUES(?, ?)
    `, [req.taskId, req.body.user_id])
    res.json({ status: 'success', data: { insertedId: insertedRecord } })
})

router.delete('/assigned-user/:id', async(req, res) => {
    await dbQuery(`
        DELETE FROM task_assigned_users
        WHERE id = ?
    `, [req.params.id])
    res.json({ status: 'success' })
})

router.post('/time-spend', async(req, res) => {
    let insertedRecord = await dbQuery(`
        INSERT INTO task_time_spends(task_id, user_id, description, start_date_time, end_date_time) VALUES(?, ?, ?, ?, ?)
    `, [req.taskId, req.authUserId, req.body.description, req.body.start_date_time, req.body.end_date_time])
    res.json({ status: 'success', data: { insertedId: insertedRecord } })
})

router.put('/time-spend/:id', async(req, res) => {
    await dbQuery(`
        UPDATE task_time_spends
        SET description = ?, start_date_time = ?, end_date_time = ?, updated_at=CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
    `, [req.body.description, req.body.start_date_time, req.body.end_date_time, req.params.id, req.authUserId])
    res.json({ status: 'success' })
})

router.delete('/time-spend/:id', async(req, res) => {
    await dbQuery(`
        DELETE FROM task_time_spends
        WHERE id = ? AND user_id = ?
    `, [req.params.id, req.authUserId])
    res.json({ status: 'success' })
})

router.put('/update/:field', async(req, res) => {
    if(req.params.field === 'date' || req.params.field === 'title' || req.params.field === 'task_type_id' || req.params.field === 'task_status_id' || req.params.field === 'project_category_id') {
        await dbQuery(`
            UPDATE tasks
            SET ${req.params.field} = ?
            WHERE id = ?
        `, [req.body[req.params.field], req.taskId])
        res.json({ status: 'success' })
    } else {
        res.json({ status: 'error' })
    }
})

router.get('/checklists', async(req, res) => {
    const checklists = await dbQuery(`
        SELECT task_checklists.id, task_checklists.name
        FROM task_checklists
        JOIN tasks ON tasks.task_type_id = task_checklists.task_type_id
        WHERE tasks.id = ?
        ORDER BY task_checklists.sort_order
    `, [req.taskId])
    let checklistCount = {}
    for(const checklist of checklists) {
        let count = await dbQuery(`
            SELECT COUNT(*) as count FROM task_checklist_items
            WHERE task_id = ?
            AND task_checklist_id = ?
        `, [req.taskId, checklist.id])
        let checked = await dbQuery(`
            SELECT COUNT(*) as count FROM task_checklist_items
            WHERE task_id = ?
            AND task_checklist_id = ?
            AND checked = 1
        `, [req.taskId, checklist.id])
        checklistCount[checklist.id] = {
            count: count[0].count,
            checked: checked[0].count
        }
    }
    res.json({ checklists, checklistCount })
})

router.get('/checklist-items/:task_checklist_id', async(req, res) => {
    const checklistsItems = await dbQuery(`
        SELECT id, content, checked, sort_order
        FROM task_checklist_items
        WHERE task_id = ?
        AND task_checklist_id = ?
        ORDER by sort_order
    `, [req.taskId, req.params.task_checklist_id])
    res.json(checklistsItems)
})

router.post('/checklist-item/:task_checklist_id', async(req, res) => {
    await dbQuery(`
        INSERT INTO task_checklist_items(task_id, task_checklist_id, content, sort_order)
        VALUES(?, ?, ?, ?)
    `, [req.taskId, req.params.task_checklist_id, req.body.content, req.body.sort_order])
    res.json({ status: 'success' })
})

router.put('/checklist-item/:id/checked', async(req, res) => {
    await dbQuery(`
        UPDATE task_checklist_items
        SET checked = ?
        WHERE id = ?
    `, [req.body.checked, req.params.id])
    res.json({ status: 'success' })
})

module.exports = router
