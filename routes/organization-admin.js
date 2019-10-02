const express = require('express')
const dbQuery =  require('../libs/db')
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
        `, [req.organizationId, `%${req.query.name}%`, `%${req.query.name}%`])
        res.json(matchingUsers)
    } else {
        res.json([])
    }
})

router.get('/members', async(req, res) => {
    let organizationMembers = await dbQuery(`
        SELECT organization_members.id, users.name as user, organization_roles.role
        FROM organization_members
        JOIN users ON users.id = organization_members.user_id
        JOIN organization_roles ON organization_roles.id = organization_members.organization_role_id
        WHERE organization_members.organization_id = ?
    `, [req.organizationId])
    res.json(organizationMembers)
})

router.post('/member', async(req, res) => {
    let insertedRecord = await dbQuery(`
        INSERT INTO organization_members(organization_id, user_id, organization_role_id) VALUES(?, ?, ?)
    `, [req.organizationId, req.body.user_id, req.body.organization_role_id])
    res.json({ status: 'success', data: { insertedId: insertedRecord } })
})

router.delete('/member/:id', async(req, res) => {
    await dbQuery(`
        DELETE FROM organization_members
        WHERE id = ?
    `, [req.params.id])
    res.json({ status: 'success' })
})

module.exports = router
