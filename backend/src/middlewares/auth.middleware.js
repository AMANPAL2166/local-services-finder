import jwt         from 'jsonwebtoken'
import User        from '../models/User.model.js'
import asyncHandler from '../utils/asyncHandler.js'

export const protect = asyncHandler(async (req, res, next) => {
  let token

  // Check Authorization header first, then cookie
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.cookies?.token) {
    token = req.cookies.token
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please login to continue.',
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user    = await User.findById(decoded.id).select('-password')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists',
      })
    }

    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: err.name === 'TokenExpiredError'
        ? 'Session expired, please login again'
        : 'Invalid token, please login again',
    })
  }
})

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. This action requires ${roles.join(' or ')} role.`,
    })
  }
  next()
}