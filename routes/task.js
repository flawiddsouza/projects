const express = require('express')
const router = express.Router()
const dbQuery =  require('../libs/db')

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
        SELECT task_comments.id, users.name as user, task_comments.comment, task_comments.created_at, task_comments.updated_at,
        (CASE WHEN users.id = ? THEN true ELSE false END) as you
        FROM task_comments
        JOIN users ON users.id = task_comments.user_id
        WHERE task_comments.task_id = ?
        ORDER BY task_comments.created_at
    `, [req.authUserId, req.taskId])
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
        SELECT task_time_spends.id, task_time_spends.description, task_time_spends.start_date_time, task_time_spends.end_date_time, users.name as user,
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
    `, [req.taskId])
    res.json(timeSpends)
})

router.get('/assigned-users', async(req, res) => {
    let assignedUsers = await dbQuery(`
        SELECT task_assigned_users.id, users.name as user
        FROM task_assigned_users
        JOIN users ON users.id = task_assigned_users.user_id
        WHERE task_assigned_users.task_id = ?
    `, [req.taskId])
    let assignableUsers = await dbQuery(`
        SELECT users.id, users.name as user
        FROM project_members
        JOIN organization_members ON organization_members.id = project_members.organization_member_id
        JOIN users ON users.id = organization_members.user_id
        JOIN tasks ON tasks.project_id = project_members.project_id
        LEFT JOIN task_assigned_users ON task_assigned_users.user_id = users.id
        AND task_assigned_users.task_id = tasks.id
        WHERE tasks.id = ?
        AND task_assigned_users.id IS NULL
    `, [req.taskId])
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

module.exports = router
