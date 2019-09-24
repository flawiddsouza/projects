const fs = require('fs')

let migrationsDirectory = 'migrations'

const path = require('path')

function getDateTimeObject() {
    let currentDateTime = new Date()

    return {
        day: currentDateTime.getDate().toString().padStart(2, '0'),
        month: (currentDateTime.getMonth() + 1).toString().padStart(2, '0'),
        year: currentDateTime.getFullYear(),
        hours: currentDateTime.getHours().toString().padStart(2, '0'),
        minutes: currentDateTime.getMinutes().toString().padStart(2, '0'),
        seconds: currentDateTime.getSeconds().toString().padStart(2, '0')
    }
}

let dateTime = getDateTimeObject()

let newMigrationFileName = `${dateTime.year}${dateTime.month}${dateTime.day}_${dateTime.hours}${dateTime.minutes}${dateTime.seconds}`

const args = process.argv.slice(2)
if(args.length > 0) {
    newMigrationFileName += `_${args[0]}`
}

newMigrationFileName += '.sql'

fs.writeFileSync(path.join(migrationsDirectory, newMigrationFileName), '')
