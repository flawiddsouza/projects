const express = require('express')
const router = express.Router()
const jwtAuthMiddleware = require('../libs/jwtAuthMiddleware')

router.use('/auth', require('./auth'))
router.use('/admin', jwtAuthMiddleware, require('./admin'))

function validateOrganization(req, res, next) {
    req.organization = req.params.organization
    next()
}

router.use('/:organization/admin', [jwtAuthMiddleware, validateOrganization], require('./organization-admin'))
router.use('/:organization', [jwtAuthMiddleware, validateOrganization], require('./organization'))

module.exports = router
