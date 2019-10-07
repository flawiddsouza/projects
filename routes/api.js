const express = require('express')
const router = express.Router()
const jwtAuthMiddleware = require('../libs/jwtAuthMiddleware')
const { dbQuery } = require('./../libs/cjs/db')

router.use('/auth', require('./auth'))
router.use('/admin', jwtAuthMiddleware, require('./admin'))

async function isSuperAdmin(userId) {
    let isSuperAdmin = await dbQuery(`
        SELECT id
        FROM admins
        WHERE organization_id IS NULL AND user_id = ?
    `, [userId])

    if(isSuperAdmin.length > 0) {
        isSuperAdmin = true
    } else {
        isSuperAdmin = false
    }

    return isSuperAdmin
}

router.get('/is-super-admin', jwtAuthMiddleware, async(req, res) => {
    res.json(await isSuperAdmin(req.authUserId))
})

router.get('/organizations', jwtAuthMiddleware, async(req, res) => {
    let organizations = []
    if(await isSuperAdmin(req.authUserId)) {
        organizations = await dbQuery('SELECT name, slug FROM organizations')
    } else {
        // get all the organizations the user is a member of and organization admin of
        organizations = await dbQuery(`
            SELECT organizations.name, organizations.slug
            FROM organizations
            LEFT JOIN organization_members ON organization_members.organization_id = organizations.id
            AND organization_members.user_id = :user_id
            LEFT JOIN admins ON admins.organization_id = organizations.id
            AND admins.user_id = :user_id
            WHERE organization_members.id IS NOT NULL OR admins.id IS NOT NULL
        `, { user_id: req.authUserId })
    }
    res.send(organizations)
})

async function validateAccessToTask(req, res, next) { // TODO check if the autheticated user has access to the task
    let results = await dbQuery('SELECT id, project_id FROM tasks WHERE id = ?', [req.params.id])
    if(results.length > 0) {
        req.taskId = results[0].id
        req.projectId = results[0].project_id
        next()
    } else {
        res.send({
            status: 'error',
            message: 'Task does not exist'
        })
    }
}

router.use('/task/:id', [jwtAuthMiddleware, validateAccessToTask], require('./task'))

async function validateOrganization(req, res, next) {
    let results = await dbQuery('SELECT id FROM organizations WHERE slug = ?', [req.params.organization])
    if(results.length > 0) {
        req.organizationId = results[0].id
        next()
    } else {
        res.send({
            status: 'error',
            message: 'Organization does not exist'
        })
    }
}

router.use('/:organization/admin', [jwtAuthMiddleware, validateOrganization], require('./organization-admin'))
router.use('/:organization', [jwtAuthMiddleware, validateOrganization], require('./organization'))
router.get('/:organization/is-admin', [jwtAuthMiddleware, validateOrganization], async(req, res) => {
    if(await isSuperAdmin(req.authUserId)) {
        res.json(true)
    } else {
        let organizationAdmin = await dbQuery(`
            SELECT id FROM admins
            WHERE organization_id = ? AND user_id = ?
        `, [req.organizationId, req.authUserId])

        if(organizationAdmin.length > 0) {
            res.json(true)
        } else {
            res.json(false)
        }
    }
})

module.exports = router
