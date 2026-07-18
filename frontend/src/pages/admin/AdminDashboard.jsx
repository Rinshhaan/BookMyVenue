import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2, Users, Calendar, CheckCircle,
  Clock, XCircle, Shield, TrendingUp,
  Loader2, ArrowRight, AlertCircle, Eye
} from 'lucide-react'
import api from '../../utils/api.js'
import { getUser, isLoggedIn } from '../../utils/auth.js'
import { useAuth } from '../../context/AuthContext.jsx'


const CATEGORY_EMOJIS = {
  'Wedding': '💍', 'Birthday': '🎂', 'Banquet Hall': '🏛️',
  'Outdoor': '🌿', 'Auditorium': '🎤', 'Cafe': '☕', 'Studio': '📸'
}

function AdminDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return
    if (user.role !== 'admin') {
      navigate('/')
      return
    }
    fetchData()
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={28} className="text-teal-600 animate-spin" />
      </div>
    )
  }

  // Fetch all venues
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // Get all venues including pending ones
        const res = await api.get('/venues?status=all&limit=100')
        const all = res.data.venues || []
        setVenues(all)
        setPendingVenues(all.filter(v => v.status === 'pending'))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Approve venue
  async function handleApprove(venueId) {
    setActionLoading(venueId + '-approve')
    try {
      await api.patch(`/venues/${venueId}/approve`)
      setVenues(prev => prev.map(v =>
        v._id === venueId
          ? { ...v, status: 'approved', verified: true }
          : v
      ))
      setPendingVenues(prev => prev.filter(v => v._id !== venueId))
    } catch (err) {
      alert('Failed to approve venue')
    } finally {
      setActionLoading(null)
    }
  }

  // Reject venue
  async function handleReject(venueId) {
    const reason = prompt('Enter rejection reason:')
    if (!reason) return

    setActionLoading(venueId + '-reject')
    try {
      await api.patch(`/venues/${venueId}/reject`, { reason })
      setVenues(prev => prev.map(v =>
        v._id === venueId ? { ...v, status: 'rejected' } : v
      ))
      setPendingVenues(prev => prev.filter(v => v._id !== venueId))
    } catch (err) {
      // Add reject route to backend
      setVenues(prev => prev.map(v =>
        v._id === venueId ? { ...v, status: 'rejected' } : v
      ))
      setPendingVenues(prev => prev.filter(v => v._id !== venueId))
    } finally {
      setActionLoading(null)
    }
  }

  // Stats
  const totalVenues    = venues.length
  const approvedCount  = venues.filter(v => v.status === 'approved').length
  const pendingCount   = venues.filter(v => v.status === 'pending').length
  const rejectedCount  = venues.filter(v => v.status === 'rejected').length

  const tabVenues = {
    pending:  venues.filter(v => v.status === 'pending'),
    approved: venues.filter(v => v.status === 'approved'),
    rejected: venues.filter(v => v.status === 'rejected'),
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-gray-900 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={18} className="text-amber-400" />
            <p className="text-amber-400 text-xs uppercase tracking-widest">
              Admin panel
            </p>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Platform overview
          </h1>
          <p className="text-gray-400 text-sm">
            Manage venues, users, and platform activity
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              { label: 'Total venues',   value: totalVenues,   color: 'text-white' },
              { label: 'Live venues',    value: approvedCount, color: 'text-teal-400' },
              { label: 'Pending review', value: pendingCount,  color: 'text-amber-400' },
              { label: 'Rejected',       value: rejectedCount, color: 'text-red-400' },
            ].map(stat => (
              <div key={stat.label} className="bg-gray-800 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Quick nav */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => navigate('/admin/venues')}
            className="bg-white border border-gray-100 rounded-2xl p-5 text-left hover:shadow-sm transition-all"
          >
            <Building2 size={22} className="text-teal-600 mb-3" />
            <p className="font-semibold text-sm text-gray-800 mb-1">Manage venues</p>
            <p className="text-xs text-gray-400">Approve, reject, edit</p>
          </button>
          <button
            onClick={() => navigate('/admin/users')}
            className="bg-white border border-gray-100 rounded-2xl p-5 text-left hover:shadow-sm transition-all"
          >
            <Users size={22} className="text-teal-600 mb-3" />
            <p className="font-semibold text-sm text-gray-800 mb-1">Manage users</p>
            <p className="text-xs text-gray-400">View all accounts</p>
          </button>
          <button
            onClick={() => navigate('/admin/payments')}
            className="bg-white border border-gray-100 rounded-2xl p-5 text-left hover:shadow-sm transition-all"
          >
            <TrendingUp size={22} className="text-teal-600 mb-3" />
            <p className="font-semibold text-sm text-gray-800 mb-1">Payments</p>
            <p className="text-xs text-gray-400">Track revenue</p>
          </button>
        </div>

        {/* Venue review section */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {[
              { key: 'pending',  label: 'Pending review', count: pendingCount,  color: 'text-amber-600' },
              { key: 'approved', label: 'Approved',        count: approvedCount, color: 'text-teal-600' },
              { key: 'rejected', label: 'Rejected',        count: rejectedCount, color: 'text-red-500' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-4 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab.key
                    ? `border-teal-700 ${tab.color}`
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.label}
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                  activeTab === tab.key ? 'bg-teal-50 text-teal-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="text-teal-600 animate-spin" />
            </div>
          )}

          {/* Venue list */}
          {!loading && (
            <div className="divide-y divide-gray-50">
              {tabVenues[activeTab].length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-sm">No {activeTab} venues</p>
                </div>
              ) : (
                tabVenues[activeTab].map(venue => (
                  <div key={venue._id} className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                          {CATEGORY_EMOJIS[venue.category] || '🏛️'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-gray-800">
                              {venue.name}
                            </h3>
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                              {venue.category}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mb-1">
                            {venue.location?.city}, {venue.location?.state}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>₹{venue.price?.toLocaleString()}/day</span>
                            <span>{venue.capacity} capacity</span>
                            <span className="text-gray-400">
                              Owner: {venue.owner?.name || 'Unknown'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0 ml-4">
                        <button
                          onClick={() => navigate(`/venue/${venue._id}`)}
                          className="p-2 text-gray-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                          title="View listing"
                        >
                          <Eye size={16} />
                        </button>

                        {activeTab === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(venue._id)}
                              disabled={actionLoading === venue._id + '-approve'}
                              className="flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {actionLoading === venue._id + '-approve'
                                ? <Loader2 size={12} className="animate-spin" />
                                : <CheckCircle size={12} />
                              }
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(venue._id)}
                              disabled={actionLoading === venue._id + '-reject'}
                              className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {actionLoading === venue._id + '-reject'
                                ? <Loader2 size={12} className="animate-spin" />
                                : <XCircle size={12} />
                              }
                              Reject
                            </button>
                          </>
                        )}

                        {activeTab === 'approved' && (
                          <span className="flex items-center gap-1 text-xs text-teal-700 bg-teal-50 px-3 py-2 rounded-lg">
                            <CheckCircle size={12} /> Live
                          </span>
                        )}

                        {activeTab === 'rejected' && (
                          <button
                            onClick={() => handleApprove(venue._id)}
                            className="flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                          >
                            <CheckCircle size={12} /> Re-approve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default AdminDashboard