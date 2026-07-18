import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, CheckCircle, Loader2, AlertCircle, MapPin, Users
} from 'lucide-react'
import api from '../../utils/api.js'
import { useAuth } from '../../context/AuthContext.jsx'

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

function EditVenuePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  // Form states
  const [name, setName]               = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory]       = useState('')
  const [city, setCity]               = useState('')
  const [state, setState]             = useState('')
  const [address, setAddress]         = useState('')
  const [price, setPrice]             = useState('')
  const [capacity, setCapacity]       = useState('')
  const [amenities, setAmenities]     = useState([])
  const [weekendMultiplier, setWeekendMultiplier] = useState(1)
  const [blackoutDates, setBlackoutDates] = useState([])
  const [newBlackoutDate, setNewBlackoutDate] = useState('')

  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [errors, setErrors]       = useState({})
  const [saved, setSaved]         = useState(false)

  // Fetch existing venue data
  useEffect(() => {
    if (!user) return
    async function fetchVenue() {
      try {
        const res = await api.get(`/venues/${id}`)
        const v = res.data.venue

        // Pre-fill all form fields with existing data
        setName(v.name || '')
        setDescription(v.description || '')
        setCategory(v.category || '')
        setCity(v.location?.city || '')
        setState(v.location?.state || '')
        setAddress(v.location?.address || '')
        setPrice(v.price?.toString() || '')
        setCapacity(v.capacity?.toString() || '')
        setAmenities(v.amenities || [])
        setWeekendMultiplier(v.pricing_rules?.weekend_multiplier || 1)
        setBlackoutDates(v.pricing_rules?.blackout_dates || [])
      } catch (err) {
        setErrors({ fetch: 'Could not load venue data.' })
      } finally {
        setLoading(false)
      }
    }
    fetchVenue()
  }, [id, user])

  function toggleAmenity(amenity) {
    setAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    )
  }

  function addBlackoutDate() {
    if (!newBlackoutDate) return
    if (blackoutDates.includes(newBlackoutDate)) return
    setBlackoutDates(prev => [...prev, newBlackoutDate].sort())
    setNewBlackoutDate('')
  }

  function removeBlackoutDate(date) {
    setBlackoutDates(prev => prev.filter(d => d !== date))
  }

  function validate() {
    const newErrors = {}
    if (!name.trim())        newErrors.name        = 'Venue name is required'
    if (!description.trim()) newErrors.description = 'Description is required'
    if (!category)           newErrors.category    = 'Select a category'
    if (!city.trim())        newErrors.city        = 'City is required'
    if (!state)              newErrors.state       = 'State is required'
    if (!address.trim())     newErrors.address     = 'Address is required'
    if (!price || Number(price) <= 0) newErrors.price = 'Enter a valid price'
    if (!capacity || Number(capacity) <= 0) newErrors.capacity = 'Enter a valid capacity'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    try {
      await api.put(`/venues/${id}`, {
        name,
        description,
        category,
        location: { city, state, address },
        price: Number(price),
        capacity: Number(capacity),
        amenities,
        pricing_rules: {
          weekend_multiplier: Number(weekendMultiplier),
          blackout_dates: blackoutDates
        }
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setErrors({ submit: err.response?.data?.error || 'Failed to save changes.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="text-teal-600 animate-spin" />
      </div>
    )
  }

  if (errors.fetch) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{errors.fetch}</p>
          <button onClick={() => navigate('/owner/my-venues')} className="bg-teal-700 text-white px-6 py-3 rounded-xl text-sm">
            Back to my venues
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/owner/my-venues')}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-base font-semibold text-gray-800">Edit venue</h1>
              <p className="text-xs text-gray-400">{name}</p>
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all ${
              saved
                ? 'bg-teal-50 text-teal-700 border border-teal-200'
                : saving
                ? 'bg-teal-400 text-white cursor-not-allowed'
                : 'bg-teal-700 hover:bg-teal-800 text-white'
            }`}
          >
            {saving ? (
              <><Loader2 size={14} className="animate-spin" /> Saving...</>
            ) : saved ? (
              <><CheckCircle size={14} /> Saved!</>
            ) : (
              'Save changes'
            )}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

        {/* Submit error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 flex items-center gap-2">
            <AlertCircle size={16} /> {errors.submit}
          </div>
        )}

        {/* Success banner */}
        {saved && (
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-sm text-teal-700 flex items-center gap-2">
            <CheckCircle size={16} /> Changes saved successfully!
          </div>
        )}

        {/* Basic info */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Basic information
          </h2>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Venue name *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-teal-400'
              }`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.name}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Description *</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              className={`w-full border rounded-xl px-4 py-3 text-sm outline-none resize-none transition-colors ${
                errors.description ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-teal-400'
              }`}
            />
            {errors.description && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.description}</p>}
          </div>

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

        {/* Location */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Location</h2>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">City *</label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={city}
                onChange={e => setCity(e.target.value)}
                className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-colors ${
                  errors.city ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-teal-400'
                }`}
              />
            </div>
            {errors.city && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.city}</p>}
          </div>

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

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Full address *</label>
            <textarea
              value={address}
              onChange={e => setAddress(e.target.value)}
              rows={2}
              className={`w-full border rounded-xl px-4 py-3 text-sm outline-none resize-none transition-colors ${
                errors.address ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-teal-400'
              }`}
            />
            {errors.address && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.address}</p>}
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Pricing & capacity
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Price per day (₹) *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
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
                  className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-colors ${
                    errors.capacity ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-teal-400'
                  }`}
                />
              </div>
              {errors.capacity && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.capacity}</p>}
            </div>
          </div>

          {/* Weekend multiplier */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">
              Weekend price multiplier
              <span className="ml-2 text-teal-600 font-normal">
                = ₹{price ? Math.round(Number(price) * weekendMultiplier).toLocaleString() : '0'}/day on Fri-Sun
              </span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range" min="1" max="2" step="0.1"
                value={weekendMultiplier}
                onChange={e => setWeekendMultiplier(Number(e.target.value))}
                className="flex-1 accent-teal-700"
              />
              <span className="text-sm font-bold text-teal-700 min-w-10">
                {weekendMultiplier}×
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1× (same price)</span>
              <span>2× (double on weekends)</span>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            Amenities
          </h2>
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
        </div>

        {/* Blackout dates */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">
            Blackout dates
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            Block specific dates — renovation, personal events, or any unavailability.
            These dates will show as unavailable to customers.
          </p>

          {/* Add date */}
          <div className="flex gap-2 mb-4">
            <input
              type="date"
              value={newBlackoutDate}
              onChange={e => setNewBlackoutDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-400"
            />
            <button
              onClick={addBlackoutDate}
              disabled={!newBlackoutDate}
              className="bg-teal-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              Block date
            </button>
          </div>

          {/* Blocked dates list */}
          {blackoutDates.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">
              No dates blocked yet
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {blackoutDates.map(date => (
                <span
                  key={date}
                  className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-1.5 rounded-full"
                >
                  {new Date(date).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                  <button
                    onClick={() => removeBlackoutDate(date)}
                    className="hover:text-red-900 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-4 rounded-2xl text-sm font-semibold transition-all ${
            saving
              ? 'bg-teal-400 text-white cursor-not-allowed'
              : 'bg-teal-700 hover:bg-teal-800 text-white shadow-sm'
          }`}
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Saving changes...
            </span>
          ) : 'Save all changes'}
        </button>

      </div>
    </div>
  )
}

export default EditVenuePage