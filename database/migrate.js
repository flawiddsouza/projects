const fs = require('fs')

let completedMigrationsFilePath = 'completed-migrations.json'

if(!fs.existsSync(completedMigrationsFilePath)) {
    fs.writeFileSync(completedMigrationsFilePath, '[]')
}

let completedMigrationsFileString = fs.readFileSync(completedMigrationsFilePath, 'utf-8')
let completedMigrations = JSON.parse(completedMigrationsFileString)

let migrationsDirectory = 'migrations'
let migrations = fs.readdirSync(migrationsDirectory)

let difference = (arr1, arr2) => arr1.filter(x => !arr2.includes(x))

let pendingMigrations = difference(migrations, completedMigrations)

if(pendingMigrations.length === 0) {
    console.log('Nothing to migrate.')
    process.exit()
}

const mysql = require('serverless-mysql')

require('dotenv').config({ path: '../.env' })

let db = null

if(process.env.DB_CONNECTION === 'mysql') {

    db = mysql({
        config: {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_DATABASE,
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD
        }
    })

} else {
    throw new Exception('DB Connection Not Implemented')
}

async function pushToCompletedMigrations(migrationFileName) {
    completedMigrations.push(migrationFileName)
    fs.writeFileSync(completedMigrationsFilePath, JSON.stringify(completedMigrations, null, 4))
}

const path = require('path');

(async () => {
    for(const migration of pendingMigrations) {
        console.log(`Migrating: ${migration}`)
        let migrationFilePath = path.join(migrationsDirectory, migration)
        let migrationFileString = fs.readFileSync(migrationFilePath, 'utf-8')
        try {
            await db.query(migrationFileString)
            await db.end()
        } catch(e) {
            console.error(e)
            break
        }

        await pushToCompletedMigrations(migration)

        console.log(`Migrated: ${migration}`)
    }
    process.exit()
})()
