import express from 'express'
import Booking from '../models/Booking.js'
import Venue from '../models/Venue.js'
import { protect, restrictTo } from '../middleware/auth.js'

const router = express.Router()

// ── CREATE BOOKING ──
// POST /api/bookings
router.post('/', protect, restrictTo('customer'), async (req, res) => {
  try {
    const {
      venueId, dates, guests,
      eventType, packageName, notes,
      basePrice, platformFee, totalPrice
    } = req.body

    // Find venue
    const venue = await Venue.findById(venueId)
      .populate('owner', 'name phone')

    if (!venue || venue.is_deleted) {
      return res.status(404).json({ error: 'Venue not found' })
    }

    // Check for date conflicts — race condition protection
    const conflictDates = dates.filter(d => venue.booked_dates.includes(d))
    if (conflictDates.length > 0) {
      return res.status(409).json({
        error: `These dates are already booked: ${conflictDates.join(', ')}`
      })
    }

    // Idempotency key — prevents double booking
    const idempotency_key = `${req.user._id}-${venueId}-${dates.sort().join('-')}`

    // Check if booking already exists with this key
    const existing = await Booking.findOne({ idempotency_key })
    if (existing) {
      return res.status(409).json({ error: 'This booking already exists' })
    }

    // Create booking snapshot — freeze venue data at booking time
    const venue_snapshot = {
      name: venue.name,
      address: venue.location.address,
      price: venue.price,
      owner_name: venue.owner.name,
      owner_phone: venue.owner.phone
    }

    // Create booking
    const booking = await Booking.create({
      customer: req.user._id,
      venue: venueId,
      venue_snapshot,
      dates,
      total_days: dates.length,
      guests,
      event_type: eventType,
      package_name: packageName,
      notes,
      base_price: basePrice,
      platform_fee: platformFee,
      total_price: totalPrice,
      idempotency_key,
      status: 'locked',
      payment_status: 'pending'
    })

    // Lock the dates on venue
    await Venue.findByIdAndUpdate(venueId, {
      $push: { booked_dates: { $each: dates } }
    })

    res.status(201).json({ status: 'success', booking })

  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// ── GET MY BOOKINGS (customer) ──
// GET /api/bookings/my-bookings
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id })
      .populate('venue', 'name location images category')
      .sort({ createdAt: -1 })

    res.json({ status: 'success', bookings })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ── GET SINGLE BOOKING ──
// GET /api/bookings/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('venue', 'name location category images')
      .populate('customer', 'name email phone')

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    // Only customer who booked, venue owner, or admin can see it
    const isCustomer = booking.customer._id.toString() === req.user._id.toString()
    const isAdmin    = req.user.role === 'admin'

    if (!isCustomer && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' })
    }

    res.json({ status: 'success', booking })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ── CONFIRM BOOKING (after payment) ──
// PATCH /api/bookings/:id/confirm
router.patch('/:id/confirm', protect, async (req, res) => {
  try {
    const { payment_id } = req.body

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        status: 'confirmed',
        payment_status: 'paid',
        payment_id
      },
      { new: true }
    )

    res.json({ status: 'success', booking })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ── CANCEL BOOKING ──
// PATCH /api/bookings/:id/cancel
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    // Calculate refund based on cancellation policy
    const eventDate   = new Date(booking.dates.sort()[0])
    const today       = new Date()
    const daysUntil   = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24))

    let refundAmount = 0
    if (daysUntil >= 7)      refundAmount = booking.total_price
    else if (daysUntil >= 3) refundAmount = booking.total_price * 0.5
    else                     refundAmount = 0

    // Release dates back to available
    await Venue.findByIdAndUpdate(booking.venue, {
      $pull: { booked_dates: { $in: booking.dates } }
    })

    // Update booking
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        status: 'cancelled',
        cancelled_at: new Date(),
        cancellation_reason: req.body.reason,
        refund_amount: refundAmount,
        payment_status: refundAmount > 0 ? 'refunded' : 'paid'
      },
      { new: true }
    )

    res.json({
      status: 'success',
      booking: updated,
      refundAmount,
      message: refundAmount > 0
        ? `Cancellation successful. ₹${refundAmount} will be refunded.`
        : 'Cancelled. No refund applicable as per policy.'
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ── GET ALL BOOKINGS (admin) ──
// GET /api/bookings/admin/all
router.get('/admin/all', protect, restrictTo('admin'), async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('customer', 'name email')
      .populate('venue', 'name location')
      .sort({ createdAt: -1 })

    res.json({ status: 'success', bookings })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router