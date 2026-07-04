import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import connectDB from './config/db.js'

// Routes
import authRoutes from './routes/auth.js'
import venueRoutes from './routes/venues.js'
import bookingRoutes from './routes/bookings.js'

// Load .env variables
dotenv.config()

// Connect to MongoDB
connectDB()

const app = express()

// ── MIDDLEWARE ──

// CORS — allow requests from our React frontend
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}))

// Parse JSON bodies
app.use(express.json())

// Rate limiting — max 100 requests per IP per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
})
app.use('/api', limiter)

// ── ROUTES ──
app.use('/api/auth', authRoutes)
app.use('/api/venues', venueRoutes)
app.use('/api/bookings', bookingRoutes)

// ── HEALTH CHECK ──
// Visit http://localhost:5000/api/health to verify server is running
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'BookMyVenue API is running',
    timestamp: new Date().toISOString()
  })
})

// ── 404 HANDLER ── ← must come AFTER health check
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' })
})

// ── GLOBAL ERROR HANDLER ──
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    error: err.message || 'Something went wrong'
  })
})

// ── START SERVER ──
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})