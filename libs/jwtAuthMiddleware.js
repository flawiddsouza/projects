const jwt =  require('./jwt')

module.exports = function authCheck(req, res, next) {
    if(req.body.token || req.header('Token')) {
        try {
            let token = null
            if(req.header('Token')) {
                token = req.header('Token')
            }
            if(req.body.token) {
                token = req.body.token
            }
            let decodedToken = jwt.verifyToken(token)
            req.authUserId = decodedToken.userId // decoded has the object structure { userId: userId }
        } catch(err) {
            if(err.name == 'JsonWebTokenError') {
                return res.json({
                    status: 'error',
                    message: 'Authentication failed. Invalid token provided.'
                })
            } else if(err.name == 'TokenExpiredError') {
                return res.json({
                    status: 'error',
                    message: 'Authentication failed. Token provided has expired.'
                })
            } else {
                console.log(err)
            }
        }
    } else {
        return res.json({
            status: 'error',
            message: 'Authentication failed. No token provided.'
        })
    }
    next()
}
