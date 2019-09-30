const express = require('express')
const generateCRUD =  require('../libs/cjs/generateCRUD')

const router = express.Router()

generateCRUD(router, 'organizations', 'organizations', ['name', 'slug'])

module.exports = router
