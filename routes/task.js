const express = require('express')
const router = express.Router()
const dbQuery =  require('../libs/db')

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

module.exports = router
