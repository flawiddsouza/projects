const express = require('express')
const router = express.Router()
const dbQuery =  require('../libs/db')

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
        SELECT project_members.id, users.name, organization_roles.role
        FROM project_members
        JOIN organization_members ON organization_members.id = project_members.organization_member_id
        JOIN organization_roles ON organization_roles.id = organization_members.organization_role_id
        JOIN users ON users.id = organization_members.user_id
        WHERE project_members.project_id = ?
    `, [req.projectId])
    res.json(projectMembers)
})

router.get('/:project/tasks', validateProject, async(req, res) => {
    let tasks = await dbQuery(`
        SELECT tasks.id, tasks.date, tasks.title, task_types.type, task_statuses.status
        FROM tasks
        JOIN task_types ON task_types.id = tasks.task_type_id
        JOIN task_statuses ON task_statuses.id = tasks.task_status_id
        WHERE project_id = ?
    `, [req.projectId])
    res.json(tasks)
})

module.exports = router
