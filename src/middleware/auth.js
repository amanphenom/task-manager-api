const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    console.log('Auth middleware')
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // Check if decoded payload has valid user id and token exist in tokens array
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
        if (!user)
            throw new Error()
        
        // Set user in req so that route handler does not have to do db op again
        req.user = user
        req.token = token
        next()
    } catch (e) {
        res.status(401).send({ error: 'Authentication failed' })
    }
}

module.exports = auth