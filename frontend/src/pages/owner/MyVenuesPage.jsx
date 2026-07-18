import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2, MapPin, Users, Star,
  CheckCircle, Clock, XCircle, Eye,
  Trash2, Plus, Loader2, AlertCircle
} from 'lucide-react'
import api from '../../utils/api.js'
import { getUser, isLoggedIn } from '../../utils/auth.js'
import { useAuth } from '../../context/AuthContext.jsx'


const CATEGORY_EMOJIS = {
  'Wedding': '💍', 'Birthday': '🎂', 'Banquet Hall': '🏛️',
  'Outdoor': '🌿', 'Auditorium': '🎤', 'Cafe': '☕', 'Studio': '📸'
}

function MyVenuesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()  // ← use context not getUser()

  const [venues, setVenues]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    if (!user) return        // wait for context
    if (user.role !== 'owner') {
      navigate('/')
      return
    }
    fetchVenues()
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={28} className="text-teal-600 animate-spin" />
      </div>
    )
  }

  async function fetchVenues() {
    setLoading(true)
    try {
      const res = await api.get('/venues/owner/my-venues')
      setVenues(res.data.venues)
    } catch (err) {
      setError('Could not load your venues.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(venueId, venueName) {
    const confirmed = window.confirm(
      `Remove "${venueName}"? This will hide it from search results. Active bookings will not be affected.`
    )
    if (!confirmed) return

    setDeleting(venueId)
    try {
      await api.delete(`/venues/${venueId}`)
      setVenues(prev => prev.filter(v => v._id !== venueId))
    } catch (err) {
      alert('Could not remove venue. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  const statusConfig = {
    approved: { label: 'Live',            color: 'bg-teal-50 text-teal-700 border-teal-200',  icon: <CheckCircle size={11} /> },
    pending:  { label: 'Under review',    color: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock size={11} /> },
    rejected: { label: 'Rejected',        color: 'bg-red-50 text-red-600 border-red-200',      icon: <XCircle size={11} /> },
    suspended:{ label: 'Suspended',       color: 'bg-gray-50 text-gray-600 border-gray-200',   icon: <XCircle size={11} /> },
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">My Venues</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {venues.length} venue{venues.length !== 1 ? 's' : ''} listed
            </p>
          </div>
          <button
            onClick={() => navigate('/owner/list-venue')}
            className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={16} /> Add venue
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="text-teal-600 animate-spin" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-20">
            <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
            <p className="text-gray-500">{error}</p>
            <button
              onClick={fetchVenues}
              className="mt-4 text-teal-700 text-sm hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && venues.length === 0 && (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-16 text-center">
            <Building2 size={48} className="text-gray-200 mx-auto mb-4" />
            <p className="text-base font-semibold text-gray-700 mb-2">No venues yet</p>
            <p className="text-sm text-gray-400 mb-6">
              List your first venue and start receiving bookings
            </p>
            <button
              onClick={() => navigate('/owner/list-venue')}
              className="bg-teal-700 text-white text-sm font-medium px-6 py-3 rounded-xl"
            >
              List a venue
            </button>
          </div>
        )}

        {/* Venues list */}
        {!loading && !error && venues.length > 0 && (
          <div className="space-y-4">
            {venues.map(venue => {
              const status = statusConfig[venue.status] || statusConfig.pending

              return (
                <div
                  key={venue._id}
                  className="bg-white border border-gray-100 rounded-2xl p-5"
                >
                  <div className="flex items-start gap-4">

                    {/* Emoji icon */}
                    <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center text-3xl shrink-0">
                      {CATEGORY_EMOJIS[venue.category] || '🏛️'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h3 className="text-sm font-semibold text-gray-800 truncate">
                          {venue.name}
                        </h3>
                        <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border shrink-0 ${status.color}`}>
                          {status.icon} {status.label}
                        </span>
                      </div>

                      <p className="text-xs text-gray-400 flex items-center gap-1 mb-2">
                        <MapPin size={11} />
                        {venue.location.city}, {venue.location.state}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <span className="font-semibold text-teal-700">
                          ₹{venue.price.toLocaleString()}/day
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={11} /> {venue.capacity} guests
                        </span>
                        <span className="flex items-center gap-1">
                          <Star size={11} className="text-amber-400 fill-amber-400" />
                          {venue.rating}
                        </span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                          {venue.category}
                        </span>
                      </div>

                      {/* Status messages */}
                      {venue.status === 'pending' && (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-xs text-amber-700 mb-3">
                          <Clock size={11} className="inline mr-1" />
                          Under review — our team will verify within 24-48 hours
                        </div>
                      )}

                      {venue.status === 'rejected' && (
                        <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-xs text-red-600 mb-3">
                          <XCircle size={11} className="inline mr-1" />
                          Rejected: {venue.verification?.rejection_reason || 'Contact support for details'}
                        </div>
                      )}

                      {/* Amenities chips */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {venue.amenities.slice(0, 4).map(a => (
                          <span key={a} className="text-xs bg-gray-50 border border-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            {a}
                          </span>
                        ))}
                        {venue.amenities.length > 4 && (
                          <span className="text-xs text-gray-400">
                            +{venue.amenities.length - 4} more
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/owner/edit-venue/${venue._id}`)}
                          className="flex items-center gap-1.5 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-2 rounded-lg transition-colors"
                        >
                          <Eye size={13} /> Edit venue
                        </button>
                        <button
                          onClick={() => navigate(`/venue/${venue._id}`)}
                          className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
                        >
                          <Eye size={13} /> View listing
                        </button>
                        <button
                          onClick={() => handleDelete(venue._id, venue.name)}
                          disabled={deleting === venue._id}
                          className="flex items-center gap-1.5 text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {deleting === venue._id
                            ? <Loader2 size={13} className="animate-spin" />
                            : <Trash2 size={13} />
                          }
                          Remove
                        </button>

                        <span className="ml-auto text-xs text-gray-400">
                          Listed {new Date(venue.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
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

export default MyVenuesPage