import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Star, Users, CheckCircle, ArrowLeft, Wifi, Car, Wind, Music, Camera, Coffee, ChevronLeft, ChevronRight, Share2, Heart } from 'lucide-react'

// ─── SAMPLE DATA ───────────────────────────────────────────
const SAMPLE_VENUES = [
  {
    id: '1',
    name: 'Kochi Convention Centre',
    location: 'Ernakulam',
    address: 'MG Road, Ernakulam, Kochi, Kerala 682011',
    category: 'Banquet Hall',
    price: 25000,
    capacity: 500,
    rating: 4.8,
    reviews: 124,
    verified: true,
    description: 'A premium banquet hall in the heart of Kochi, perfect for weddings, corporate events, and large gatherings. Features state-of-the-art sound systems, elegant decor, and a dedicated event management team.',
    amenities: ['WiFi', 'Parking', 'AC', 'Sound System', 'Catering', 'Photography'],
    owner: { name: 'Suresh Kumar', phone: '+91 98765 43210' },
    booked_dates: ['2026-06-25', '2026-06-26', '2026-07-04', '2026-07-10', '2026-07-15'],
  },
  {
    id: '2',
    name: 'Beach Pavilion Kozhikode',
    location: 'Kozhikode',
    address: 'Beach Road, Kozhikode, Kerala 673001',
    category: 'Outdoor',
    price: 18000,
    capacity: 300,
    rating: 4.6,
    reviews: 89,
    verified: false,
    description: 'A stunning outdoor venue right on the Kozhikode beach. Ideal for sunset weddings, birthday parties, and cultural events.',
    amenities: ['Parking', 'Sound System', 'Catering', 'Photography'],
    owner: { name: 'Anitha Menon', phone: '+91 94567 89012' },
    booked_dates: ['2026-06-28', '2026-07-05', '2026-07-12'],
  },
  {
    id: '3',
    name: 'Thrissur Heritage Hall',
    location: 'Thrissur',
    address: 'Swaraj Round, Thrissur, Kerala 680001',
    category: 'Wedding',
    price: 32000,
    capacity: 800,
    rating: 4.9,
    reviews: 201,
    verified: true,
    description: 'A majestic heritage hall in the cultural capital of Kerala. With traditional Kerala architecture and modern amenities.',
    amenities: ['WiFi', 'Parking', 'AC', 'Sound System', 'Catering', 'Photography', 'Decoration'],
    owner: { name: 'Rajan Pillai', phone: '+91 97654 32109' },
    booked_dates: ['2026-06-29', '2026-06-30', '2026-07-06', '2026-07-07', '2026-07-20'],
  },
]

// ─── CONSTANTS ──────────
const AMENITY_ICONS = {
  'WiFi': <Wifi size={16} />,
  'Parking': <Car size={16} />,
  'AC': <Wind size={16} />,
  'Sound System': <Music size={16} />,
  'Photography': <Camera size={16} />,
  'Catering': <Coffee size={16} />,
  'Decoration': <Star size={16} />,
}

const CATEGORY_EMOJIS = {
  'Wedding': '💍',
  'Birthday': '🎂',
  'Banquet Hall': '🏛️',
  'Outdoor': '🌿',
  'Auditorium': '🎤',
  'Cafe': '☕',
  'Studio': '📸',
}

const HERO_COLORS = [
  'from-teal-50 to-teal-100',
  'from-amber-50 to-amber-100',
  'from-pink-50 to-pink-100',
]

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

// ─── CALENDAR HELPERS ─────────
// How many days in a given month?
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

// What day of week does month start on? (0=Sun, 6=Sat)
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

// Turn year/month/day numbers into "2026-06-25" string
function formatDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}


function VenueDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Find venue whose id matches URL param
  const venue = SAMPLE_VENUES.find(v => v.id === id)

  // Today's date — used to disable past dates
  const today = new Date()
  today.setHours(0, 0, 0, 0) // reset time to midnight for clean comparison

  // ── STATES ──
  const [calMonth, setCalMonth] = useState(today.getMonth())    // which month calendar shows
  const [calYear, setCalYear]   = useState(today.getFullYear()) // which year calendar shows
  const [selectedDates, setSelectedDates] = useState([])        // array of picked dates
  const [liked, setLiked] = useState(false)                     // heart button toggle

  // ── VENUE NOT FOUND ──
  // If user visits /venue/999 which doesn't exist → show error screen
  if (!venue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-xl font-semibold text-gray-700 mb-2">Venue not found</p>
          <p className="text-sm text-gray-400 mb-6">This venue may have been removed</p>
          <button
            onClick={() => navigate('/browse')}
            className="bg-teal-700 text-white text-sm font-medium px-6 py-3 rounded-xl">
              Back to Browse
          </button>
        </div>
      </div>
    )
  }

  // ── CALENDAR COMPUTED VALUES ──
  const daysInMonth = getDaysInMonth(calYear, calMonth)
  const firstDay    = getFirstDayOfMonth(calYear, calMonth)

  // ── CALENDAR NAVIGATION ──
  function prevMonth() {
    // If January → go to December of previous year
    if (calMonth === 0) {
      setCalMonth(11)
      setCalYear(y => y - 1)
    } else {
      setCalMonth(m => m - 1)
    }
  }

  function nextMonth() {
    // If December → go to January of next year
    if (calMonth === 11) {
      setCalMonth(0)
      setCalYear(y => y + 1)
    } else {
      setCalMonth(m => m + 1)
    }
  }

  // ── DATE CLICK HANDLER ──
  function handleDateClick(day) {
    const dateStr = formatDate(calYear, calMonth, day)
    const clickedDate = new Date(dateStr)
    const isPast     = clickedDate < today
    const isBooked   = venue.booked_dates.includes(dateStr)

    // Do nothing if past or already booked
    if (isPast || isBooked) return

    setSelectedDates(prev => {
      // If this date is already selected → remove it (deselect)
      if (prev.includes(dateStr)) {
        return prev.filter(d => d !== dateStr)
      }
      // If not selected → add it
      return [...prev, dateStr]
    })
  }

  // ── REMOVE ONE DATE (from chip below calendar) ──
  function removeDate(dateStr) {
    setSelectedDates(prev => prev.filter(d => d !== dateStr))
  }

  // ── TOTAL DAYS + PRICE ──
  const totalDays  = selectedDates.length
  const basePrice  = venue.price * totalDays
  const platformFee = basePrice * 0.05
  const totalPrice = basePrice + platformFee

  // ── BOOK NOW ──
  function handleBookNow() {
    if (selectedDates.length === 0) {
      alert('Please select at least one date!')
      return
    }
    // Sort dates and pass to booking page as URL parameter
    const datesParam = selectedDates.sort().join(',')
    navigate(`/booking/${venue.id}?dates=${datesParam}`)
  }

  // Pick hero color based on venue id
  const heroColor = HERO_COLORS[(Number(id) - 1) % HERO_COLORS.length]

  // ─── RENDER ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO ── */}
      <div className={`h-72 bg-gradient-to-br ${heroColor} flex items-center justify-center relative`}>
        <span className="text-8xl">{CATEGORY_EMOJIS[venue.category] || '🏛️'}</span>

        {/* Back button — navigate(-1) goes to previous page */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white bg-opacity-90 text-gray-700 p-2 rounded-xl shadow-sm flex items-center gap-2 text-sm font-medium hover:bg-opacity-100 transition-all"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Top right action buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setLiked(!liked)}
            className="bg-white bg-opacity-90 p-2.5 rounded-xl shadow-sm hover:bg-opacity-100 transition-all"
          >
            <Heart
              size={18}
              className={liked ? 'fill-red-500 text-red-500' : 'text-gray-500'}
            />
          </button>
          <button className="bg-white bg-opacity-90 p-2.5 rounded-xl shadow-sm hover:bg-opacity-100 transition-all">
            <Share2 size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Verified badge — only shows if venue.verified is true */}
        {venue.verified && (
          <div className="absolute bottom-4 left-4 bg-white text-teal-700 text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium shadow-sm">
            <CheckCircle size={12} /> Verified venue
          </div>
        )}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── LEFT — venue details ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Name + category + rating */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-800">{venue.name}</h1>
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full shrink-0 ml-3">
                  {venue.category}
                </span>
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                <MapPin size={14} className="text-teal-600" />
                {venue.address}
              </p>
              <div className="flex items-center gap-5 text-sm">
                <span className="flex items-center gap-1.5">
                  <Star size={15} className="text-amber-400 fill-amber-400" />
                  <span className="font-semibold text-gray-800">{venue.rating}</span>
                  <span className="text-gray-400">({venue.reviews} reviews)</span>
                </span>
                <span className="flex items-center gap-1.5 text-gray-500">
                  <Users size={14} />
                  Up to {venue.capacity} guests
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-base font-semibold text-gray-800 mb-2">About this venue</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{venue.description}</p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-base font-semibold text-gray-800 mb-3">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {venue.amenities.map(amenity => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-700"
                  >
                    <span className="text-teal-600">
                      {AMENITY_ICONS[amenity] || '✓'}
                    </span>
                    {amenity}
                  </div>
                ))}
              </div>
            </div>

            {/* ── AVAILABILITY CALENDAR ── */}
            <div>
              <h2 className="text-base font-semibold text-gray-800 mb-1">
                Select your dates
              </h2>
              <p className="text-xs text-gray-400 mb-3">
                Click individual dates to select. Click again to deselect.
              </p>

              <div className="bg-white border border-gray-100 rounded-2xl p-5">

                {/* Month navigator */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={prevMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft size={18} className="text-gray-600" />
                  </button>
                  <p className="text-sm font-semibold text-gray-800">
                    {MONTH_NAMES[calMonth]} {calYear}
                  </p>
                  <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight size={18} className="text-gray-600" />
                  </button>
                </div>

                {/* Day of week headers */}
                <div className="grid grid-cols-7 mb-1">
                  {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                    <div
                      key={d}
                      className="text-center text-xs font-medium text-gray-400 py-1"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">

                  {/* Empty cells before first day */}
                  {Array.from({ length: firstDay }).map((_, i) => (  
                    <div key={`empty-${i}`} />
                  ))}

                  {/* Day cells */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day     = i + 1
                    const dateStr = formatDate(calYear, calMonth, day)
                    const isPast  = new Date(dateStr) < today
                    const isBooked    = venue.booked_dates.includes(dateStr)
                    const isSelected  = selectedDates.includes(dateStr)
                    const isToday     = dateStr === formatDate(
                      today.getFullYear(), today.getMonth(), today.getDate()
                    )

                    return (
                      <button
                        key={day}
                        onClick={() => handleDateClick(day)}
                        disabled={isPast || isBooked}
                        className={`
                          h-9 w-full rounded-lg text-sm font-medium transition-all
                          ${isSelected
                            ? 'bg-teal-700 text-white scale-95'
                            : isBooked
                            ? 'bg-red-50 text-red-300 cursor-not-allowed line-through'
                            : isPast
                            ? 'text-gray-200 cursor-not-allowed'
                            : isToday
                            ? 'border-2 border-teal-400 text-teal-700 hover:bg-teal-50'
                            : 'text-gray-700 hover:bg-teal-50 hover:text-teal-700'
                          }
                        `}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-5 mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <div className="w-3 h-3 rounded bg-teal-700" />
                    Selected
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <div className="w-3 h-3 rounded bg-red-100" />
                    Booked
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <div className="w-3 h-3 rounded border-2 border-teal-400" />
                    Today
                  </div>
                </div>
              </div>

              {/* Selected date chips */}
              {selectedDates.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedDates.sort().map(d => (
                    <span
                      key={d}
                      onClick={() => removeDate(d)}
                      className="bg-teal-50 border border-teal-200 text-teal-800 text-xs px-3 py-1.5 rounded-full cursor-pointer hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors flex items-center gap-1.5"
                    >
                      {new Date(d).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short'
                      })}
                      <span className="text-xs">✕</span>
                    </span>
                  ))}
                  <button
                    onClick={() => setSelectedDates([])}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors underline"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* ── RIGHT — booking card ── */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 sticky top-24">

              {/* Price per day */}
              <div className="mb-4">
                <span className="text-2xl font-bold text-teal-700">
                  ₹{venue.price.toLocaleString()}
                </span>
                <span className="text-gray-400 text-sm"> /day</span>
              </div>

              {/* Date selection summary */}
              <div className={`mb-4 p-3 rounded-xl border text-sm transition-all ${
                selectedDates.length > 0
                  ? 'bg-teal-50 border-teal-200 text-teal-800'
                  : 'bg-gray-50 border-gray-200 text-gray-400'
              }`}>
                {selectedDates.length === 0
                  ? 'Click dates on the calendar'
                  : selectedDates.length === 1
                  ? `📅 ${new Date(selectedDates[0]).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`
                  : `📅 ${selectedDates.length} dates selected`
                }
              </div>

              {/* Price breakdown — only shows when dates are selected */}
              {selectedDates.length > 0 && (
                <div className="mb-4 space-y-2 text-sm border-t border-gray-100 pt-3">
                  <div className="flex justify-between text-gray-600">
                    <span>₹{venue.price.toLocaleString()} × {totalDays} day{totalDays > 1 ? 's' : ''}</span>
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
              )}

              {/* Book Now button */}
              <button
                onClick={handleBookNow}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                  selectedDates.length > 0
                    ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-sm hover:shadow-md'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {selectedDates.length > 0
                  ? `Book ${totalDays} day${totalDays > 1 ? 's' : ''} · ₹${totalPrice.toLocaleString()}`
                  : 'Select dates to book'
                }
              </button>

              {/* Owner info */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Listed by</p>
                <p className="text-sm font-medium text-gray-700">{venue.owner.name}</p>
                <p className="text-xs text-teal-600">{venue.owner.phone}</p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default VenueDetailPage