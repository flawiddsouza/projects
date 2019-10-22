const express = require('express')
const router = express.Router()
const { dbQuery } =  require('../libs/cjs/db')

router.get('/account-details', async(req, res) => {
    const response = await dbQuery(`
        SELECT email, name FROM users WHERE id = ?
    `, [req.authUserId])
    res.json(response[0])
})

module.exports = router
