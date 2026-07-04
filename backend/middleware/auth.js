import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// Verify JWT token — protects private routes
export async function protect(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authenticated. Please log in.' })
    }

    // Extract token
    const token = authHeader.split(' ')[1]

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Find user from token's id
    const user = await User.findById(decoded.id)
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User no longer exists.' })
    }

    // Attach user to request
    req.user = user
    next()

  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' })
  }
}

// Restrict to specific roles
export function restrictTo(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. ${req.user.role}s cannot perform this action.`
      })
    }
    next()
  }
}