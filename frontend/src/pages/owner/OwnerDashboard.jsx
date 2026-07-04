import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2, Calendar, TrendingUp, Plus,
  CheckCircle, Clock, XCircle, ArrowRight,
  Loader2, Users, Star
} from 'lucide-react'
import api from '../../utils/api.js'
import { getUser, isLoggedIn } from '../../utils/auth.js'

const CATEGORY_EMOJIS = {
  'Wedding': '💍', 'Birthday': '🎂', 'Banquet Hall': '🏛️',
  'Outdoor': '🌿', 'Auditorium': '🎤', 'Cafe': '☕', 'Studio': '📸'
}

function OwnerDashboard() {
  const navigate = useNavigate()
  const user = getUser()

  const [venues, setVenues]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  // Redirect if not logged in or not owner
  useEffect(() => {
    if (!isLoggedIn()) { navigate('/login'); return }
    if (user?.role !== 'owner') { navigate('/'); return }
  }, [])

  // Fetch owner's venues
  useEffect(() => {
    async function fetchMyVenues() {
      setLoading(true)
      try {
        const res = await api.get('/venues/owner/my-venues')
        setVenues(res.data.venues)
      } catch (err) {
        setError('Could not load your venues.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchMyVenues()
  }, [])

  // Compute stats from venues
  const totalVenues    = venues.length
  const approvedVenues = venues.filter(v => v.status === 'approved').length
  const pendingVenues  = venues.filter(v => v.status === 'pending').length
  const totalCapacity  = venues.reduce((sum, v) => sum + v.capacity, 0)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-teal-900 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-teal-400 text-xs uppercase tracking-widest mb-1">
            Owner dashboard
          </p>
          <h1 className="text-2xl font-bold text-white mb-1">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-teal-400 text-sm">
            Manage your venues and track your bookings
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              { label: 'Total venues',    value: totalVenues,    icon: <Building2 size={16} /> },
              { label: 'Live venues',     value: approvedVenues, icon: <CheckCircle size={16} /> },
              { label: 'Pending review',  value: pendingVenues,  icon: <Clock size={16} /> },
              { label: 'Total capacity',  value: totalCapacity,  icon: <Users size={16} /> },
            ].map(stat => (
              <div key={stat.label} className="bg-teal-800 bg-opacity-50 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 text-teal-400 mb-1">
                  {stat.icon}
                  <span className="text-xs">{stat.label}</span>
                </div>
                <p className="text-xl font-bold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => navigate('/owner/list-venue')}
            className="bg-orange-600 hover:bg-orange-700 text-white rounded-2xl p-5 text-left transition-all hover:shadow-md group"
          >
            <Plus size={24} className="mb-3" />
            <p className="font-semibold text-base mb-1">List a new venue</p>
            <p className="text-xs text-orange-200">Add your venue to get bookings</p>
          </button>

          <button
            onClick={() => navigate('/owner/my-venues')}
            className="bg-white border border-gray-100 hover:shadow-sm text-left rounded-2xl p-5 transition-all group"
          >
            <Building2 size={24} className="mb-3 text-teal-600" />
            <p className="font-semibold text-base text-gray-800 mb-1">Manage venues</p>
            <p className="text-xs text-gray-400">Edit, update, or remove venues</p>
          </button>

          <button
            onClick={() => navigate('/owner/earnings')}
            className="bg-white border border-gray-100 hover:shadow-sm text-left rounded-2xl p-5 transition-all group"
          >
            <TrendingUp size={24} className="mb-3 text-teal-600" />
            <p className="font-semibold text-base text-gray-800 mb-1">View earnings</p>
            <p className="text-xs text-gray-400">Track revenue and payouts</p>
          </button>
        </div>

        {/* My venues section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Your venues</h2>
          <button
            onClick={() => navigate('/owner/list-venue')}
            className="flex items-center gap-1 text-sm text-teal-700 hover:underline"
          >
            <Plus size={14} /> Add venue
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="text-teal-600 animate-spin" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-16">
            <p className="text-gray-500">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && venues.length === 0 && (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center">
            <Building2 size={40} className="text-gray-200 mx-auto mb-4" />
            <p className="text-base font-semibold text-gray-700 mb-2">
              No venues listed yet
            </p>
            <p className="text-sm text-gray-400 mb-6">
              List your first venue and start receiving bookings
            </p>
            <button
              onClick={() => navigate('/owner/list-venue')}
              className="bg-teal-700 text-white text-sm font-medium px-6 py-3 rounded-xl"
            >
              List your first venue
            </button>
          </div>
        )}

        {/* Venue list */}
        {!loading && !error && venues.length > 0 && (
          <div className="space-y-4">
            {venues.map(venue => (
              <div
                key={venue._id}
                className="bg-white border border-gray-100 rounded-2xl p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center text-3xl shrink-0">
                      {CATEGORY_EMOJIS[venue.category] || '🏛️'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-800">
                          {venue.name}
                        </h3>
                        {venue.verified && (
                          <span className="flex items-center gap-1 text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                            <CheckCircle size={10} /> Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mb-2">
                        {venue.location.city}, {venue.location.state}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users size={11} /> {venue.capacity} capacity
                        </span>
                        <span className="flex items-center gap-1">
                          <Star size={11} className="text-amber-400 fill-amber-400" />
                          {venue.rating}
                        </span>
                        <span className="font-medium text-teal-700">
                          ₹{venue.price.toLocaleString()}/day
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {/* Status badge */}
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                      venue.status === 'approved'
                        ? 'bg-teal-50 text-teal-700 border-teal-200'
                        : venue.status === 'pending'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : venue.status === 'rejected'
                        ? 'bg-red-50 text-red-600 border-red-200'
                        : 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>
                      {venue.status === 'approved' && <CheckCircle size={10} />}
                      {venue.status === 'pending' && <Clock size={10} />}
                      {venue.status === 'rejected' && <XCircle size={10} />}
                      {venue.status.charAt(0).toUpperCase() + venue.status.slice(1)}
                    </span>

                    <button
                      onClick={() => navigate(`/venue/${venue._id}`)}
                      className="flex items-center gap-1 text-xs text-teal-700 hover:underline"
                    >
                      View listing <ArrowRight size={11} />
                    </button>
                  </div>
                </div>

                {/* Pending review notice */}
                {venue.status === 'pending' && (
                  <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-700">
                    <Clock size={12} className="inline mr-1" />
                    Your venue is under review. Our team will verify your documents within 24-48 hours.
                  </div>
                )}

                {/* Rejected notice */}
                {venue.status === 'rejected' && (
                  <div className="mt-4 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-xs text-red-600">
                    <XCircle size={12} className="inline mr-1" />
                    Venue rejected. Reason: {venue.verification?.rejection_reason || 'Please contact support.'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default OwnerDashboard