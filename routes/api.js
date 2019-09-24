const express = require('express')
const router = express.Router()

router.use('/auth', require('./auth'))
router.use('/admin-panel', require('./admin-panel'))
router.use('/:organization/admin-panel', require('./organization-admin-panel'))
router.use('/:organization', require('./organization'))

module.exports = router
