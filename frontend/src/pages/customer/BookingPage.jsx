import { useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Users, ChevronDown, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'

// Same sample venues — later from API
const SAMPLE_VENUES = [
  {
    id: '1',
    name: 'Kochi Convention Centre',
    location: 'Ernakulam',
    category: 'Banquet Hall',
    price: 25000,
    capacity: 500,
    rating: 4.8,
    verified: true,
    owner: { name: 'Suresh Kumar', phone: '+91 98765 43210' },
  },
  {
    id: '2',
    name: 'Beach Pavilion Kozhikode',
    location: 'Kozhikode',
    category: 'Outdoor',
    price: 18000,
    capacity: 300,
    rating: 4.6,
    verified: false,
    owner: { name: 'Anitha Menon', phone: '+91 94567 89012' },
  },
  {
    id: '3',
    name: 'Thrissur Heritage Hall',
    location: 'Thrissur',
    category: 'Wedding',
    price: 32000,
    capacity: 800,
    rating: 4.9,
    verified: true,
    owner: { name: 'Rajan Pillai', phone: '+91 97654 32109' },
  },
]

const CATEGORY_EMOJIS = {
  'Wedding': '💍', 'Birthday': '🎂', 'Banquet Hall': '🏛️',
  'Outdoor': '🌿', 'Auditorium': '🎤', 'Cafe': '☕', 'Studio': '📸',
}

const PACKAGES = [
  { id: 'basic', label: 'Basic', description: 'Venue only', multiplier: 1 },
  { id: 'silver', label: 'Silver', description: 'Venue + Catering', multiplier: 1.3 },
  { id: 'gold', label: 'Gold', description: 'Venue + Catering + Decoration + Photography', multiplier: 1.8 },
]

const EVENT_TYPES = [
  'Wedding', 'Birthday Party', 'Corporate Event',
  'Baby Shower', 'Anniversary', 'Engagement', 'Other'
]

function BookingPage() {
  const { venueId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // Read dates from URL — comes from VenueDetailPage
  const datesParam = searchParams.get('dates') || ''
  const selectedDates = datesParam ? datesParam.split(',') : []

  // Find venue
  const venue = SAMPLE_VENUES.find(v => v.id === venueId)

  // ── FORM STATES ──
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [phone, setPhone]         = useState('')
  const [guests, setGuests]       = useState('')
  const [eventType, setEventType] = useState('')
  const [packageId, setPackageId] = useState('basic')
  const [notes, setNotes]         = useState('')
  const [step, setStep]           = useState(1) // 1=details, 2=review, 3=success
  const [errors, setErrors]       = useState({})

  // ── COMPUTED VALUES ──
  const totalDays     = selectedDates.length
  const selectedPkg   = PACKAGES.find(p => p.id === packageId)
  const basePrice     = venue ? venue.price * totalDays * selectedPkg.multiplier : 0
  const platformFee   = basePrice * 0.05
  const totalPrice    = basePrice + platformFee

  // ── VALIDATION ──
  function validate() {
    const newErrors = {}
    if (!name.trim())    newErrors.name    = 'Name is required'
    if (!email.trim())   newErrors.email   = 'Email is required'
    else if (!email.includes('@')) newErrors.email = 'Enter a valid email'
    if (!phone.trim())   newErrors.phone   = 'Phone is required'
    else if (phone.length < 10)   newErrors.phone = 'Enter a valid phone number'
    if (!guests.trim())  newErrors.guests  = 'Number of guests is required'
    else if (Number(guests) > venue.capacity) newErrors.guests = `Max capacity is ${venue.capacity} guests`
    if (!eventType)      newErrors.eventType = 'Please select event type'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleContinue() {
    if (validate()) setStep(2)
  }

  // Mock payment — in real app this calls Razorpay
  function handleConfirmBooking() {
    setStep(3)
  }

  // ── VENUE NOT FOUND ──
  if (!venue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-lg font-semibold text-gray-700">Venue not found</p>
          <button onClick={() => navigate('/browse')} className="mt-4 bg-teal-700 text-white px-6 py-3 rounded-xl text-sm">
            Back to Browse
          </button>
        </div>
      </div>
    )
  }

  // ── NO DATES SELECTED ──
  if (selectedDates.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">📅</p>
          <p className="text-lg font-semibold text-gray-700">No dates selected</p>
          <button onClick={() => navigate(`/venue/${venueId}`)} className="mt-4 bg-teal-700 text-white px-6 py-3 rounded-xl text-sm">
            Go back and select dates
          </button>
        </div>
      </div>
    )
  }

  // ── SUCCESS SCREEN ──
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-teal-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
          <p className="text-sm text-gray-500 mb-6">
            Your booking at <span className="font-medium text-gray-700">{venue.name}</span> has been confirmed.
            A confirmation will be sent to <span className="font-medium">{email}</span>
          </p>

          {/* Booking summary */}
          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Booking ID</span>
              <span className="font-medium text-gray-800">
                BMV-{Math.random().toString(36).substr(2,8).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Venue</span>
              <span className="font-medium text-gray-800">{venue.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Dates</span>
              <span className="font-medium text-gray-800">{totalDays} day{totalDays > 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Package</span>
              <span className="font-medium text-gray-800">{selectedPkg.label}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-200">
              <span className="text-gray-700">Total paid</span>
              <span className="text-teal-700">₹{totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/my-bookings')}
              className="flex-1 bg-teal-700 text-white text-sm font-medium py-3 rounded-xl hover:bg-teal-800 transition-colors"
            >
              View my bookings
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 border border-gray-200 text-gray-700 text-sm font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Go home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HEADER ── */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button
            onClick={() => step === 1 ? navigate(-1) : setStep(1)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-base font-semibold text-gray-800">
              {step === 1 ? 'Enter your details' : 'Review your booking'}
            </h1>
            <p className="text-xs text-gray-400">{venue.name}</p>
          </div>

          {/* Step indicator */}
          <div className="ml-auto flex items-center gap-2">
            {[1, 2].map(s => (
              <div
                key={s}
                className={`w-7 h-7 rounded-full text-xs font-medium flex items-center justify-center transition-all ${
                  s === step
                    ? 'bg-teal-700 text-white'
                    : s < step
                    ? 'bg-teal-100 text-teal-700'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {s < step ? '✓' : s}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── MAIN FORM ── */}
          <div className="lg:col-span-2">

            {/* STEP 1 — Details form */}
            {step === 1 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Your details
                </h2>

                {/* Name */}
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                    Full name *
                  </label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Rinshan Khan"
                    className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${
                      errors.name
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200 focus:border-teal-400'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                    Email address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="rinshan@example.com"
                    className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${
                      errors.email
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200 focus:border-teal-400'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                    Phone number *
                  </label>
                  <div className="flex gap-2">
                    <span className="border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-500 bg-gray-50">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="98765 43210"
                      className={`flex-1 border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${
                        errors.phone
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200 focus:border-teal-400'
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {errors.phone}
                    </p>
                  )}
                </div>

                {/* Guests + Event type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                      Number of guests *
                    </label>
                    <div className="relative">
                      <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        value={guests}
                        onChange={e => setGuests(e.target.value)}
                        placeholder="150"
                        className={`w-full border rounded-xl pl-8 pr-4 py-3 text-sm outline-none transition-colors ${
                          errors.guests
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200 focus:border-teal-400'
                        }`}
                      />
                    </div>
                    {errors.guests && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={11} /> {errors.guests}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                      Event type *
                    </label>
                    <div className="relative">
                      <select
                        value={eventType}
                        onChange={e => setEventType(e.target.value)}
                        className={`w-full border rounded-xl px-4 py-3 text-sm outline-none appearance-none transition-colors ${
                          errors.eventType
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200 focus:border-teal-400'
                        }`}
                      >
                        <option value="">Select...</option>
                        {EVENT_TYPES.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.eventType && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={11} /> {errors.eventType}
                      </p>
                    )}
                  </div>
                </div>

                {/* Package selector */}
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-2 block">
                    Choose package
                  </label>
                  <div className="space-y-2">
                    {PACKAGES.map(pkg => (
                      <button
                        key={pkg.id}
                        onClick={() => setPackageId(pkg.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                          packageId === pkg.id
                            ? 'border-teal-400 bg-teal-50'
                            : 'border-gray-200 hover:border-teal-200'
                        }`}
                      >
                        <div>
                          <p className={`text-sm font-medium ${
                            packageId === pkg.id ? 'text-teal-800' : 'text-gray-700'
                          }`}>
                            {pkg.label}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{pkg.description}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${
                            packageId === pkg.id ? 'text-teal-700' : 'text-gray-600'
                          }`}>
                            ₹{(venue.price * pkg.multiplier * totalDays).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            ₹{(venue.price * pkg.multiplier).toLocaleString()}/day
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                    Special requests (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Any special requirements, dietary needs, setup preferences..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-400 transition-colors resize-none"
                  />
                </div>

                <button
                  onClick={handleContinue}
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold py-3.5 rounded-xl transition-colors"
                >
                  Continue to review →
                </button>
              </div>
            )}

            {/* STEP 2 — Review */}
            {step === 2 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Review your booking
                </h2>

                {/* Details review */}
                <div className="space-y-3">
                  {[
                    { label: 'Name', value: name },
                    { label: 'Email', value: email },
                    { label: 'Phone', value: `+91 ${phone}` },
                    { label: 'Guests', value: `${guests} people` },
                    { label: 'Event type', value: eventType },
                    { label: 'Package', value: `${selectedPkg.label} — ${selectedPkg.description}` },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between py-2 border-b border-gray-50 text-sm">
                      <span className="text-gray-400">{item.label}</span>
                      <span className="font-medium text-gray-700">{item.value}</span>
                    </div>
                  ))}
                  {notes && (
                    <div className="py-2 text-sm">
                      <p className="text-gray-400 mb-1">Special requests</p>
                      <p className="text-gray-700">{notes}</p>
                    </div>
                  )}
                </div>

                {/* Cancellation policy */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-amber-800 mb-1">
                    Cancellation policy
                  </p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Cancel 7+ days before → Full refund.
                    Cancel 3–7 days before → 50% refund.
                    Cancel under 3 days → No refund.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border border-gray-200 text-gray-700 text-sm font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    ← Edit details
                  </button>
                  <button
                    onClick={handleConfirmBooking}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
                  >
                    Confirm & Pay ₹{totalPrice.toLocaleString()}
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* ── RIGHT — booking summary ── */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 sticky top-24">

              {/* Venue mini card */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                  {CATEGORY_EMOJIS[venue.category] || '🏛️'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{venue.name}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <MapPin size={10} /> {venue.location}
                  </p>
                </div>
              </div>

              {/* Selected dates */}
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                  <Calendar size={11} className="inline mr-1" />
                  Selected dates
                </p>
                <div className="flex flex-wrap gap-1">
                  {selectedDates.sort().map(d => (
                    <span
                      key={d}
                      className="bg-teal-50 text-teal-700 text-xs px-2 py-1 rounded-lg"
                    >
                      {new Date(d).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short'
                      })}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price breakdown */}
              <div className="space-y-2 text-sm pt-3 border-t border-gray-100">
                <div className="flex justify-between text-gray-500">
                  <span>₹{(venue.price * selectedPkg.multiplier).toLocaleString()} × {totalDays} day{totalDays > 1 ? 's' : ''}</span>
                  <span>₹{basePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Platform fee (5%)</span>
                  <span>₹{platformFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-800 pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-teal-700">₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default BookingPage