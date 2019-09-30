const express = require('express')
const dbQuery =  require('../libs/db')
const generateCRUD =  require('../libs/cjs/generateCRUD')

const router = express.Router()

generateCRUD(router, 'projects', 'projects', ['name', 'slug'], { where: 'organization_id', equals: 'organizationId'})
generateCRUD(router, 'statuses', 'task_statuses', ['status', 'sort_order'], { where: 'organization_id', equals: 'organizationId'})
generateCRUD(router, 'types', 'task_types', ['type', 'sort_order'], { where: 'organization_id', equals: 'organizationId'})
generateCRUD(router, 'roles', 'organization_roles', ['role', 'task'], { where: 'organization_id', equals: 'organizationId'})

router.get('/users', async(req, res) => {
    res.send([])
})

module.exports = router
