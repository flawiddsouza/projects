const path = require('path')
const envPath = path.join(__dirname, '../.env')
const { parsed: localEnv } = require('dotenv').config({ path: envPath })
if(localEnv === undefined) {
    throw Error('.env file not found')
}

if(localEnv.JWT_SECRET === undefined || localEnv.JWT_SECRET === '') {
    throw Error('JWT_SECRET not defined in .env')
}

if(localEnv.JWT_EXPIRY === undefined || localEnv.JWT_EXPIRY === '') {
    throw Error('JWT_EXPIRY not defined in .env')
}

const jwt = require('jsonwebtoken')

function generateToken(data) {
    return jwt.sign({
        data: data
    }, localEnv.JWT_SECRET, { expiresIn: localEnv.JWT_EXPIRY })
}

function verifyToken(token) {
    return jwt.verify(token, localEnv.JWT_SECRET)
}

module.exports = { generateToken, verifyToken }
