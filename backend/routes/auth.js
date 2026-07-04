import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Helper — creates JWT token
function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
}

// Helper — send token response
function sendToken(user, statusCode, res) {
  const token = signToken(user._id)
  res.status(statusCode).json({
    status: 'success',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      businessName: user.businessName
    }
  })
}

// ── SIGNUP ──
// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, phone, password, role, businessName } = req.body

    // Check if email already exists
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,       // auto-hashed by pre-save hook in model
      role: role || 'customer',
      businessName
    })

    sendToken(user, 201, res)

  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// ── LOGIN ──
// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Find user — include password (select: false by default)
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Check password
    const isCorrect = await user.comparePassword(password)
    if (!isCorrect) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    sendToken(user, 200, res)

  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// ── GET CURRENT USER ──
// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({
    status: 'success',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      businessName: req.user.businessName
    }
  })
})

export default router