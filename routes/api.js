const express = require('express')
const router = express.Router()
const jwtAuthMiddleware = require('../libs/jwtAuthMiddleware')

router.use('/auth', require('./auth'))
router.use('/admin-panel', jwtAuthMiddleware, require('./admin-panel'))
router.use('/:organization/admin-panel', jwtAuthMiddleware, require('./organization-admin-panel'))
router.use('/:organization', jwtAuthMiddleware, require('./organization'))

module.exports = router
