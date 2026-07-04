import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin, Calendar, CheckCircle, Clock,
  XCircle, Loader2, ArrowRight, AlertCircle
} from 'lucide-react'
import api from '../../utils/api.js'
import { isLoggedIn } from '../../utils/auth.js'

const STATUS_CONFIG = {
  locked: {
    label: 'Pending payment',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: <Clock size={12} />
  },
  confirmed: {
    label: 'Confirmed',
    color: 'bg-teal-50 text-teal-700 border-teal-200',
    icon: <CheckCircle size={12} />
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-50 text-red-600 border-red-200',
    icon: <XCircle size={12} />
  },
  completed: {
    label: 'Completed',
    color: 'bg-gray-50 text-gray-600 border-gray-200',
    icon: <CheckCircle size={12} />
  }
}

const CATEGORY_EMOJIS = {
  'Wedding': '💍', 'Birthday': '🎂', 'Banquet Hall': '🏛️',
  'Outdoor': '🌿', 'Auditorium': '🎤', 'Cafe': '☕', 'Studio': '📸'
}

function MyBookingsPage() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [filter, setFilter]     = useState('all')

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login')
    }
  }, [])

  // Fetch bookings
  useEffect(() => {
    async function fetchBookings() {
      setLoading(true)
      try {
        const res = await api.get('/bookings/my-bookings')
        setBookings(res.data.bookings)
      } catch (err) {
        setError('Could not load bookings.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [])

  // Filter bookings by status
  const filtered = bookings.filter(b => {
    if (filter === 'all') return true
    if (filter === 'upcoming') return b.status === 'confirmed'
    if (filter === 'cancelled') return b.status === 'cancelled'
    if (filter === 'completed') return b.status === 'completed'
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl font-bold text-gray-800 mb-1">My Bookings</h1>
          <p className="text-sm text-gray-400">
            {bookings.length} total booking{bookings.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6">

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { key: 'all', label: 'All' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'completed', label: 'Completed' },
            { key: 'cancelled', label: 'Cancelled' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all ${
                filter === tab.key
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={32} className="text-teal-600 animate-spin mb-3" />
            <p className="text-sm text-gray-400">Loading your bookings...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-20">
            <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
            <p className="text-gray-600">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📋</p>
            <p className="text-lg font-semibold text-gray-700 mb-2">
              {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
            </p>
            <p className="text-sm text-gray-400 mb-6">
              {filter === 'all'
                ? 'Start exploring venues and make your first booking!'
                : 'Try switching to a different filter'
              }
            </p>
            {filter === 'all' && (
              <button
                onClick={() => navigate('/browse')}
                className="bg-teal-700 text-white text-sm font-medium px-6 py-3 rounded-xl"
              >
                Browse venues
              </button>
            )}
          </div>
        )}

        {/* Booking cards */}
        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map(booking => {
              const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.locked
              const venue = booking.venue

              return (
                <div
                  key={booking._id}
                  className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition-shadow"
                >
                  {/* Top row — venue info + status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                        {CATEGORY_EMOJIS[venue?.category] || '🏛️'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {booking.venue_snapshot?.name || venue?.name}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <MapPin size={10} />
                          {venue?.location?.city}, {venue?.location?.state}
                        </p>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${status.color}`}>
                      {status.icon}
                      {status.label}
                    </span>
                  </div>

                  {/* Booking details */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                      <p className="text-xs text-gray-400 mb-0.5">
                        <Calendar size={10} className="inline mr-1" />
                        Dates booked
                      </p>
                      <p className="text-sm font-medium text-gray-700">
                        {booking.total_days} day{booking.total_days > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-gray-400">
                        {booking.dates?.sort().slice(0, 2).map(d =>
                          new Date(d).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short'
                          })
                        ).join(', ')}
                        {booking.dates?.length > 2 && ` +${booking.dates.length - 2} more`}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                      <p className="text-xs text-gray-400 mb-0.5">Total paid</p>
                      <p className="text-sm font-semibold text-teal-700">
                        ₹{booking.total_price?.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">{booking.event_type}</p>
                    </div>
                  </div>

                  {/* Booking ID + action */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <p className="text-xs text-gray-400">
                      ID: <span className="font-mono text-gray-600">
                        {booking._id.toString().slice(-8).toUpperCase()}
                      </span>
                    </p>
                    <button
                      onClick={() => navigate(`/venue/${venue?._id}`)}
                      className="flex items-center gap-1 text-xs text-teal-700 hover:underline font-medium"
                    >
                      View venue <ArrowRight size={12} />
                    </button>
                  </div>

                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}

export default MyBookingsPage