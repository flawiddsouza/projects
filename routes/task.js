const express = require('express')
const router = express.Router()
const { dbQuery } =  require('../libs/cjs/db')
const path = require('path')
const fs = require('fs')
const notifyUserByEmailTaskAssigned =  require('../libs/cjs/notifyUserByEmailTaskAssigned')

async function getCompletedTaskStatusId(projectId) {
    let completedTaskStatusId = await dbQuery(`
        SELECT task_statuses.id FROM projects
        JOIN task_statuses ON task_statuses.organization_id = projects.organization_id
        WHERE projects.id = ?
        ORDER BY task_statuses.sort_order DESC
        LIMIT 1
    `, [projectId])

    if(completedTaskStatusId.length > 0) {
        completedTaskStatusId = completedTaskStatusId[0].id
    } else {
        completedTaskStatusId = null
    }

    return completedTaskStatusId
}

router.get('/', async(req, res) => {
    let completedTaskStatusId = await getCompletedTaskStatusId(req.projectId)

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
            tasks.due_date,
            tasks.completed_date,
            CASE WHEN tasks.task_status_id = ? THEN true ELSE false END as completed,
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
    `, [completedTaskStatusId, req.taskId])

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

    let completedTaskStatusId = await getCompletedTaskStatusId(req.projectId)

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
        },
        subTasks: {
            count: (await dbQuery('SELECT COUNT(*) as count FROM task_sub_tasks WHERE task_id = ?', [req.taskId]))[0].count,
            completedCount: (await dbQuery(`
                SELECT COUNT(*) as count
                FROM task_sub_tasks
                JOIN tasks ON tasks.id = task_sub_tasks.sub_task_id
                WHERE task_sub_tasks.task_id = ?
                AND tasks.task_status_id = ?
            `, [req.taskId, completedTaskStatusId]))[0].count
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

    let commentFiles = await dbQuery(`
        SELECT task_comment_files.id, task_comment_files.original_file_name, task_comment_files.saved_file_name, task_comment_files.file_size, task_comment_files.task_comment_id
        FROM task_comment_files
        JOIN task_comments ON task_comments.id = task_comment_files.task_comment_id
        WHERE task_comments.task_id = ?
    `, [req.taskId])

    for(const i in comments) {
        comments[i].files = commentFiles.filter(commentFile => commentFile.task_comment_id === comments[i].id)
    }

    res.json(comments)
})

router.post('/comment', async(req, res) => {
    let insertedRecord = await dbQuery(`
        INSERT INTO task_comments(task_id, user_id, comment) VALUES(?, ?, ?)
    `, [req.taskId, req.authUserId, req.body.comment])
    res.json({ status: 'success', data: { insertedId: insertedRecord.insertId } })
})

const uploadDir = path.join(__dirname, '..', 'static', 'uploads')

async function uploadCommentFile(req, file) {
    const uploadFileName = new Date().getTime() + '_' + file.name
    file.mv(path.join(uploadDir, uploadFileName))
    await dbQuery(`
        INSERT INTO task_comment_files(task_comment_id, original_file_name, saved_file_name, file_size) VALUES(?, ?, ?, ?)
    `, [req.params.comment_id, file.name, uploadFileName, file.size])
}

router.post('/comment-files/:comment_id', async(req, res) => {
    if(req.files.files.hasOwnProperty('length')) {
        for(const file of req.files.files) {
            await uploadCommentFile(req, file)
        }
    } else {
        await uploadCommentFile(req, req.files.files)
    }
    res.json({ status: 'success' })
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
    let commentFiles = await dbQuery(`
        SELECT saved_file_name
        FROM task_comment_files
        WHERE task_comment_id = ?
    `, [req.params.id])

    for(const commentFile of commentFiles) {
        fs.unlink(path.join(uploadDir, commentFile.saved_file_name), (err) => {
            if(err) {
                console.log(err)
            }
        })
    }

    await dbQuery(`
        DELETE FROM task_comment_files
        WHERE task_comment_id = ?
    `, [req.params.id])

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
            task_assigned_users.user_id,
            CONCAT(
                users.name,
                (CASE WHEN users.id = ? THEN ' (you)' ELSE '' END)
            ) as user,
            (CASE WHEN users.id = ? THEN true ELSE false END) as you
        FROM task_assigned_users
        JOIN users ON users.id = task_assigned_users.user_id
        WHERE task_assigned_users.task_id = ?
    `, [req.authUserId, req.authUserId, req.taskId])
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
    await dbQuery(`
        INSERT INTO task_assigned_users(task_id, user_id) VALUES(?, ?)
    `, [req.taskId, req.body.user_id])

    if(req.body.notify_user_by_email && Number(req.body.user_id) !== req.authUserId) {
        notifyUserByEmailTaskAssigned(req.taskId, req.body.user_id, req.authUserId)
    }

    res.json({ status: 'success' })
})

router.delete('/assigned-user/:id', async(req, res) => {
    await dbQuery(`
        DELETE FROM task_assigned_users
        WHERE id = ?
    `, [req.params.id])
    res.json({ status: 'success' })
})

router.post('/time-spend', async(req, res) => {
    await dbQuery(`
        INSERT INTO task_time_spends(task_id, user_id, description, start_date_time, end_date_time) VALUES(?, ?, ?, ?, ?)
    `, [req.taskId, req.authUserId, req.body.description ? req.body.description : null, req.body.start_date_time, req.body.end_date_time])
    res.json({ status: 'success' })
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

router.get('/sub-tasks', async(req, res) => {
    const subTasks = await dbQuery(`
        SELECT
            task_sub_tasks.id,
            sub_tasks.date,
            task_types.type as type,
            task_statuses.status as status,
            project_categories.category as category,
            sub_tasks.title
        FROM task_sub_tasks
        JOIN tasks as sub_tasks ON sub_tasks.id = task_sub_tasks.sub_task_id
        JOIN task_types ON task_types.id = sub_tasks.task_type_id
        JOIN task_statuses ON task_statuses.id = sub_tasks.task_status_id
        LEFT JOIN project_categories ON project_categories.id = sub_tasks.project_category_id
        WHERE task_sub_tasks.task_id = ?
        ORDER BY task_sub_tasks.id
    `, [req.taskId])

    let completedTaskStatusId = await getCompletedTaskStatusId(req.projectId)

    res.json({
        data: subTasks,
        completedCount: (await dbQuery(`
            SELECT COUNT(*) as count
            FROM task_sub_tasks
            JOIN tasks ON tasks.id = task_sub_tasks.sub_task_id
            WHERE task_sub_tasks.task_id = ?
            AND tasks.task_status_id = ?
        `, [req.taskId, completedTaskStatusId]))[0].count
    })
})

router.get('/sub-tasks/matching-tasks', async(req, res) => {
    if(req.query.task) {
        let matchingTasks = await dbQuery(`
            SELECT
                tasks.id as value,
                CONCAT(
                    '[',
                    DATE_FORMAT(tasks.date, '%d-%b-%y'),
                    '] ',
                    '[',
                    task_types.type,
                    '] ',
                    '[',
                    task_statuses.status,
                    '] ',
                    CASE WHEN project_categories.category IS NOT NULL THEN '[' ELSE '' END,
                    CASE WHEN project_categories.category IS NOT NULL THEN project_categories.category ELSE '' END,
                    CASE WHEN project_categories.category IS NOT NULL THEN '] ' ELSE '' END,
                    tasks.title
                ) as label
            FROM tasks
            JOIN task_types ON task_types.id = tasks.task_type_id
            JOIN task_statuses ON task_statuses.id = tasks.task_status_id
            LEFT JOIN project_categories ON project_categories.id = tasks.project_category_id
            LEFT JOIN task_sub_tasks ON task_sub_tasks.task_id = tasks.id AND task_sub_tasks.sub_task_id = ?
            WHERE tasks.project_id = ?
            AND tasks.id != ?
            AND task_sub_tasks.id IS NULL
            HAVING label LIKE ?
            LIMIT 4
        `, [req.taskId, req.projectId, req.taskId, `%${req.query.task}%`])

        res.json(matchingTasks)
    } else {
        res.json([])
    }
})

router.post('/sub-task', async(req, res) => {
    await dbQuery(`
        INSERT INTO task_sub_tasks(task_id, sub_task_id)
        VALUES(?, ?)
    `, [req.taskId, req.body.sub_task_id])
    res.json({ status: 'success' })
})

router.delete('/sub-task/:id', async(req, res) => {
    await dbQuery(`
        DELETE FROM task_sub_tasks
        WHERE id = ?
    `, [req.params.id])
    res.json({ status: 'success' })
})

router.put('/update/:field', async(req, res) => {
    if(req.params.field === 'date' || req.params.field === 'title' || req.params.field === 'task_type_id' || req.params.field === 'task_status_id' || req.params.field === 'project_category_id' || req.params.field === 'due_date' || req.params.field === 'completed_date') {

        let completedTaskStatusId = await getCompletedTaskStatusId(req.projectId)

        if(req.params.field === 'task_status_id' && Number(req.body[req.params.field]) === completedTaskStatusId) {

            let pendingStuff = []

            let pendingSubTasksCount = (await dbQuery(`
                SELECT COUNT(*) as count
                FROM task_sub_tasks
                JOIN tasks ON tasks.id = task_sub_tasks.sub_task_id
                WHERE task_sub_tasks.task_id = ?
                AND tasks.task_status_id != ?
            `, [req.taskId, completedTaskStatusId]))[0].count

            if(pendingSubTasksCount > 0) {
                pendingStuff.push('sub tasks')
            }

            let pendingChecklistItemsCount = await dbQuery(`
                SELECT
                    COUNT(*) as count,
                    task_checklists.name as checklist_name
                FROM task_checklist_items
                JOIN task_checklists ON task_checklists.id = task_checklist_items.task_checklist_id
                WHERE task_checklist_items.task_id = ?
                AND task_checklist_items.checked = 0
                GROUP BY task_checklists.id
            `, [req.taskId])

            for(const pendingChecklistItemsCountSingle of pendingChecklistItemsCount) {
                if(pendingChecklistItemsCountSingle.count > 0) {
                    pendingStuff.push(pendingChecklistItemsCountSingle.checklist_name)
                }
            }

            if(pendingStuff.length > 0) {
                res.json({
                    status: 'error',
                    message: 'You can\'t mark this task as completed without completing your ' + pendingStuff.join(', ').replace(/,(?!.*,)/gmi, ' and')
                })

                return
            } else {
                await dbQuery(`
                    UPDATE tasks
                    SET completed_date = CURRENT_DATE
                    WHERE id = ?
                `, [req.taskId])
            }
        }

        if(req.params.field === 'task_status_id' && Number(req.body[req.params.field]) !== completedTaskStatusId) {
            await dbQuery(`
                UPDATE tasks
                SET completed_date = null
                WHERE id = ?
            `, [req.taskId])
        }

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
        SELECT id, content, checked, sort_order, created_at
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

router.put('/checklist-item/:id', async(req, res) => {
    await dbQuery(`
        UPDATE task_checklist_items
        SET content = ?
        WHERE id = ?
    `, [req.body.content, req.params.id])
    res.json({ status: 'success' })
})

router.delete('/checklist-item/:id', async(req, res) => {
    await dbQuery(`
        DELETE FROM task_checklist_items
        WHERE id = ?
    `, [req.params.id])
    res.json({ status: 'success' })
})

router.delete('/', async(req, res) => {

    let taskCommentIds = await dbQuery(`
        SELECT id FROM task_comments
        WHERE task_id = ?
    `, [req.taskId])

    taskCommentIds = taskCommentIds.map(taskComment => taskComment.id)

    if(taskCommentIds.length > 0) {

        let taskCommentFiles = await dbQuery(`
            SELECT saved_file_name FROM task_comment_files
            WHERE task_comment_id IN (${Array(taskCommentIds.length).fill('?')})
        `, [...taskCommentIds])

        if(taskCommentFiles.length > 0) {

            for(const taskCommentFile of taskCommentFiles) {
                fs.unlink(path.join(uploadDir, taskCommentFile.saved_file_name), (err) => {
                    if(err) {
                        console.log(err)
                    }
                })
            }

            await dbQuery(`
                DELETE FROM task_comment_files
                WHERE task_comment_id IN (${Array(taskCommentIds.length).fill('?')})
            `, [...taskCommentIds])

        }

        await dbQuery(`
            DELETE FROM task_comments
            WHERE task_id = ?
        `, [req.taskId])

    }

    await dbQuery(`
        DELETE FROM task_assigned_users
        WHERE task_id = ?
    `, [req.taskId])

    await dbQuery(`
        DELETE FROM task_time_spends
        WHERE task_id = ?
    `, [req.taskId])

    await dbQuery(`
        DELETE FROM task_sub_tasks
        WHERE task_id = ? OR sub_task_id = ?
    `, [req.taskId, req.taskId])

    await dbQuery(`
        DELETE FROM task_checklist_items
        WHERE task_id = ?
    `, [req.taskId])

    await dbQuery(`
        DELETE FROM tasks
        WHERE id = ?
    `, [req.taskId])

    res.json({ status: 'success' })
})

module.exports = router
