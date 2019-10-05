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

const { dbQuery } = require('./../libs/cjs/db')

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
        let queries = migrationFileString.split(';')
        queries = queries.filter(query => query.trim())
        for(const query of queries) {
            let results = await dbQuery(query)
            if(results.hasOwnProperty('error')) {
                console.error(results.error)
                break
            }
        }

        await pushToCompletedMigrations(migration)

        console.log(`Migrated: ${migration}`)
    }
    process.exit()
})()
