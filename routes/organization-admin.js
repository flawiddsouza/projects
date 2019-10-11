const express = require('express')
const { dbQuery } =  require('../libs/cjs/db')
const generateCRUD =  require('../libs/cjs/generateCRUD')

const router = express.Router()

generateCRUD(router, 'projects', 'projects', ['name', 'slug'], { where: 'organization_id', equals: 'organizationId'})
generateCRUD(router, 'statuses', 'task_statuses', ['status', 'sort_order'], { where: 'organization_id', equals: 'organizationId'})
generateCRUD(router, 'types', 'task_types', ['type', 'sort_order'], { where: 'organization_id', equals: 'organizationId'})
generateCRUD(router, 'roles', 'organization_roles', ['role'], { where: 'organization_id', equals: 'organizationId'})

router.get('/matching-users', async(req, res) => { // matching users excluding organization members
    if(req.query.name) {
        let matchingUsers = await dbQuery(`
            SELECT users.id as value, users.name as label
            FROM users
            LEFT JOIN organization_members ON organization_members.user_id = users.id AND organization_members.organization_id = ?
            WHERE (users.name LIKE ? OR users.email LIKE ?) AND organization_members.id IS NULL
            AND users.email_verification_code IS NULL
        `, [req.organizationId, `%${req.query.name}%`, `%${req.query.name}%`])
        res.json(matchingUsers)
    } else {
        res.json([])
    }
})

router.get('/members', async(req, res) => {
    let organizationMembers = await dbQuery(`
        SELECT organization_members.id, users.name as user, organization_roles.role, organization_members.organization_role_id
        FROM organization_members
        JOIN users ON users.id = organization_members.user_id
        JOIN organization_roles ON organization_roles.id = organization_members.organization_role_id
        WHERE organization_members.organization_id = ?
    `, [req.organizationId])
    res.json(organizationMembers)
})

router.post('/member', async(req, res) => {
    await dbQuery(`
        INSERT INTO organization_members(organization_id, user_id, organization_role_id) VALUES(?, ?, ?)
    `, [req.organizationId, req.body.user_id, req.body.organization_role_id])
    res.json({ status: 'success'})
})

router.put('/member/:id/change-role', async(req, res) => {
    await dbQuery(`
        UPDATE organization_members
        SET organization_role_id = ?
        WHERE id = ?
    `, [req.body.organization_role_id, req.params.id])
    res.json({ status: 'success' })
})

router.delete('/member/:id', async(req, res) => {
    await dbQuery(`
        DELETE FROM organization_members
        WHERE id = ?
    `, [req.params.id])
    res.json({ status: 'success' })
})

router.get('/projects/assign-members/organization-members/:project_id', async(req, res) => { // organization members excluding members who are already in the project
    let organizationMembers = await dbQuery(`
        SELECT
            organization_members.id,
            CONCAT(users.name, ' (', organization_roles.role, ')') as user
        FROM organization_members
        JOIN users ON users.id = organization_members.user_id
        JOIN organization_roles ON organization_roles.id = organization_members.organization_role_id
        LEFT JOIN project_members ON project_members.organization_member_id = organization_members.id
        AND project_members.project_id = ?
        WHERE organization_members.organization_id = ?
        AND project_members.id IS NULL
    `, [req.params.project_id, req.organizationId])
    res.json(organizationMembers)
})

router.get('/projects/assign-members/projects', async(req, res) => {
    let projects = await dbQuery(`
        SELECT id, name FROM projects
        WHERE organization_id = ?
    `, [req.organizationId])
    res.json(projects)
})

router.get('/projects/assign-members/project-members/:project_id', async(req, res) => {
    let projectMembers = await dbQuery(`
        SELECT
            project_members.id,
            CONCAT(users.name, ' (', organization_roles.role, ')') as user
        FROM project_members
        JOIN organization_members ON organization_members.id = project_members.organization_member_id
        JOIN users ON users.id = organization_members.user_id
        JOIN organization_roles ON organization_roles.id = organization_members.organization_role_id
        WHERE project_members.project_id = ?
    `, [req.params.project_id])
    res.json(projectMembers)
})

router.post('/projects/assign-members/project-members/:project_id', async(req, res) => {
    await dbQuery(`
        INSERT INTO project_members(project_id, organization_member_id)
        VALUES(?, ?)
    `, [req.params.project_id, req.body.organization_member_id])
    res.json({ status: 'success' })
})

router.delete('/projects/assign-members/project-member/:id', async(req, res) => {
    await dbQuery(`
        DELETE FROM project_members
        WHERE id = ?
    `, [req.params.id])
    res.json({ status: 'success' })
})

router.get('/tasks/checklists/:task_type_id', async(req, res) => {
    let checklists = await dbQuery(`
        SELECT task_checklists.id, task_checklists.name, task_checklists.sort_order
        FROM task_checklists
        JOIN task_types ON task_types.id = task_checklists.task_type_id
        WHERE task_checklists.task_type_id = ?
        AND task_types.organization_id = ?
        ORDER BY task_checklists.sort_order
    `, [req.params.task_type_id, req.organizationId])
    res.json(checklists)
})

router.post('/tasks/checklists/:task_type_id', async(req, res) => {
    await dbQuery(`
        INSERT INTO task_checklists(task_type_id, name, sort_order)
        VALUES(?, ?, ?)
    `, [req.params.task_type_id, req.body.name, req.body.sort_order])
    res.json({ status: 'success' })
})

router.put('/tasks/checklists/:id', async(req, res) => {
    await dbQuery(`
        UPDATE task_checklists
        SET name = ?, sort_order = ?
        WHERE id = ?
    `, [req.body.name, req.body.sort_order, req.params.id])
    res.json({ status: 'success' })
})

router.delete('/tasks/checklists/:id', async(req, res) => {
    await dbQuery(`
        DELETE FROM task_checklists
        WHERE id = ?
    `, [req.params.id])
    res.json({ status: 'success' })
})

router.get('/projects/categories/:project_id', async(req, res) => {
    let projectCategories = await dbQuery(`
        SELECT id, category
        FROM project_categories
        WHERE project_id = ?
        ORDER BY category
    `, [req.params.project_id])
    res.json(projectCategories)
})

router.post('/projects/categories/:project_id', async(req, res) => {
    await dbQuery(`
        INSERT INTO project_categories(project_id, category)
        VALUES(?, ?)
    `, [req.params.project_id, req.body.category])
    res.json({ status: 'success' })
})

router.put('/projects/categories/:id', async(req, res) => {
    await dbQuery(`
        UPDATE project_categories
        SET category = ?
        WHERE id = ?
    `, [req.body.category, req.params.id])
    res.json({ status: 'success' })
})

router.delete('/projects/categories/:id', async(req, res) => {
    await dbQuery(`
        DELETE FROM project_categories
        WHERE id = ?
    `, [req.params.id])
    res.json({ status: 'success' })
})

module.exports = router
