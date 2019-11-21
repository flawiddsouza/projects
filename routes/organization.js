const express = require('express')
const router = express.Router()
const { dbQuery } =  require('../libs/cjs/db')
const notifyUserByEmailTaskAssigned =  require('../libs/cjs/notifyUserByEmailTaskAssigned')
const { isSuperAdmin, isOrganizationAdmin } = require('../libs/cjs/adminCheckHelpers')
const dateFns = require('date-fns')

router.get('/projects', async(req, res) => {
    let projects = []

    if(await isSuperAdmin(req.authUserId) || await isOrganizationAdmin(req.authUserId, req.organizationId)) {
        projects = await dbQuery('SELECT id, name, slug FROM projects WHERE organization_id = ?', [req.organizationId])
    } else {
        projects = await dbQuery(`
            SELECT
                projects.id,
                projects.name,
                projects.slug
            FROM projects
            JOIN project_members ON project_members.project_id = projects.id
            JOIN organization_members ON organization_members.id = project_members.organization_member_id
            WHERE projects.organization_id = ?
            AND organization_members.user_id = ?
        `, [req.organizationId, req.authUserId])
    }

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

router.get('/task-priorities', async(req, res) => {
    let taskPriorities = await dbQuery('SELECT id, priority, `default` FROM task_priorities WHERE organization_id = ? ORDER BY sort_order', [req.organizationId])
    res.json(taskPriorities)
})

async function validateProject(req, res, next) {
    let results = null
    if(req.params.project === 'all') {
        if(await isSuperAdmin(req.authUserId) || await isOrganizationAdmin(req.authUserId, req.organizationId)) {
            results = await dbQuery('SELECT id FROM projects WHERE organization_id = ?', [req.organizationId])
        } else {
            results = await dbQuery(`
                SELECT projects.id
                FROM projects
                JOIN project_members ON project_members.project_id = projects.id
                JOIN organization_members ON organization_members.id = project_members.organization_member_id
                WHERE projects.organization_id = ?
                AND organization_members.user_id = ?
            `, [req.organizationId, req.authUserId])
        }
    } else {
        results = await dbQuery('SELECT id FROM projects WHERE slug = ? AND organization_id = ?', [req.params.project, req.organizationId])
    }
    if(results.length > 0) {
        req.projectId = results.map(result => result.id).join(',')
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
            GROUP_CONCAT(project_members.project_id) as project_ids,
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
        WHERE project_members.project_id IN (${req.projectId})
        GROUP BY users.id, users.name, organization_roles.role, organization_members.user_id
        ORDER BY users.name
    `, [req.authUserId, req.authUserId])
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

    let orderBy = 'tasks.created_at'

    if(
        req.query.sort_by === 'Start Date' ||
        req.query.sort_by === 'Due Date' ||
        req.query.sort_by === 'Completed Date'
    ) {
        if(req.query.sort_by === 'Start Date') {
            orderBy = 'tasks.date'
        }

        if(req.query.sort_by === 'Due Date') {
            orderBy = 'tasks.due_date'
        }

        if(req.query.sort_by === 'Completed Date') {
            orderBy = 'tasks.completed_date'
        }
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
            tasks.id, tasks.date, tasks.title, task_types.type, task_statuses.status, project_categories.category as project_category,
            task_priorities.priority,
            tasks.task_type_id,
            tasks.task_status_id,
            tasks.project_category_id,
            tasks.task_priority_id,
            tasks.due_date,
            tasks.completed_date,
            tasks.project_id,
            projects.name as project_name,
            CASE WHEN tasks.task_status_id = ? THEN true ELSE false END as completed
        FROM tasks
        JOIN task_types ON task_types.id = tasks.task_type_id
        JOIN task_statuses ON task_statuses.id = tasks.task_status_id
        LEFT JOIN task_priorities ON task_priorities.id = tasks.task_priority_id
        JOIN projects ON projects.id = tasks.project_id
        LEFT JOIN project_categories ON project_categories.id = tasks.project_category_id
        WHERE tasks.project_id IN (${req.projectId})
        ${req.query.status === 'All' && completedTaskStatusId ? 'AND tasks.task_status_id != ?' : ''}
        ${req.query.status !== 'All' ? 'AND tasks.task_status_id = ?' : ''}
        ${req.query.type !== 'All' ? 'AND tasks.task_type_id = ?' : ''}
        ${req.query.category !== 'All' && req.query.category !== '' ? 'AND tasks.project_category_id = ?' : ''}
        ${req.query.category === '' ? 'AND tasks.project_category_id IS NULL': '' }
        ${req.query.user !== 'All' ? `AND tasks.id IN (
            SELECT task_id FROM task_assigned_users WHERE user_id = ?
        )` : ''}
        ${req.query.filter ? 'AND tasks.title LIKE "%' + req.query.filter + '%"' : ''}
        ORDER BY ${orderBy} DESC
        ${limit !== 'All' ? 'LIMIT ' + limit : ''}
    `, [completedTaskStatusId, ...additionalParams])
    res.json(tasks)
})

router.get('/:project/categories', validateProject, async(req, res) => {
    let projectCategories = await dbQuery(`
        SELECT
            project_categories.id,
            project_categories.category,
            projects.name as project_name,
            project_categories.project_id
        FROM project_categories
        JOIN projects ON projects.id = project_categories.project_id
        WHERE project_categories.project_id IN (${req.projectId})
    `)
    res.json(projectCategories)
})

router.post('/:project/task', validateProject, async(req, res) => {
    let insertedRecord = await dbQuery(`
        INSERT INTO tasks(project_id, date, title, task_type_id, task_status_id, project_category_id, task_priority_id, due_date) VALUES(?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        req.params.project !== 'all' ? req.projectId : req.body.project_id,
        req.body.date,
        req.body.title,
        req.body.task_type_id,
        req.body.task_status_id,
        req.body.project_category_id,
        req.body.task_priority_id,
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
                INSERT INTO task_assigned_users(task_id, user_id, assigned_by) VALUES(?, ?, ?)
            `, [insertedRecord.insertId, userId, req.authUserId != userId ? req.authUserId : null])

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

    let params = []

    let userIdExists = true

    if(req.query.user) {
        if(req.query.user !== 'All') {
            params.push(req.query.user)
        } else {
            userIdExists = false
        }
    } else {
        params.push(req.authUserId)
    }

    if(req.query.filter === 'Selected Date') {
        params.push(req.query.date)
    }

    let startDateEndDateFilter = null

    if(
        req.query.filter === 'This Week' ||
        req.query.filter === 'Last Week' ||
        req.query.filter === 'This Month' ||
        req.query.filter === 'Last Month' ||
        req.query.filter === 'This Year' ||
        req.query.filter === 'Last Year'
    ) {
        startDateEndDateFilter = true

        let startDate = null
        let endDate = null

        const isoDateFormat = 'yyyy-MM-dd'
        const weekProps = { weekStartsOn: 1 }

        const thisWeekFirstDay = dateFns.startOfWeek(new Date(), weekProps)
        const lastWeekFirstDay = dateFns.startOfWeek(dateFns.subDays(thisWeekFirstDay, 1), weekProps)
        const thisMonthFirstDay = dateFns.startOfMonth(new Date())
        const lastMonthFirstDay = dateFns.startOfMonth(dateFns.subDays(thisMonthFirstDay, 1))
        const thisYearFirstDay = dateFns.startOfYear(new Date())
        const lastYearFirstDay = dateFns.startOfYear(dateFns.subDays(thisYearFirstDay, 1))

        if(req.query.filter === 'This Week') {
            startDate = dateFns.format(thisWeekFirstDay, isoDateFormat)
            endDate = dateFns.format(dateFns.endOfWeek(thisWeekFirstDay, weekProps), isoDateFormat)
        }

        if(req.query.filter === 'Last Week') {
            startDate = dateFns.format(lastWeekFirstDay, isoDateFormat)
            endDate = dateFns.format(dateFns.endOfWeek(lastWeekFirstDay, weekProps), isoDateFormat)
        }

        if(req.query.filter === 'This Month') {
            startDate = dateFns.format(thisMonthFirstDay, isoDateFormat)
            endDate = dateFns.format(dateFns.endOfMonth(thisMonthFirstDay), isoDateFormat)
        }

        if(req.query.filter === 'Last Month') {
            startDate = dateFns.format(lastMonthFirstDay, isoDateFormat)
            endDate = dateFns.format(dateFns.endOfMonth(lastMonthFirstDay), isoDateFormat)
        }

        if(req.query.filter === 'This Year') {
            startDate = dateFns.format(thisYearFirstDay, isoDateFormat)
            endDate = dateFns.format(dateFns.endOfYear(thisYearFirstDay), isoDateFormat)
        }

        if(req.query.filter === 'Last Year') {
            startDate = dateFns.format(lastYearFirstDay, isoDateFormat)
            endDate = dateFns.format(dateFns.endOfYear(lastYearFirstDay), isoDateFormat)
        }

        // console.log(req.query.filter, 'Start: ' + startDate, 'End: ' + endDate)

        params.push(startDate)
        params.push(endDate)
    }

    const timeSpends = await dbQuery(`
        SELECT
            task_time_spends.id,
            task_time_spends.task_id,
            CONCAT(
                users.name,
                (CASE WHEN users.id = ? THEN ' (you)' ELSE '' END)
            ) as user,
            task_time_spends.user_id,
            projects.name as project_name,
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
        JOIN users ON users.id = task_time_spends.user_id
        JOIN projects ON projects.id = tasks.project_id
        WHERE tasks.project_id IN (${req.projectId})
        ${userIdExists ? 'AND task_time_spends.user_id = ?' : ''}
        ${req.query.filter === 'Selected Date' ? 'AND DATE(task_time_spends.start_date_time) = ?' : ''}
        ${startDateEndDateFilter ? 'AND DATE(task_time_spends.start_date_time) >= ? AND DATE(task_time_spends.start_date_time) <= ?' : ''}
        ORDER BY task_time_spends.start_date_time
    `, [req.authUserId, ...params])

    res.json(timeSpends)
})

module.exports = router
