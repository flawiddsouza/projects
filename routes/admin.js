const express = require('express')
const generateCRUD =  require('../libs/cjs/generateCRUD')
const { dbQuery } =  require('../libs/cjs/db')

const router = express.Router()

generateCRUD(router, 'organizations', 'organizations', ['name', 'slug'], null, {
    async afterCreate(insertedId) {
        await dbQuery(`
            INSERT INTO task_statuses(organization_id, status, sort_order)
            VALUES
                (:organization_id, 'Open', 1),
                (:organization_id, 'Completed', 2)
        `, {
            organization_id: insertedId
        })
    },
    async beforeDelete(id) {
        await dbQuery(`
            DELETE FROM task_statuses WHERE organization_id = ?
        `, [id])
    }
})

module.exports = router
