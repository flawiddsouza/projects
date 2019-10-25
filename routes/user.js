const express = require('express')
const router = express.Router()
const { dbQuery } =  require('../libs/cjs/db')
const bcrypt =  require('bcrypt')

router.get('/account-details', async(req, res) => {
    const response = await dbQuery(`
        SELECT email, name FROM users WHERE id = ?
    `, [req.authUserId])
    res.json(response[0])
})

router.put('/account-details/name', async(req, res) => {
    await dbQuery(`
        UPDATE users SET name=?, updated_at=CURRENT_TIMESTAMP WHERE id = ?
    `, [req.body.name, req.authUserId])
    res.json({ status: 'Success' })
})

const saltRounds = 10

router.put('/account-details/password', async(req, res) => {
    await dbQuery(`
        UPDATE users SET password=?, updated_at=CURRENT_TIMESTAMP WHERE id = ?
    `, [
        await bcrypt.hash(req.body.password, saltRounds),
        req.authUserId
    ])
    res.json({ status: 'Success' })
})

module.exports = router
