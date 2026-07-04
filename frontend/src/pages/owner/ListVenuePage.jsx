import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2, MapPin, Users, DollarSign,
  Plus, X, ArrowLeft, ArrowRight,
  CheckCircle, Loader2, AlertCircle
} from 'lucide-react'
import api from '../../utils/api.js'

const CATEGORIES = ['Wedding', 'Birthday', 'Banquet Hall', 'Outdoor', 'Auditorium', 'Cafe', 'Studio']

const AMENITY_OPTIONS = [
  'WiFi', 'Parking', 'AC', 'Sound System',
  'Catering', 'Photography', 'Decoration',
  'Generator', 'CCTV', 'Wheelchair Access'
]

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry'
]

function ListVenuePage() {
  const navigate = useNavigate()

  // Multi-step form
  const [step, setStep] = useState(1)
  const TOTAL_STEPS = 4

  // ── FORM STATES ──
  const [name, setName]               = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory]       = useState('')
  const [city, setCity]               = useState('')
  const [state, setState]             = useState('')
  const [address, setAddress]         = useState('')
  const [price, setPrice]             = useState('')
  const [capacity, setCapacity]       = useState('')
  const [amenities, setAmenities]     = useState([])
  const [packages, setPackages]       = useState([
    { name: 'Venue Only', description: 'Just the venue space', price: '', includes: [] }
  ])
  const [weekendMultiplier, setWeekendMultiplier] = useState(1)
  const [errors, setErrors]           = useState({})
  const [loading, setLoading]         = useState(false)
  const [submitted, setSubmitted]     = useState(false)

  // Toggle amenity selection
  function toggleAmenity(amenity) {
    setAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    )
  }

  // Package management
  function addPackage() {
    setPackages(prev => [...prev, {
      name: '', description: '', price: '', includes: []
    }])
  }

  function removePackage(index) {
    setPackages(prev => prev.filter((_, i) => i !== index))
  }

  function updatePackage(index, field, value) {
    setPackages(prev => prev.map((pkg, i) =>
      i === index ? { ...pkg, [field]: value } : pkg
    ))
  }

  // Validation per step
  function validateStep(s) {
    const newErrors = {}

    if (s === 1) {
      if (!name.trim())        newErrors.name        = 'Venue name is required'
      if (!description.trim()) newErrors.description = 'Description is required'
      if (!category)           newErrors.category    = 'Select a category'
    }

    if (s === 2) {
      if (!city.trim())    newErrors.city    = 'City is required'
      if (!state)          newErrors.state   = 'State is required'
      if (!address.trim()) newErrors.address = 'Address is required'
    }

    if (s === 3) {
      if (!price || Number(price) <= 0)       newErrors.price    = 'Enter a valid price'
      if (!capacity || Number(capacity) <= 0) newErrors.capacity = 'Enter a valid capacity'
      if (amenities.length === 0)             newErrors.amenities = 'Select at least one amenity'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleNext() {
    if (validateStep(step)) setStep(s => s + 1)
  }

  function handleBack() {
    setStep(s => s - 1)
  }

  // Submit to backend
  async function handleSubmit() {
    setLoading(true)
    try {
      await api.post('/venues', {
        name,
        description,
        category,
        location: { city, state, address },
        price: Number(price),
        capacity: Number(capacity),
        amenities,
        packages: packages.map(p => ({
          ...p,
          price: Number(p.price) || Number(price)
        })),
        pricing_rules: {
          weekend_multiplier: Number(weekendMultiplier)
        }
      })
      setSubmitted(true)
    } catch (err) {
      setErrors({ submit: err.response?.data?.error || 'Failed to submit. Try again.' })
    } finally {
      setLoading(false)
    }
  }

  // Success screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-10 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-teal-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Venue submitted!</h2>
          <p className="text-sm text-gray-500 mb-2">
            Your venue <span className="font-medium text-gray-700">"{name}"</span> has been submitted for review.
          </p>
          <p className="text-xs text-gray-400 mb-8">
            Our team will verify your listing within 24-48 hours. You'll be notified once it goes live.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/owner/dashboard')}
              className="flex-1 bg-teal-700 text-white text-sm font-medium py-3 rounded-xl hover:bg-teal-800 transition-colors"
            >
              Go to dashboard
            </button>
            <button
              onClick={() => {
                setSubmitted(false)
                setStep(1)
                setName(''); setDescription(''); setCategory('')
                setCity(''); setState(''); setAddress('')
                setPrice(''); setCapacity(''); setAmenities([])
              }}
              className="flex-1 border border-gray-200 text-gray-700 text-sm font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              List another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button
            onClick={() => step === 1 ? navigate('/owner/dashboard') : handleBack()}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-semibold text-gray-800">List your venue</h1>
            <p className="text-xs text-gray-400">Step {step} of {TOTAL_STEPS}</p>
          </div>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all ${
                  i + 1 === step
                    ? 'w-6 h-2 bg-teal-700'
                    : i + 1 < step
                    ? 'w-2 h-2 bg-teal-300'
                    : 'w-2 h-2 bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* ── STEP 1 — Basic info ── */}
        {step === 1 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
            <div>
              <h2 className="text-base font-semibold text-gray-800 mb-1">Basic information</h2>
              <p className="text-xs text-gray-400">Tell guests about your venue</p>
            </div>

            {/* Venue name */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Venue name *</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Grand Convention Hall"
                className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-teal-400'
                }`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Description *</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe your venue — what makes it special, what events it's perfect for..."
                rows={4}
                className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors resize-none ${
                  errors.description ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-teal-400'
                }`}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{description.length}/500</p>
              {errors.description && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.description}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">Category *</label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2.5 rounded-xl border text-sm text-left transition-all ${
                      category === cat
                        ? 'bg-teal-50 border-teal-400 text-teal-800 font-medium'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-teal-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {errors.category && <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><AlertCircle size={11} />{errors.category}</p>}
            </div>
          </div>
        )}

        {/* ── STEP 2 — Location ── */}
        {step === 2 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
            <div>
              <h2 className="text-base font-semibold text-gray-800 mb-1">Location</h2>
              <p className="text-xs text-gray-400">Where is your venue located?</p>
            </div>

            {/* City */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">City *</label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Mumbai"
                  className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-colors ${
                    errors.city ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-teal-400'
                  }`}
                />
              </div>
              {errors.city && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.city}</p>}
            </div>

            {/* State */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">State *</label>
              <select
                value={state}
                onChange={e => setState(e.target.value)}
                className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${
                  errors.state ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-teal-400'
                }`}
              >
                <option value="">Select state...</option>
                {INDIAN_STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {errors.state && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.state}</p>}
            </div>

            {/* Full address */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Full address *</label>
              <textarea
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="123 Main Street, Area Name, City - PIN"
                rows={3}
                className={`w-full border rounded-xl px-4 py-3 text-sm outline-none resize-none transition-colors ${
                  errors.address ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-teal-400'
                }`}
              />
              {errors.address && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.address}</p>}
            </div>
          </div>
        )}

        {/* ── STEP 3 — Pricing & amenities ── */}
        {step === 3 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-base font-semibold text-gray-800 mb-1">Pricing & amenities</h2>
              <p className="text-xs text-gray-400">Set your base price and what you offer</p>
            </div>

            {/* Price + Capacity row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">Base price per day (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                  <input
                    type="number"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="25000"
                    className={`w-full border rounded-xl pl-8 pr-4 py-3 text-sm outline-none transition-colors ${
                      errors.price ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-teal-400'
                    }`}
                  />
                </div>
                {errors.price && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.price}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">Max capacity *</label>
                <div className="relative">
                  <Users size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={capacity}
                    onChange={e => setCapacity(e.target.value)}
                    placeholder="500"
                    className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-colors ${
                      errors.capacity ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-teal-400'
                    }`}
                  />
                </div>
                {errors.capacity && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.capacity}</p>}
              </div>
            </div>

            {/* Weekend pricing */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">
                Weekend price multiplier
                <span className="ml-2 text-teal-600 font-normal">
                  = ₹{price ? Math.round(Number(price) * weekendMultiplier).toLocaleString() : '0'}/day on weekends
                </span>
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="2"
                  step="0.1"
                  value={weekendMultiplier}
                  onChange={e => setWeekendMultiplier(Number(e.target.value))}
                  className="flex-1 accent-teal-700"
                />
                <span className="text-sm font-semibold text-teal-700 min-w-10">
                  {weekendMultiplier}×
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1× (same price)</span>
                <span>2× (double price)</span>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">Amenities *</label>
              <div className="grid grid-cols-2 gap-2">
                {AMENITY_OPTIONS.map(amenity => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm text-left transition-all ${
                      amenities.includes(amenity)
                        ? 'bg-teal-50 border-teal-400 text-teal-800'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-teal-200'
                    }`}
                  >
                    {amenities.includes(amenity) && <CheckCircle size={12} className="text-teal-600 shrink-0" />}
                    {amenity}
                  </button>
                ))}
              </div>
              {errors.amenities && <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><AlertCircle size={11} />{errors.amenities}</p>}
            </div>
          </div>
        )}

        {/* ── STEP 4 — Packages ── */}
        {step === 4 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
            <div>
              <h2 className="text-base font-semibold text-gray-800 mb-1">Packages</h2>
              <p className="text-xs text-gray-400">
                Define what you offer. Customers will choose from these options.
              </p>
            </div>

            {packages.map((pkg, index) => (
              <div
                key={index}
                className="border border-gray-100 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">
                    Package {index + 1}
                  </p>
                  {index > 0 && (
                    <button
                      onClick={() => removePackage(index)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Package name</label>
                    <input
                      value={pkg.name}
                      onChange={e => updatePackage(index, 'name', e.target.value)}
                      placeholder="Venue Only"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Price (₹)</label>
                    <input
                      type="number"
                      value={pkg.price}
                      onChange={e => updatePackage(index, 'price', e.target.value)}
                      placeholder={price || '25000'}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Description</label>
                  <input
                    value={pkg.description}
                    onChange={e => updatePackage(index, 'description', e.target.value)}
                    placeholder="What's included in this package?"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-400"
                  />
                </div>
              </div>
            ))}

            <button
              onClick={addPackage}
              className="w-full border border-dashed border-teal-300 text-teal-700 text-sm font-medium py-3 rounded-xl hover:bg-teal-50 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Add another package
            </button>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600">
                <AlertCircle size={12} className="inline mr-1" />
                {errors.submit}
              </div>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 border border-gray-200 text-gray-700 text-sm font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button
              onClick={handleNext}
              className="flex-1 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`flex-1 text-sm font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                loading
                  ? 'bg-teal-400 text-white cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Submitting...</>
              ) : (
                <><CheckCircle size={16} /> Submit for review</>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}

export default ListVenuePage