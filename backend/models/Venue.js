import mongoose from 'mongoose'

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  includes: [String]
})

const venueSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Venue name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  category: {
    type: String,
    enum: ['Wedding', 'Birthday', 'Banquet Hall', 'Outdoor', 'Auditorium', 'Cafe', 'Studio'],
    required: true
  },
  location: {
    city: { type: String, required: true },
    state: { type: String, required: true },
    address: { type: String, required: true },
    lat: { type: Number },
    lng: { type: Number }
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: 1
  },
  amenities: [String],
  packages: [packageSchema],
  images: [String],
  booked_dates: [String],

  // Pricing rules
  pricing_rules: {
    weekend_multiplier: { type: Number, default: 1 },
    festival_multiplier: { type: Number, default: 1 },
    blackout_dates: [String]
  },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  verified: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 0
  },
  is_deleted: {
    type: Boolean,
    default: false
  },

  // ── VERIFICATION SYSTEM ──
  verification: {
    status: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified'
    },
    submitted_at: Date,
    reviewed_at: Date,
    reviewed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejection_reason: String,
    documents: {
      identity_proof: String,
      property_proof: String,
      gst_certificate: String,
      venue_photos: [String]
    }
  },

  owner_phone_verified: {
    type: Boolean,
    default: false
  },

  // ── REPORT SYSTEM ──
  reports: {
    count: { type: Number, default: 0 },
    reporters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }

}, {
  timestamps: true   // ← options go here as SECOND argument, after all fields
})

// ── INDEXES ──
venueSchema.index({ 'location.city': 1 })
venueSchema.index({ 'location.state': 1 })
venueSchema.index({ category: 1 })
venueSchema.index({ price: 1 })
venueSchema.index({ status: 1 })
venueSchema.index({ owner: 1 })

const Venue = mongoose.model('Venue', venueSchema)
export default Venue