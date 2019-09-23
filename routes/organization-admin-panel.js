const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.send('organization admin panel')
})

module.exports = router
