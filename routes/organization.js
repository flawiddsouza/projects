const express = require('express')
const router = express.Router()
const { dbQuery } =  require('../libs/cjs/db')
const notifyUserByEmailTaskAssigned =  require('../libs/cjs/notifyUserByEmailTaskAssigned')

router.get('/projects', async(req, res) => {
    let projects = await dbQuery('SELECT name, slug FROM projects WHERE organization_id = ?', [req.organizationId])
    res.json(projects)
})

router.get('/task-types', async(req, res) => {
    let taskTypes = await dbQuery('SELECT id, type FROM task_types WHERE organization_id = ? ORDER BY sort_order', [req.organizationId])
    res.json(taskTypes)
})

router.get('/task-statuses', async(req, res) => {
    let taskStatuses = await dbQuery('SELECT id, status FROM task_statuses WHERE organization_id = ? ORDER BY sort_order', [req.organizationId])
    res.json(taskStatuses)
})

async function validateProject(req, res, next) {
    let results = await dbQuery('SELECT id FROM projects WHERE slug = ? AND organization_id = ?', [req.params.project, req.organizationId])
    if(results.length > 0) {
        req.projectId = results[0].id
        next()
    } else {
        res.json({
            status: 'error',
            message: 'Project does not exist'
        })
    }
}

router.get('/:project/members', validateProject, async(req, res) => {
    let projectMembers = await dbQuery(`
        SELECT
            project_members.id,
            CONCAT(
                users.name,
                (CASE WHEN users.id = ? THEN ' (you)' ELSE '' END)
            ) as user,
            (CASE WHEN users.id = ? THEN true ELSE false END) as you,
            organization_roles.role,
            organization_members.user_id
        FROM project_members
        JOIN organization_members ON organization_members.id = project_members.organization_member_id
        JOIN organization_roles ON organization_roles.id = organization_members.organization_role_id
        JOIN users ON users.id = organization_members.user_id
        WHERE project_members.project_id = ?
        ORDER BY users.name
    `, [req.authUserId, req.authUserId, req.projectId])
    res.json(projectMembers)
})

async function getCompletedTaskStatusId(organizationId) {
    let completedTaskStatusId = await dbQuery(`
        SELECT id FROM task_statuses
        WHERE organization_id = ?
        ORDER BY sort_order DESC
        LIMIT 1
    `, [organizationId])

    if(completedTaskStatusId.length > 0) {
        completedTaskStatusId = completedTaskStatusId[0].id
    } else {
        completedTaskStatusId = null
    }

    return completedTaskStatusId
}

router.get('/:project/tasks', validateProject, async(req, res) => {
    let additionalParams = []

    if(req.query.status !== 'All') {
        additionalParams.push(req.query.status)
    }

    if(req.query.type !== 'All') {
        additionalParams.push(req.query.type)

    }
    if(req.query.category !== 'All' && req.query.category !== '') {
        additionalParams.push(req.query.category)
    }

    if(req.query.user !== 'All' && req.query.user !== 'authenticated') {
        additionalParams.push(req.query.user)
    }

    if(req.query.user === 'authenticated') {
        additionalParams.push(req.authUserId)
    }

    let limit = 'All'
    if(req.query.limit === '50' || req.query.limit === '100') {
        limit = req.query.limit
    }

    const completedTaskStatusId = await getCompletedTaskStatusId(req.organizationId)

    if(req.query.status === 'All' && completedTaskStatusId) {
        additionalParams.unshift(completedTaskStatusId)
    }

    let tasks = await dbQuery(`
        SELECT
            tasks.id, tasks.date, tasks.title, task_types.type, task_statuses.status, project_categories.category as project_category, tasks.task_type_id, tasks.task_status_id, tasks.project_category_id,
            tasks.due_date,
            tasks.completed_date,
            CASE WHEN tasks.task_status_id = ? THEN true ELSE false END as completed
        FROM tasks
        JOIN task_types ON task_types.id = tasks.task_type_id
        JOIN task_statuses ON task_statuses.id = tasks.task_status_id
        LEFT JOIN project_categories ON project_categories.id = tasks.project_category_id
        WHERE tasks.project_id = ?
        ${req.query.status === 'All' && completedTaskStatusId ? 'AND tasks.task_status_id != ?' : ''}
        ${req.query.status !== 'All' ? 'AND tasks.task_status_id = ?' : ''}
        ${req.query.type !== 'All' ? 'AND tasks.task_type_id = ?' : ''}
        ${req.query.category !== 'All' && req.query.category !== '' ? 'AND tasks.project_category_id = ?' : ''}
        ${req.query.category === '' ? 'AND tasks.project_category_id IS NULL': '' }
        ${req.query.user !== 'All' ? `AND tasks.id IN (
            SELECT task_id FROM task_assigned_users WHERE user_id = ?
        )` : ''}
        ORDER BY tasks.created_at DESC
        ${limit !== 'All' ? 'LIMIT ' + limit : ''}
    `, [completedTaskStatusId, req.projectId, ...additionalParams])
    res.json(tasks)
})

router.get('/:project/categories', validateProject, async(req, res) => {
    let projectCategories = await dbQuery(`
        SELECT id, category
        FROM project_categories
        WHERE project_id = ?
    `, [req.projectId])
    res.json(projectCategories)
})

router.post('/:project/task', validateProject, async(req, res) => {
    let insertedRecord = await dbQuery(`
        INSERT INTO tasks(project_id, date, title, task_type_id, task_status_id, project_category_id, due_date) VALUES(?, ?, ?, ?, ?, ?, ?)
    `, [
        req.projectId,
        req.body.date,
        req.body.title,
        req.body.task_type_id,
        req.body.task_status_id,
        req.body.project_category_id,
        req.body.due_date
    ])

    let insertedCommentId = null

    if(req.body.description || req.body.hasAttachments) {
        insertedCommentId = await dbQuery(`
            INSERT INTO task_comments(task_id, user_id, comment) VALUES(?, ?, ?)
        `, [insertedRecord.insertId, req.authUserId, req.body.description])
        insertedCommentId = insertedCommentId.insertId
    }

    if(req.body.assignTo.length > 0) {
        for(const userId of req.body.assignTo) {
            await dbQuery(`
                INSERT INTO task_assigned_users(task_id, user_id) VALUES(?, ?)
            `, [insertedRecord.insertId, userId])

            if(req.body.notifyUsersByEmail && req.authUserId !== userId) {
                notifyUserByEmailTaskAssigned(insertedRecord.insertId, userId, req.authUserId)
            }
        }
    }

    res.json(
        {
            status: 'success',
            data: {
                insertedId: insertedRecord.insertId,
                insertedCommentId
            }
        }
    )
})

router.get('/:project/time-spends-for-authenticated-user', validateProject, async(req, res) => {

    let additionalParams = []

    if(req.query.filter === 'Selected Date') {
        additionalParams.push(req.query.date)
    }

    const timeSpends = await dbQuery(`
        SELECT
            task_time_spends.id,
            task_time_spends.task_id,
            task_types.type as type,
            project_categories.category as project_category,
            tasks.title as task,
            task_time_spends.description as description,
            task_time_spends.start_date_time,
            task_time_spends.end_date_time,
            DATE_FORMAT(task_time_spends.start_date_time, '%h:%i %p') as start_time,
            DATE_FORMAT(task_time_spends.end_date_time, '%h:%i %p') as end_time,
            (CASE
                WHEN task_time_spends.end_date_time IS NOT NULL THEN
                    TIMESTAMPDIFF(SECOND, task_time_spends.start_date_time, task_time_spends.end_date_time)
                ELSE
                    ''
                END
            ) as duration
        FROM task_time_spends
        JOIN tasks ON tasks.id = task_time_spends.task_id
        JOIN task_types ON task_types.id = tasks.task_type_id
        LEFT JOIN project_categories ON project_categories.id = tasks.project_category_id
        WHERE task_time_spends.user_id = ?
        ${req.query.filter === 'Selected Date' ? 'AND DATE(task_time_spends.start_date_time) = ?' : ''}
        ORDER BY task_time_spends.start_date_time DESC
    `, [req.authUserId, ...additionalParams])

    res.json(timeSpends)
})

module.exports = router
