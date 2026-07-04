import express from 'express'
import Venue from '../models/Venue.js'
import { protect, restrictTo } from '../middleware/auth.js'

const router = express.Router()

// ── GET ALL VENUES (public) ──
// GET /api/venues?category=Wedding&district=Ernakulam&page=1
router.get('/', async (req, res) => {
  try {
    const {
      category, district, minPrice,
      maxPrice, minCapacity, page = 1, limit = 12
    } = req.query

    // Build filter object dynamically
    const filter = {
      status: 'approved',
      is_deleted: false
    }

    if (category)    filter.category = category
    if (district)    filter['location.district'] = district
    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = Number(minPrice)
      if (maxPrice) filter.price.$lte = Number(maxPrice)
    }
    if (minCapacity) filter.capacity = { $gte: Number(minCapacity) }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit)

    const [venues, total] = await Promise.all([
      Venue.find(filter)
        .populate('owner', 'name phone')
        .sort({ rating: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Venue.countDocuments(filter)
    ])

    res.json({
      status: 'success',
      results: venues.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      venues
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ── GET SINGLE VENUE (public) ──
// GET /api/venues/:id
router.get('/:id', async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id)
      .populate('owner', 'name phone email')

    if (!venue || venue.is_deleted) {
      return res.status(404).json({ error: 'Venue not found' })
    }

    res.json({ status: 'success', venue })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ── CREATE VENUE (owners only) ──
// POST /api/venues
router.post('/', protect, restrictTo('owner'), async (req, res) => {
  try {
    const venue = await Venue.create({
      ...req.body,
      owner: req.user._id  // attach logged-in owner's ID
    })

    res.status(201).json({ status: 'success', venue })

  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// ── UPDATE VENUE (owner only — their own venue) ──
// PUT /api/venues/:id
router.put('/:id', protect, restrictTo('owner', 'admin'), async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id)

    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' })
    }

    // Owner can only update their own venues
    if (req.user.role === 'owner' &&
        venue.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only edit your own venues' })
    }

    const updated = await Venue.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    res.json({ status: 'success', venue: updated })

  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// ── SOFT DELETE VENUE ──
// DELETE /api/venues/:id
router.delete('/:id', protect, restrictTo('owner', 'admin'), async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id)

    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' })
    }

    // Soft delete — never actually remove from DB
    venue.is_deleted = true
    await venue.save()

    res.json({ status: 'success', message: 'Venue removed successfully' })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ── GET MY VENUES (owner) ──
// GET /api/venues/owner/my-venues
router.get('/owner/my-venues', protect, restrictTo('owner'), async (req, res) => {
  try {
    const venues = await Venue.find({
      owner: req.user._id,
      is_deleted: false
    }).sort({ createdAt: -1 })

    res.json({ status: 'success', venues })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ── APPROVE VENUE (admin only) ──
// PATCH /api/venues/:id/approve
router.patch('/:id/approve', protect, restrictTo('admin'), async (req, res) => {
  try {
    const venue = await Venue.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', verified: true },
      { new: true }
    )

    res.json({ status: 'success', venue })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router