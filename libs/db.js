import mysql from 'serverless-mysql'

let query = null

if(process.env.DB_CONNECTION === 'mysql') {

    const db = mysql({
        config: {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_DATABASE,
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD
        }
    })

    query = async() => {
        try {
            const results = await db.query(query)
            await db.end()
            return results
        } catch(error) {
            return { error }
        }
    }

} else {
    throw new Exception('DB Connection Not Implemented')
}

export { query }
