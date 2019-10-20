const express = require('express')
const bcrypt =  require('bcrypt')
const { dbQuery } =  require('../libs/cjs/db')
const sendMail =  require('../libs/mail')
const jwt =  require('../libs/jwt')

const router = express.Router()

const saltRounds = 10

function stringShuffle(string) {
    var parts = string.split('')
    for (var i = parts.length; i > 0;) {
        var random = parseInt(Math.random() * i)
        var temp = parts[--i]
        parts[i] = parts[random]
        parts[random] = temp
    }
    return parts.join('')
}

router.post('/register', async(req, res) => {
    if(req.body.name !== undefined && req.body.email !== undefined && req.body.password !== undefined) {
        let verificationCode = stringShuffle('abcdefghijklmnopqrstuvwxyz0123456789'.repeat(2)).substr(0, 64)
        let results = await dbQuery('INSERT INTO users(name, email, email_verification_code, password) VALUES(?, ?, ?, ?)', [
            req.body.name,
            req.body.email,
            verificationCode,
            await bcrypt.hash(req.body.password, saltRounds)
        ])
        if(results.hasOwnProperty('error')) {
            if(results.error.startsWith('DB Error: Duplicate entry')) {
                res.send({ status: 'error', message: 'The given email address has already been registered' })
            } else {
                res.send({ status: 'error', message: results.error })
            }
        } else {
            sendMail(req.body.email, 'Projects - Verify Email Address', `Click <a href="SUBSTITUTE_APP_URL/api/auth/verify-email?email=${req.body.email}&code=${verificationCode}">here</a> to verify your email address and complete registration`)
            res.send({ status: 'success', message: 'Registration Successful. Please check your email and click the verification link to complete your registration.' })
        }
    } else {
        res.send({ status: 'error', message: 'name, email and password are required fields' })
    }
})

router.get('/verify-email', async(req, res) => {
    if(req.query.email !== undefined && req.query.email !== '' && req.query.code !== undefined && req.query.code !== '') {
        let results = await dbQuery('SELECT * FROM users WHERE email = ? AND email_verification_code = ?', [req.query.email, req.query.code])
        if(results.length === 0) {
            res.send('Invalid verification link')
        } else {
            await dbQuery('UPDATE users SET email_verification_code=NULL, updated_at=CURRENT_TIMESTAMP WHERE email = ? AND email_verification_code = ?', [req.query.email, req.query.code])
            // res.send('Email verified. Registration Successful!')
            res.redirect(`/?verified=${req.query.email}`)
        }
    } else {
        res.send('Invalid verification link')
    }
})

router.post('/login', async(req, res) => {
    if(req.body.email !== undefined && req.body.password !== undefined) {
        let results = await dbQuery('SELECT * FROM users WHERE email = ?', [req.body.email])
        if(results.length > 0) {
            let user = results[0]
            if(user.email_verification_code) {
                res.send({
                    status: 'error',
                    message: 'Email not verified. Please verify your email address before continuing.'
                })
            } else {
                let passwordMatches = await bcrypt.compare(req.body.password, user.password)
                if(passwordMatches) {
                    res.send({
                        status: 'success',
                        message: 'Logged in',
                        data: {
                            token: jwt.generateToken({ userId: user.id})
                        }
                    })
                } else {
                    res.send({
                        status: 'error',
                        message: 'Incorrect username & password'
                    })
                }
            }
        } else {
            res.send({ status: 'error', message: 'User not found' })
        }
    } else {
        res.send({ status: 'error', message: 'email and password are required fields' })
    }
})

router.post('/forgot-password', async(req, res) => {
    let results = await dbQuery('SELECT * FROM users WHERE email = ?', [req.body.email])
    if(results.length > 0) {
        let user = results[0]
        if(user.email_verification_code) {
            res.send({
                status: 'error',
                message: 'Email not verified. Please verify your email address before continuing.'
            })
        } else {
            let resetCode = stringShuffle('abcdefghijklmnopqrstuvwxyz0123456789'.repeat(2)).substr(0, 64)
            await dbQuery(`
                INSERT INTO password_resets(user_id, code) VALUES(?, ?)
            `, [user.id, resetCode])
            sendMail(req.body.email, 'Projects - Reset Password', `Click <a href="SUBSTITUTE_APP_URL/api/auth/reset-password?email=${req.body.email}&code=${resetCode}">here</a> to reset your password`)
            res.send({
                status: 'success',
                message: 'A password reset link has been sent to your email address'
            })
        }
    } else {
        res.send({ status: 'error', message: 'This email address is not registered with our system' })
    }
})

router.get('/reset-password', async(req, res) => {
    if(req.query.email !== undefined && req.query.email !== '' && req.query.code !== undefined && req.query.code !== '') {
        let results = await dbQuery(`
            SELECT * FROM password_resets
            JOIN users ON users.id = password_resets.user_id
            WHERE users.email = ?
            AND password_resets.code = ?
        `, [req.query.email, req.query.code])
        if(results.length === 0) {
            res.send('Invalid password reset link')
        } else {
            res.send(`
                <title>Projects - Reset Password</title>
                <style>
                body {
                    margin: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                form {
                    padding: 1em;
                    border: 1px solid black;
                }
                </style>
                <form method="POST">
                    <table>
                        <tr>
                            <td>New Password</td>
                            <td>
                                <input type="password" name="newPassword" required autofocus>
                            </td>
                        </tr>
                        <tr>
                            <td>Confirm Password</td>
                            <td>
                                <input type="password" name="newPasswordConfirm" required>
                            </td>
                        </tr>
                    </table>
                    <button style="margin-top: 1em">Reset Password</button>
                </form>
            `)
        }
    } else {
        res.send('Invalid password reset link')
    }
})

router.post('/reset-password', async(req, res) => {
    if(req.body.newPassword !== undefined && req.body.newPasswordConfirm !== undefined && req.body.newPassword === req.body.newPasswordConfirm) {
        let results = await dbQuery(`
            SELECT
                password_resets.id,
                password_resets.user_id
            FROM password_resets
            JOIN users ON users.id = password_resets.user_id
            WHERE users.email = ?
            AND password_resets.code = ?
        `, [req.query.email, req.query.code])

        if(results.length === 0) {
            res.redirect(`/api/auth/reset-password?email=${req.query.email}&code=${req.query.code}`)
            return
        }

        let passwordReset = results[0]

        await dbQuery('UPDATE users SET password=? WHERE id = ?', [
            await bcrypt.hash(req.body.newPassword, saltRounds),
            passwordReset.user_id
        ])

        await dbQuery('DELETE FROM password_resets WHERE id = ?', [passwordReset.id])

        res.redirect(`/?password-reset-successfully=${req.query.email}`)
    } else {
        res.redirect(`/api/auth/reset-password?email=${req.query.email}&code=${req.query.code}`)
    }
})

module.exports = router
