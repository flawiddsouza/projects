const express = require('express')
const router = express.Router()
const jwtAuthMiddleware = require('../libs/jwtAuthMiddleware')
const { dbQuery } = require('./../libs/cjs/db')

router.use('/auth', require('./auth'))
router.use('/admin', jwtAuthMiddleware, require('./admin'))

router.get('/organizations', jwtAuthMiddleware, async(req, res) => {
    // TODO get only the organizations that the user belongs to - only super admin has access to all organizations
    let organizations = await dbQuery('SELECT name, slug FROM organizations')
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

module.exports = router
