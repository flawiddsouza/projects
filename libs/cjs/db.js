const mysql = require('mysql2/promise')

const path = require('path')
const envPath = path.join(__dirname, '../../.env')
const { parsed: localEnv } = require('dotenv').config({ path: envPath })
if(localEnv === undefined) {
    throw Error('.env file not found')
}

let query = null
let queryWithoutParams = null

if(localEnv.DB_CONNECTION === 'mysql') {

    const config = {
        host: localEnv.DB_HOST,
        port: localEnv.DB_PORT,
        database: localEnv.DB_DATABASE,
        user: localEnv.DB_USERNAME,
        password: localEnv.DB_PASSWORD,
        dateStrings: true,
        namedPlaceholders: true
    }

    query = async(queryToExecute, params=null) => {

        try {
            const db = await mysql.createConnection(config)

            const [rows, fields] = await db.execute(queryToExecute, params)
            await db.end()
            return rows
        } catch(e) {
            // console.log(queryToExecute, params, e.message)
            return { error: 'DB Error: ' + e.message }
        }

    }

    queryWithoutParams = async(queryToExecute) => {

        try {
            const db = await mysql.createConnection(config)

            const [rows, fields] = await db.query(queryToExecute)
            await db.end()
            return rows
        } catch(e) {
            return { error: 'DB Error: ' + e.message }
        }

    }

} else {
    throw new Exception('DB Connection Not Implemented')
}

module.exports = { dbQuery: query, queryWithoutParams }
