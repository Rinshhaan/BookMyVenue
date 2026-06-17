import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Search, Users, Calendar, Star, CheckCircle, ArrowRight } from 'lucide-react'

const CATEGORIES = [
  { label: 'Wedding', icon: '💍' },
  { label: 'Birthday', icon: '🎂' },
  { label: 'Banquet Hall', icon: '🏛️' },
  { label: 'Outdoor', icon: '🌿' },
  { label: 'Auditorium', icon: '🎤' },
  { label: 'Cafe', icon: '☕' },
  { label: 'Studio', icon: '📸' },
]

const FEATURED_VENUES = [
  {
    id: '1',
    name: 'Kochi Convention Centre',
    location: 'Ernakulam',
    distance: '2.3 km',
    price: '25,000',
    rating: '4.8',
    category: 'Banquet Hall',
    verified: true,
    color: 'bg-teal-50',
    iconColor: 'text-teal-700',
  },
  {
    id: '2',
    name: 'Beach Pavilion Kozhikode',
    location: 'Kozhikode',
    distance: '4.1 km',
    price: '18,000',
    rating: '4.6',
    category: 'Outdoor',
    verified: false,
    popular: true,
    color: 'bg-amber-50',
    iconColor: 'text-amber-700',
  },
  {
    id: '3',
    name: 'Thrissur Heritage Hall',
    location: 'Thrissur',
    distance: '1.8 km',
    price: '32,000',
    rating: '4.9',
    category: 'Wedding',
    verified: true,
    color: 'bg-pink-50',
    iconColor: 'text-pink-700',
  },
]

function HomePage() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('Wedding')
  const [searchLocation, setSearchLocation] = useState('')
  const [searchGuests, setSearchGuests] = useState('')

  function handleSearch() {
    navigate(`/browse?location=${searchLocation}&guests=${searchGuests}&category=${activeCategory}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO ── */}
      <section className="bg-teal-900 px-6 py-14">
        <p className="text-teal-300 text-xs tracking-widest uppercase mb-3">
          Kerala's #1 venue booking platform
        </p>
        <h1 className="text-3xl font-bold text-teal-50 leading-tight mb-2">
          Find the perfect venue<br />for your celebration
        </h1>
        <p className="text-teal-400 text-sm mb-8">
          Birthday parties, weddings, corporate events and more across Kerala
        </p>

        {/* Search bar */}
        <div className="bg-white rounded-2xl p-4 flex flex-col md:flex-row gap-3">
          <div className="flex items-center gap-3 flex-1 border-b md:border-b-0 md:border-r border-gray-100 pb-3 md:pb-0 md:pr-4">
            <MapPin size={18} className="text-teal-600 shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Location</p>
              <input
                className="text-sm font-medium text-gray-800 w-full outline-none bg-transparent placeholder-gray-400"
                placeholder="Kozhikode, Kerala"
                value={searchLocation}
                onChange={e => setSearchLocation(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 flex-1 border-b md:border-b-0 md:border-r border-gray-100 pb-3 md:pb-0 md:pr-4">
            <Calendar size={18} className="text-teal-600 shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Event type</p>
              <p className="text-sm font-medium text-gray-800">{activeCategory}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-1 md:pr-4">
            <Users size={18} className="text-teal-600 shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Guests</p>
              <input
                className="text-sm font-medium text-gray-800 w-full outline-none bg-transparent placeholder-gray-400"
                placeholder="150 people"
                value={searchGuests}
                onChange={e => setSearchGuests(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="bg-orange-600 hover:bg-orange-700 transition-colors text-white text-sm font-medium px-6 py-3 rounded-xl flex items-center justify-center gap-2"
          >
            <Search size={16} />
            Search
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-8 mt-6">
          {[
            { num: '500+', label: 'Venues listed' },
            { num: '14', label: 'Districts covered' },
            { num: '10K+', label: 'Happy bookings' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-lg font-bold text-teal-50">{s.num}</p>
              <p className="text-xs text-teal-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="px-6 py-8">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Browse by category</h2>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(cat.label)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-all ${
                activeCategory === cat.label
                  ? 'bg-teal-50 border-teal-400 text-teal-800 font-medium'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-teal-300'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── FEATURED VENUES ── */}
      <section className="px-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Featured venues</h2>
          <button
            onClick={() => navigate('/browse')}
            className="text-teal-700 text-sm flex items-center gap-1 hover:underline"
          >
            See all <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURED_VENUES.map(venue => (
            <div
              key={venue.id}
              onClick={() => navigate(`/venue/${venue.id}`)}
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            >
              {/* Image placeholder */}
              <div className={`h-36 ${venue.color} flex items-center justify-center relative`}>
                <span className="text-5xl">🏛️</span>
                {venue.verified && (
                  <span className="absolute top-2 right-2 bg-teal-50 text-teal-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                    <CheckCircle size={10} /> Verified
                  </span>
                )}
                {venue.popular && (
                  <span className="absolute top-2 right-2 bg-amber-50 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">
                    Popular
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="text-sm font-semibold text-gray-800 mb-1">{venue.name}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
                  <MapPin size={11} />
                  {venue.location} · {venue.distance}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-teal-700">₹{venue.price}/day</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Star size={11} className="text-amber-400 fill-amber-400" />
                    {venue.rating}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── NEAR ME BANNER ── */}
      <section className="px-6 pb-10">
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-teal-800 flex items-center gap-2">
              <MapPin size={16} /> Venues near you
            </p>
            <p className="text-xs text-teal-600 mt-1">
              Enable location to see venues closest to you first
            </p>
          </div>
          <button
            onClick={() => navigate('/browse?nearby=true')}
            className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Enable location
          </button>
        </div>
      </section>

    </div>
  )
}

export default HomePage