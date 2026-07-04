import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
  // Who booked
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Which venue
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: true
  },

  // Snapshot of venue at booking time
  // So if owner updates venue, old bookings stay accurate
  venue_snapshot: {
    name: String,
    address: String,
    price: Number,
    owner_name: String,
    owner_phone: String
  },

  // Booking details
  dates: [String],          // ["2026-07-10", "2026-07-12"]
  total_days: Number,
  guests: Number,
  event_type: String,
  package_name: String,
  notes: String,

  // Payment
  base_price: Number,
  platform_fee: Number,
  total_price: Number,
  payment_id: String,       // Razorpay payment ID
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },

  // Booking status — our state machine from system design
  status: {
    type: String,
    enum: ['locked', 'confirmed', 'cancelled', 'completed', 'no_show'],
    default: 'locked'
  },

  // Auto-release lock after 10 minutes if payment not completed
  locked_until: {
    type: Date,
    default: () => new Date(Date.now() + 10 * 60 * 1000)
  },

  // Cancellation
  cancelled_at: Date,
  cancellation_reason: String,
  refund_amount: Number,

  // Unique key to prevent double booking
  idempotency_key: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
})

// ── INDEXES ──
bookingSchema.index({ customer: 1 })
bookingSchema.index({ venue: 1 })
bookingSchema.index({ status: 1 })

const Booking = mongoose.model('Booking', bookingSchema)
export default Booking