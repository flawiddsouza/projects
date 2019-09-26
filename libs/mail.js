const path = require('path')
const envPath = path.join(__dirname, '../.env')
const { parsed: localEnv } = require('dotenv').config({ path: envPath })
if(localEnv === undefined) {
    throw Error('.env file not found')
}

if(localEnv.MAILGUN_API_KEY === undefined || localEnv.MAILGUN_API_KEY === '') {
    throw Error('MAILGUN_API_KEY not defined in .env')
}

if(localEnv.MAILGUN_DOMAIN === undefined || localEnv.MAILGUN_DOMAIN === '') {
    throw Error('MAILGUN_DOMAIN not defined in .env')
}

if(localEnv.MAILGUN_FROM_EMAIL_NAME === undefined || localEnv.MAILGUN_FROM_EMAIL_NAME === '') {
    throw Error('MAILGUN_FROM_EMAIL_NAME not defined in .env')
}

if(localEnv.MAILGUN_FROM_EMAIL === undefined || localEnv.MAILGUN_FROM_EMAIL === '') {
    throw Error('MAILGUN_FROM_EMAIL not defined in .env')
}

if(localEnv.APP_URL === undefined || localEnv.APP_URL === '') {
    throw Error('APP_URL not defined in .env')
}

const mailgun = require('mailgun-js')

const mg = mailgun({
    apiKey: localEnv.MAILGUN_API_KEY, domain: localEnv.MAILGUN_DOMAIN
})

function sendMail(toEmail, subject, body) {
    mg.messages().send({
        from: `${localEnv.MAILGUN_FROM_EMAIL_NAME} <${localEnv.MAILGUN_FROM_EMAIL}>`,
        to: toEmail,
        subject: subject,
        html: body.replace('SUBSTITUTE_APP_URL', localEnv.APP_URL)
    }, (error, response) => {
        if(error) {
            console.error(response)
        }
    })
}

module.exports = sendMail
