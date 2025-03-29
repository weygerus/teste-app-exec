const jwt = require('jsonwebtoken')
const secret = '12345'

exports.verifyToken = (req, res, next) => {

  const token = req.headers['authorization']?.split(' ')[1]
  
  if (!token) return res.status(403).json({ message: 'No token provided' })

  jwt.verify(token, secret, (err, decoded) => {

    if (err) return res.status(403).json({ message: 
        `Failed to authenticate token: ${err}`})

    req.userId = decoded.id
    req.userRole = decoded.role
    next()
  })
}

exports.isAdmin = (req, res, next) => {

  if (req.body.role != 1) {

    return res.status(403).json(
    { 
      message: 'Require Admin Role' 
    })
  }  
  
  next()
}